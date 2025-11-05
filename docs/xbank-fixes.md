# Fix funzionali X-BANK

Questa release interviene su tre aree critiche del modulo X-BANK: Bankroll, Pronostici e Scalate, introducendo validazioni robuste, allineamento dell’autenticazione e feedback utente chiari.

## Bankroll

- Aggiunta nuova API `GET/POST` su `GET /api/xbank/bankroll` e `POST /api/xbank/bankroll` con:
  - Autenticazione via `Authorization: Bearer <token>` e verifica ruolo su tabella `users` (`abbonato_vip` o `admin`).
  - Validazione input: tipo transazione (`deposit|withdrawal|adjustment`), importi numerici e positivi dove richiesto, descrizione obbligatoria.
  - Aggiornamento atomico di `xbank_user_settings.current_bankroll` e inserimento in `xbank_bankroll_tracking` con `balance_before/after`.
- UI `BankrollManager`: rafforzata la validazione client (importo positivo per depositi/prelievi) e gestione errori.

## Pronostici

- Ripristinata la cancellazione sicura: `PredictionsList` invia ora l’header `Authorization` al DELETE di `/api/xbank/predictions/:id` e mostra conferma prima dell’operazione.

## Scalate

- Allineate le route `/api/xbank/scalate` e `/api/xbank/scalate/[id]` a `supabaseAdmin` con autenticazione via bearer token e controllo ruolo su `users` (`abbonato_vip|admin`).
- `ScalateManager` invia l’`Authorization` in tutte le chiamate (GET, POST, PUT, DELETE) per garantire persistenza corretta.

## Test

- Aggiunti test unitari con Vitest per la funzione `validateAndComputeNewBalance` (`src/lib/xbank/bankroll.ts`) che coprono depositi, prelievi, regolazioni negative e casi di errore.

## Compatibilità e architettura

- Coerenza con il pattern esistente: uso di `supabaseAdmin` e `users.role` come negli altri endpoint X-BANK.
- Nessuna modifica ai nomi delle tabelle di scalate (`scalate`, `scalata_steps`).

## Note operative

- Per avviare in locale: `npm run dev` (porta `3000`).
- Per testare: `npm install` seguito da `npm run test`.