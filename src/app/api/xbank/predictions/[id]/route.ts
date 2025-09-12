import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const updateData: any = {
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

    // Aggiorna il pronostico
    const { data, error } = await supabaseAdmin
      .from('xbank_custom_predictions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        xbank_prediction_groups(name, color)
      `)
      .single()

    if (error) {
      console.error('Error updating custom prediction:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del pronostico' },
        { status: 500 }
      )
    }

    // Se il pronostico è stato chiuso, aggiorna il bankroll
    if (status && status !== 'pending' && existingPrediction.status === 'pending') {
      const profit = status === 'won' 
        ? (parseFloat(result_amount) || (parseFloat(stake_amount) * parseFloat(odds) - parseFloat(stake_amount)))
        : -parseFloat(stake_amount)

      // Aggiorna il bankroll dell'utente
      await supabaseAdmin.rpc('update_user_bankroll', {
        p_user_id: user.id,
        p_amount: profit
      })

      // Registra la transazione nel bankroll tracking
      await supabaseAdmin
        .from('xbank_bankroll_tracking')
        .insert({
          user_id: user.id,
          prediction_id: id,
          transaction_type: status === 'won' ? 'win' : 'loss',
          amount: Math.abs(profit),
          description: `${status === 'won' ? 'Vincita' : 'Perdita'} pronostico: ${title}`,
          balance_after: 0 // Verrà aggiornato dal trigger
        })
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