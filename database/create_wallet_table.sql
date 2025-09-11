-- Script SQL per creare la tabella wallet
-- Eseguire questo script nel Supabase SQL Editor

-- Crea la tabella wallet
CREATE TABLE IF NOT EXISTS wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  stake_amount DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  result VARCHAR(20) DEFAULT 'pending' CHECK (result IN ('win', 'loss', 'void', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prediction_id)
);

-- Crea indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_prediction_id ON wallet(prediction_id);
CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallet(status);
CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON wallet(created_at);

-- Abilita RLS (Row Level Security)
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo i propri wallet items
DROP POLICY IF EXISTS "Users can view own wallet items" ON wallet;
CREATE POLICY "Users can view own wallet items" ON wallet
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di inserire nel proprio wallet
DROP POLICY IF EXISTS "Users can insert own wallet items" ON wallet;
CREATE POLICY "Users can insert own wallet items" ON wallet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy per permettere agli utenti di aggiornare i propri wallet items
DROP POLICY IF EXISTS "Users can update own wallet items" ON wallet;
CREATE POLICY "Users can update own wallet items" ON wallet
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di eliminare i propri wallet items
DROP POLICY IF EXISTS "Users can delete own wallet items" ON wallet;
CREATE POLICY "Users can delete own wallet items" ON wallet
  FOR DELETE USING (auth.uid() = user_id);

-- Commenti per documentazione
COMMENT ON TABLE wallet IS 'Tabella per salvare i pronostici copiati dagli utenti nel loro wallet personale';
COMMENT ON COLUMN wallet.user_id IS 'ID dell\'utente proprietario del wallet';
COMMENT ON COLUMN wallet.prediction_id IS 'ID del pronostico salvato';
COMMENT ON COLUMN wallet.stake_amount IS 'Importo della puntata (opzionale)';
COMMENT ON COLUMN wallet.notes IS 'Note personali dell\'utente sul pronostico';
COMMENT ON COLUMN wallet.status IS 'Stato del pronostico nel wallet (active, completed, cancelled)';
COMMENT ON COLUMN wallet.result IS 'Risultato del pronostico (win, loss, void, pending)';