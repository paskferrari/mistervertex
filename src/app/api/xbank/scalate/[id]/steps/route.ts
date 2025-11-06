import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface ScalataSettings {
  multiplier?: number
  max_loss?: number
  [key: string]: number | string | boolean | null | undefined
}

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
      .select('*')
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

    // Normalizza campi con fallback tra schema inglese/italiano
    const currentStep = Number((scalata as any).current_step ?? (scalata as any).passo_attuale ?? 0)
    const maxSteps = Number((scalata as any).max_steps ?? (scalata as any).passi_massimi ?? 0)
    const scalataType = (scalata as any).scalata_type ?? (scalata as any).tipo ?? 'progressive'
    const settings = ((scalata as any).settings as ScalataSettings) ?? {
      multiplier: (scalata as any).moltiplicatore ?? 2,
      max_loss: (scalata as any).perdita_massima ?? 0
    }
    const currentBankroll = Number((scalata as any).current_bankroll ?? (scalata as any).bankroll_attuale ?? 0)

    // Verifica che non si superi il numero massimo di passi
    if (currentStep >= maxSteps) {
      return NextResponse.json({ error: 'Numero massimo di passi raggiunto' }, { status: 400 })
    }

    // Calcola lo stake per il prossimo passo basato sul tipo di scalata
    let nextStake = 0
    
    switch (scalataType) {
      case 'progressive':
        if (currentStep === 0) {
          // Primo passo: usa il bankroll corrente
          nextStake = currentBankroll
        } else {
          // Passi successivi: moltiplica per il moltiplicatore
          const multiplier = (settings?.multiplier as number) || 2
          nextStake = currentBankroll * multiplier
        }
        break
        
      case 'fixed':
        // Stake fisso: usa sempre il bankroll iniziale
        nextStake = currentBankroll
        break
        
      case 'fibonacci':
        // Implementa la sequenza di Fibonacci
        let previousSteps: any[] | null = null
        let prevError: any = null
        {
          const { data, error } = await supabase
            .from('scalata_steps')
            .select('stake, sequence')
            .eq('scalata_id', id)
            .order('sequence', { ascending: false })
            .limit(2)
          previousSteps = data
          prevError = error
        }
        if (prevError || !previousSteps) {
          // Fallback: ordina per possibile colonna italiana
          const { data } = await supabase
            .from('scalata_steps')
            .select('stake, numero_passo')
            .eq('scalata_id', id)
            .order('numero_passo', { ascending: false })
            .limit(2)
          previousSteps = data || []
        }

        if (!previousSteps || previousSteps.length === 0) {
          nextStake = currentBankroll
        } else if (previousSteps.length === 1) {
          nextStake = currentBankroll
        } else {
          nextStake = (Number(previousSteps[0].stake) || 0) + (Number(previousSteps[1].stake) || 0)
        }
        break
        
      case 'custom':
        // Per scalate personalizzate, usa il bankroll corrente
        nextStake = currentBankroll
        break
        
      default:
        nextStake = currentBankroll
    }

    // Verifica che lo stake non superi il limite di perdita massima
    if (settings.max_loss && nextStake > settings.max_loss) {
      return NextResponse.json({ error: 'Stake supera la perdita massima consentita' }, { status: 400 })
    }

    // Crea il nuovo passo
    let step: any = null
    {
      const { data, error } = await supabase
        .from('scalata_steps')
        .insert({
          scalata_id: id,
          sequence: currentStep + 1,
          title,
          odds,
          stake: nextStake,
          status: 'pending',
          prediction_id: prediction_id || null,
          custom_prediction_id: custom_prediction_id || null
        })
        .select()
        .single()
      if (!error) {
        step = data
      } else {
        // Fallback su schema italiano
        const { data: itData, error: itError } = await supabase
          .from('scalata_steps')
          .insert({
            scalata_id: id,
            numero_passo: currentStep + 1,
            titolo: title,
            quota: odds,
            puntata: nextStake,
            risultato: 'pending',
            pronostico_id: prediction_id || null,
            pronostico_custom_id: custom_prediction_id || null
          })
          .select()
          .single()
        if (itError) {
          console.error('Errore nella creazione del passo:', itError)
          return NextResponse.json({ error: 'Errore nella creazione del passo' }, { status: 500 })
        }
        step = itData
      }
    }

    // Aggiorna il passo corrente della scalata
    {
      const { error: upError } = await supabase
        .from('scalate')
        .update({ 
          current_step: currentStep + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (upError) {
        // Fallback su colonna italiana
        await supabase
          .from('scalate')
          .update({ 
            passo_attuale: currentStep + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      }
    }

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}