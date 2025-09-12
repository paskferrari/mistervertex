import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Verifica che l'utente sia autenticato
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', session.user.email)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Accesso negato - Solo gli admin possono svuotare il wallet' },
        { status: 403 }
      )
    }

    // Prima conta i record esistenti
    const { count: initialCount, error: countError } = await supabase
      .from('wallet')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Errore nel conteggio iniziale:', countError)
      return NextResponse.json(
        { error: 'Errore nel conteggio dei record esistenti' },
        { status: 500 }
      )
    }

    // Svuota la tabella wallet
    const { error: deleteError } = await supabase
      .from('wallet')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Condizione che matcha tutti i record

    if (deleteError) {
      console.error('Errore durante lo svuotamento:', deleteError)
      return NextResponse.json(
        { error: 'Errore durante lo svuotamento della tabella wallet', details: deleteError },
        { status: 500 }
      )
    }

    // Verifica che la tabella sia vuota
    const { count: finalCount, error: finalCountError } = await supabase
      .from('wallet')
      .select('*', { count: 'exact', head: true })

    if (finalCountError) {
      console.error('Errore nel conteggio finale:', finalCountError)
    }

    return NextResponse.json({
      success: true,
      message: 'Tabella wallet svuotata con successo',
      recordsDeleted: initialCount || 0,
      remainingRecords: finalCount || 0
    })

  } catch (error) {
    console.error('Errore durante lo svuotamento della tabella wallet:', error)
    return NextResponse.json(
      { error: 'Errore interno del server', details: error },
      { status: 500 }
    )
  }
}