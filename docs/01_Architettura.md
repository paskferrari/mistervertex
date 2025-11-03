# 🏗️ Architettura Vertex

## Panoramica Architetturale

Vertex è costruito seguendo un'architettura moderna **JAMstack** con separazione netta tra frontend, backend e database, ottimizzata per performance, scalabilità e manutenibilità.

---

## 🔧 Stack Tecnologico

### Frontend
- **Framework**: Next.js 15.5.3 (React 19.1.0)
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Lucide React, Radix UI
- **State Management**: React Hooks + Context API
- **Build Tool**: Webpack (dev) / Turbopack (prod)
- **PWA**: Service Worker + Manifest

### Backend & Database
- **BaaS**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth + JWT
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage

### DevOps & Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Linting**: ESLint
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **Monitoring**: Vercel Analytics

### External APIs
- **Sports Data**: API sportive per odds e statistiche
- **Payments**: Stripe (pianificato)
- **Notifications**: Web Push API
- **Analytics**: Vercel Analytics

---

## 🏛️ Diagramma Architetturale

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  📱 PWA (Next.js)     │  🌐 Web App        │  📊 Dashboard   │
│  - Service Worker     │  - React Components │  - Admin Panel  │
│  - Offline Support    │  - Responsive UI    │  - Analytics    │
│  - Push Notifications │  - Real-time Updates│  - User Mgmt    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  🔌 Next.js API Routes │  🔐 Supabase Edge Functions        │
│  - Custom endpoints    │  - Authentication                  │
│  - Middleware          │  - Authorization                   │
│  - Rate limiting       │  - Data validation                 │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  🧠 Core Services      │  📈 Analytics       │  💰 Payments  │
│  - User Management     │  - Prediction Engine│  - Stripe     │
│  - Bankroll Logic     │  - Performance Calc  │  - Billing    │
│  - Prediction System  │  - Reporting         │  - Invoicing  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  🗄️ Supabase PostgreSQL │  📊 External APIs  │  💾 Storage   │
│  - User profiles        │  - Sports data      │  - Files      │
│  - Predictions          │  - Odds providers   │  - Images     │
│  - Bankroll history     │  - Market data      │  - Backups    │
│  - Notifications        │  - Statistics       │  - Logs       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struttura del Progetto

```
bvertex/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 admin/              # Dashboard amministrativo
│   │   ├── 📁 api/                # API routes
│   │   ├── 📁 dashboard/          # Dashboard utente
│   │   ├── 📁 login/              # Autenticazione
│   │   ├── 📁 xbank/              # Modulo X-Bank
│   │   └── 📄 layout.tsx          # Layout principale
│   ├── 📁 components/             # Componenti React
│   │   ├── 📁 xbank/              # Componenti X-Bank
│   │   ├── 📄 Navigation.tsx      # Navigazione
│   │   └── 📄 PWAManager.tsx      # PWA logic
│   ├── 📁 hooks/                  # Custom hooks
│   ├── 📁 lib/                    # Utilities e config
│   └── 📁 styles/                 # CSS globali
├── 📁 public/                     # Asset statici
├── 📁 database/                   # Script SQL
├── 📁 docs/                       # Documentazione
└── 📄 package.json                # Dipendenze
```

---

## 🔄 Flusso Dati

### 1. Autenticazione
```
User Login → Supabase Auth → JWT Token → Client Storage → API Calls
```

### 2. Gestione Predizioni
```
User Input → Validation → Supabase DB → Real-time Updates → UI Refresh
```

### 3. Bankroll Management
```
Transaction → Business Logic → Database Update → Analytics Update → Notification
```

### 4. Real-time Features
```
Database Change → Supabase Realtime → WebSocket → Client Update → UI Refresh
```

---

## 🔐 Sicurezza

### Autenticazione & Autorizzazione
- **JWT Tokens**: Gestiti da Supabase Auth
- **Row Level Security**: Politiche PostgreSQL
- **API Protection**: Middleware di autenticazione
- **CORS**: Configurazione restrittiva

### Data Protection
- **Encryption**: HTTPS/TLS per tutte le comunicazioni
- **Sanitization**: Input validation su tutti gli endpoint
- **Rate Limiting**: Protezione contro abuse
- **Audit Logs**: Tracking delle azioni sensibili

---

## 📊 Performance & Scalabilità

### Frontend Optimization
- **Code Splitting**: Lazy loading dei componenti
- **Image Optimization**: Next.js Image component
- **Caching**: Service Worker + Browser cache
- **Bundle Analysis**: Webpack Bundle Analyzer

### Database Optimization
- **Indexing**: Indici ottimizzati per query frequenti
- **Connection Pooling**: Supabase connection pooler
- **Query Optimization**: Prepared statements
- **Backup Strategy**: Automated daily backups

### Monitoring
- **Error Tracking**: Console logging + Vercel insights
- **Performance Metrics**: Core Web Vitals
- **Uptime Monitoring**: Vercel deployment status
- **User Analytics**: Anonymized usage data

---

## 🚀 Deployment Strategy

### Environments
- **Development**: Local (localhost:3000)
- **Staging**: Vercel preview deployments
- **Production**: Vercel production + Supabase prod

### CI/CD Pipeline
```
Git Push → GitHub → Vercel Build → Automated Tests → Deploy → Health Check
```

### Rollback Strategy
- **Instant Rollback**: Vercel deployment history
- **Database Migrations**: Reversible SQL scripts
- **Feature Flags**: Gradual feature rollout

---

## 🔮 Architettura Futura

### Microservizi (Fase 2)
- **Prediction Service**: Servizio dedicato per AI/ML
- **Payment Service**: Gestione pagamenti isolata
- **Notification Service**: Sistema notifiche avanzato

### Scalabilità (Fase 3)
- **CDN**: Distribuzione globale contenuti
- **Load Balancing**: Distribuzione del carico
- **Caching Layer**: Redis per performance
- **Message Queue**: Elaborazione asincrona

---

*[← Torna al Dashboard](./Dashboard.md)*