# 🛠️ Guida Setup Sviluppo - Mister Vertex

## 📋 Requisiti di Sistema

### **Software Richiesti**
- **Node.js**: ≥ 18.0.0 (LTS recommended)
- **npm**: ≥ 9.0.0 (incluso con Node.js)
- **Git**: ≥ 2.30.0
- **VS Code**: Recommended IDE
- **PostgreSQL**: ≥ 14.0 (per sviluppo locale opzionale)

### **Estensioni VS Code Consigliate**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### **Toolchain Aggiuntiva**
- **Supabase CLI**: Per gestione database locale
- **Vercel CLI**: Per deployment e testing
- **Docker**: Per containerizzazione (opzionale)

---

## 🚀 Setup Passo-Passo

### **Step 1: Clone Repository**
```bash
# Clone del repository
git clone https://github.com/paskferrari/mistervertex.git
cd mistervertex

# Verifica versione Node.js
node --version  # Deve essere ≥ 18.0.0
npm --version   # Deve essere ≥ 9.0.0
```

### **Step 2: Installazione Dipendenze**
```bash
# Installazione dipendenze
npm install

# Verifica installazione
npm list --depth=0
```

### **Step 3: Configurazione Environment**

#### 3.1 Crea file `.env.local`
```bash
# Copia template environment
cp .env.example .env.local  # Se disponibile
# OPPURE crea manualmente .env.local
```

#### 3.2 Configura variabili Supabase
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key

# Admin Configuration
ADMIN_EMAIL=admin@mistervertex.com
ADMIN_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Development
NODE_ENV=development
PORT=3000
```

#### 3.3 Setup Supabase Project
1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea nuovo progetto
3. Copia URL e API keys in `.env.local`
4. Vai su SQL Editor
5. Esegui il contenuto di `supabase-schema.sql`

### **Step 4: Database Setup**
```bash
# Esegui setup database completo
node database/execute_setup_complete.js

# Verifica setup
npm run db:verify  # Se disponibile
```

### **Step 5: Primo Avvio**
```bash
# Avvia server di sviluppo
npm run dev

# L'applicazione sarà disponibile su:
# http://localhost:3000
```

### **Step 6: Verifica Setup**
1. **Frontend**: Apri http://localhost:3000
2. **Admin**: Vai su http://localhost:3000/admin/login
3. **API**: Testa http://localhost:3000/api/health (se disponibile)
4. **Database**: Verifica connessione Supabase

---

## 🔧 Comandi di Sviluppo

### **Comandi Principali**
```bash
# Sviluppo
npm run dev              # Avvia server sviluppo
npm run dev:debug        # Avvia con debug mode
npm run dev:webpack      # Avvia con webpack analyzer

# Build e Deploy
npm run build            # Build production
npm run start            # Avvia build production
npm run export           # Export statico (se configurato)

# Quality Assurance
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript check
npm run format           # Prettier formatting

# Testing (da implementare)
npm run test             # Unit tests
npm run test:watch       # Test in watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # End-to-end tests

# Database
npm run db:reset         # Reset database
npm run db:seed          # Seed dati di test
npm run db:migrate       # Esegui migrazioni
npm run db:backup        # Backup database
```

### **Comandi Utility**
```bash
# Analisi e Debug
npm run analyze          # Bundle analyzer
npm run health           # Health check
npm run clean            # Pulisci cache e build

# Supabase (se CLI installato)
supabase start           # Avvia Supabase locale
supabase stop            # Ferma Supabase locale
supabase db reset        # Reset database locale
supabase gen types       # Genera TypeScript types
```

---

## 🌿 Policy Branch e Git Workflow

### **Branch Strategy**
```
main
├── develop
├── feature/feature-name
├── bugfix/bug-description
├── hotfix/critical-fix
└── release/version-number
```

### **Branch Naming Convention**
- **Feature**: `feature/user-authentication`
- **Bug Fix**: `bugfix/login-validation-error`
- **Hot Fix**: `hotfix/critical-security-patch`
- **Release**: `release/v1.2.0`
- **Chore**: `chore/update-dependencies`

### **Commit Convention**
Utilizziamo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>(<scope>): <description>

# Esempi
feat(auth): add user registration endpoint
fix(ui): resolve mobile navigation bug
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): optimize database queries
test(auth): add unit tests for login flow
chore(deps): update next.js to v15.5.3
```

### **Git Workflow**
```bash
# 1. Crea nuovo branch da develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Sviluppa e commit
git add .
git commit -m "feat(feature): implement new feature"

# 3. Push e crea PR
git push origin feature/new-feature
# Crea Pull Request su GitHub

# 4. Dopo merge, cleanup
git checkout develop
git pull origin develop
git branch -d feature/new-feature
```

### **Pre-commit Hooks**
```bash
# Installa husky per pre-commit hooks
npm install --save-dev husky lint-staged

# Configura in package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 🏷️ Naming Convention Release

### **Versioning Strategy**
Utilizziamo [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Esempi:
v1.0.0 - Initial release
v1.1.0 - New features
v1.1.1 - Bug fixes
v2.0.0 - Breaking changes
```

### **Release Types**
- **Major (X.0.0)**: Breaking changes, architettura significativa
- **Minor (0.X.0)**: Nuove features, backward compatible
- **Patch (0.0.X)**: Bug fixes, security patches

### **Release Naming**
```bash
# Git tags
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# Branch release
release/v1.2.0

# Deployment environments
- development: develop branch
- staging: release/v1.2.0
- production: main (tagged)
```

### **Release Process**
```bash
# 1. Crea release branch
git checkout develop
git checkout -b release/v1.2.0

# 2. Update version
npm version minor  # Aggiorna package.json

# 3. Build e test
npm run build
npm run test

# 4. Merge in main
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# 5. Deploy
git push origin main --tags
```

---

## 🔍 Troubleshooting

### **Problemi Comuni**

#### **Build Errors**
```bash
# TypeScript errors
npm run type-check
# Fix errors in indicated files

# ESLint errors
npm run lint:fix
# Review and fix remaining issues

# Dependency issues
rm -rf node_modules package-lock.json
npm install
```

#### **Database Connection**
```bash
# Verifica variabili environment
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Test connessione
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
console.log('Supabase client created successfully');
"
```

#### **Port Already in Use**
```bash
# Trova processo su porta 3000
lsof -ti:3000

# Termina processo
kill -9 $(lsof -ti:3000)

# Oppure usa porta diversa
PORT=3001 npm run dev
```

#### **Memory Issues**
```bash
# Aumenta memoria Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Pulisci cache
npm run clean
rm -rf .next
```

### **Debug Tools**

#### **React Developer Tools**
- Installa estensione browser
- Usa per debug componenti React

#### **Network Debugging**
```bash
# Abilita debug mode
DEBUG=* npm run dev

# Log API calls
export NODE_ENV=development
export LOG_LEVEL=debug
```

#### **Database Debugging**
```sql
-- Verifica tabelle Supabase
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica dati utente
SELECT * FROM users LIMIT 5;
```

---

## 📚 Risorse Utili

### **Documentazione**
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### **Tools Online**
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind CSS Playground](https://play.tailwindcss.com)
- [Regex101](https://regex101.com)
- [JSON Formatter](https://jsonformatter.org)

### **Community**
- [Next.js Discord](https://discord.gg/nextjs)
- [React Discord](https://discord.gg/react)
- [Supabase Discord](https://discord.supabase.com)

---

*Ultimo aggiornamento: 2024-01-20*  
*Per supporto: Contatta il team di sviluppo*