import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/xbank/groups/[id] - Recupera un gruppo specifico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
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

    const groupId = params.id

    // Recupera il gruppo con le statistiche
    const { data: group, error: groupError } = await supabase
      .from('xbank_groups')
      .select(`
        id,
        name,
        description,
        color,
        created_at,
        updated_at
      `)
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Calcola le statistiche del gruppo
    const { data: predictions, error: predictionsError } = await supabase
      .from('xbank_predictions')
      .select('stake, total_odds, status, result_profit')
      .eq('user_id', decoded.userId)
      .eq('group_id', groupId)

    if (predictionsError) {
      console.error('Errore nel recupero delle statistiche:', predictionsError)
      return NextResponse.json({ error: 'Errore nel calcolo delle statistiche' }, { status: 500 })
    }

    const stats = {
      predictions_count: predictions?.length || 0,
      total_stake: predictions?.reduce((sum: number, p: any) => sum + p.stake, 0) || 0,
      total_profit: predictions?.filter((p: any) => p.result_profit !== null)
        .reduce((sum: number, p: any) => sum + (p.result_profit || 0), 0) || 0,
      win_rate: predictions?.length > 0 ? 
        (predictions.filter((p: any) => p.status === 'won').length / 
         predictions.filter((p: any) => p.status !== 'pending').length) * 100 : 0,
      avg_odds: predictions?.length > 0 ? 
        (predictions.reduce((sum: number, p: any) => sum + p.total_odds, 0) / predictions.length) || 0 : 0
    }

    const roi = stats.total_stake > 0 ? (stats.total_profit / stats.total_stake) * 100 : 0

    return NextResponse.json({
      success: true,
      group: {
        ...group,
        ...stats,
        roi
      }
    })

  } catch (error) {
    console.error('Errore nell\'API del gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// PUT /api/xbank/groups/[id] - Aggiorna un gruppo
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
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

    const groupId = params.id
    const { name, description, color } = await request.json()

    // Validazione
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome del gruppo richiesto' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Nome del gruppo troppo lungo (max 100 caratteri)' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Descrizione troppo lunga (max 500 caratteri)' }, { status: 400 })
    }

    // Verifica che il gruppo appartenga all'utente
    const { data: existingGroup, error: existingError } = await supabase
      .from('xbank_groups')
      .select('id')
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (existingError || !existingGroup) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Aggiorna il gruppo
    const { data: updatedGroup, error: updateError } = await supabase
      .from('xbank_groups')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .select()
      .single()

    if (updateError) {
      console.error('Errore nell\'aggiornamento del gruppo:', updateError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del gruppo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      group: updatedGroup,
      message: 'Gruppo aggiornato con successo'
    })

  } catch (error) {
    console.error('Errore nell\'API di aggiornamento gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// DELETE /api/xbank/groups/[id] - Elimina un gruppo
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
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

    const groupId = params.id

    // Verifica che il gruppo appartenga all'utente
    const { data: existingGroup, error: existingError } = await supabase
      .from('xbank_groups')
      .select('id')
      .eq('id', groupId)
      .eq('user_id', decoded.userId)
      .single()

    if (existingError || !existingGroup) {
      return NextResponse.json({ error: 'Gruppo non trovato' }, { status: 404 })
    }

    // Prima rimuovi l'associazione dai pronostici
    const { error: updatePredictionsError } = await supabase
      .from('xbank_predictions')
      .update({ group_id: null })
      .eq('group_id', groupId)
      .eq('user_id', decoded.userId)

    if (updatePredictionsError) {
      console.error('Errore nella rimozione delle associazioni:', updatePredictionsError)
      return NextResponse.json({ error: 'Errore nella rimozione delle associazioni' }, { status: 500 })
    }

    // Elimina il gruppo
    const { error: deleteError } = await supabase
      .from('xbank_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', decoded.userId)

    if (deleteError) {
      console.error('Errore nell\'eliminazione del gruppo:', deleteError)
      return NextResponse.json({ error: 'Errore nell\'eliminazione del gruppo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Gruppo eliminato con successo'
    })

  } catch (error) {
    console.error('Errore nell\'API di eliminazione gruppo:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}