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

    // Query per i post dell'utente
    let query = supabase
      .from('board_posts')
      .select(`
        *,
        author:profiles!board_posts_user_id_fkey (
          id,
          username,
          avatar_url,
          role
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Applica filtri
    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType)
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

        // Conta follower dell'utente
        const { count: followersCount } = await supabase
          .from('user_follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id)

        // Calcola win rate dell'utente
        const { data: userStats } = await supabase
          .from('predictions')
          .select('status')
          .eq('user_id', user.id)
          .in('status', ['won', 'lost'])

        let winRate = null
        if (userStats && userStats.length > 0) {
          const wonCount = userStats.filter(p => p.status === 'won').length
          winRate = Math.round((wonCount / userStats.length) * 100)
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
          is_liked: false, // L'utente non può mettere like ai propri post
          is_following_author: false, // L'utente non può seguire se stesso
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