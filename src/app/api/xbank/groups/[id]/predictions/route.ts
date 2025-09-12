import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

interface DecodedToken {
  userId: string
  email: string
  iat?: number
  exp?: number
}

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/xbank/groups/[id]/predictions - Recupera i pronostici di un gruppo
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    } catch {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('ruolo')
      .eq('id', decoded.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    if (userData.ruolo !== 'abbonato_vip') {
      return NextResponse.json({ error: 'Accesso negato. Richiesto abbonamento VIP.' }, { status: 403 })
    }

    const groupId = id

    // Verifica che il gruppo appartenga all'utente
    const { data: groupData, error: groupError } = await supabase
      .from('xbank_groups')
      .select('id')
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (groupError || !groupData) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Recupera i pronostici del gruppo
    const { data: predictions, error: predictionsError } = await supabase
      .from('xbank_predictions')
      .select(`
        id,
        title,
        description,
        sport,
        stake,
        total_odds,
        potential_win,
        confidence_level,
        prediction_type,
        status,
        event_date,
        created_at,
        notes,
        bets,
        result_profit
      `)
      .eq('user_id', decoded.userId)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (predictionsError) {
      console.error('Errore nel recupero dei pronostici del gruppo:', predictionsError)
      return NextResponse.json({ error: 'Errore nel recupero dei pronostici' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      predictions: predictions || []
    })

  } catch (error) {
    console.error('Errore nell\'API dei pronostici del gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// POST /api/xbank/groups/[id]/predictions - Aggiunge pronostici al gruppo
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try{
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    } catch {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('ruolo')
      .eq('id', decoded.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    if (userData.ruolo !== 'abbonato_vip') {
      return NextResponse.json({ error: 'Accesso negato. Richiesto abbonamento VIP.' }, { status: 403 })
    }

    const groupId = id
    const { predictionIds } = await request.json()

    if (!predictionIds || !Array.isArray(predictionIds)) {
      return NextResponse.json({ error: 'IDs dei pronostici richiesti' }, { status: 400 })
    }

    // Verifica che il gruppo appartenga all'utente
    const { data: groupData, error: groupError } = await supabase
      .from('xbank_groups')
      .select('id')
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (groupError || !groupData) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Verifica che tutti i pronostici appartengano all'utente
    const { data: predictions, error: predictionsError } = await supabase
      .from('xbank_predictions')
      .select('id')
      .eq('user_id', decoded.userId)
      .in('id', predictionIds)

    if (predictionsError || !predictions || predictions.length !== predictionIds.length) {
      return NextResponse.json({ error: 'Alcuni pronostici non sono validi' }, { status: 400 })
    }

    // Aggiorna i pronostici per assegnarli al gruppo
    const { error: updateError } = await supabase
      .from('xbank_predictions')
      .update({ group_id: groupId })
      .in('id', predictionIds)

    if (updateError) {
      console.error('Errore nell\'aggiornamento dei pronostici:', updateError)
      return NextResponse.json({ error: 'Errore nell\'assegnazione dei pronostici al gruppo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pronostici aggiunti al gruppo con successo'
    })

  } catch (error) {
    console.error('Errore nell\'API di aggiunta pronostici al gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// DELETE /api/xbank/groups/[id]/predictions - Rimuove pronostici dal gruppo
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  try{
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: DecodedToken
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    } catch {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('ruolo')
      .eq('id', decoded.userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    if (userData.ruolo !== 'abbonato_vip') {
      return NextResponse.json({ error: 'Accesso negato. Richiesto abbonamento VIP.' }, { status: 403 })
    }

    const groupId = id
    const { predictionIds } = await request.json()

    if (!predictionIds || !Array.isArray(predictionIds)) {
      return NextResponse.json({ error: 'IDs dei pronostici richiesti' }, { status: 400 })
    }

    // Verifica che il gruppo appartenga all'utente
    const { data: groupData, error: groupError } = await supabase
      .from('xbank_groups')
      .select('id')
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (groupError || !groupData) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Rimuove i pronostici dal gruppo (imposta group_id a null)
    const { error: updateError } = await supabase
      .from('xbank_predictions')
      .update({ group_id: null })
      .eq('user_id', decoded.userId)
      .eq('group_id', groupId)
      .in('id', predictionIds)

    if (updateError) {
      console.error('Errore nella rimozione dei pronostici dal gruppo:', updateError)
      return NextResponse.json({ error: 'Errore nella rimozione dei pronostici dal gruppo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pronostici rimossi dal gruppo con successo'
    })

  } catch (error) {
    console.error('Errore nell\'API di rimozione pronostici dal gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}