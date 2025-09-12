import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface PostUpdateData {
  title?: string
  content?: string
  tags?: string[]
  visibility?: string
  views_count?: number
  updated_at?: string
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Verifica che il post esista e appartenga all'utente
    const { data: post } = await supabase
      .from('board_posts')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post non trovato o non autorizzato' }, { status: 404 })
    }

    // Elimina prima i likes del post
    await supabase
      .from('board_post_likes')
      .delete()
      .eq('post_id', id)

    // Elimina i commenti del post
    await supabase
      .from('board_post_comments')
      .delete()
      .eq('post_id', id)

    // Elimina il post
    const { error } = await supabase
      .from('board_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Errore nell\'eliminazione del post:', error)
      return NextResponse.json({ error: 'Errore nell\'eliminazione del post' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Post eliminato con successo' })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Verifica che il post esista e appartenga all'utente
    const { data: existingPost } = await supabase
      .from('board_posts')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingPost) {
      return NextResponse.json({ error: 'Post non trovato o non autorizzato' }, { status: 404 })
    }

    const body = await request.json()
    const updates: PostUpdateData = {}

    // Campi aggiornabili
    if (body.title !== undefined) updates.title = body.title
    if (body.content !== undefined) updates.content = body.content
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.visibility !== undefined) updates.visibility = body.visibility
    
    // Incrementa views se richiesto
    if (body.increment_views) {
      const { data: currentPost } = await supabase
        .from('board_posts')
        .select('views_count')
        .eq('id', id)
        .single()
      
      updates.views_count = (currentPost?.views_count || 0) + 1
    }

    updates.updated_at = new Date().toISOString()

    // Aggiorna il post
    const { data: post, error } = await supabase
      .from('board_posts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Errore nell\'aggiornamento del post:', error)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del post' }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}