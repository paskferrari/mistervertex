# 🔧 Documentazione Tecnica - Vertex

## 🎯 Overview Tecnico

Vertex è costruito con un'architettura moderna **full-stack TypeScript** che privilegia performance, scalabilità e developer experience. La piattaforma utilizza microservizi containerizzati con deployment su AWS.

---

## 🌐 API Endpoints

### 🔐 Authentication

#### POST `/api/auth/login`
Autenticazione utente con email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Doe",
      "membership": "premium",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

#### POST `/api/auth/register`
Registrazione nuovo utente

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Smith",
  "acceptTerms": true
}
```

#### POST `/api/auth/refresh`
Refresh token di accesso

**Headers:**
```
Authorization: Bearer <refreshToken>
```

#### POST `/api/auth/logout`
Logout e invalidazione token

### 👤 User Management

#### GET `/api/users/profile`
Recupera profilo utente corrente

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "membership": "premium",
    "bankroll": 1250.50,
    "stats": {
      "totalBets": 156,
      "winRate": 0.67,
      "roi": 0.125,
      "profit": 312.75
    },
    "preferences": {
      "currency": "EUR",
      "timezone": "Europe/Rome",
      "notifications": true
    }
  }
}
```

#### PUT `/api/users/profile`
Aggiorna profilo utente

#### GET `/api/users/stats`
Statistiche dettagliate utente

#### PUT `/api/users/preferences`
Aggiorna preferenze utente

### 💰 X-Bank (Bankroll Management)

#### GET `/api/xbank/transactions`
Lista transazioni bankroll

**Query Parameters:**
- `page`: Numero pagina (default: 1)
- `limit`: Elementi per pagina (default: 20)
- `type`: Tipo transazione (bet, win, loss, deposit, withdrawal)
- `dateFrom`: Data inizio (ISO 8601)
- `dateTo`: Data fine (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_456",
        "type": "bet",
        "amount": -25.00,
        "description": "Milan vs Inter - Over 2.5",
        "odds": 1.85,
        "status": "pending",
        "createdAt": "2024-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "summary": {
      "totalDeposits": 1000.00,
      "totalWithdrawals": 200.00,
      "totalBets": 850.00,
      "totalWins": 1300.50,
      "currentBalance": 1250.50
    }
  }
}
```

#### POST `/api/xbank/transactions`
Crea nuova transazione

**Request:**
```json
{
  "type": "bet",
  "amount": 25.00,
  "description": "Milan vs Inter - Over 2.5",
  "odds": 1.85,
  "bookmaker": "Bet365",
  "sport": "football",
  "league": "Serie A"
}
```

#### GET `/api/xbank/balance`
Saldo attuale bankroll

#### GET `/api/xbank/stats`
Statistiche performance

### 🤖 AI Predictions

#### GET `/api/predictions`
Lista predizioni AI disponibili

**Query Parameters:**
- `sport`: Sport (football, basketball, tennis)
- `league`: Lega specifica
- `date`: Data partite (YYYY-MM-DD)
- `confidence`: Confidenza minima (0.0-1.0)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "id": "pred_789",
        "match": {
          "homeTeam": "AC Milan",
          "awayTeam": "Inter Milan",
          "league": "Serie A",
          "date": "2024-01-21T20:45:00Z",
          "venue": "San Siro"
        },
        "prediction": {
          "type": "over_under",
          "market": "Over 2.5 Goals",
          "odds": 1.85,
          "confidence": 0.78,
          "expectedValue": 0.125
        },
        "analysis": {
          "factors": [
            "Both teams high scoring average",
            "Historical head-to-head trends",
            "Recent form analysis"
          ],
          "riskLevel": "medium"
        },
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ],
    "meta": {
      "total": 15,
      "avgConfidence": 0.72,
      "sports": ["football", "basketball"]
    }
  }
}
```

#### GET `/api/predictions/{id}`
Dettagli predizione specifica

#### POST `/api/predictions/{id}/track`
Traccia predizione nel bankroll

### 📊 Analytics

#### GET `/api/analytics/dashboard`
Dati dashboard principale

#### GET `/api/analytics/performance`
Metriche performance dettagliate

#### GET `/api/analytics/trends`
Analisi trend e pattern

### 🔔 Notifications

#### GET `/api/notifications`
Lista notifiche utente

#### PUT `/api/notifications/{id}/read`
Marca notifica come letta

#### POST `/api/notifications/preferences`
Aggiorna preferenze notifiche

---

## 🗄️ Schema Database

### 📋 Tabelle Principali

#### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  membership_type VARCHAR(50) DEFAULT 'basic',
  bankroll DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_membership ON users(membership_type);
```

#### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- bet, win, loss, deposit, withdrawal
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  odds DECIMAL(5,2),
  bookmaker VARCHAR(100),
  sport VARCHAR(50),
  league VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### Predictions
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(255) NOT NULL,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  league VARCHAR(100) NOT NULL,
  sport VARCHAR(50) NOT NULL,
  match_date TIMESTAMP NOT NULL,
  prediction_type VARCHAR(100) NOT NULL,
  market VARCHAR(255) NOT NULL,
  odds DECIMAL(5,2) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  expected_value DECIMAL(5,4),
  analysis JSONB,
  result VARCHAR(50), -- win, loss, void, pending
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_sport ON predictions(sport);
CREATE INDEX idx_predictions_league ON predictions(league);
CREATE INDEX idx_predictions_match_date ON predictions(match_date);
CREATE INDEX idx_predictions_confidence ON predictions(confidence);
```

#### User_Predictions (Tracking)
```sql
CREATE TABLE user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  stake DECIMAL(10,2) NOT NULL,
  potential_return DECIMAL(10,2),
  actual_return DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active', -- active, won, lost, void
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, prediction_id)
);

CREATE INDEX idx_user_predictions_user_id ON user_predictions(user_id);
CREATE INDEX idx_user_predictions_status ON user_predictions(status);
```

#### Sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### 🔗 Relazioni Database

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : has
    USERS ||--o{ USER_PREDICTIONS : tracks
    USERS ||--o{ SESSIONS : has
    PREDICTIONS ||--o{ USER_PREDICTIONS : tracked_by
    
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        string membership_type
        decimal bankroll
        timestamp created_at
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        string type
        decimal amount
        string description
        decimal odds
        timestamp created_at
    }
    
    PREDICTIONS {
        uuid id PK
        string match_id
        string home_team
        string away_team
        string league
        decimal odds
        decimal confidence
        timestamp match_date
    }
```

---

## 🛠️ Scripts & Comandi Utili

### 🚀 Development

#### Setup Iniziale
```bash
# Clone repository
git clone https://github.com/vertex/vertex-platform.git
cd vertex-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npm run db:setup
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

#### Database Management
```bash
# Create new migration
npm run db:migration:create <migration_name>

# Run migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Database backup
npm run db:backup

# Database restore
npm run db:restore <backup_file>
```

#### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- transactions.test.ts

# Run tests for specific component
npm test -- --testNamePattern="UserProfile"
```

### 🏗️ Build & Deploy

#### Build Commands
```bash
# Build for production
npm run build

# Build and analyze bundle
npm run build:analyze

# Build Docker image
docker build -t vertex-platform .

# Build and push to registry
npm run docker:build:push
```

#### Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Deploy specific service
npm run deploy:api
npm run deploy:frontend

# Rollback deployment
npm run deploy:rollback

# Check deployment status
npm run deploy:status
```

### 📊 Monitoring & Maintenance

#### Health Checks
```bash
# Check application health
curl https://api.vertex.com/health

# Check database connection
npm run health:db

# Check external APIs
npm run health:external

# Full system check
npm run health:full
```

#### Performance
```bash
# Run performance tests
npm run perf:test

# Analyze bundle size
npm run analyze:bundle

# Check memory usage
npm run analyze:memory

# Database performance
npm run analyze:db
```

#### Logs & Debugging
```bash
# View application logs
npm run logs

# View error logs only
npm run logs:error

# View logs for specific service
npm run logs:api
npm run logs:worker

# Debug mode
npm run dev:debug

# Profile application
npm run profile
```

---

## 🔧 Configurazioni Ambiente

### 🌍 Environment Variables

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vertex
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
ODDS_API_KEY=your-odds-api-key
SPORTS_API_KEY=your-sports-api-key
OPENAI_API_KEY=your-openai-api-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1
S3_BUCKET=vertex-uploads

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

#### Optional Variables
```bash
# Development
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Features Flags
ENABLE_AI_PREDICTIONS=true
ENABLE_SOCIAL_FEATURES=false
ENABLE_AUTO_BETTING=false

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Cache
CACHE_TTL=3600
ENABLE_CACHE=true
```

### 🐳 Docker Configuration

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: vertex
      POSTGRES_USER: vertex
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 📋 TODO Tecnico

### 🔥 Priorità Critica
- [ ] Implementare rate limiting avanzato per API
- [ ] Setup monitoring real-time con alerting
- [ ] Completare test coverage >90%
- [ ] Implementare backup automatico database

### ⚡ Priorità Alta
- [ ] Ottimizzare query database per performance
- [ ] Implementare caching Redis per predizioni
- [ ] Setup CI/CD pipeline completa
- [ ] Implementare logging strutturato

### 🎯 Priorità Media
- [ ] Creare API documentation con Swagger
- [ ] Implementare health checks avanzati
- [ ] Setup load testing automatico
- [ ] Implementare feature flags system

### 📚 Priorità Bassa
- [ ] Creare SDK per sviluppatori esterni
- [ ] Implementare GraphQL endpoint
- [ ] Setup multi-region deployment
- [ ] Creare tool CLI per amministrazione

---

## 🔍 Troubleshooting

### 🚨 Problemi Comuni

#### Database Connection Issues
```bash
# Check database status
pg_isready -h localhost -p 5432

# Check connection from app
npm run health:db

# Reset database connections
npm run db:reset-connections
```

#### Performance Issues
```bash
# Check slow queries
npm run db:slow-queries

# Analyze memory usage
npm run analyze:memory

# Check API response times
npm run analyze:api-performance
```

#### Authentication Problems
```bash
# Verify JWT configuration
npm run auth:verify-config

# Check token expiration
npm run auth:check-tokens

# Reset user sessions
npm run auth:reset-sessions
```

---

*[← Torna al Dashboard](./Dashboard.md)*