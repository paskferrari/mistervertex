-- Schema per la piattaforma Mister Vertex
-- Nota: Configurare app.jwt_secret nelle impostazioni del progetto Supabase

-- Tabella per raccogliere le richieste email dalla landing page
CREATE TABLE IF NOT EXISTS email_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per gli utenti amministratori
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per gli utenti della piattaforma
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'guest' CHECK (role IN ('admin', 'guest', 'abbonato_base', 'abbonato_premium', 'abbonato_vip')),
  subscription_level INTEGER DEFAULT 0,
  approved_by VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per i pronostici (per future implementazioni)
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sport VARCHAR(100),
  match_info TEXT,
  prediction_type VARCHAR(100),
  odds DECIMAL(5,2),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  required_subscription_level INTEGER DEFAULT 0,
  access_level INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  result VARCHAR(20) CHECK (result IN ('win', 'loss', 'void', 'pending')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per tracciare l'accesso ai pronostici
CREATE TABLE IF NOT EXISTS user_prediction_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_email_requests_status ON email_requests(status);
CREATE INDEX IF NOT EXISTS idx_email_requests_created_at ON email_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_level ON users(subscription_level);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_required_subscription ON predictions(required_subscription_level);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_requests_updated_at BEFORE UPDATE ON email_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Email requests: solo lettura per admin
ALTER TABLE email_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on email_requests" ON email_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin read on email_requests" ON email_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Allow admin update on email_requests" ON email_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- Admin users: solo admin possono leggere
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin read on admin_users" ON admin_users
  FOR SELECT TO authenticated
  USING (
    email = auth.jwt() ->> 'email'
  );

-- Users: gli utenti possono vedere solo se stessi, admin possono vedere tutti
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admin can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admin can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- Predictions: visibilità basata sul livello di abbonamento
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view predictions based on subscription" ON predictions
  FOR SELECT TO authenticated
  USING (
    status = 'active' AND
    (
      required_subscription_level = 0 OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.subscription_level >= predictions.required_subscription_level
        AND users.is_active = true
      ) OR
      EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Admin can manage predictions" ON predictions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- User prediction access: gli utenti possono tracciare solo i propri accessi
ALTER TABLE user_prediction_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own access" ON user_prediction_access
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own access" ON user_prediction_access
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- Inserisci un utente admin di default
-- Nota: L'utente auth deve essere creato tramite Supabase Auth, questo è solo per la tabella admin_users
INSERT INTO admin_users (email, password_hash)
VALUES (
  'admin@mistervertex.com',
  '$2b$10$rOzJqQqQqQqQqQqQqQqQqO'  -- Placeholder: sostituire con hash bcrypt reale
) ON CONFLICT (email) DO NOTHING;

-- Commenti per documentazione
COMMENT ON TABLE email_requests IS 'Tabella per raccogliere le richieste di accesso dalla landing page';
COMMENT ON TABLE admin_users IS 'Tabella per gli amministratori della piattaforma';
COMMENT ON TABLE users IS 'Tabella per gli utenti registrati della piattaforma';
COMMENT ON TABLE predictions IS 'Tabella per i pronostici di Mister Vertex';
COMMENT ON TABLE user_prediction_access IS 'Tabella per tracciare l\'accesso degli utenti ai pronostici';