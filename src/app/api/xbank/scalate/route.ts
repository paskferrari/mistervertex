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
    const formattedScalate = await Promise.all((scalate || []).map(async (scalata: any) => {
      // Prova prima a leggere i passi annidati; se vuoto, fai fallback con una query separata
      let stepsSrc = scalata.scalata_steps || scalata.passi || []
      if (!stepsSrc || stepsSrc.length === 0) {
        const { data: fetchedSteps } = await supabaseAdmin
          .from('scalata_steps')
          .select('*')
          .eq('scalata_id', scalata.id)
          .order('sequence', { ascending: true })
        stepsSrc = fetchedSteps || []
      }

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
    }))

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

    // Crea la scalata con payload minimale per massima compatibilità
    // Evita colonne opzionali che potrebbero non esistere (es. settings, current_bankroll)
    const minimalPayload = {
      user_id: user.id,
      name,
      scalata_type,
      initial_stake,
      target_profit,
      max_steps,
      status: 'active'
    }

    // Primo tentativo: colonne inglesi
    let created: any = null
    let createError: any = null
    {
      const { data, error } = await supabaseAdmin
        .from('scalate')
        .insert(minimalPayload)
        .select()
        .single()
      created = data
      createError = error
    }

    // Fallback: prova con colonne italiane quando lo schema remoto le richiede (es. nome NOT NULL)
    if (createError) {
      const italianPayload = {
        user_id: user.id,
        nome: name,
        tipo: scalata_type,
        stake_iniziale: initial_stake,
        profitto_target: target_profit,
        passi_massimi: max_steps,
        stato: 'active'
      } as Record<string, any>

      const { data: itCreated, error: itError } = await supabaseAdmin
        .from('scalate')
        .insert(italianPayload)
        .select()
        .single()

      if (itError) {
        console.error('Errore nella creazione della scalata (IT fallback):', itError)
        return NextResponse.json({ error: 'Errore nella creazione della scalata' }, { status: 500 })
      }
      created = itCreated
    }

    // Prova ad aggiornare current_bankroll e settings se le colonne esistono
    // In caso di errore di colonna mancante, ignora senza fallire
    if (created?.id) {
      const tryUpdate = async (updates: Record<string, any>) => {
        const { error } = await supabaseAdmin
          .from('scalate')
          .update(updates)
          .eq('id', created.id)
        return error
      }

      // Aggiorna current_bankroll = initial_stake
      const upBankrollErr = await tryUpdate({ current_bankroll: initial_stake })
      if (upBankrollErr && (upBankrollErr.code === '42703' || upBankrollErr.code === 'PGRST204')) {
        // Colonna non presente: ignora
      } else if (upBankrollErr) {
        console.warn('Update current_bankroll errore:', upBankrollErr)
      }

      // Aggiorna settings JSON se presente
      const settingsObj = {
        multiplier: multiplier || 2,
        reset_on_loss: reset_on_loss || false,
        max_loss: max_loss || 0,
        auto_progression: auto_progression || false
      }
      const upSettingsErr = await tryUpdate({ settings: settingsObj })
      if (upSettingsErr && (upSettingsErr.code === '42703' || upSettingsErr.code === 'PGRST204')) {
        // Colonna non presente: ignora
      } else if (upSettingsErr) {
        console.warn('Update settings errore:', upSettingsErr)
      }

      // Auto-creazione dei passi in base alla configurazione
      try {
        const stepsCount = Math.max(1, Number(max_steps) || 1)
        const m = Number(multiplier) || 2
        const type = String(scalata_type || 'fixed')
        const initStake = Math.max(0, Number(initial_stake) || 0)
        const lossCap = Number(max_loss) || 0

        const stepsEn: any[] = []
        let cumulative = 0
        for (let i = 1; i <= stepsCount; i++) {
          let stake = initStake
          if (type === 'progressive') {
            stake = Math.round(initStake * Math.pow(m, i - 1) * 100) / 100
          } else if (type === 'fixed') {
            stake = initStake
          } else if (type === 'fibonacci') {
            // Sequenza di Fibonacci: 1,1,2,3,5,... moltiplicata per lo stake iniziale
            const fib = (n: number): number => {
              if (n <= 2) return 1
              let a = 1, b = 1
              for (let k = 3; k <= n; k++) {
                const c = a + b
                a = b
                b = c
              }
              return b
            }
            stake = Math.round(initStake * fib(i) * 100) / 100
          } else {
            // custom/default: usa stake iniziale
            stake = initStake
          }
          const nextCumulative = cumulative + (stake || 0)
          if (lossCap > 0 && nextCumulative > lossCap) {
            break
          }
          cumulative = nextCumulative
          stepsEn.push({
            scalata_id: created.id,
            sequence: i,
            title: `Step ${i}`,
            odds: null,
            stake,
            status: 'pending'
          })
        }

        if (stepsEn.length > 0) {
          const { error: insErr } = await supabaseAdmin
            .from('scalata_steps')
            .insert(stepsEn)

          if (insErr) {
            const errMsg = String(insErr.message || '')

            // Fallback ibrido: alcuni ambienti usano 'numero_passo' ma mantengono gli altri campi in inglese
            if (insErr.code === '23502' && errMsg.includes('numero_passo')) {
              const stepsHybrid = stepsEn.map((s) => ({
                scalata_id: s.scalata_id,
                numero_passo: s.sequence,
                title: s.title,
                odds: s.odds,
                stake: s.stake,
                status: s.status
              }))

              const { error: hyErr } = await supabaseAdmin
                .from('scalata_steps')
                .insert(stepsHybrid)

              if (!hyErr) {
                // Inserimento riuscito con schema ibrido
              } else {
                // Ultimo fallback: schema completamente italiano
                const stepsIt = stepsEn.map((s) => ({
                  scalata_id: s.scalata_id,
                  numero_passo: s.sequence,
                  titolo: s.title,
                  quota: s.odds,
                  puntata: s.stake,
                  risultato: s.status
                }))
                const { error: itInsErr } = await supabaseAdmin
                  .from('scalata_steps')
                  .insert(stepsIt)
                if (itInsErr) {
                  console.warn('Auto-creazione passi fallita:', insErr, hyErr, itInsErr)
                }
              }
            } else {
              // Fallback standard: schema completamente italiano
              const stepsIt = stepsEn.map((s) => ({
                scalata_id: s.scalata_id,
                numero_passo: s.sequence,
                titolo: s.title,
                quota: s.odds,
                puntata: s.stake,
                risultato: s.status
              }))
              const { error: itInsErr } = await supabaseAdmin
                .from('scalata_steps')
                .insert(stepsIt)
              if (itInsErr) {
                console.warn('Auto-creazione passi fallita:', insErr, itInsErr)
              }
            }
          }
        }
      } catch (e) {
        console.warn('Errore auto-creazione passi:', e)
      }
    }

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}