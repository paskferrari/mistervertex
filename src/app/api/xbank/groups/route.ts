import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Recupera i gruppi di pronostici dell'utente
export async function GET(request: NextRequest) {
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

    // Recupera i gruppi con statistiche
    const { data, error } = await supabaseAdmin
      .from('xbank_prediction_groups')
      .select(`
        *,
        xbank_custom_predictions(
          id,
          status,
          stake_amount,
          result_amount,
          odds
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching prediction groups:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei gruppi' },
        { status: 500 }
      )
    }

    // Calcola le statistiche per ogni gruppo
    const groupsWithStats = (data || []).map((group: any) => {
      const predictions = group.xbank_custom_predictions || []
      const totalPredictions = predictions.length
      const wonPredictions = predictions.filter((p: any) => p.status === 'won').length
      const lostPredictions = predictions.filter((p: any) => p.status === 'lost').length
      const pendingPredictions = predictions.filter((p: any) => p.status === 'pending').length
      
      const totalStaked = predictions.reduce((sum: number, p: any) => sum + (p.stake_amount || 0), 0)
      const totalReturns = predictions
        .filter((p: any) => p.status === 'won')
        .reduce((sum: number, p: any) => sum + (p.result_amount || (p.stake_amount * p.odds)), 0)
      const totalLosses = predictions
        .filter((p: any) => p.status === 'lost')
        .reduce((sum: number, p: any) => sum + p.stake_amount, 0)
      
      const profit = totalReturns - totalLosses
      const roi = totalStaked > 0 ? ((profit / totalStaked) * 100) : 0
      const winRate = totalPredictions > 0 ? ((wonPredictions / (wonPredictions + lostPredictions)) * 100) : 0
      
      return {
        ...group,
        statistics: {
          total_predictions: totalPredictions,
          won_predictions: wonPredictions,
          lost_predictions: lostPredictions,
          pending_predictions: pendingPredictions,
          total_staked: totalStaked,
          total_returns: totalReturns,
          profit,
          roi,
          win_rate: winRate
        },
        xbank_custom_predictions: undefined // Rimuovi i dati grezzi
      }
    })

    return NextResponse.json(groupsWithStats)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un gruppo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('id')

    if (!groupId) {
      return NextResponse.json(
        { error: 'ID gruppo richiesto' },
        { status: 400 }
      )
    }

    // Verifica autenticazione
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token di autenticazione richiesto' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token non valido' },
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

    // Verifica che il gruppo appartenga all'utente
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('xbank_prediction_groups')
      .select('user_id')
      .eq('id', groupId)
      .single()

    if (groupError || !groupData) {
      return NextResponse.json(
        { error: 'Gruppo non trovato' },
        { status: 404 }
      )
    }

    if (groupData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo gruppo' },
        { status: 403 }
      )
    }

    // Elimina il gruppo
    const { error: deleteError } = await supabaseAdmin
      .from('xbank_prediction_groups')
      .delete()
      .eq('id', groupId)

    if (deleteError) {
      console.error('Error deleting group:', deleteError)
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione del gruppo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Gruppo eliminato con successo'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo gruppo di pronostici
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, is_public } = body

    // Validazione
    if (!name) {
      return NextResponse.json(
        { error: 'Nome del gruppo obbligatorio' },
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

    // Crea il gruppo
    const { data, error } = await supabaseAdmin
      .from('xbank_prediction_groups')
      .insert({
        user_id: user.id,
        name,
        description,
        color: color || '#8B5CF6',
        is_public: is_public || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prediction group:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del gruppo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Gruppo creato con successo',
      group: {
        ...data,
        statistics: {
          total_predictions: 0,
          won_predictions: 0,
          lost_predictions: 0,
          pending_predictions: 0,
          total_staked: 0,
          total_returns: 0,
          profit: 0,
          roi: 0,
          win_rate: 0
        }
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