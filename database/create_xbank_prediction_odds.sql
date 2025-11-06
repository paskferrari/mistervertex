-- Tabella per gestire quote multiple per i pronostici X-BANK
CREATE TABLE IF NOT EXISTS public.xbank_prediction_odds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES public.xbank_custom_predictions(id) ON DELETE CASCADE,
  label TEXT,
  market_type TEXT,
  selection TEXT,
  odds NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | won | lost | void
  result_amount NUMERIC(10,2), -- opzionale, utile per singola quota
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xbank_prediction_odds_prediction_id ON public.xbank_prediction_odds(prediction_id);
CREATE INDEX IF NOT EXISTS idx_xbank_prediction_odds_status ON public.xbank_prediction_odds(status);

-- RLS
ALTER TABLE public.xbank_prediction_odds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own prediction odds" ON public.xbank_prediction_odds;
CREATE POLICY "Users can view own prediction odds" ON public.xbank_prediction_odds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.xbank_custom_predictions p 
      WHERE p.id = xbank_prediction_odds.prediction_id 
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own prediction odds" ON public.xbank_prediction_odds;
CREATE POLICY "Users can insert own prediction odds" ON public.xbank_prediction_odds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.xbank_custom_predictions p 
      WHERE p.id = xbank_prediction_odds.prediction_id 
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own prediction odds" ON public.xbank_prediction_odds;
CREATE POLICY "Users can update own prediction odds" ON public.xbank_prediction_odds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.xbank_custom_predictions p 
      WHERE p.id = xbank_prediction_odds.prediction_id 
      AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own prediction odds" ON public.xbank_prediction_odds;
CREATE POLICY "Users can delete own prediction odds" ON public.xbank_prediction_odds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.xbank_custom_predictions p 
      WHERE p.id = xbank_prediction_odds.prediction_id 
      AND p.user_id = auth.uid()
    )
  );