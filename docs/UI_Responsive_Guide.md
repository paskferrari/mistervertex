# Linee guida UI responsive e scroll

Queste regole garantiscono che ogni modal, div e container sia sempre visibile e correttamente scrollabile su qualsiasi dispositivo.

## Utility principali

- `modal-root`: wrapper fisso centrato per modali; gestisce z-index, layout e padding.
- `modal-responsive`: larghezze responsive dei modali (`sm/md/lg/xl`).
- `modal-content-scroll`: abilita lo scroll verticale interno, usa `90dvh` su mobile e `padding-bottom: env(safe-area-inset-bottom)`.
- `modal-header`: header dei modali con layout responsive.
- `modal-actions`: barra azioni con layout `column` su mobile, `row` su desktop.
- `section-scroll`: contenitore scrollabile per pannelli e liste; overscroll sicuro e scrollbar sottile.
- `mobile-scroll`: abilita scroll fluido su mobile e blocca scroll chaining.
- `safe-area-top|bottom|left|right`: padding per aree sicure su dispositivi con notch.
- `scrollbar-hide`: nasconde scrollbar dove necessario (ad es. menu orizzontali).
- `touch-target`: dimensione minima di 44×44px per target di tocco.

## Pattern consigliati

- Modali: usare `modal-root` come overlay, contenuto con `card modal-responsive modal-content-scroll`. Header in `modal-header`; azioni in `modal-actions`.
- Liste lunghe: avvolgere la lista con `section-scroll` o `mobile-scroll` per evitare overflow su viewport piccoli.
- Form: usare classi di `responsive-fixes.css` (`form-responsive`, `form-row`, `form-actions`) per impaginazione coerente.
- Safe area: aggiungere `safe-area-sides` o le utility `safe-area-*` dove i contenuti toccano i bordi del viewport.

## Accessibilità e performance

- Evitare scroll orizzontale indesiderato con `no-horizontal-scroll` sui container principali.
- Mantenere touch actions fluide con `touch-action: manipulation` e `-webkit-overflow-scrolling: touch`.
- Impostare font-size dei `input` a 16px su mobile per prevenire zoom su iOS (già incluso in `globals.css`).

## Implementazione di esempio

Nel componente `ScalateManager` i modali di creazione e dettagli usano `modal-root`, `modal-responsive` e `modal-content-scroll`, con header e azioni responsive, e safe-area sui lati per evitare contenuti coperti.