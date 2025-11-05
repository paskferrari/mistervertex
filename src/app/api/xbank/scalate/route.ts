import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione via bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP o admin su tabella users
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    // Recupera le scalate dell'utente con i relativi passi (supporto a colonne italiane/inglesi)
    const { data: scalate, error } = await supabaseAdmin
      .from('scalate')
      .select(`*, scalata_steps (*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore nel recupero delle scalate:', error)
      return NextResponse.json({ error: 'Errore nel recupero delle scalate' }, { status: 500 })
    }

    // Formatta i dati per il frontend con normalizzazione nomi campo
    const formattedScalate = (scalate || []).map((scalata: any) => {
      const stepsSrc = scalata.scalata_steps || scalata.passi || []
      const steps = stepsSrc.map((step: any) => ({
        id: step.id,
        sequence: step.sequence ?? step.numero_passo ?? null,
        title: step.title ?? step.titolo ?? '',
        odds: step.odds ?? step.quota ?? null,
        stake: step.stake ?? step.puntata ?? null,
        status: step.status ?? step.risultato ?? 'pending',
        prediction_id: step.prediction_id ?? step.pronostico_id ?? null,
        custom_prediction_id: step.custom_prediction_id ?? step.pronostico_custom_id ?? null,
        completed_at: step.completed_at ?? step.completato_il ?? null,
        created_at: step.created_at,
        updated_at: step.updated_at
      }))

      const normalized = {
        id: scalata.id,
        user_id: scalata.user_id,
        name: scalata.name ?? scalata.nome ?? '',
        description: scalata.description ?? scalata.descrizione ?? '',
        scalata_type: scalata.scalata_type ?? scalata.tipo ?? 'progressive',
        initial_stake: Number(scalata.initial_stake ?? scalata.stake_iniziale ?? 0),
        target_profit: Number(scalata.target_profit ?? scalata.profitto_target ?? 0),
        max_steps: Number(scalata.max_steps ?? scalata.passi_massimi ?? 0),
        current_step: Number(scalata.current_step ?? scalata.passo_attuale ?? 0),
        current_bankroll: Number(scalata.current_bankroll ?? scalata.bankroll_attuale ?? 0),
        status: scalata.status ?? scalata.stato ?? 'active',
        steps,
        // Mantieni settings come oggetto unico
        settings: scalata.settings ?? {
          multiplier: scalata.moltiplicatore ?? 2,
          reset_on_loss: scalata.reset_su_sconfitta ?? false,
          max_loss: scalata.perdita_massima ?? 0,
          auto_progression: scalata.progresso_automatico ?? false
        },
        created_at: scalata.created_at,
        updated_at: scalata.updated_at
      }

      return normalized
    })

    return NextResponse.json(formattedScalate)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione via bearer token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP o admin
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
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

    // Crea la scalata, con fallback su schema italiano in caso di colonne mancanti
    let scalataInsert
    let insertError
    const englishPayload = {
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
    }

    const { data: enData, error: enError } = await supabaseAdmin
      .from('scalate')
      .insert(englishPayload)
      .select()
      .single()

    if (!enError) {
      scalataInsert = enData
    } else if (enError.code === '42703') {
      // Colonna non trovata: tentativo con schema italiano
      const italianPayload = {
        user_id: user.id,
        nome: name,
        descrizione: description || '',
        tipo: scalata_type,
        stake_iniziale: initial_stake,
        profitto_target: target_profit,
        passi_massimi: max_steps,
        passo_attuale: 0,
        bankroll_attuale: initial_stake,
        stato: 'active',
        // Se lo schema italiano usa colonne separate invece di JSON
        moltiplicatore: multiplier || 2,
        reset_su_sconfitta: reset_on_loss || false,
        perdita_massima: max_loss || 0,
        progresso_automatico: auto_progression || false
      }

      const { data: itData, error: itError } = await supabaseAdmin
        .from('scalate')
        .insert(italianPayload)
        .select()
        .single()

      scalataInsert = itData
      insertError = itError
    } else {
      insertError = enError
    }

    if (insertError) {
      console.error('Errore nella creazione della scalata:', insertError)
      return NextResponse.json({ error: 'Errore nella creazione della scalata' }, { status: 500 })
    }

    return NextResponse.json(scalataInsert, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}