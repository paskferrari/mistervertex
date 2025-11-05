-- Script completo per configurare tutte le tabelle necessarie per X-BANK
-- Eseguire questo script nel Supabase SQL Editor

-- 1. Prima crea la tabella users se non esiste (dal schema principale)
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

-- 2. Crea la tabella xbank_user_settings
CREATE TABLE IF NOT EXISTS xbank_user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_bankroll DECIMAL(15,2) DEFAULT 1000.00,
  current_bankroll DECIMAL(15,2) DEFAULT 1000.00,
  currency VARCHAR(10) DEFAULT 'EUR',
  unit_type VARCHAR(20) DEFAULT 'currency', -- 'currency', 'percentage', 'units'
  unit_value DECIMAL(10,2) DEFAULT 10.00,
  risk_management JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Crea la tabella notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'prediction', 'group', 'scalata')),
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crea la tabella xbank_prediction_groups
CREATE TABLE IF NOT EXISTS xbank_prediction_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crea la tabella xbank_custom_predictions
CREATE TABLE IF NOT EXISTS xbank_custom_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES xbank_prediction_groups(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  odds DECIMAL(10,2) NOT NULL CHECK (odds > 0),
  stake_amount DECIMAL(15,2) NOT NULL CHECK (stake_amount > 0),
  stake_type VARCHAR(20) DEFAULT 'fixed' CHECK (stake_type IN ('fixed', 'percentage', 'units')),
  confidence INTEGER DEFAULT 50 CHECK (confidence >= 1 AND confidence <= 100),
  event_date TIMESTAMP WITH TIME ZONE,
  bookmaker VARCHAR(100),
  market_type VARCHAR(100),
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void', 'cashout')),
  result_amount DECIMAL(15,2),
  result_profit DECIMAL(15,2),
  settled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_xbank_user_settings_user_id ON xbank_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_xbank_prediction_groups_user_id ON xbank_prediction_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_xbank_custom_predictions_user_id ON xbank_custom_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_xbank_custom_predictions_group_id ON xbank_custom_predictions(group_id);
CREATE INDEX IF NOT EXISTS idx_xbank_custom_predictions_status ON xbank_custom_predictions(status);
CREATE INDEX IF NOT EXISTS idx_xbank_custom_predictions_created_at ON xbank_custom_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_xbank_custom_predictions_category ON xbank_custom_predictions(category);

-- 6b. Tabella bankroll_history (tracking dettagliato del bankroll)
CREATE TABLE IF NOT EXISTS bankroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit','withdrawal','bet','win','loss','adjustment')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  balance_before DECIMAL(15,2),
  balance_after DECIMAL(15,2),
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bankroll_history_user_id ON bankroll_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_created_at ON bankroll_history(created_at);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_type ON bankroll_history(transaction_type);

-- 7. Abilita RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE xbank_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE xbank_prediction_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE xbank_custom_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_history ENABLE ROW LEVEL SECURITY;

-- 6. Policies per users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 7. Policies per xbank_user_settings
DROP POLICY IF EXISTS "Users can manage own xbank settings" ON xbank_user_settings;
CREATE POLICY "Users can manage own xbank settings" ON xbank_user_settings
  FOR ALL USING (auth.uid() = user_id);

-- 8. Policies per notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 11. Policies per xbank_prediction_groups
DROP POLICY IF EXISTS "Users can manage own prediction groups" ON xbank_prediction_groups;
CREATE POLICY "Users can manage own prediction groups" ON xbank_prediction_groups
  FOR ALL USING (auth.uid() = user_id);

-- 12. Policies per xbank_custom_predictions
DROP POLICY IF EXISTS "Users can manage own custom predictions" ON xbank_custom_predictions;
CREATE POLICY "Users can manage own custom predictions" ON xbank_custom_predictions
  FOR ALL USING (auth.uid() = user_id);

-- 12b. Policies per bankroll_history
DROP POLICY IF EXISTS "Users can manage own bankroll history" ON bankroll_history;
CREATE POLICY "Users can manage own bankroll history" ON bankroll_history
  FOR ALL USING (auth.uid() = user_id);

-- 9. Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_xbank_user_settings_updated_at ON xbank_user_settings;
CREATE TRIGGER update_xbank_user_settings_updated_at 
  BEFORE UPDATE ON xbank_user_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_xbank_prediction_groups_updated_at ON xbank_prediction_groups;
CREATE TRIGGER update_xbank_prediction_groups_updated_at 
  BEFORE UPDATE ON xbank_prediction_groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_xbank_custom_predictions_updated_at ON xbank_custom_predictions;
CREATE TRIGGER update_xbank_custom_predictions_updated_at 
  BEFORE UPDATE ON xbank_custom_predictions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bankroll_history_updated_at ON bankroll_history;
CREATE TRIGGER update_bankroll_history_updated_at
  BEFORE UPDATE ON bankroll_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 13. Commenti per documentazione
COMMENT ON TABLE users IS 'Tabella per gli utenti registrati della piattaforma';
COMMENT ON TABLE xbank_user_settings IS 'Impostazioni utente per il sistema X-BANK';
COMMENT ON TABLE notifications IS 'Tabella per le notifiche degli utenti X-BANK';
COMMENT ON TABLE xbank_prediction_groups IS 'Gruppi di pronostici personalizzati per X-BANK';
COMMENT ON TABLE xbank_custom_predictions IS 'Pronostici personalizzati degli utenti X-BANK';
COMMENT ON TABLE bankroll_history IS 'Cronologia e tracking delle transazioni del bankroll utente';
COMMENT ON COLUMN notifications.type IS 'Tipo di notifica: info, success, warning, error, prediction, group, scalata';
COMMENT ON COLUMN notifications.data IS 'Dati aggiuntivi della notifica in formato JSON';
COMMENT ON COLUMN xbank_custom_predictions.status IS 'Stato del pronostico: pending, won, lost, void, cashout';
COMMENT ON COLUMN xbank_custom_predictions.stake_type IS 'Tipo di puntata: fixed, percentage, units';
COMMENT ON COLUMN xbank_custom_predictions.confidence IS 'Livello di confidenza da 1 a 100';
COMMENT ON COLUMN xbank_custom_predictions.tags IS 'Tag per categorizzare i pronostici';

-- Script completato con successo!
-- Ora puoi usare create_vip_user.sql per creare un utente VIP di test