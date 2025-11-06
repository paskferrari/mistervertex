import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Recupera i pronostici personalizzati dell'utente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // pending, won, lost
    const group_id = searchParams.get('group_id')
    
    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token di autenticazione mancante' },
        { status: 401 }
      )
    }

    // Verifica l'utente con il token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Costruisci la query
    let query = supabaseAdmin
      .from('xbank_custom_predictions')
      .select(`
        *,
        xbank_prediction_groups(name, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Applica filtri
    if (status) {
      query = query.eq('status', status)
    }
    if (group_id) {
      query = query.eq('group_id', group_id)
    }

    // Paginazione
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching custom predictions:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei pronostici' },
        { status: 500 }
      )
    }

    // Recupera le quote associate senza dipendere da relazioni PostgREST
    let predictions = data || []
    if (predictions.length > 0) {
      const ids = predictions.map(p => p.id).filter(Boolean)
      const { data: oddsData, error: oddsError } = await supabaseAdmin
        .from('xbank_prediction_odds')
        .select('*')
        .in('prediction_id', ids)

      if (!oddsError && Array.isArray(oddsData)) {
        const byPrediction = new Map<string, any[]>()
        for (const odd of oddsData) {
          const pid = odd.prediction_id
          if (!byPrediction.has(pid)) byPrediction.set(pid, [])
          byPrediction.get(pid)!.push(odd)
        }
        predictions = predictions.map(p => ({
          ...p,
          xbank_prediction_odds: byPrediction.get(p.id) || []
        }))
      }
    }

    return NextResponse.json({
      predictions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo pronostico personalizzato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      odds,
      stake_amount,
      stake_type, // 'fixed' o 'percentage'
      confidence,
      event_date,
      bookmaker,
      market_type,
      group_id,
      tags
    } = body

    // Validazione completa
    const errors = []
    
    // Campi obbligatori
    if (!title || title.trim().length === 0) {
      errors.push('Il titolo è obbligatorio')
    }
    if (!odds) {
      errors.push('La quota è obbligatoria')
    }
    if (!stake_amount) {
      errors.push('L\'importo della puntata è obbligatorio')
    }
    
    // Validazione numerica
    const oddsNum = parseFloat(odds)
    const stakeNum = parseFloat(stake_amount)
    const confidenceNum = confidence ? parseInt(confidence) : 50
    
    if (isNaN(oddsNum) || oddsNum <= 1) {
      errors.push('La quota deve essere un numero maggiore di 1')
    }
    if (isNaN(stakeNum) || stakeNum <= 0) {
      errors.push('L\'importo della puntata deve essere un numero positivo')
    }
    if (isNaN(confidenceNum) || confidenceNum < 1 || confidenceNum > 100) {
      errors.push('La confidenza deve essere un numero tra 1 e 100')
    }
    
    // Validazione lunghezza campi
    if (title && title.length > 200) {
      errors.push('Il titolo non può superare i 200 caratteri')
    }
    if (description && description.length > 1000) {
      errors.push('La descrizione non può superare i 1000 caratteri')
    }
    
    // Validazione data evento
    if (event_date) {
      const eventDateTime = new Date(event_date)
      if (isNaN(eventDateTime.getTime())) {
        errors.push('La data dell\'evento non è valida')
      }
    }
    
    // Validazione stake_type
    if (stake_type && !['fixed', 'percentage'].includes(stake_type)) {
      errors.push('Il tipo di puntata deve essere "fixed" o "percentage"')
    }
    
    // Validazione tags
    if (tags && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) {
      errors.push('I tag devono essere un array di stringhe')
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Errori di validazione', details: errors },
        { status: 400 }
      )
    }

    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token di autenticazione mancante' },
        { status: 401 }
      )
    }

    // Verifica l'utente con il token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Crea il pronostico
    const { data, error } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .insert({
        user_id: user.id,
        title,
        description,
        odds: parseFloat(odds),
        stake_amount: parseFloat(stake_amount),
        stake_type: stake_type || 'fixed',
        confidence: confidence || 50,
        event_date: event_date ? new Date(event_date).toISOString() : null,
        bookmaker,
        market_type,
        group_id,
        tags: tags || [],
        status: 'pending'
      })
      .select(`
        *,
        xbank_prediction_groups(name, color)
      `)
      .single()

    if (error) {
      console.error('Error creating custom prediction:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del pronostico' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pronostico creato con successo',
      prediction: data
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}