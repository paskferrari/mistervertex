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

    // Verifica che l'utente da seguire esista
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', id)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    // Non permettere di seguire se stessi
    if (id === user.id) {
      return NextResponse.json({ error: 'Non puoi seguire te stesso' }, { status: 400 })
    }

    // Verifica se l'utente sta già seguendo
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .single()

    if (existingFollow) {
      // Rimuovi il follow (unfollow)
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', id)

      if (error) {
        console.error('Errore nell\'unfollow:', error)
        return NextResponse.json({ error: 'Errore nell\'unfollow' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: `Non segui più ${targetUser.username}`, 
        following: false 
      })
    } else {
      // Aggiungi il follow
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: id
        })

      if (error) {
        console.error('Errore nel follow:', error)
        return NextResponse.json({ error: 'Errore nel follow' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: `Ora segui ${targetUser.username}`, 
        following: true 
      })
    }
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}