# 🎨 Design & UX - Vertex

## 🎯 Design Philosophy

Vertex segue i principi di **Modern Minimalism** con focus su:
- **Clarity**: Informazioni chiare e immediate
- **Efficiency**: Azioni rapide e intuitive  
- **Trust**: Design professionale che ispira fiducia
- **Accessibility**: Usabilità per tutti gli utenti

---

## 🎨 Palette Colori

### Colori Primari
```css
/* Brand Colors */
--vertex-primary: #3B82F6      /* Blue 500 - Principale */
--vertex-primary-dark: #1D4ED8 /* Blue 700 - Hover/Active */
--vertex-primary-light: #DBEAFE /* Blue 100 - Background */

/* Accent Colors */
--vertex-success: #10B981      /* Green 500 - Successo */
--vertex-warning: #F59E0B      /* Amber 500 - Attenzione */
--vertex-danger: #EF4444       /* Red 500 - Errore */
--vertex-info: #06B6D4         /* Cyan 500 - Info */
```

### Colori Neutri
```css
/* Grays */
--vertex-gray-50: #F9FAFB
--vertex-gray-100: #F3F4F6
--vertex-gray-200: #E5E7EB
--vertex-gray-300: #D1D5DB
--vertex-gray-400: #9CA3AF
--vertex-gray-500: #6B7280
--vertex-gray-600: #4B5563
--vertex-gray-700: #374151
--vertex-gray-800: #1F2937
--vertex-gray-900: #111827

/* Dark Mode */
--vertex-dark-bg: #0F172A      /* Slate 900 */
--vertex-dark-surface: #1E293B /* Slate 800 */
--vertex-dark-border: #334155  /* Slate 700 */
```

### Colori Semantici
```css
/* Status Colors */
--vertex-win: #059669          /* Emerald 600 - Vincita */
--vertex-loss: #DC2626         /* Red 600 - Perdita */
--vertex-pending: #D97706      /* Orange 600 - In attesa */
--vertex-void: #6B7280         /* Gray 500 - Annullato */

/* Membership Tiers */
--vertex-basic: #8B5CF6        /* Violet 500 */
--vertex-premium: #F59E0B      /* Amber 500 */
--vertex-vip: #EC4899          /* Pink 500 */
```

---

## 📝 Tipografia

### Font Stack
```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace (per codici/numeri) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale Tipografica
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* H1 */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* H2 */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* H3 */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }    /* H4 */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }   /* Large */

/* Body Text */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* Base */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }   /* Small */
.text-xs { font-size: 0.75rem; line-height: 1rem; }       /* Extra Small */
```

### Font Weights
- **Light (300)**: Testi secondari
- **Regular (400)**: Corpo del testo
- **Medium (500)**: Enfasi leggera
- **Semibold (600)**: Titoli sezioni
- **Bold (700)**: Titoli principali

---

## 🧩 Sistema di Componenti

### 1. Layout Components

#### Header/Navigation
```
┌─────────────────────────────────────────────────────┐
│ [Logo] Navigation Items           [User] [Settings] │
└─────────────────────────────────────────────────────┘
```
- **Mobile**: Hamburger menu + bottom navigation
- **Desktop**: Horizontal navigation + sidebar

#### Sidebar
```
┌─────────────┐
│ 🏠 Dashboard │
│ 💰 X-Bank   │
│ 📊 Analytics│
│ ⚙️ Settings │
│ 👤 Profile  │
└─────────────┘
```

### 2. Data Display Components

#### Card Base
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
  border: 1px solid #E5E7EB;
}
```

#### Stats Card
```
┌─────────────────────┐
│ 📈 Bankroll        │
│ €1,250.00          │
│ +12.5% this month  │
└─────────────────────┘
```

#### Prediction Card
```
┌─────────────────────────────────┐
│ ⚽ Milan vs Inter               │
│ Over 2.5 Goals | 1.85 | 85%    │
│ [Dettagli] [Aggiungi]          │
└─────────────────────────────────┘
```

### 3. Interactive Components

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #3B82F6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #3B82F6;
  border: 1px solid #3B82F6;
  padding: 12px 24px;
  border-radius: 8px;
}
```

#### Form Elements
```css
/* Input Field */
.input {
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 4. Feedback Components

#### Toast Notifications
```
┌─────────────────────────────────┐
│ ✅ Predizione aggiunta con      │
│    successo!                    │
└─────────────────────────────────┘
```

#### Loading States
- **Skeleton**: Placeholder animati
- **Spinner**: Loading circolare
- **Progress Bar**: Per operazioni lunghe

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
.mobile { max-width: 640px; }      /* sm */
.tablet { max-width: 768px; }      /* md */
.laptop { max-width: 1024px; }     /* lg */
.desktop { max-width: 1280px; }    /* xl */
.wide { max-width: 1536px; }       /* 2xl */
```

### Layout Patterns

#### Mobile (< 768px)
- Stack verticale
- Bottom navigation
- Swipe gestures
- Touch-friendly (44px min)

#### Tablet (768px - 1024px)
- Sidebar collassabile
- Grid 2-3 colonne
- Gesture navigation

#### Desktop (> 1024px)
- Sidebar fissa
- Grid 3-4 colonne
- Hover states
- Keyboard shortcuts

---

## 🎭 Dark Mode

### Implementazione
```css
/* Light Mode (default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}

/* Dark Mode */
[data-theme="dark"] {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
}
```

### Toggle Implementation
- **System Preference**: Rispetta impostazioni OS
- **Manual Override**: Toggle utente persistente
- **Smooth Transition**: Animazione 200ms

## 🧪 Form & Input (Luxury System)

### Linee guida
- Usa i componenti condivisi `src/ui/Input.tsx` e `src/ui/Select.tsx` per tutti i form.
- Evita input/select/textarea grezzi con classi locali; preferisci i componenti.
- Mantieni `label`, `hint` e `error` tramite le props esposte.
- Non usare colori legacy viola: preferisci helper accent blu.

### Classi base (luxury.css)
- `lux-input`, `lux-select` per campi form coerenti.
- `lux-input-label`, `lux-input-hint`, `lux-input-error` per testi associati.
- Modali: `lux-modal-backdrop`, `lux-modal-content` per overlay/dialog.

### Esempi
```tsx
import Input from '@/ui/Input'
import Select from '@/ui/Select'

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  hint="Usa la tua email registrata"
/>

<Select
  label="Valuta"
  value={currency}
  onChange={(e) => setCurrency(e.target.value)}
  options=[
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'Dollaro (USD)' }
  ]
/>
```

### Migrazione dal legacy
- Sostituisci `bg/text/border-purple-*` e gradienti `to-purple-*` con helper accent blu.
- Allinea modali custom a `lux-modal-*`.
- Verifica `/login`, `/admin/login`, `/xbank` in dev.

---

## ♿ Accessibilità

### WCAG 2.1 Compliance

#### Contrasto Colori
- **AA Standard**: Minimo 4.5:1 per testo normale
- **AAA Standard**: Minimo 7:1 per testo importante
- **Large Text**: Minimo 3:1 per testi > 18px

#### Keyboard Navigation
- **Tab Order**: Logico e sequenziale
- **Focus Indicators**: Visibili e contrastati
- **Skip Links**: Per navigazione rapida

#### Screen Readers
- **Semantic HTML**: Uso corretto di heading, landmarks
- **ARIA Labels**: Descrizioni per elementi interattivi
- **Alt Text**: Immagini descrittive

---

## 🎯 UX Patterns

### Navigation Patterns
- **Breadcrumbs**: Per orientamento
- **Progressive Disclosure**: Informazioni graduali
- **Contextual Actions**: Azioni nel contesto

### Data Entry
- **Smart Defaults**: Valori pre-compilati
- **Inline Validation**: Feedback immediato
- **Auto-save**: Prevenzione perdita dati

### Feedback Patterns
- **Immediate Feedback**: Conferme istantanee
- **Progress Indicators**: Per operazioni lunghe
- **Error Recovery**: Suggerimenti per correzioni

---

## 📋 TODO Design

### Priorità Alta
- [ ] Finalizzare iconografia custom
- [ ] Creare design system Figma completo
- [ ] Implementare animazioni micro-interazioni
- [ ] Ottimizzare performance animazioni

### Priorità Media
- [ ] Creare template email transazionali
- [ ] Design onboarding flow
- [ ] Mockup mobile app nativa
- [ ] Illustrazioni custom per empty states

### Priorità Bassa
- [ ] Tema natalizio/stagionale
- [ ] Personalizzazione avatar utenti
- [ ] Gamification elements
- [ ] Advanced data visualizations

---

## 🔧 Tools & Resources

### Design Tools
- **Figma**: Design system e prototipi
- **Tailwind CSS**: Framework CSS utility-first
- **Lucide React**: Libreria icone
- **Radix UI**: Componenti accessibili

### Testing Tools
- **Lighthouse**: Performance e accessibilità
- **Wave**: Accessibility testing
- **Contrast Checker**: Verifica contrasti
- **Responsive Viewer**: Test multi-device

---

*[← Torna al Dashboard](./Dashboard.md)*