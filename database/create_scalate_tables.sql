-- Creazione tabelle per il sistema Scalate (allineate all'API)

-- Tabella principale delle scalate
CREATE TABLE IF NOT EXISTS public.scalate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scalata_type TEXT NOT NULL,
  initial_stake NUMERIC(10,2) NOT NULL,
  target_profit NUMERIC(10,2) NOT NULL,
  max_steps INTEGER NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  current_bankroll NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella dei passi delle scalate
CREATE TABLE IF NOT EXISTS public.scalata_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scalata_id UUID NOT NULL REFERENCES public.scalate(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  title TEXT,
  odds NUMERIC(10,2),
  stake NUMERIC(10,2),
  status TEXT DEFAULT 'pending',
  prediction_id UUID,
  custom_prediction_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scalata_id, sequence)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_scalate_user_id ON public.scalate(user_id);
CREATE INDEX IF NOT EXISTS idx_scalate_status ON public.scalate(status);
CREATE INDEX IF NOT EXISTS idx_scalata_steps_scalata_id ON public.scalata_steps(scalata_id);
CREATE INDEX IF NOT EXISTS idx_scalata_steps_sequence ON public.scalata_steps(sequence);

-- Row Level Security
ALTER TABLE public.scalate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scalata_steps ENABLE ROW LEVEL SECURITY;

-- Policy per scalate
CREATE POLICY IF NOT EXISTS "Users can view own scalate" ON public.scalate
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own scalate" ON public.scalate
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own scalate" ON public.scalate
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own scalate" ON public.scalate
  FOR DELETE USING (auth.uid() = user_id);

-- Policy per scalata_steps
CREATE POLICY IF NOT EXISTS "Users can view own scalata_steps" ON public.scalata_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can insert own scalata_steps" ON public.scalata_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can update own scalata_steps" ON public.scalata_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can delete own scalata_steps" ON public.scalata_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );