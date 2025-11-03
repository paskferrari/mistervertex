# X-Bank API - Esempi Pratici di Utilizzo

Questa guida fornisce esempi pratici per utilizzare tutte le funzionalità X-Bank con dati reali degli utenti.

## Autenticazione

Tutte le richieste richiedono un token di autenticazione nell'header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 1. Inserimento Pronostici

### Esempio 1: Pronostico Calcio
```javascript
// POST /api/xbank/predictions
const response = await fetch('/api/xbank/predictions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    title: "Inter vs Milan - Vittoria Inter",
    description: "Derby della Madonnina. L'Inter è in ottima forma e gioca in casa. Quota interessante per la vittoria nerazzurra.",
    odds: 2.15,
    stake_amount: 50,
    stake_type: "fixed", // o "percentage"
    confidence: 85,
    event_date: "2024-02-10T20:45:00Z",
    bookmaker: "Bet365",
    market_type: "1X2",
    tags: ["calcio", "serie-a", "derby"]
  })
});

const result = await response.json();
console.log('Pronostico creato:', result.prediction);
```

### Esempio 2: Pronostico Tennis con Percentuale Bankroll
```javascript
// POST /api/xbank/predictions
const response = await fetch('/api/xbank/predictions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    title: "Djokovic vs Nadal - Vittoria Djokovic",
    description: "Finale ATP Masters. Djokovic ha vinto gli ultimi 3 scontri diretti su cemento.",
    odds: 1.85,
    stake_amount: 5, // 5% del bankroll
    stake_type: "percentage",
    confidence: 75,
    event_date: "2024-02-15T15:00:00Z",
    bookmaker: "Sisal",
    market_type: "Match Winner",
    tags: ["tennis", "atp", "finale"]
  })
});
```

## 2. Modifica/Aggiornamento Pronostici

### Esempio 1: Aggiornare Quote e Confidenza
```javascript
// PUT /api/xbank/predictions/[id]
const predictionId = "123e4567-e89b-12d3-a456-426614174000";

const response = await fetch(`/api/xbank/predictions/${predictionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    odds: 2.25, // Quote aggiornate
    confidence: 90, // Confidenza aumentata
    description: "Quote migliorate! Aggiornata anche la confidenza dopo le ultime notizie."
  })
});

const result = await response.json();
console.log('Pronostico aggiornato:', result.prediction);
```

### Esempio 2: Chiudere un Pronostico Vincente
```javascript
// PUT /api/xbank/predictions/[id]
const response = await fetch(`/api/xbank/predictions/${predictionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    status: "won",
    result_amount: 107.50 // 50 * 2.15 = 107.50
  })
});

// Il sistema aggiorna automaticamente il bankroll e registra la transazione
```

### Esempio 3: Chiudere un Pronostico Perdente
```javascript
// PUT /api/xbank/predictions/[id]
const response = await fetch(`/api/xbank/predictions/${predictionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    status: "lost",
    result_amount: 0
  })
});

// Il sistema sottrae automaticamente la puntata dal bankroll
```

## 3. Gestione Impostazioni Bankroll

### Esempio 1: Recuperare Impostazioni Attuali
```javascript
// GET /api/xbank/settings
const response = await fetch('/api/xbank/settings', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const settings = await response.json();
console.log('Bankroll attuale:', settings.bankroll_amount);
console.log('Impostazioni:', settings);
```

### Esempio 2: Aggiornare Bankroll e Impostazioni
```javascript
// PUT /api/xbank/settings
const response = await fetch('/api/xbank/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    bankroll_amount: 2000,
    default_stake_percentage: 3,
    max_stake_percentage: 10,
    risk_management: {
      max_daily_loss: 200,
      max_weekly_loss: 500,
      stop_loss_percentage: 20
    },
    notifications: {
      email_enabled: true,
      push_enabled: true,
      win_notifications: true,
      loss_notifications: true
    }
  })
});

const result = await response.json();
console.log('Impostazioni aggiornate:', result.settings);
```

## 4. Sistema Copy-Trade

### Esempio 1: Seguire un Trader di Successo
```javascript
// POST /api/xbank/copytrade
const response = await fetch('/api/xbank/copytrade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    followed_user_id: "trader123-uuid",
    follow_type: "user",
    copy_settings: {
      stake_mode: "percentage", // o "fixed"
      stake_percentage: 2, // 2% del mio bankroll per ogni sua puntata
      max_stake_amount: 100,
      min_confidence: 70, // Copia solo pronostici con confidenza >= 70%
      auto_copy: true,
      copy_tags: ["calcio", "tennis"], // Copia solo questi sport
      exclude_tags: ["live"] // Non copiare pronostici live
    }
  })
});

const result = await response.json();
console.log('Ora segui:', result.follow);
```

### Esempio 2: Seguire un Gruppo di Esperti
```javascript
// POST /api/xbank/copytrade
const response = await fetch('/api/xbank/copytrade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    followed_group_id: "group456-uuid",
    follow_type: "group",
    copy_settings: {
      stake_mode: "fixed",
      fixed_amount: 25, // Importo fisso per ogni pronostico del gruppo
      min_confidence: 80,
      auto_copy: false, // Copia manuale
      max_daily_copies: 3
    }
  })
});
```

### Esempio 3: Copiare Manualmente un Pronostico
```javascript
// POST /api/xbank/copytrade/copy
const response = await fetch('/api/xbank/copytrade/copy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    original_prediction_id: "pred789-uuid",
    follow_id: "follow123-uuid",
    custom_stake_amount: 75 // Importo personalizzato per questa copia
  })
});

const result = await response.json();
console.log('Pronostico copiato:', result.prediction);
```

### Esempio 4: Visualizzare Pronostici Disponibili per Copy-Trade
```javascript
// GET /api/xbank/copytrade/copy?status=pending&page=1&limit=10
const response = await fetch('/api/xbank/copytrade/copy?status=pending&page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log('Pronostici disponibili:', data.predictions);

// Ogni pronostico include:
// - Dati del pronostico originale
// - Info sul trader/gruppo
// - Flag already_copied per sapere se già copiato
```

### Esempio 5: Aggiornare Impostazioni Copy-Trade
```javascript
// PUT /api/xbank/copytrade/[followId]
const followId = "follow123-uuid";

const response = await fetch(`/api/xbank/copytrade/${followId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    copy_settings: {
      stake_mode: "percentage",
      stake_percentage: 1.5, // Ridotto da 2% a 1.5%
      min_confidence: 85, // Aumentato da 70% a 85%
      auto_copy: false // Disattivato auto-copy
    }
  })
});
```

### Esempio 6: Smettere di Seguire (Unfollow)
```javascript
// DELETE /api/xbank/copytrade/[followId]
const response = await fetch(`/api/xbank/copytrade/${followId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const result = await response.json();
console.log('Unfollow completato:', result.message);
```

## 5. Storico Bankroll e Transazioni

### Esempio 1: Visualizzare Storico Completo
```javascript
// GET /api/xbank/bankroll?page=1&limit=20
const response = await fetch('/api/xbank/bankroll?page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log('Transazioni:', data.transactions);
console.log('Paginazione:', data.pagination);
```

### Esempio 2: Filtrare Solo Vincite
```javascript
// GET /api/xbank/bankroll?type=win&page=1&limit=10
const response = await fetch('/api/xbank/bankroll?type=win&page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log('Solo vincite:', data.transactions);
```

## 6. Recupero Pronostici con Filtri

### Esempio 1: I Miei Pronostici Attivi
```javascript
// GET /api/xbank/predictions?status=pending&page=1&limit=10
const response = await fetch('/api/xbank/predictions?status=pending&page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log('Pronostici attivi:', data.predictions);
```

### Esempio 2: Pronostici di un Gruppo Specifico
```javascript
// GET /api/xbank/predictions?group_id=group123&status=all
const response = await fetch('/api/xbank/predictions?group_id=group123&status=all', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

const data = await response.json();
console.log('Pronostici del gruppo:', data.predictions);
```

## Esempi di Utilizzo Completi

### Scenario 1: Trader Esperto che Pubblica Pronostici
```javascript
// 1. Crea un nuovo pronostico
const newPrediction = await fetch('/api/xbank/predictions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TRADER_TOKEN'
  },
  body: JSON.stringify({
    title: "Juventus vs Napoli - Over 2.5 Goals",
    description: "Entrambe le squadre hanno attacchi prolifici. Prevedo almeno 3 gol.",
    odds: 1.95,
    stake_amount: 100,
    confidence: 88,
    event_date: "2024-02-20T20:45:00Z",
    bookmaker: "Bet365",
    market_type: "Over/Under",
    tags: ["calcio", "serie-a", "over"]
  })
});

// 2. Aggiorna il pronostico se cambiano le quote
const updatedPrediction = await fetch(`/api/xbank/predictions/${predictionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TRADER_TOKEN'
  },
  body: JSON.stringify({
    odds: 2.05, // Quote migliorate
    description: "Quote migliorate! Sempre più convinto del pronostico."
  })
});

// 3. Chiude il pronostico dopo la partita
const closedPrediction = await fetch(`/api/xbank/predictions/${predictionId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TRADER_TOKEN'
  },
  body: JSON.stringify({
    status: "won",
    result_amount: 205 // 100 * 2.05
  })
});
```

### Scenario 2: Utente che Fa Copy-Trade
```javascript
// 1. Cerca trader da seguire (tramite interfaccia utente)
// 2. Segue un trader di successo
const follow = await fetch('/api/xbank/copytrade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer USER_TOKEN'
  },
  body: JSON.stringify({
    followed_user_id: "expert_trader_id",
    follow_type: "user",
    copy_settings: {
      stake_mode: "percentage",
      stake_percentage: 2,
      min_confidence: 80,
      auto_copy: true
    }
  })
});

// 3. Il sistema copia automaticamente i nuovi pronostici del trader
// 4. L'utente può vedere i risultati nel suo storico
const myPredictions = await fetch('/api/xbank/predictions?page=1', {
  headers: { 'Authorization': 'Bearer USER_TOKEN' }
});
```

### Scenario 3: Gestione Completa del Bankroll
```javascript
// 1. Imposta il bankroll iniziale
const settings = await fetch('/api/xbank/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer USER_TOKEN'
  },
  body: JSON.stringify({
    bankroll_amount: 1000,
    default_stake_percentage: 2,
    max_stake_percentage: 5
  })
});

// 2. Monitora le performance
const bankrollHistory = await fetch('/api/xbank/bankroll', {
  headers: { 'Authorization': 'Bearer USER_TOKEN' }
});

// 3. Aggiusta le impostazioni in base ai risultati
const updatedSettings = await fetch('/api/xbank/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer USER_TOKEN'
  },
  body: JSON.stringify({
    default_stake_percentage: 1.5 // Riduce il rischio
  })
});
```

## Note Importanti

1. **Autenticazione**: Tutti gli endpoint richiedono un token JWT valido
2. **Permessi**: Le funzionalità X-Bank sono disponibili solo per utenti VIP e admin
3. **Validazione**: Tutti i dati vengono validati lato server
4. **Sicurezza**: Le transazioni bankroll sono tracciate e protette
5. **Performance**: Le query sono ottimizzate con indici appropriati
6. **Notifiche**: Il sistema può inviare notifiche per eventi importanti

## Codici di Errore Comuni

- `401`: Token mancante o non valido
- `403`: Accesso negato (utente non VIP)
- `400`: Dati di input non validi
- `404`: Risorsa non trovata
- `500`: Errore interno del server

Tutti gli errori includono un messaggio descrittivo in italiano per facilitare il debugging.