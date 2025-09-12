import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'vip') {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const postType = searchParams.get('type')

    // Query base per i post
    let query = supabase
      .from('board_posts')
      .select(`
        *,
        author:profiles!board_posts_user_id_fkey (
          id,
          username,
          avatar_url,
          role
        ),
        board_post_likes!left (
          user_id
        ),
        board_post_comments!left (
          id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Applica filtri
    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType)
    }

    // Filtro visibilità basato sul ruolo dell'utente
    if (profile?.role === 'vip') {
      // Gli utenti VIP possono vedere tutti i post
      query = query.in('visibility', ['public', 'followers', 'vip'])
    } else {
      // Gli utenti normali vedono solo post pubblici e dei loro seguiti
      query = query.in('visibility', ['public', 'followers'])
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Errore nel recupero dei post:', error)
      return NextResponse.json({ error: 'Errore nel recupero dei post' }, { status: 500 })
    }

    // Recupera informazioni aggiuntive per ogni post
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Conta likes
        const { count: likesCount } = await supabase
          .from('board_post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        // Conta commenti
        const { count: commentsCount } = await supabase
          .from('board_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)

        // Verifica se l'utente ha messo like
        const { data: userLike } = await supabase
          .from('board_post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single()

        // Verifica se l'utente segue l'autore
        const { data: following } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', post.user_id)
          .single()

        // Conta follower dell'autore
        const { count: followersCount } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', post.user_id)

        // Calcola win rate dell'autore (se disponibile)
        const { data: authorStats } = await supabase
          .from('predictions')
          .select('status')
          .eq('user_id', post.user_id)
          .in('status', ['won', 'lost'])

        let winRate = null
        if (authorStats && authorStats.length > 0) {
          const wonCount = authorStats.filter(p => p.status === 'won').length
          winRate = Math.round((wonCount / authorStats.length) * 100)
        }

        // Recupera dati del pronostico se collegato
        let predictionData = null
        if (post.prediction_id) {
          const { data: prediction } = await supabase
            .from('predictions')
            .select('category, odds, stake_amount, status, result')
            .eq('id', post.prediction_id)
            .single()

          if (prediction) {
            predictionData = {
              sport: prediction.category,
              odds: prediction.odds,
              stake: prediction.stake_amount,
              status: prediction.status,
              result: prediction.result
            }
          }
        }

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          prediction_id: post.prediction_id,
          custom_prediction_id: post.custom_prediction_id,
          post_type: post.post_type,
          visibility: post.visibility,
          tags: post.tags || [],
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          views_count: post.views_count || 0,
          is_liked: !!userLike,
          is_following_author: !!following,
          author: {
            id: post.author.id,
            username: post.author.username,
            avatar_url: post.author.avatar_url,
            role: post.author.role,
            followers_count: followersCount || 0,
            win_rate: winRate
          },
          prediction_data: predictionData,
          created_at: post.created_at,
          updated_at: post.updated_at
        }
      })
    )

    return NextResponse.json(enrichedPosts)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'vip') {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      content,
      post_type,
      visibility,
      tags,
      prediction_id,
      custom_prediction_id
    } = body

    // Validazione dati
    if (!title || !content || !post_type || !visibility) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    if (!['prediction', 'analysis', 'tip', 'discussion'].includes(post_type)) {
      return NextResponse.json({ error: 'Tipo di post non valido' }, { status: 400 })
    }

    if (!['public', 'followers', 'vip'].includes(visibility)) {
      return NextResponse.json({ error: 'Visibilità non valida' }, { status: 400 })
    }

    // Verifica che il pronostico appartenga all'utente (se specificato)
    if (prediction_id) {
      const { data: prediction } = await supabase
        .from('predictions')
        .select('id, user_id')
        .eq('id', prediction_id)
        .eq('user_id', user.id)
        .single()

      if (!prediction) {
        return NextResponse.json({ error: 'Pronostico non trovato o non autorizzato' }, { status: 404 })
      }
    }

    // Crea il post
    const { data: post, error } = await supabase
      .from('board_posts')
      .insert({
        user_id: user.id,
        title,
        content,
        post_type,
        visibility,
        tags: tags || [],
        prediction_id: prediction_id || null,
        custom_prediction_id: custom_prediction_id || null,
        views_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Errore nella creazione del post:', error)
      return NextResponse.json({ error: 'Errore nella creazione del post' }, { status: 500 })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}