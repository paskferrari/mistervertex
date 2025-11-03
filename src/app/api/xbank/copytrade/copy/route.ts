import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUserClient } from '@/lib/supabase'

// POST - Copia un pronostico da un trader seguito
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      original_prediction_id,
      follow_id,
      custom_stake_amount,
      custom_stake_percentage
    } = body

    // Validazione
    if (!original_prediction_id) {
      return NextResponse.json(
        { error: 'ID pronostico originale mancante' },
        { status: 400 }
      )
    }

    if (!follow_id) {
      return NextResponse.json(
        { error: 'ID follow mancante' },
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
    const supabase = getSupabaseUserClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: Copy-trade disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Verifica che il follow appartenga all'utente e sia attivo
    const { data: followData } = await supabase
      .from('user_follows')
      .select('*')
      .eq('id', follow_id)
      .eq('follower_user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!followData) {
      return NextResponse.json(
        { error: 'Follow non trovato o non attivo' },
        { status: 404 }
      )
    }

    // Recupera il pronostico originale
    const { data: originalPrediction } = await supabase
      .from('custom_predictions')
      .select('*')
      .eq('id', original_prediction_id)
      .single()

    if (!originalPrediction) {
      return NextResponse.json(
        { error: 'Pronostico originale non trovato' },
        { status: 404 }
      )
    }

    // Verifica che il pronostico appartenga al trader seguito
    const isFromFollowedUser = followData.follow_type === 'user' && 
                              originalPrediction.user_id === followData.followed_user_id

    const isFromFollowedGroup = followData.follow_type === 'group' && 
                               originalPrediction.group_id === followData.followed_group_id

    if (!isFromFollowedUser && !isFromFollowedGroup) {
      return NextResponse.json(
        { error: 'Il pronostico non appartiene al trader/gruppo seguito' },
        { status: 403 }
      )
    }

    // Verifica che non abbia già copiato questo pronostico
    const { data: existingCopy } = await supabase
      .from('custom_predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('copied_from_prediction_id', original_prediction_id)
      .single()

    if (existingCopy) {
      return NextResponse.json(
        { error: 'Hai già copiato questo pronostico' },
        { status: 400 }
      )
    }

    // Calcola l'importo della puntata basato sulle impostazioni di copy-trade
    let stakeAmount = originalPrediction.stake_amount
    const copySettings = followData.copy_settings || {}

    if (custom_stake_amount) {
      stakeAmount = custom_stake_amount
    } else if (custom_stake_percentage) {
      // Recupera il bankroll dell'utente
      const { data: userSettings } = await supabase
        .from('xbank_user_settings')
        .select('bankroll_amount')
        .eq('user_id', user.id)
        .single()

      const bankroll = userSettings?.bankroll_amount || 1000
      stakeAmount = (bankroll * custom_stake_percentage) / 100
    } else if (copySettings.stake_mode === 'percentage' && copySettings.stake_percentage) {
      // Usa le impostazioni del follow
      const { data: userSettings } = await supabase
        .from('xbank_user_settings')
        .select('bankroll_amount')
        .eq('user_id', user.id)
        .single()

      const bankroll = userSettings?.bankroll_amount || 1000
      stakeAmount = (bankroll * copySettings.stake_percentage) / 100
    } else if (copySettings.stake_mode === 'fixed' && copySettings.fixed_amount) {
      stakeAmount = copySettings.fixed_amount
    }

    // Recupera le impostazioni utente per calcolare stake_units
    const { data: userSettings } = await supabase
      .from('xbank_user_settings')
      .select('bankroll_amount')
      .eq('user_id', user.id)
      .single()

    // Crea il pronostico copiato
    const { data: copiedPrediction, error } = await supabase
      .from('custom_predictions')
      .insert({
        user_id: user.id,
        title: `[COPY] ${originalPrediction.title}`,
        description: `Copiato da ${followData.follow_type === 'user' ? 'utente' : 'gruppo'}\n\n${originalPrediction.description || ''}`,
        event_name: originalPrediction.event_name,
        match_date: originalPrediction.match_date,
        odds: originalPrediction.odds,
        stake_amount: stakeAmount,
        stake_units: copySettings.stake_mode === 'percentage' ? (stakeAmount / ((userSettings?.bankroll_amount || 1000) / 100)) : null,
        confidence: originalPrediction.confidence,
        bookmaker: originalPrediction.bookmaker,
        bet_type: originalPrediction.bet_type,
        tags: [...(originalPrediction.tags || []), 'copy-trade'],
        status: 'pending',
        copied_from_prediction_id: original_prediction_id,
        copied_from_user_id: originalPrediction.user_id,
        copied_from_follow_id: follow_id
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating copied prediction:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del pronostico copiato' },
        { status: 500 }
      )
    }

    // Registra l'attività di copy-trade
    await supabase
      .from('bankroll_history')
      .insert({
        user_id: user.id,
        transaction_type: 'copy_trade',
        amount: stakeAmount,
        description: `Copy-trade: ${originalPrediction.title}`,
        reference_id: copiedPrediction.id,
        reference_type: 'prediction'
      })

    return NextResponse.json({
      message: 'Pronostico copiato con successo',
      prediction: copiedPrediction,
      original_prediction: originalPrediction
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// GET - Recupera i pronostici disponibili per il copy-trade
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
    const supabase = getSupabaseUserClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: Copy-trade disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status') || 'pending'
    const offset = (page - 1) * limit

    // Recupera gli utenti/gruppi seguiti attivi
    const { data: activeFollows } = await supabase
      .from('user_follows')
      .select('followed_user_id, followed_group_id, follow_type')
      .eq('follower_user_id', user.id)
      .eq('is_active', true)

    if (!activeFollows || activeFollows.length === 0) {
      return NextResponse.json({
        predictions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Costruisci la query per i pronostici disponibili
    const userIds = activeFollows
      .filter(f => f.follow_type === 'user')
      .map(f => f.followed_user_id)
      .filter(Boolean)

    const groupIds = activeFollows
      .filter(f => f.follow_type === 'group')
      .map(f => f.followed_group_id)
      .filter(Boolean)

    let query = supabase
      .from('custom_predictions')
      .select(`
        *,
        user:users!custom_predictions_user_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('status', status)
      .neq('user_id', user.id) // Escludi i propri pronostici
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtra per utenti seguiti o gruppi seguiti
    if (userIds.length > 0 && groupIds.length > 0) {
      query = query.or(`user_id.in.(${userIds.join(',')}),group_id.in.(${groupIds.join(',')})`)
    } else if (userIds.length > 0) {
      query = query.in('user_id', userIds)
    } else if (groupIds.length > 0) {
      query = query.in('group_id', groupIds)
    }

    const { data: predictions, error } = await query

    if (error) {
      console.error('Error fetching copy-trade predictions:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei pronostici' },
        { status: 500 }
      )
    }

    // Verifica quali pronostici sono già stati copiati
    const predictionIds = predictions?.map(p => p.id) || []
    const { data: alreadyCopied } = await supabase
      .from('custom_predictions')
      .select('copied_from_prediction_id')
      .eq('user_id', user.id)
      .in('copied_from_prediction_id', predictionIds)

    const copiedIds = new Set(alreadyCopied?.map(c => c.copied_from_prediction_id) || [])

    const predictionsWithCopyStatus = predictions?.map(pred => ({
      ...pred,
      already_copied: copiedIds.has(pred.id)
    })) || []

    return NextResponse.json({
      predictions: predictionsWithCopyStatus,
      pagination: {
        page,
        limit,
        total: predictions?.length || 0,
        totalPages: Math.ceil((predictions?.length || 0) / limit)
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