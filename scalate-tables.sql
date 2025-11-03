-- Creazione tabelle per il sistema Scalate di X-Bank
-- Esegui questi comandi nel SQL Editor di Supabase

-- 1. Creazione tabella scalate
CREATE TABLE IF NOT EXISTS public.scalate (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descrizione TEXT,
  tipo VARCHAR(50) NOT NULL DEFAULT 'classica',
  stake_iniziale DECIMAL(10,2) NOT NULL,
  profitto_target DECIMAL(10,2) NOT NULL,
  passi_massimi INTEGER NOT NULL DEFAULT 10,
  stato VARCHAR(50) NOT NULL DEFAULT 'attiva',
  bankroll_attuale DECIMAL(10,2) NOT NULL DEFAULT 0,
  passo_attuale INTEGER NOT NULL DEFAULT 1,
  profitto_totale DECIMAL(10,2) NOT NULL DEFAULT 0,
  impostazioni JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Creazione tabella scalata_steps
CREATE TABLE IF NOT EXISTS public.scalata_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scalata_id UUID NOT NULL REFERENCES public.scalate(id) ON DELETE CASCADE,
  numero_passo INTEGER NOT NULL,
  stake DECIMAL(10,2) NOT NULL,
  quota DECIMAL(5,2),
  evento VARCHAR(255),
  risultato VARCHAR(50) DEFAULT 'pending',
  profitto DECIMAL(10,2) DEFAULT 0,
  data_evento TIMESTAMP WITH TIME ZONE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scalata_id, numero_passo)
);

-- 3. Creazione indici per performance
CREATE INDEX IF NOT EXISTS idx_scalate_user_id ON public.scalate(user_id);
CREATE INDEX IF NOT EXISTS idx_scalate_stato ON public.scalate(stato);
CREATE INDEX IF NOT EXISTS idx_scalata_steps_scalata_id ON public.scalata_steps(scalata_id);
CREATE INDEX IF NOT EXISTS idx_scalata_steps_numero_passo ON public.scalata_steps(numero_passo);

-- 4. Abilitazione Row Level Security (RLS)
ALTER TABLE public.scalate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scalata_steps ENABLE ROW LEVEL SECURITY;

-- 5. Policy per tabella scalate
CREATE POLICY "Users can view own scalate" ON public.scalate
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scalate" ON public.scalate
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scalate" ON public.scalate
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scalate" ON public.scalate
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Policy per tabella scalata_steps
CREATE POLICY "Users can view own scalata_steps" ON public.scalata_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own scalata_steps" ON public.scalata_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own scalata_steps" ON public.scalata_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own scalata_steps" ON public.scalata_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.scalate 
      WHERE scalate.id = scalata_steps.scalata_id 
      AND scalate.user_id = auth.uid()
    )
  );

-- 7. Inserimento dati di esempio (opzionale)
-- Nota: Sostituisci 'your-user-id-here' con un ID utente valido
/*
INSERT INTO public.scalate (
  user_id, 
  nome, 
  descrizione, 
  stake_iniziale, 
  profitto_target, 
  passi_massimi,
  bankroll_attuale
) VALUES (
  'your-user-id-here',
  'Scalata Test',
  'Scalata di esempio per test',
  10.00,
  100.00,
  5,
  10.00
);
*/