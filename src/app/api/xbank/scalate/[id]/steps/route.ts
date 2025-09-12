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

    // Verifica che la scalata appartenga all'utente
    const { data: scalata } = await supabase
      .from('scalate')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!scalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    // Recupera i passi della scalata
    const { data: steps, error } = await supabase
      .from('scalata_steps')
      .select('*')
      .eq('scalata_id', id)
      .order('sequence', { ascending: true })

    if (error) {
      console.error('Errore nel recupero dei passi:', error)
      return NextResponse.json({ error: 'Errore nel recupero dei passi' }, { status: 500 })
    }

    return NextResponse.json(steps || [])
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

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

    // Verifica che la scalata appartenga all'utente
    const { data: scalata } = await supabase
      .from('scalate')
      .select('id, user_id, current_step, max_steps, scalata_type, settings, current_bankroll')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!scalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    const body = await request.json()
    const { title, odds, prediction_id, custom_prediction_id } = body

    // Validazione dati
    if (!title || !odds) {
      return NextResponse.json({ error: 'Titolo e quota sono obbligatori' }, { status: 400 })
    }

    if (odds <= 1) {
      return NextResponse.json({ error: 'La quota deve essere maggiore di 1' }, { status: 400 })
    }

    // Verifica che non si superi il numero massimo di passi
    if (scalata.current_step >= scalata.max_steps) {
      return NextResponse.json({ error: 'Numero massimo di passi raggiunto' }, { status: 400 })
    }

    // Calcola lo stake per il prossimo passo basato sul tipo di scalata
    let nextStake = 0
    const settings = scalata.settings as any || {}
    
    switch (scalata.scalata_type) {
      case 'progressive':
        if (scalata.current_step === 0) {
          // Primo passo: usa il bankroll corrente
          nextStake = scalata.current_bankroll
        } else {
          // Passi successivi: moltiplica per il moltiplicatore
          const multiplier = settings.multiplier || 2
          nextStake = scalata.current_bankroll * multiplier
        }
        break
        
      case 'fixed':
        // Stake fisso: usa sempre il bankroll iniziale
        nextStake = scalata.current_bankroll
        break
        
      case 'fibonacci':
        // Implementa la sequenza di Fibonacci
        const { data: previousSteps } = await supabase
          .from('scalata_steps')
          .select('stake')
          .eq('scalata_id', id)
          .order('sequence', { ascending: false })
          .limit(2)
        
        if (!previousSteps || previousSteps.length === 0) {
          nextStake = scalata.current_bankroll
        } else if (previousSteps.length === 1) {
          nextStake = scalata.current_bankroll
        } else {
          nextStake = previousSteps[0].stake + previousSteps[1].stake
        }
        break
        
      case 'custom':
        // Per scalate personalizzate, usa il bankroll corrente
        nextStake = scalata.current_bankroll
        break
        
      default:
        nextStake = scalata.current_bankroll
    }

    // Verifica che lo stake non superi il limite di perdita massima
    if (settings.max_loss && nextStake > settings.max_loss) {
      return NextResponse.json({ error: 'Stake supera la perdita massima consentita' }, { status: 400 })
    }

    // Crea il nuovo passo
    const { data: step, error } = await supabase
      .from('scalata_steps')
      .insert({
        scalata_id: id,
        sequence: scalata.current_step + 1,
        title,
        odds,
        stake: nextStake,
        status: 'pending',
        prediction_id: prediction_id || null,
        custom_prediction_id: custom_prediction_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Errore nella creazione del passo:', error)
      return NextResponse.json({ error: 'Errore nella creazione del passo' }, { status: 500 })
    }

    // Aggiorna il passo corrente della scalata
    await supabase
      .from('scalate')
      .update({ 
        current_step: scalata.current_step + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}