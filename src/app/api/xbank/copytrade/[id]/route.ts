import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUserClient } from '@/lib/supabase'

// PUT - Aggiorna le impostazioni di copy-trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { copy_settings, is_active } = body

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

    // Verifica che il follow appartenga all'utente
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('follower_user_id')
      .eq('id', id)
      .single()

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Follow non trovato' },
        { status: 404 }
      )
    }

    if (existingFollow.follower_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo follow' },
        { status: 403 }
      )
    }

    // Prepara i dati per l'aggiornamento
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (copy_settings !== undefined) updateData.copy_settings = copy_settings
    if (is_active !== undefined) updateData.is_active = is_active

    // Aggiorna il follow
    const { data, error } = await supabase
      .from('user_follows')
      .update(updateData)
      .eq('id', id)
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
          color
        )
      `)
      .single()

    if (error) {
      console.error('Error updating follow:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del follow' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Follow aggiornato con successo',
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

// DELETE - Smetti di seguire (unfollow)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Verifica che il follow appartenga all'utente
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('follower_user_id')
      .eq('id', id)
      .single()

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Follow non trovato' },
        { status: 404 }
      )
    }

    if (existingFollow.follower_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo follow' },
        { status: 403 }
      )
    }

    // Disattiva il follow invece di eliminarlo (per mantenere lo storico)
    const { data, error } = await supabase
      .from('user_follows')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error deactivating follow:', error)
      return NextResponse.json(
        { error: 'Errore nella disattivazione del follow' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Unfollow eseguito con successo',
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