-- Migrazione schema Scalate: aggiunge colonne mancanti e indici/policy

-- Tabella scalate: aggiunta colonne inglesi standard se mancanti
ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS scalata_type TEXT DEFAULT 'progressive';

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS initial_stake NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS target_profit NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS max_steps INTEGER NOT NULL DEFAULT 1;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS current_step INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS current_bankroll NUMERIC(10,2) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.scalate
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Tabella scalata_steps: aggiunta colonne inglesi standard se mancanti
ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS sequence INTEGER;

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS odds NUMERIC(10,2);

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS stake NUMERIC(10,2);

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS prediction_id UUID;

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS custom_prediction_id UUID;

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.scalata_steps
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indici (idempotenti)
CREATE INDEX IF NOT EXISTS idx_scalate_user_id ON public.scalate(user_id);
CREATE INDEX IF NOT EXISTS idx_scalata_steps_sequence ON public.scalata_steps(sequence);

-- Crea indice su status/stato se la colonna esiste (compatibile con schemi localizzati)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'scalate' AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scalate_status ON public.scalate(status);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'scalate' AND column_name = 'stato'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_scalate_stato ON public.scalate(stato);
  END IF;
END $$;

-- Abilita Row Level Security se non già attiva
ALTER TABLE IF EXISTS public.scalate ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scalata_steps ENABLE ROW LEVEL SECURITY;

-- Policy di accesso per scalate
DROP POLICY IF EXISTS "Users can view own scalate" ON public.scalate;
CREATE POLICY "Users can view own scalate" ON public.scalate
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scalate" ON public.scalate;
CREATE POLICY "Users can insert own scalate" ON public.scalate
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scalate" ON public.scalate;
CREATE POLICY "Users can update own scalate" ON public.scalate
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scalate" ON public.scalate;
CREATE POLICY "Users can delete own scalate" ON public.scalate
  FOR DELETE USING (auth.uid() = user_id);

-- Policy di accesso per i passi: consentire operazioni se la scalata appartiene all'utente
DROP POLICY IF EXISTS "Users can view own scalata_steps" ON public.scalata_steps;
CREATE POLICY "Users can view own scalata_steps" ON public.scalata_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own scalata_steps" ON public.scalata_steps;
CREATE POLICY "Users can insert own scalata_steps" ON public.scalata_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own scalata_steps" ON public.scalata_steps;
CREATE POLICY "Users can update own scalata_steps" ON public.scalata_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own scalata_steps" ON public.scalata_steps;
CREATE POLICY "Users can delete own scalata_steps" ON public.scalata_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );