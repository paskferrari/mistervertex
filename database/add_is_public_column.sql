-- Aggiunge la colonna is_public alla tabella xbank_prediction_groups
ALTER TABLE xbank_prediction_groups ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Commento sulla colonna
COMMENT ON COLUMN xbank_prediction_groups.is_public IS 'Indica se il gruppo di pronostici è pubblico o privato';