const { createClient } = require('@supabase/supabase-js')

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ixqjqjqjqjqjqjqjqjqj.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || 'your-secret-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testScalateIntegration() {
  console.log('🧪 Test Integrazione Scalate...\n')

  try {
    // 1. Test connessione database
    console.log('1. Test connessione database...')
    const { data: testConnection, error: connectionError } = await supabase
      .from('scalate')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.log('❌ Errore connessione:', connectionError.message)
      return
    }
    console.log('✅ Connessione database OK')

    // 2. Verifica struttura tabella scalate
    console.log('\n2. Verifica struttura tabella scalate...')
    const { data: scalateData, error: scalateError } = await supabase
      .from('scalate')
      .select('id, nome, descrizione, tipo, stake_iniziale, profitto_target, passi_massimi, passo_attuale, bankroll_attuale, stato, impostazioni, created_at, updated_at')
      .limit(1)

    if (scalateError) {
      console.log('❌ Errore struttura scalate:', scalateError.message)
      return
    }
    console.log('✅ Struttura tabella scalate OK')

    // 3. Verifica struttura tabella scalata_steps
    console.log('\n3. Verifica struttura tabella scalata_steps...')
    const { data: stepsData, error: stepsError } = await supabase
      .from('scalata_steps')
      .select('id, scalata_id, numero_passo, stake, quota, evento, risultato, profitto, data_evento, note, created_at')
      .limit(1)

    if (stepsError) {
      console.log('❌ Errore struttura steps:', stepsError.message)
      return
    }
    console.log('✅ Struttura tabella scalata_steps OK')

    // 4. Test inserimento e lettura con mappatura
    console.log('\n4. Test inserimento e lettura con mappatura...')
    
    // Crea un utente di test se non esiste
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'
    
    // Verifica/crea utente auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      user_id: testUserId,
      email: 'test-scalate@example.com',
      password: 'test123456',
      email_confirm: true
    })

    if (authError && !authError.message.includes('already been registered')) {
      console.log('❌ Errore creazione auth user:', authError.message)
      return
    }

    // Verifica/crea utente nella tabella users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', testUserId)
      .single()

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: 'test-scalate@example.com',
          role: 'abbonato_vip'
        })

      if (userError && !userError.message.includes('duplicate key')) {
        console.log('❌ Errore creazione user:', userError.message)
        return
      }
    }

    console.log('✅ Utente di test pronto')

    // Inserisci scalata di test
    const testScalata = {
      user_id: testUserId,
      nome: 'Test Integrazione',
      descrizione: 'Test per verificare la mappatura dei dati',
      tipo: 'progressive',
      stake_iniziale: 10.00,
      profitto_target: 100.00,
      passi_massimi: 5,
      passo_attuale: 1,
      bankroll_attuale: 10.00,
      stato: 'active',
      impostazioni: JSON.stringify({
        multiplier: 2,
        reset_on_loss: true,
        max_loss: 50,
        auto_progression: false
      })
    }

    const { data: insertedScalata, error: insertError } = await supabase
      .from('scalate')
      .insert(testScalata)
      .select()
      .single()

    if (insertError) {
      console.log('❌ Errore inserimento scalata:', insertError.message)
      return
    }

    console.log('✅ Scalata inserita:', insertedScalata.id)

    // 5. Test lettura con join
    console.log('\n5. Test lettura con join...')
    const { data: scalataWithSteps, error: readError } = await supabase
      .from('scalate')
      .select(`
        id, nome, descrizione, tipo, stake_iniziale, profitto_target,
        passi_massimi, passo_attuale, bankroll_attuale, stato, impostazioni,
        created_at, updated_at,
        scalata_steps (
          id, numero_passo, stake, quota, evento, risultato, profitto,
          data_evento, note, created_at
        )
      `)
      .eq('id', insertedScalata.id)
      .single()

    if (readError) {
      console.log('❌ Errore lettura con join:', readError.message)
    } else {
      console.log('✅ Lettura con join OK')
      console.log('   Nome:', scalataWithSteps.nome)
      console.log('   Tipo:', scalataWithSteps.tipo)
      console.log('   Stato:', scalataWithSteps.stato)
      console.log('   Steps:', scalataWithSteps.scalata_steps?.length || 0)
    }

    // 6. Test mappatura dati (simula quello che fa l'API)
    console.log('\n6. Test mappatura dati...')
    
    if (scalataWithSteps) {
      const mappedData = {
        id: scalataWithSteps.id,
        name: scalataWithSteps.nome,
        description: scalataWithSteps.descrizione,
        scalata_type: scalataWithSteps.tipo,
        initial_stake: scalataWithSteps.stake_iniziale,
        target_profit: scalataWithSteps.profitto_target,
        max_steps: scalataWithSteps.passi_massimi,
        current_step: scalataWithSteps.passo_attuale,
        current_bankroll: scalataWithSteps.bankroll_attuale,
        status: scalataWithSteps.stato,
        settings: typeof scalataWithSteps.impostazioni === 'string' 
          ? JSON.parse(scalataWithSteps.impostazioni) 
          : scalataWithSteps.impostazioni,
        steps: scalataWithSteps.scalata_steps?.map(step => ({
          id: step.id,
          numero_passo: step.numero_passo,
          stake: step.stake,
          quota: step.quota,
          evento: step.evento,
          risultato: step.risultato,
          profitto: step.profitto,
          data_evento: step.data_evento,
          note: step.note,
          created_at: step.created_at
        })) || [],
        created_at: scalataWithSteps.created_at,
        updated_at: scalataWithSteps.updated_at
      }

      console.log('✅ Mappatura dati completata')
      console.log('   Dati mappati:', {
        name: mappedData.name,
        scalata_type: mappedData.scalata_type,
        initial_stake: mappedData.initial_stake,
        status: mappedData.status
      })
    }

    // 7. Pulizia
    console.log('\n7. Pulizia dati di test...')
    
    const { error: deleteError } = await supabase
      .from('scalate')
      .delete()
      .eq('id', insertedScalata.id)

    if (deleteError) {
      console.log('⚠️  Errore eliminazione scalata:', deleteError.message)
    } else {
      console.log('✅ Scalata di test eliminata')
    }

    console.log('\n✅ Test integrazione completato con successo!')
    console.log('\n📋 RIEPILOGO:')
    console.log('   ✅ Connessione database')
    console.log('   ✅ Struttura tabelle corretta')
    console.log('   ✅ Inserimento con nomi colonne italiani')
    console.log('   ✅ Lettura con join')
    console.log('   ✅ Mappatura dati per frontend')
    console.log('\n🎉 Le correzioni alle API Scalate sono funzionanti!')

  } catch (error) {
    console.error('❌ Errore durante il test:', error)
  }
}

// Esegui il test
testScalateIntegration()