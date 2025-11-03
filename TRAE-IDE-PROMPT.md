# PROMPT PER TRAE IDE - LUXURY DESIGN SYSTEM CONVERSION

Converti l'intero progetto seguendo questo design system luxury premium ispirato ad Apple. Applica OGNI dettaglio con precisione assoluta.

---

## 🎨 DESIGN SYSTEM CORE

### Color Palette (variabili CSS obbligatorie)
```css
:root {
    --primary-bg: #000000;
    --secondary-bg: #0a0a0a;
    --card-bg: rgba(255, 255, 255, 0.03);
    --glass-bg: rgba(255, 255, 255, 0.05);
    --border-color: rgba(255, 255, 255, 0.08);
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.6);
    --accent-gold: #d4af37;
    --accent-green: #00ff88;
    --accent-red: #ff3b6d;
    --accent-blue: #0066ff;
    --shadow-glow: rgba(212, 175, 55, 0.15);
}
```

### Tipografia
- **Font primario**: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- **Font weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)
- **Smoothing**: -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
- **Titoli grandi**: letter-spacing: -2px per h1, -1px per h2, -0.5px per h3
- **Body text**: line-height: 1.6
- **Labels uppercase**: letter-spacing: 1px, font-weight: 500

### Spacing Scale
- Micro: 0.5rem (8px)
- Small: 1rem (16px)
- Medium: 1.5rem (24px)
- Large: 2rem (32px)
- XL: 4rem (64px)
- Padding cards: 2rem
- Gap grids: 2rem

---

## 🏗️ COMPONENTI ARCHITETTURALI

### 1. BACKGROUND ANIMATO
```css
/* Sfondo con orb fluttuanti blur */
.bg-gradient {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    opacity: 0.4;
}

.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: float 20s ease-in-out infinite;
}

/* 3 orb con colori diversi: oro, blu, verde */
/* Dimensioni: 600px, 400px, 500px */
/* Gradienti radial con trasparenze 0.3, 0.2, 0.15 */
```

**Animation float**: movimento organico su 4 keyframes (translate + scale variabili)

---

### 2. NAVIGATION BAR
```css
nav {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    backdrop-filter: blur(20px) saturate(180%);
    background: rgba(0, 0, 0, 0.7);
    border-bottom: 1px solid var(--border-color);
}
```

**Struttura**:
- Logo: gradient gold→white con text-fill-color: transparent
- Links: hover con underline animato (width 0→100%, 0.3s cubic-bezier)
- Button CTA: gradient gold, border-radius: 20px, shadow glow, hover translateY(-2px)

---

### 3. GLASSMORPHISM CARDS
```css
.card {
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
    transform: translateY(-8px);
    border-color: rgba(212, 175, 55, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 
                0 0 40px var(--shadow-glow);
}

/* Linea gradient top su hover */
.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
    opacity: 0;
    transition: opacity 0.4s;
}

.card:hover::before {
    opacity: 1;
}
```

**Card Header**:
- Flex space-between
- Title: 1.4rem, font-weight: 700, letter-spacing: -0.5px

**Badges**:
```css
.badge {
    padding: 0.4rem 1rem;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-live {
    background: rgba(0, 255, 136, 0.15);
    color: var(--accent-green);
    border: 1px solid rgba(0, 255, 136, 0.3);
    animation: pulse 2s ease-in-out infinite;
}
/* Altri badge: hot (red), premium (gold) */
```

---

### 4. BUTTONS SYSTEM
```css
/* Primary Button */
.btn-primary {
    background: linear-gradient(135deg, var(--accent-green), #00cc70);
    color: #000;
    box-shadow: 0 4px 20px rgba(0, 255, 136, 0.2);
    padding: 1rem;
    border-radius: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(0, 255, 136, 0.3);
}

/* Secondary Button */
.btn-secondary {
    background: var(--card-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    /* Stessi padding e styling */
}

.btn-secondary:hover {
    background: var(--glass-bg);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
}
```

---

### 5. CHARTS SVG
```html
<div class="chart-container">
    <svg class="chart-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
        <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(0,255,136,0.3);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(0,255,136,0);stop-opacity:1" />
            </linearGradient>
        </defs>
        <path d="M 0 150 Q 100 120, 200 100 T 400 60" stroke="#00ff88" stroke-width="2" fill="none"/>
        <path d="M 0 150 Q 100 120, 200 100 T 400 60 L 400 200 L 0 200 Z" fill="url(#gradient1)"/>
    </svg>
</div>
```

```css
.chart-container {
    height: 200px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    margin: 1.5rem 0;
    overflow: hidden;
}
```

**Colori gradient per diversi chart**: verde (#00ff88), oro (#d4af37), blu (#0066ff)

---

### 6. METRICS & DATA DISPLAY
```css
.metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
}

.metric-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
}

.metric-value {
    font-size: 1.1rem;
    font-weight: 600;
}

/* Colori semantici */
.value-positive { color: var(--accent-green); }
.value-negative { color: var(--accent-red); }
.value-neutral { color: var(--text-primary); }
```

---

### 7. LEADERBOARD
```css
.leaderboard-item {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.leaderboard-item:hover {
    background: var(--card-bg);
    border-color: rgba(212, 175, 55, 0.3);
    transform: translateX(8px);
}

.rank {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent-gold), #f4d03f);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

---

## ⚡ ANIMAZIONI & TRANSIZIONI

### Timing Functions (SEMPRE queste)
```css
/* Default per interazioni */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Per animazioni più lente/fluide */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

/* Mai usare ease, ease-in-out, linear */
```

### Hover Effects Patterns
1. **Cards**: translateY(-8px) + border color change + double shadow
2. **Buttons**: translateY(-2px) + shadow intensity increase
3. **Links**: color change + underline width animation
4. **Leaderboard items**: translateX(8px) + background/border change

### Keyframe Animations
```css
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(50px, 50px) scale(1.1); }
    50% { transform: translate(-30px, 80px) scale(0.9); }
    75% { transform: translate(-80px, -40px) scale(1.05); }
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
@media (max-width: 768px) {
    /* Hero h1: 2.5rem invece di 4.5rem */
    /* Cards grid: 1 colonna */
    /* Nav links: nascosti */
    /* Stats bar: 1 colonna */
}
```

### Grid Layouts
```css
/* Cards */
grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
gap: 2rem;

/* Stats bar */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1.5rem;
```

---

## 🎯 REGOLE RIGIDE DA SEGUIRE

### Border Radius Hierarchy
- Cards grandi: 24px
- Buttons/Badges: 16-20px
- Charts/Immagini: 16px
- NO border-radius sotto 12px

### Shadow System
```css
/* Elevated cards */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 
            0 0 40px var(--shadow-glow);

/* Buttons */
box-shadow: 0 4px 20px rgba(COLOR, 0.2);

/* Hover buttons */
box-shadow: 0 6px 30px rgba(COLOR, 0.3);
```

### Text Gradients
```css
background: linear-gradient(135deg, START_COLOR, END_COLOR);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```
Usare per: logo, titoli hero, numeri stats, rank leaderboard

### Backdrop Blur
```css
backdrop-filter: blur(20px) saturate(180%);
/* Sempre con background rgba semi-trasparente */
```

---

## 📋 CHECKLIST CONVERSIONE

Per OGNI componente esistente:

1. ✅ Applica color palette (no colori custom)
2. ✅ Aggiungi glassmorphism (background + border + blur)
3. ✅ Border radius minimo 16px
4. ✅ Transitions con cubic-bezier(0.4, 0, 0.2, 1)
5. ✅ Hover con translateY/X + shadow
6. ✅ Typography Inter con weights corretti
7. ✅ Spacing 2rem per padding cards
8. ✅ Text gradients per elementi premium
9. ✅ Badges con border + background trasparente
10. ✅ Shadow glow su elementi interattivi

### Sostituisci SEMPRE:
- ❌ Colori flat → ✅ Gradienti + trasparenze
- ❌ Border solidi → ✅ Border rgba sottili
- ❌ Background opachi → ✅ Glassmorphism
- ❌ Hover semplici → ✅ Hover con elevation
- ❌ Transition lineari → ✅ cubic-bezier
- ❌ Shadow basic → ✅ Double shadow con glow

---

## 🚀 IMPLEMENTAZIONE

### Ordine di conversione:
1. Setup variabili CSS root
2. Background animato con orb
3. Navigation bar
4. Layout grids
5. Cards con glassmorphism
6. Buttons system
7. Typography overhaul
8. Charts/Data visualization
9. Animations/Transitions polish
10. Responsive adjustments

### Test finale:
- [ ] Tutti gli hover funzionano fluidi
- [ ] Backdrop blur visibile ovunque
- [ ] Gradienti text visibili
- [ ] Shadow glow presente su interactive elements
- [ ] Border radius consistenti
- [ ] Spacing uniforme (2rem cards, 1.5rem gaps)
- [ ] Colori SOLO dalla palette
- [ ] Font Inter caricato correttamente
- [ ] Animazioni smooth (no lag)
- [ ] Responsive funzionante

---

## 💎 ELEMENTI SIGNATURE

Questi dettagli rendono il design UNICO:

1. **Orb blur animati** sullo sfondo (3 elementi, colori diversi)
2. **Linea gradient** in alto alle cards su hover
3. **Double shadow** (black + colored glow) su elevations
4. **Text-fill transparent** con gradient per premium elements
5. **Pulse animation** su badge live
6. **Rank gradient** oro nella leaderboard
7. **Chart SVG** con path + gradient fill
8. **Cubic-bezier** custom per TUTTE le transition
9. **Backdrop blur 20px** con saturate 180%
10. **Letter-spacing negativo** su titoli grandi

---

## ⚠️ NON FARE MAI:

❌ Usare colori non nella palette
❌ Border radius sotto 12px
❌ Transition con ease/linear
❌ Background opachi (sempre rgba)
❌ Shadow singolo su cards
❌ Hover senza translate
❌ Font diverso da Inter
❌ Border spessi (max 1px)
❌ Spacing random (usa la scale)
❌ Colori text senza semantic meaning

---

## 🎨 EXTRA: COMPONENTI AGGIUNTIVI

Se devi creare nuovi componenti, segui questi pattern:

### Modal/Dialog
```css
.modal {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

### Input Fields
```css
.input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    color: var(--text-primary);
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input:focus {
    border-color: var(--accent-gold);
    box-shadow: 0 0 20px var(--shadow-glow);
    outline: none;
}
```

### Tabs/Segmented Control
```css
.tabs {
    display: flex;
    background: var(--card-bg);
    border-radius: 16px;
    padding: 0.5rem;
    gap: 0.5rem;
}

.tab {
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    background: transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab.active {
    background: var(--glass-bg);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

---

## 📝 NOTE FINALI

Questo design system è **premium**, **coeso** e **professionale**. Ogni elemento deve sembrare parte di un'unica famiglia visiva. La chiave è la **consistenza assoluta**: stessi border-radius, stessi spacing, stesse transition, stessa palette.

Non improvvisare. Segui OGNI dettaglio. Il risultato finale deve essere **indistinguibile da un prodotto Apple** ma con personalità luxury unica per bet trading.

**Obiettivo**: Design che fa sentire l'utente in una piattaforma da €10,000/mese di membership.
