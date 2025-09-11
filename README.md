# Mister Vertex - Piattaforma di Betting Community

Una piattaforma web responsive per la community di betting gestita da Mister Vertex, con sistema di registrazione utenti, dashboard admin e gestione pronostici.

## 🚀 Caratteristiche

- **Landing Page Responsive**: Raccolta email degli utenti interessati
- **Dashboard Admin**: Gestione richieste email e creazione utenti
- **Sistema di Ruoli**: Admin, Guest, Abbonato (Base/Premium/VIP)
- **Autenticazione Sicura**: Integrazione con Supabase Auth
- **Design Moderno**: UI/UX ottimizzata con Tailwind CSS
- **Mobile First**: Completamente responsive per tutti i dispositivi

## 🛠️ Tecnologie Utilizzate

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, RLS)
- **Icons**: Lucide React
- **Deployment**: Vercel (consigliato)

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- Account Supabase

## ⚙️ Installazione

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai su Settings > API per ottenere:
   - Project URL
   - Anon public key
   - Service role key

### 3. Configura le variabili d'ambiente

Modifica `.env.local` e inserisci i tuoi valori:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_EMAIL=admin@mistervertex.com
ADMIN_PASSWORD=your_secure_password
```

### 4. Inizializza il database

1. Vai su Supabase Dashboard > SQL Editor
2. Copia e incolla il contenuto di `supabase-schema.sql`
3. Esegui lo script per creare tutte le tabelle e policies

### 5. Avvia il server di sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## 🗄️ Struttura Database

Il progetto utilizza Supabase con le seguenti tabelle:

- **email_requests**: Raccolta richieste di accesso
- **admin_users**: Gestione amministratori
- **users**: Utenti della piattaforma con ruoli
- **predictions**: Sistema pronostici
- **user_prediction_access**: Controllo accessi

### Setup Database
1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai su SQL Editor nel dashboard Supabase
3. Esegui il contenuto del file `supabase-schema.sql`
4. Crea un utente admin tramite Supabase Auth con email `admin@mistervertex.com`
5. Aggiorna l'hash della password nella tabella `admin_users` se necessario

### Ruoli Utente

- **Admin**: Accesso completo alla dashboard
- **Guest**: Accesso base
- **Abbonato Base**: Livello 1 di abbonamento
- **Abbonato Premium**: Livello 2 di abbonamento  
- **Abbonato VIP**: Livello 3 di abbonamento

## 📱 Pagine Principali

### Landing Page (`/`)
- Hero section con form raccolta email
- Sezioni features
- Design responsive e moderno

### Admin Login (`/admin/login`)
- Form di login per amministratori
- Validazione credenziali

### Admin Dashboard (`/admin/dashboard`)
- Gestione richieste email (approva/rifiuta)
- Creazione nuovi utenti
- Statistiche piattaforma

## 🚀 Prossimi Passi

1. **Configura Supabase**: Crea il progetto e esegui lo schema SQL
2. **Aggiorna .env.local**: Inserisci le tue credenziali Supabase
3. **Testa la piattaforma**: Avvia il server e testa tutte le funzionalità
4. **Deploy**: Pubblica su Vercel o altra piattaforma

---

**Mister Vertex** - La community di betting del futuro 🚀
# mistervertex
