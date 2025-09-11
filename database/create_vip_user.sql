-- Script per creare un utente VIP di test
-- IMPORTANTE: Eseguire PRIMA lo script setup_complete_database.sql per creare le tabelle

-- Utente VIP: golo@mistervertex.com
INSERT INTO public.users (id, email, role, subscription_level)
VALUES (
  '9a1a3cc0-2795-4571-85eb-7e985cc7506a',
  'golo@mistervertex.com',
  'abbonato_vip',
  3
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  subscription_level = EXCLUDED.subscription_level;

-- Crea le impostazioni X-BANK per l'utente VIP
INSERT INTO public.xbank_user_settings (user_id, initial_bankroll, current_bankroll)
VALUES (
  '9a1a3cc0-2795-4571-85eb-7e985cc7506a',
  5000.00,
  5000.00
)
ON CONFLICT (user_id) DO UPDATE SET
  initial_bankroll = EXCLUDED.initial_bankroll,
  current_bankroll = EXCLUDED.current_bankroll;

-- Verifica che l'utente sia stato creato/aggiornato correttamente
SELECT u.id, u.email, u.role, u.subscription_level, s.initial_bankroll, s.current_bankroll, u.created_at, u.updated_at 
FROM public.users u
LEFT JOIN public.xbank_user_settings s ON u.id = s.user_id
WHERE u.id = '9a1a3cc0-2795-4571-85eb-7e985cc7506a';

-- Commento: Dopo aver eseguito questo script, l'utente avrà accesso alle funzionalità VIP
-- incluse le notifiche X-BANK