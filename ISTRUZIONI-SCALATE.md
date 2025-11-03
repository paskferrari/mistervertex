# 🔧 Istruzioni per Creare le Tabelle Scalate

## Problema Identificato
Gli errori nel componente `ScalateManager.tsx` sono causati dalla mancanza delle tabelle `scalate` e `scalata_steps` nel database Supabase.

## ✅ Soluzione: Creazione Manuale delle Tabelle

### Passo 1: Accedi al Dashboard Supabase
1. Vai su: https://supabase.com/dashboard
2. Effettua il login con le tue credenziali
3. Seleziona il progetto X-Bank

### Passo 2: Apri il SQL Editor
1. Nel menu laterale, clicca su **"SQL Editor"**
2. Clicca su **"New query"** per creare una nuova query

### Passo 3: Esegui il Codice SQL
1. Copia tutto il contenuto del file `scalate-tables.sql`
2. Incolla nel SQL Editor
3. Clicca su **"Run"** per eseguire

### Passo 4: Verifica la Creazione
Dopo l'esecuzione, dovresti vedere:
- ✅ Tabella `scalate` creata
- ✅ Tabella `scalata_steps` creata
- ✅ Indici creati per le performance
- ✅ Row Level Security (RLS) abilitato
- ✅ Policy di sicurezza configurate

## 🧪 Test dopo la Creazione

### Verifica Automatica
Esegui questo comando per verificare che le tabelle siano state create:
```bash
node check-scalate-tables.js
```

### Test del Componente
1. Ricarica la pagina X-Bank: http://localhost:3000/xbank
2. Vai alla sezione "Scalate"
3. Verifica che non ci siano più errori nella console
4. Prova a creare una nuova scalata

## 📋 Struttura delle Tabelle Create

### Tabella `scalate`
- **id**: UUID primario
- **user_id**: Riferimento all'utente
- **nome**: Nome della scalata
- **descrizione**: Descrizione opzionale
- **tipo**: Tipo di scalata (default: 'classica')
- **stake_iniziale**: Importo iniziale
- **profitto_target**: Obiettivo di profitto
- **passi_massimi**: Numero massimo di passi
- **stato**: Stato attuale ('attiva', 'completata', 'fallita', 'pausa')
- **bankroll_attuale**: Bankroll corrente
- **passo_attuale**: Passo corrente
- **profitto_totale**: Profitto accumulato
- **impostazioni**: Configurazioni aggiuntive (JSON)

### Tabella `scalata_steps`
- **id**: UUID primario
- **scalata_id**: Riferimento alla scalata
- **numero_passo**: Numero del passo
- **stake**: Importo scommesso
- **quota**: Quota della scommessa
- **evento**: Descrizione dell'evento
- **risultato**: Risultato ('pending', 'win', 'loss')
- **profitto**: Profitto del passo
- **data_evento**: Data dell'evento
- **note**: Note aggiuntive

## 🔒 Sicurezza
Le tabelle sono protette da Row Level Security (RLS):
- Ogni utente può vedere solo le proprie scalate
- Le operazioni sono limitate ai dati dell'utente autenticato
- Le policy garantiscono l'isolamento dei dati

## ❓ Risoluzione Problemi

### Se le tabelle non vengono create:
1. Verifica di essere loggato come proprietario del progetto
2. Controlla che il progetto Supabase sia attivo
3. Prova a eseguire i comandi SQL uno alla volta

### Se gli errori persistono:
1. Controlla la console del browser per errori specifici
2. Verifica che le variabili d'ambiente siano corrette
3. Riavvia il server Next.js: `npm run dev`

## 🎯 Risultato Atteso
Dopo aver completato questi passaggi:
- ✅ Nessun errore nella console per ScalateManager
- ✅ Interfaccia scalate completamente funzionale
- ✅ Possibilità di creare, modificare ed eliminare scalate
- ✅ Sistema di tracking dei passi operativo