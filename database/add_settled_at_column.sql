-- Aggiunge la colonna settled_at alla tabella xbank_custom_predictions
ALTER TABLE xbank_custom_predictions ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE;

-- Commento sulla colonna
COMMENT ON COLUMN xbank_custom_predictions.settled_at IS 'Data/ora di chiusura del pronostico (won/lost/void/cashout)';