AGISCI COME: Lead dev + DB engineer + DevOps. Lavora in modalità “apply & verify”.

OBIETTIVO
Applica i seguenti interventi tecnici ad alto impatto, producendo PR atomiche con test e istruzioni di verifica locale.

CONSEGNE GENERALI (per ogni PR)
- Aggiorna file interessati con modifiche minimali e commenti essenziali.
- Aggiungi test (unit/integration) dove indicato.
- Scrivi nel body della PR: cosa è stato risolto, comandi per provare, esito atteso.
- Non introdurre nuove dipendenze senza motivo.

INTERVENTI DA ESEGUIRE (in PR distinte)

🔧 PR1 — Migrazioni DB: is_public + settled_at + bankroll_history
- Crea migrazione in `database/migrations/<timestamp>__xbank_columns.sql` con:

ALTER TABLE xbank_prediction_groups
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

ALTER TABLE xbank_custom_predictions
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ;
- Verifica che `bankroll_history` sia presente e indicizzata (user_id, created_at, transaction_type). Se mancano indici, aggiungi:

CREATE INDEX IF NOT EXISTS idx_bankroll_history_user_created
ON bankroll_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_predictions_status_user
ON xbank_custom_predictions(status, user_id, created_at DESC);


- ACCETTAZIONE:
- `POST /api/xbank/groups` accetta `is_public`.
- `PUT /api/xbank/predictions/:id` accetta `settled_at`.
- Flusso bankroll: deposito/prelievo + lettura lista popolata.

🔧 PR2 — Uniforma autenticazione Analytics (Supabase Bearer)
- File: `src/app/api/xbank/analytics/route.ts`
- Sostituisci JWT custom con Supabase Admin/Auth basato su Bearer:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eventuale controllo ruolo/abbonamento qui…
  // …poi logica analytics
  return NextResponse.json({ ok: true });
}


	•	ACCETTAZIONE:
	•	Nessun “secret or public key must be provided”.
	•	Rotte X-BANK usano Bearer Supabase coerente con il resto.

🔧 PR3 — Fix Hydration /xbank (SSR vs Client)
	•	File: src/app/xbank/page.tsx (+ eventuali componenti figli).
	•	Evita valori variabili in SSR (es. new Date(), Math.random()).
	•	Sposta dati volatile-only in useEffect.
	•	Se necessario, imposta:


    export const dynamic = 'force-dynamic';




        	•	Dove serve, usa guard lato client:
            const isClient = typeof window !== "undefined";
            return <>{isClient ? <RealComponent/> : null}</>;



	•	ACCETTAZIONE:
	•	Nessun warning “Hydration failed”.
	•	UI stabile al primo render e dopo navigazione.

🔧 PR4 — Unifica configurazione Next
	•	Mantieni un solo file (next.config.ts o .mjs). Rimuovi duplicato.
	•	Normalizza gli experimental: rimuovi flag non usati (es. optimizePackageImports vuoto).
	•	ACCETTAZIONE:
	•	Build pulita, nessun warning da doppia config.

🔧 PR5 — Deprecazione exec_sql e pipeline migrazioni
	•	Rimuovi utilizzi di rpc('exec_sql') per esecuzioni generiche.
	•	Standardizza su Supabase CLI migrations: tutte le DDL in database/migrations
	•	Aggiungi script:
	•	npm run db:migrate → applica migrazioni
	•	npm run db:seed → seed idempotente
	•	ACCETTAZIONE:
	•	Deploy locale riproducibile: db:migrate + db:seed senza errori.

🔧 PR6 — Indici + Query minimali + Assets 404
	•	Aggiungi indici indicati sopra.
	•	Rivedi liste per selezionare solo colonne necessarie nelle fetch.
	•	Rimuovi/ripara avatarOnBoarding.png 404.
	•	ACCETTAZIONE:
	•	Nessun 404 asset.
	•	Liste più reattive (verifica tempi e payload).

🔧 PR7 — Qualità codice e test minimi X-BANK
	•	Abilita tsc --noEmit in CI + lint.
	•	Aggiungi test integrazione minimi per: settings, predictions CRUD, groups CRUD, bankroll.
	•	ACCETTAZIONE:
	•	CI passa con lint+typecheck+tests.
	•	Copertura base presente per rotte X-BANK.

REGOLE OPERATIVE
	•	Sviluppo: usare npm run dev su porta 3000 (fermare altri server prima).
	•	Nessuna esposizione della SUPABASE_SERVICE_ROLE_KEY al client.
	•	RLS: confermare policy per tabelle X-BANK (accesso filtrato su auth.uid() dove appropriato).

VERIFICA FINALE (manuale)
	•	Bankroll: deposito → lista aggiornata (ordinata per created_at DESC).
	•	Predictions: create → update con status=won/lost + settled_at → riflesso in bankroll_history.
	•	Groups: create con is_public.
	•	/xbank senza hydration mismatch.
	•	Build senza warning.



