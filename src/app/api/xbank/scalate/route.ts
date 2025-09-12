import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
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

    // Recupera le scalate dell'utente con i relativi passi
    const { data: scalate, error } = await supabase
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
          completed_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore nel recupero delle scalate:', error)
      return NextResponse.json({ error: 'Errore nel recupero delle scalate' }, { status: 500 })
    }

    // Formatta i dati per il frontend
    const formattedScalate = scalate.map(scalata => ({
      ...scalata,
      steps: scalata.scalata_steps || []
    }))

    return NextResponse.json(formattedScalate)
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
      name,
      description,
      scalata_type,
      initial_stake,
      target_profit,
      max_steps,
      multiplier,
      reset_on_loss,
      max_loss,
      auto_progression
    } = body

    // Validazione dati
    if (!name || !scalata_type || !initial_stake || !target_profit || !max_steps) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    if (initial_stake <= 0 || target_profit <= 0 || max_steps <= 0) {
      return NextResponse.json({ error: 'I valori devono essere positivi' }, { status: 400 })
    }

    // Crea la scalata
    const { data: scalata, error } = await supabase
      .from('scalate')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        scalata_type,
        initial_stake,
        target_profit,
        max_steps,
        current_step: 0,
        current_bankroll: initial_stake,
        status: 'active',
        settings: {
          multiplier: multiplier || 2,
          reset_on_loss: reset_on_loss || false,
          max_loss: max_loss || 0,
          auto_progression: auto_progression || false
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Errore nella creazione della scalata:', error)
      return NextResponse.json({ error: 'Errore nella creazione della scalata' }, { status: 500 })
    }

    return NextResponse.json(scalata, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}