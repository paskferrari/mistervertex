import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Elenca le quote di un pronostico personalizzato
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' }, { status: 403 })
    }

    const { data: existingPrediction } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .select('user_id')
      .eq('id', id)
      .single()
    if (!existingPrediction || existingPrediction.user_id !== user.id) {
      return NextResponse.json({ error: 'Pronostico non trovato o non autorizzato' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('xbank_prediction_odds')
      .select('*')
      .eq('prediction_id', id)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: 'Errore nel recupero delle quote' }, { status: 500 })
    return NextResponse.json({ odds: data || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// POST - Aggiunge una nuova quota al pronostico
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { label, market_type, selection, odds } = body

    // Sanifica e valida la quota (supporta virgole decimali)
    const oddsNum = typeof odds === 'string'
      ? parseFloat(odds.replace(',', '.'))
      : Number(odds)

    if (!Number.isFinite(oddsNum) || oddsNum <= 1) {
      return NextResponse.json({ error: 'Quota non valida: deve essere > 1.00' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' }, { status: 403 })
    }

    const { data: existingPrediction } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .select('user_id')
      .eq('id', id)
      .single()
    if (!existingPrediction || existingPrediction.user_id !== user.id) {
      return NextResponse.json({ error: 'Pronostico non trovato o non autorizzato' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('xbank_prediction_odds')
      .insert({
        prediction_id: id,
        label: label || null,
        market_type: market_type || null,
        selection: selection || null,
        odds: oddsNum,
        status: 'pending'
      })
      .select('*')
      .single()
    if (error) {
      console.error('Errore Supabase insert odds:', error)
      return NextResponse.json({ error: `Errore nella creazione della quota: ${error.message || 'sconosciuto'}` }, { status: 500 })
    }
    return NextResponse.json({ message: 'Quota aggiunta', odd: data }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// PUT - Aggiorna stato e importo risultato per più quote (bulk)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { odds_updates } = body as { odds_updates: Array<{ id: string, status: 'pending' | 'won' | 'lost' | 'void', result_amount?: number }> }
    if (!Array.isArray(odds_updates) || odds_updates.length === 0) {
      return NextResponse.json({ error: 'Nessun aggiornamento fornito' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' }, { status: 403 })
    }

    const { data: existingPrediction } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .select('user_id, status')
      .eq('id', id)
      .single()
    if (!existingPrediction || existingPrediction.user_id !== user.id) {
      return NextResponse.json({ error: 'Pronostico non trovato o non autorizzato' }, { status: 404 })
    }

    // Aggiorna quote
    for (const upd of odds_updates) {
      await supabaseAdmin
        .from('xbank_prediction_odds')
        .update({
          status: upd.status,
          result_amount: upd.result_amount !== undefined ? parseFloat(String(upd.result_amount)) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', upd.id)
        .eq('prediction_id', id)
    }

    // Ricalcola stato complessivo del pronostico
    const { data: allOdds } = await supabaseAdmin
      .from('xbank_prediction_odds')
      .select('status')
      .eq('prediction_id', id)

    let newStatus: 'pending' | 'won' | 'lost' | 'void' = 'pending'
    if (allOdds && allOdds.length > 0) {
      const statuses = allOdds.map(o => o.status)
      if (statuses.includes('lost')) newStatus = 'lost'
      else if (statuses.every(s => s === 'won')) newStatus = 'won'
      else if (statuses.every(s => s === 'void')) newStatus = 'void'
      else newStatus = 'pending'
    }

    await supabaseAdmin
      .from('xbank_custom_predictions')
      .update({
        status: newStatus,
        settled_at: newStatus !== 'pending' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return NextResponse.json({ message: 'Quote aggiornate', prediction_status: newStatus })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}