const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili di ambiente mancanti')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugScalateErrors() {
  console.log('🔍 Debug degli errori Scalate...\n')

  try {
    // 1. Verifica connessione database
    console.log('1. Verifica connessione database...')
    const { data: connection, error: connError } = await supabase
      .from('scalate')
      .select('count')
      .limit(1)
    
    if (connError) {
      console.error('❌ Errore connessione:', connError.message)
      return
    }
    console.log('✅ Connessione database OK')

    // 2. Verifica struttura tabelle
    console.log('\n2. Verifica struttura tabelle...')
    console.log('✅ Struttura tabelle verificata nei test precedenti')

    // 3. Usa un utente VIP esistente dal database
    console.log('\n👤 3. VERIFICA UTENTE VIP ESISTENTE')
    
    let testUserId
    
    try {
      // Cerca un utente VIP esistente
      const { data: vipUser, error: vipError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'abbonato_vip')
        .limit(1)
        .single()
      
      if (vipError || !vipUser) {
        console.log('⚠️  Nessun utente VIP trovato nel database')
        console.log('   Creando un utente di test temporaneo...')
        
        // Genera un UUID per il test
        const testUUID = '550e8400-e29b-41d4-a716-446655440000'
        
        // Prima crea l'utente in auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          user_id: testUUID,
          email: 'test-scalate@example.com',
          password: 'test123456',
          email_confirm: true
        })
        
        if (authError && !authError.message.includes('already been registered')) {
          console.error('❌ Errore creazione auth user:', authError.message)
          return
        }
        
        // Poi crea l'utente nella tabella users
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            id: testUUID,
            email: 'test-scalate@example.com',
            role: 'abbonato_vip'
          })
          .select()
          .single()

        if (userError && !userError.message.includes('duplicate key')) {
          console.error('❌ Errore nella creazione utente:', userError.message)
          return
        }

        console.log('✅ Utente di test creato')
        testUserId = testUUID
      } else {
        console.log('✅ Utente VIP trovato:', vipUser.email)
        testUserId = vipUser.id
      }
    } catch (error) {
      console.error('❌ Errore nella gestione utente:', error)
      return
    }

    // 4. Inserisci una scalata di test
    console.log('\n📊 4. INSERIMENTO SCALATA DI TEST');
    
    const testScalata = {
      user_id: testUserId,
      nome: 'Test Scalata Debug',
      descrizione: 'Scalata di test per debug',
      tipo: 'progressive',
      stake_iniziale: 10,
      profitto_target: 100,
      passi_massimi: 5,
      passo_attuale: 0,
      bankroll_attuale: 10,
      stato: 'attiva',
      impostazioni: {
        multiplier: 2,
        reset_on_loss: false,
        max_loss: 0,
        auto_progression: false
      }
    }

    const { data: insertedScalata, error: insertError } = await supabase
      .from('scalate')
      .insert(testScalata)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Errore inserimento scalata:', insertError.message)
      console.error('Dettagli:', insertError)
      
      // Verifica vincoli specifici
      if (insertError.message.includes('foreign key')) {
        console.log('\n🔍 Verifica vincoli foreign key...')
        
        // Verifica tabella profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)
          .single()
        
        if (profileError) {
          console.log('⚠️  Profilo utente non trovato, creo profilo...')
          
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: testUserId,
              email: 'test-scalate@example.com',
              role: 'vip',
              created_at: new Date().toISOString()
            })
          
          if (createProfileError) {
            console.error('❌ Errore creazione profilo:', createProfileError.message)
          } else {
            console.log('✅ Profilo creato')
          }
        } else {
          console.log('✅ Profilo utente trovato:', profile)
        }
      }
      
      return
    }
    
    console.log('✅ Scalata inserita con successo:', insertedScalata.id)

    // 5. Test lettura scalate
    console.log('\n5. Test lettura scalate...')
    const { data: scalate, error: readError } = await supabase
      .from('scalate')
      .select(`
        *,
        scalata_steps (
          id,
          numero_passo,
          stake,
          quota,
          evento,
          risultato,
          profitto,
          data_evento,
          note,
          created_at
        )
      `)
      .eq('user_id', testUserId)

    if (readError) {
      console.error('❌ Errore lettura scalate:', readError.message)
      return
    }
    
    console.log('✅ Scalate lette con successo:', scalate.length, 'trovate')

    // 6. Test endpoint API
    console.log('\n6. Test endpoint API...')
    
    try {
      const response = await fetch('http://localhost:3000/api/xbank/scalate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Status API GET:', response.status)
      
      if (response.status === 401) {
        console.log('⚠️  API richiede autenticazione (normale)')
      } else if (response.ok) {
        const data = await response.json()
        console.log('✅ API risponde correttamente:', data.length, 'scalate')
      } else {
        const errorData = await response.text()
        console.error('❌ Errore API:', response.status, errorData)
      }
    } catch (fetchError) {
      console.error('❌ Errore connessione API:', fetchError.message)
    }

    // 7. Pulizia dati di test
    console.log('\n🧹 7. PULIZIA DATI DI TEST')
    
    if (insertedScalata) {
      const { error: deleteError } = await supabase
        .from('scalate')
        .delete()
        .eq('id', insertedScalata.id)
      
      if (deleteError) {
        console.error('⚠️  Errore eliminazione scalata test:', deleteError.message)
      } else {
        console.log('✅ Scalata test eliminata')
      }
    }

    // Elimina utente test se creato
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(testUserId)
    if (deleteUserError && !deleteUserError.message.includes('not found')) {
      console.error('⚠️  Errore eliminazione utente test:', deleteUserError.message)
    } else {
      console.log('✅ Utente test eliminato')
    }

    console.log('\n✅ Debug completato con successo!')

  } catch (error) {
    console.error('❌ Errore durante il debug:', error)
  }
}

debugScalateErrors()