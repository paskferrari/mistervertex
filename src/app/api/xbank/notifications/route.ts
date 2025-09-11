import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Errore nel recupero notifiche:', error)
      return NextResponse.json({ error: 'Errore nel recupero notifiche' }, { status: 500 })
    }

    // Conta le notifiche non lette
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0
    })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { title, message, type = 'info', data = null, target_user_id } = body

    // Validazione
    if (!title || !message) {
      return NextResponse.json({ error: 'Titolo e messaggio sono obbligatori' }, { status: 400 })
    }

    const validTypes = ['info', 'success', 'warning', 'error', 'prediction', 'group', 'scalata']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo di notifica non valido' }, { status: 400 })
    }

    // Se target_user_id è specificato, invia solo a quell'utente (per admin)
    // Altrimenti invia a se stesso
    const userId = target_user_id || user.id

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data,
        read: false
      })
      .select()
      .single()

    if (error) {
      console.error('Errore nella creazione notifica:', error)
      return NextResponse.json({ error: 'Errore nella creazione notifica' }, { status: 500 })
    }

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}