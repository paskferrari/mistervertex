import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Leggi il file SQL per creare le tabelle X-BANK
    const sqlFilePath = join(process.cwd(), 'database', 'create_xbank_tables.sql')
    const sqlContent = readFileSync(sqlFilePath, 'utf8')

    // Esegui lo script SQL
    const { error: createTablesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: sqlContent
    })

    if (createTablesError) {
      console.error('Error creating X-BANK tables:', createTablesError)
      return NextResponse.json(
        { error: 'Errore nella creazione delle tabelle X-BANK', details: createTablesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Tabelle X-BANK create con successo',
      success: true,
      tables_created: [
        'xbank_user_settings',
        'custom_predictions', 
        'prediction_groups',
        'prediction_group_items',
        'bankroll_history',
        'user_statistics',
        'user_follows'
      ]
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server', details: error },
      { status: 500 }
    )
  }
}