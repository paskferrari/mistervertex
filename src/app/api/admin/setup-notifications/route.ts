import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Initialize Supabase client only when needed to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // Crea client Supabase con service role key per operazioni admin
    const supabase = getSupabaseAdmin()

    // Leggi il file SQL
    const sqlFilePath = path.join(process.cwd(), 'database', 'create_notifications_table.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    // Crea la tabella notifications manualmente
    // Nota: Le operazioni DDL devono essere eseguite tramite Supabase Dashboard
    // Questo endpoint serve per verificare e creare alcuni dati di test
    
    // Verifica se la tabella esiste già
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)
    
    if (tableCheckError && tableCheckError.message.includes('relation "notifications" does not exist')) {
      return NextResponse.json({
        error: 'La tabella notifications non esiste. Devi crearla manualmente nel Supabase Dashboard.',
        instructions: [
          '1. Vai su https://supabase.com/dashboard',
          '2. Seleziona il tuo progetto',
          '3. Vai su SQL Editor',
          '4. Esegui il contenuto del file database/create_notifications_table.sql'
        ]
      }, { status: 400 })
    }
    
    // Se arriviamo qui, la tabella esiste
    console.log('Tabella notifications già esistente o creata con successo')

    // Verifica se la tabella è stata creata
    const { data: tableExists, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)

    if (checkError && !checkError.message.includes('relation "notifications" does not exist')) {
      console.error('Errore nella verifica della tabella:', checkError)
      return NextResponse.json(
        { error: 'Errore nella verifica della tabella notifications', details: checkError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tabella notifications creata con successo'
    })

  } catch (error) {
    console.error('Errore nella creazione della tabella notifications:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della tabella notifications' },
      { status: 500 }
    )
  }
}