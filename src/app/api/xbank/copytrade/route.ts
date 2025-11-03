import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUserClient } from '@/lib/supabase'

// GET - Recupera gli utenti seguiti per copy-trade
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
    const type = url.searchParams.get('type') || 'user' // user o group

    // Recupera gli utenti/gruppi seguiti
    const { data: follows, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        followed_user:users!user_follows_followed_user_id_fkey(
          id,
          username,
          email,
          avatar_url
        ),
        followed_group:prediction_groups!user_follows_followed_group_id_fkey(
          id,
          name,
          description,
          color,
          is_public
        )
      `)
      .eq('follower_user_id', user.id)
      .eq('follow_type', type)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching follows:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei seguiti' },
        { status: 500 }
      )
    }

    // Calcola statistiche per ogni seguito
    const followsWithStats = await Promise.all(
      follows.map(async (follow) => {
        const targetId = follow.followed_user_id || follow.followed_group_id
        const isUser = follow.follow_type === 'user'
        
        // Recupera statistiche recenti (ultimi 30 giorni)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        let statsQuery = supabase
          .from('custom_predictions')
          .select('status, odds, stake_amount')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .in('status', ['won', 'lost'])

        if (isUser) {
          statsQuery = statsQuery.eq('user_id', targetId)
        } else {
          // Per i gruppi, recupera i pronostici dei membri del gruppo
          const { data: groupMembers } = await supabase
            .from('prediction_group_items')
            .select('prediction_id')
            .eq('group_id', targetId)
          
          if (groupMembers && groupMembers.length > 0) {
            const predictionIds = groupMembers.map(m => m.prediction_id)
            statsQuery = statsQuery.in('id', predictionIds)
          }
        }

        const { data: predictions } = await statsQuery

        let totalProfit = 0
        let totalStake = 0
        let wins = 0
        let total = predictions?.length || 0

        predictions?.forEach(pred => {
          totalStake += pred.stake_amount
          if (pred.status === 'won') {
            wins++
            totalProfit += (pred.odds * pred.stake_amount) - pred.stake_amount
          } else {
            totalProfit -= pred.stake_amount
          }
        })

        const winRate = total > 0 ? (wins / total) * 100 : 0
        const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

        return {
          ...follow,
          stats: {
            total_predictions: total,
            win_rate: Math.round(winRate * 100) / 100,
            roi: Math.round(roi * 100) / 100,
            total_profit: Math.round(totalProfit * 100) / 100,
            last_30_days: true
          }
        }
      })
    )

    return NextResponse.json({
      follows: followsWithStats,
      total: followsWithStats.length
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Segui un utente o gruppo per copy-trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      followed_user_id,
      followed_group_id,
      follow_type,
      copy_settings = {}
    } = body

    // Validazione
    if (!follow_type || !['user', 'group'].includes(follow_type)) {
      return NextResponse.json(
        { error: 'Tipo di follow non valido' },
        { status: 400 }
      )
    }

    if (follow_type === 'user' && !followed_user_id) {
      return NextResponse.json(
        { error: 'ID utente da seguire mancante' },
        { status: 400 }
      )
    }

    if (follow_type === 'group' && !followed_group_id) {
      return NextResponse.json(
        { error: 'ID gruppo da seguire mancante' },
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
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: Copy-trade disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Non permettere di seguire se stesso
    if (follow_type === 'user' && followed_user_id === user.id) {
      return NextResponse.json(
        { error: 'Non puoi seguire te stesso' },
        { status: 400 }
      )
    }

    // Verifica se già segue questo utente/gruppo
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id, is_active')
      .eq('follower_user_id', user.id)
      .eq('follow_type', follow_type)
      .eq(follow_type === 'user' ? 'followed_user_id' : 'followed_group_id', 
          follow_type === 'user' ? followed_user_id : followed_group_id)
      .single()

    if (existingFollow) {
      if (existingFollow.is_active) {
        return NextResponse.json(
          { error: 'Stai già seguendo questo ' + (follow_type === 'user' ? 'utente' : 'gruppo') },
          { status: 400 }
        )
      } else {
        // Riattiva il follow esistente
        const { data, error } = await supabase
          .from('user_follows')
          .update({
            is_active: true,
            copy_settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFollow.id)
          .select('*')
          .single()

        if (error) {
          console.error('Error reactivating follow:', error)
          return NextResponse.json(
            { error: 'Errore nella riattivazione del follow' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Follow riattivato con successo',
          follow: data
        })
      }
    }

    // Crea nuovo follow
    const { data, error } = await supabase
      .from('user_follows')
      .insert({
        follower_user_id: user.id,
        followed_user_id: follow_type === 'user' ? followed_user_id : null,
        followed_group_id: follow_type === 'group' ? followed_group_id : null,
        follow_type,
        copy_settings,
        is_active: true
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating follow:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del follow' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Follow creato con successo',
      follow: data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}