import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Recupera la scalata con i passi
    const { data: scalata, error } = await supabase
      .from('scalate')
      .select(`
        *,
        scalata_steps (
          id,
          sequence,
          title,
          odds,
          stake,
          status,
          prediction_id,
          custom_prediction_id,
          completed_at,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !scalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    // Formatta i dati
    const formattedScalata = {
      ...scalata,
      steps: scalata.scalata_steps || []
    }

    return NextResponse.json(formattedScalata)
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

    // Verifica che la scalata appartenga all'utente
    const { data: existingScalata } = await supabase
      .from('scalate')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingScalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    const body = await request.json()
    const updates: any = {}

    // Campi aggiornabili
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.status !== undefined) {
      updates.status = body.status
      updates.updated_at = new Date().toISOString()
    }
    if (body.current_step !== undefined) updates.current_step = body.current_step
    if (body.current_bankroll !== undefined) updates.current_bankroll = body.current_bankroll
    if (body.settings !== undefined) updates.settings = body.settings

    // Aggiorna la scalata
    const { data: scalata, error } = await supabase
      .from('scalate')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Errore nell\'aggiornamento della scalata:', error)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento della scalata' }, { status: 500 })
    }

    return NextResponse.json(scalata)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
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

    // Verifica che la scalata appartenga all'utente
    const { data: existingScalata } = await supabase
      .from('scalate')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingScalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    // Elimina prima i passi della scalata (se esistono)
    await supabase
      .from('scalata_steps')
      .delete()
      .eq('scalata_id', id)

    // Elimina la scalata
    const { error } = await supabase
      .from('scalate')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Errore nell\'eliminazione della scalata:', error)
      return NextResponse.json({ error: 'Errore nell\'eliminazione della scalata' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Scalata eliminata con successo' })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}