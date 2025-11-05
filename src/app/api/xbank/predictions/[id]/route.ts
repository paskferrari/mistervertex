import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface PredictionUpdateData {
  updated_at: string
  title?: string
  description?: string
  odds?: number
  stake_amount?: number
  stake_type?: string
  confidence?: string
  event_date?: string | null
  bookmaker?: string
  market_type?: string
  group_id?: string | null
  tags?: string[]
  status?: string
  settled_at?: string | null
  result_amount?: number | null
}

// PUT - Aggiorna un pronostico personalizzato
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      odds,
      stake_amount,
      stake_type,
      confidence,
      event_date,
      bookmaker,
      market_type,
      group_id,
      tags,
      status,
      result_amount
    } = body

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

    // Verifica che il pronostico appartenga all'utente
    const { data: existingPrediction } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (!existingPrediction) {
      return NextResponse.json(
        { error: 'Pronostico non trovato' },
        { status: 404 }
      )
    }

    if (existingPrediction.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo pronostico' },
        { status: 403 }
      )
    }

    // Prepara i dati per l'aggiornamento
    const updateData: PredictionUpdateData = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (odds !== undefined) updateData.odds = parseFloat(odds)
    if (stake_amount !== undefined) updateData.stake_amount = parseFloat(stake_amount)
    if (stake_type !== undefined) updateData.stake_type = stake_type
    if (confidence !== undefined) updateData.confidence = confidence
    if (event_date !== undefined) updateData.event_date = event_date ? new Date(event_date).toISOString() : null
    if (bookmaker !== undefined) updateData.bookmaker = bookmaker
    if (market_type !== undefined) updateData.market_type = market_type
    if (group_id !== undefined) updateData.group_id = group_id
    if (tags !== undefined) updateData.tags = tags
    if (status !== undefined) {
      updateData.status = status
      if (status !== 'pending') {
        updateData.settled_at = new Date().toISOString()
      }
    }
    if (result_amount !== undefined) updateData.result_amount = parseFloat(result_amount)

    // Aggiorna il pronostico con fallback per PGRST204 su settled_at
    let { data, error } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        xbank_prediction_groups(name, color)
      `)
      .single()

    if (error && String(error.message || '').includes('schema cache')) {
      console.warn('PGRST204 su settled_at, riprovo senza il campo settled_at')
      const { settled_at: _ignored, ...safeUpdate } = updateData
      const retry = await supabaseAdmin
        .from('xbank_custom_predictions')
        .update(safeUpdate)
        .eq('id', id)
        .select(`
          *,
          xbank_prediction_groups(name, color)
        `)
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) {
      console.error('Error updating custom prediction:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del pronostico' },
        { status: 500 }
      )
    }

    // Se il pronostico è stato chiuso, aggiorna il bankroll
    if (status && status !== 'pending' && existingPrediction.status === 'pending') {
      // Calcola il profitto usando i dati AGGIORNATI del pronostico
      const stake = parseFloat(String(data.stake_amount)) || 0
      const quota = parseFloat(String(data.odds)) || 0
      const result = data.result_amount !== null && data.result_amount !== undefined
        ? parseFloat(String(data.result_amount))
        : undefined

      const computedProfit = status === 'won'
        ? (typeof result === 'number' && !isNaN(result)
            ? result
            : (stake > 0 && quota > 0 ? (stake * quota - stake) : 0))
        : -stake

      // Recupera impostazioni utente per calcolare saldo corrente
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('xbank_user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!settingsError && settings) {
        const currentBalance = parseFloat(String(settings.current_bankroll)) || 0
        const newBalance = Math.round((currentBalance + computedProfit) * 100) / 100

        // Registra la transazione nel bankroll history
        await supabaseAdmin
          .from('bankroll_history')
          .insert({
            user_id: user.id,
            transaction_type: status === 'won' ? 'win' : 'loss',
            amount: Math.round(Math.abs(computedProfit) * 100) / 100,
            description: `${status === 'won' ? 'Vincita' : 'Perdita'} pronostico: ${data.title || ''}`,
            balance_before: currentBalance,
            balance_after: newBalance,
            reference_id: id,
            reference_type: 'custom_prediction'
          })

        // Aggiorna il bankroll corrente nelle impostazioni
        await supabaseAdmin
          .from('xbank_user_settings')
          .update({ current_bankroll: newBalance, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      } else {
        console.warn('Impostazioni utente non disponibili, salto update bankroll in PUT predictions')
      }
    }

    return NextResponse.json({
      message: 'Pronostico aggiornato con successo',
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

// DELETE - Elimina un pronostico personalizzato
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {

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

    // Verifica che il pronostico appartenga all'utente
    const { data: existingPrediction } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (!existingPrediction) {
      return NextResponse.json(
        { error: 'Pronostico non trovato' },
        { status: 404 }
      )
    }

    if (existingPrediction.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo pronostico' },
        { status: 403 }
      )
    }

    // Non permettere l'eliminazione di pronostici già chiusi
    if (existingPrediction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Non è possibile eliminare pronostici già chiusi' },
        { status: 400 }
      )
    }

    // Elimina il pronostico
    const { error } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting custom prediction:', error)
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione del pronostico' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pronostico eliminato con successo'
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}