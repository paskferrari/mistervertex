# 2) Prompt “FIX ESTETICI/UX AD ALTO IMPATTO”


GISCI COME: Senior UI/UX + FE engineer. Applica subito i miglioramenti visivi ad alto impatto con cambi minimi e coerenti.

OBIETTIVO
Rendere l’interfaccia più pulita, coerente, accessibile e moderna con pochi interventi mirati (1–2 giorni), poi refactor corto (1 settimana).


CONSEGNE
	•	Modifica componenti esistenti (Button, Input, Card, Typography, Navbar, Tabs).
	•	Non introdurre lib UI nuove.
	•	Ogni commit deve mappare chiaramente “file → cosa cambia → perché”.

INTERVENTI IMMEDIATI (Quick wins)

🎨 Tipografia & Gerarchia
	•	Crea una scala coerente:
	•	h1: text-4xl md:text-5xl font-semibold tracking-tight
	•	h2: text-2xl md:text-3xl font-semibold
	•	h3: text-xl md:text-2xl font-medium
	•	Body: text-base leading-7 text-muted-foreground
	•	Applica gli heading ai template/pagine principali (es. /xbank, dashboard).

🎨 Spaziatura & Card
	•	Standardizza card: rounded-2xl border shadow-sm p-6
	•	Riduci ombre pesanti (no shadow-lg by default).
	•	Usa griglia: container

<div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
e gap-6/gap-8 tra sezioni.

🎨 Button & Input
	•	Button primario:
    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 transition-all duration-200 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40"


    •	Button ghost/outline coerenti (stessi radius/padding/transitions).
	•	Input:
    className="rounded-xl border px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"


    🎨 Stati & Accessibilità
	•	Focus ring visibile su TUTTI i controlli: focus-visible:ring-2 focus-visible:ring-primary/40.
	•	Hover/active coerenti su link e tab.
	•	Evita testo grigio troppo chiaro: garantire contrasto AA (≥4.5:1).

🎨 Motion (micro)
	•	Aggiungi transition-all duration-200 ease-out a link, button, card-hover.
	•	Evita animazioni su layout critici (solo micro-feedback).

🎨 Responsive
	•	Verifica 5 breakpoint chiave (sm/md/lg/xl/2xl) per navbar, liste, card:
	•	Nessun overflow orizzontale.
	•	Titoli che non vanno a capo in modo sgradevole.

SNIPPET OPERATIVI

// Typography.tsx — esempio
export const H1 = (p) => <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" {...p} />;
export const H2 = (p) => <h2 className="text-2xl md:text-3xl font-semibold" {...p} />;
export const H3 = (p) => <h3 className="text-xl md:text-2xl font-medium" {...p} />;
export const P  = (p) => <p className="text-base leading-7 text-muted-foreground" {...p} />;

// Button.tsx — esempio§
export function Button({ className = "", ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 bg-primary text-primary-foreground transition-all duration-200 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      {...props}
    />
  );
}


/ Card.tsx — esempio

export const Card = (props) => (
  <div className="rounded-2xl border shadow-sm p-6" {...props} />
);

CRITERI DI ACCETTAZIONE (visual)
	•	Gerarchia chiara: H1/H2/H3 come da scala, body leggibile.
	•	Pulsanti e input coerenti (radius, padding, hover, focus).
	•	Nessun testo con contrasto insufficiente.
	•	Card pulite senza ombre eccessive; spacing coerente tra sezioni.
	•	Navbar e /xbank responsive senza overflow; tab leggibili e cliccabili.

REFactor corto (entro 1 settimana)
	•	Estrai “token” in classe utilitarie (es. btn, card, heading) o piccolo design system locale.
	•	Uniforma stati tab, badge e tag.
	•	Aggiungi empty/error/loading states coerenti (icona leggera + microcopy + CTA).


---

Se vuoi, posso anche **ripulire i prompt per TRAE in versione ultra-breve** (uno riga per riga da incollare al volo). Oppure dimmi da quale PR vuoi iniziare e ti scrivo **l’esatto diff** da applicare.