-- Crea la tabella di tracking del bankroll per X-BANK
-- Eseguire questo script nel Supabase SQL Editor

-- Tabella principale per la cronologia del bankroll
CREATE TABLE IF NOT EXISTS public.bankroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit','withdrawal','bet','win','loss','adjustment')),
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  balance_before NUMERIC(15,2),
  balance_after NUMERIC(15,2),
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_bankroll_history_user_id ON public.bankroll_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_created_at ON public.bankroll_history(created_at);
CREATE INDEX IF NOT EXISTS idx_bankroll_history_type ON public.bankroll_history(transaction_type);

-- Abilita Row Level Security
ALTER TABLE public.bankroll_history ENABLE ROW LEVEL SECURITY;

-- Policy RLS: utenti possono gestire solo i propri record
DROP POLICY IF EXISTS "Users can manage own bankroll history" ON public.bankroll_history;
CREATE POLICY "Users can manage own bankroll history" ON public.bankroll_history
  FOR ALL USING (auth.uid() = user_id);

-- Trigger per aggiornare automaticamente updated_at
DROP TRIGGER IF EXISTS update_bankroll_history_updated_at ON public.bankroll_history;
CREATE TRIGGER update_bankroll_history_updated_at
  BEFORE UPDATE ON public.bankroll_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fine script bankroll_history