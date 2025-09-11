import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Estrai il token JWT dall'header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Rimuovi 'Bearer '
    
    // Crea client Supabase con il token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['abbonato_vip', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    const body = await request.json()
    const { read } = body

    // Verifica che la notifica esista e appartenga all'utente
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notifica non trovata' }, { status: 404 })
    }

    // Aggiorna la notifica
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: read !== undefined ? read : true })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Errore nell\'aggiornamento notifica:', error)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento notifica' }, { status: 500 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Estrai il token JWT dall'header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Rimuovi 'Bearer '
    
    // Crea client Supabase con il token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['abbonato_vip', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    // Verifica che la notifica esista e appartenga all'utente
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notifica non trovata' }, { status: 404 })
    }

    // Elimina la notifica
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Errore nell\'eliminazione notifica:', error)
      return NextResponse.json({ error: 'Errore nell\'eliminazione notifica' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Notifica eliminata con successo' })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}