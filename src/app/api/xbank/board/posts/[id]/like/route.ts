import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

    // Verifica che il post esista
    const { data: post } = await supabase
      .from('board_posts')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post non trovato' }, { status: 404 })
    }

    // Non permettere di mettere like ai propri post
    if (post.user_id === user.id) {
      return NextResponse.json({ error: 'Non puoi mettere like ai tuoi post' }, { status: 400 })
    }

    // Verifica se l'utente ha già messo like
    const { data: existingLike } = await supabase
      .from('board_post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Rimuovi il like
      const { error } = await supabase
        .from('board_post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Errore nella rimozione del like:', error)
        return NextResponse.json({ error: 'Errore nella rimozione del like' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Like rimosso', liked: false })
    } else {
      // Aggiungi il like
      const { error } = await supabase
        .from('board_post_likes')
        .insert({
          post_id: id,
          user_id: user.id
        })

      if (error) {
        console.error('Errore nell\'aggiunta del like:', error)
        return NextResponse.json({ error: 'Errore nell\'aggiunta del like' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Like aggiunto', liked: true })
    }
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}