-- Script SQL per creare le tabelle X-BANK
-- Sistema avanzato di tracking per utenti VIP

-- Tabella per le impostazioni utente X-BANK
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

-- Tabella per pronostici personalizzati (non di Mr. Vertex)
CREATE TABLE IF NOT EXISTS custom_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_name VARCHAR(255),
  match_date TIMESTAMP WITH TIME ZONE,
  odds DECIMAL(8,3) NOT NULL,
  stake_amount DECIMAL(10,2),
  stake_units DECIMAL(8,2),
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 100),
  category VARCHAR(100),
  bookmaker VARCHAR(100),
  bet_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void', 'cancelled')),
  result_amount DECIMAL(10,2),
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per gruppi di pronostici
CREATE TABLE IF NOT EXISTS prediction_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'custom', -- 'custom', 'scalata', 'serie', 'system'
  target_profit DECIMAL(10,2),
  max_loss DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella di collegamento tra pronostici e gruppi
CREATE TABLE IF NOT EXISTS prediction_group_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES prediction_groups(id) ON DELETE CASCADE,
  prediction_id UUID, -- Può essere NULL per pronostici esterni
  custom_prediction_id UUID REFERENCES custom_predictions(id) ON DELETE CASCADE,
  sequence_order INTEGER,
  is_completed BOOLEAN DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_prediction_reference CHECK (
    (prediction_id IS NOT NULL AND custom_prediction_id IS NULL) OR
    (prediction_id IS NULL AND custom_prediction_id IS NOT NULL)
  )
);

-- Tabella per tracking bankroll storico
CREATE TABLE IF NOT EXISTS bankroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'bet_placed', 'bet_won', 'bet_lost', 'deposit', 'withdrawal', 'adjustment'
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  reference_id UUID, -- ID del pronostico o transazione correlata
  reference_type VARCHAR(50), -- 'custom_prediction', 'wallet_prediction', 'manual'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella per statistiche e metriche calcolate
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_bets INTEGER DEFAULT 0,
  won_bets INTEGER DEFAULT 0,
  lost_bets INTEGER DEFAULT 0,
  void_bets INTEGER DEFAULT 0,
  total_staked DECIMAL(15,2) DEFAULT 0,
  total_returned DECIMAL(15,2) DEFAULT 0,
  net_profit DECIMAL(15,2) DEFAULT 0,
  roi DECIMAL(8,4) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  average_odds DECIMAL(8,3) DEFAULT 0,
  longest_winning_streak INTEGER DEFAULT 0,
  longest_losing_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  streak_type VARCHAR(10) DEFAULT 'none', -- 'winning', 'losing', 'none'
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_start, period_end)
);

-- Tabella per seguire altri utenti/scalate
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_group_id UUID REFERENCES prediction_groups(id) ON DELETE CASCADE,
  follow_type VARCHAR(20) NOT NULL, -- 'user', 'group', 'scalata'
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_follow_reference CHECK (
    (followed_user_id IS NOT NULL AND followed_group_id IS NULL) OR
    (followed_user_id IS NULL AND followed_group_id IS NOT NULL)
  ),
  UNIQUE(follower_id, followed_user_id, followed_group_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_xbank_user_settings_user_id ON xbank_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_predictions_user_id ON custom_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_predictions_status ON custom_predictions(status);
CREATE INDEX IF NOT EXISTS idx_custom_predictions_created_at ON custom_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_custom_predictions_public ON custom_predictions(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_prediction_groups_user_id ON prediction_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_groups_public ON prediction_groups(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_prediction_group_items_group_id ON prediction_group_items(group_id);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_user_id ON bankroll_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_created_at ON bankroll_history(created_at);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_period ON user_statistics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_user ON user_follows(followed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_group ON user_follows(followed_group_id);

-- Abilita RLS su tutte le tabelle
ALTER TABLE xbank_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bankroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Policies per xbank_user_settings
CREATE POLICY "Users can manage own xbank settings" ON xbank_user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Policies per custom_predictions
CREATE POLICY "Users can manage own custom predictions" ON custom_predictions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public custom predictions" ON custom_predictions
  FOR SELECT USING (is_public = true);

-- Policies per prediction_groups
CREATE POLICY "Users can manage own prediction groups" ON prediction_groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prediction groups" ON prediction_groups
  FOR SELECT USING (is_public = true);

-- Policies per prediction_group_items
CREATE POLICY "Users can manage own group items" ON prediction_group_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM prediction_groups pg 
      WHERE pg.id = prediction_group_items.group_id 
      AND pg.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view public group items" ON prediction_group_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prediction_groups pg 
      WHERE pg.id = prediction_group_items.group_id 
      AND pg.is_public = true
    )
  );

-- Policies per bankroll_history
CREATE POLICY "Users can manage own bankroll history" ON bankroll_history
  FOR ALL USING (auth.uid() = user_id);

-- Policies per user_statistics
CREATE POLICY "Users can manage own statistics" ON user_statistics
  FOR ALL USING (auth.uid() = user_id);

-- Policies per user_follows
CREATE POLICY "Users can manage own follows" ON user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_xbank_user_settings_updated_at BEFORE UPDATE ON xbank_user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_predictions_updated_at BEFORE UPDATE ON custom_predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prediction_groups_updated_at BEFORE UPDATE ON prediction_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commenti finali
-- Struttura database X-BANK creata con successo
-- Include: settings utente, pronostici custom, gruppi, tracking bankroll, statistiche, follows