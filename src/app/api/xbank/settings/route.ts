import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface SettingsUpdateData {
  updated_at: string
  initial_bankroll?: number
  current_bankroll?: number
  currency?: string
  unit_type?: string
  unit_value?: number
  risk_management?: any
}

// GET - Recupera le impostazioni X-BANK dell'utente
export async function GET(request: NextRequest) {
  try {
    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token di autenticazione mancante' },
        { status: 401 }
      )
    }

    // Verifica l'utente con il token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Recupera le impostazioni X-BANK
    const { data, error } = await supabaseAdmin
      .from('xbank_user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching X-BANK settings:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero delle impostazioni' },
        { status: 500 }
      )
    }

    // Se non esistono impostazioni, crea quelle di default
    if (!data) {
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('xbank_user_settings')
        .insert({
          user_id: user.id,
          initial_bankroll: 1000.00,
          current_bankroll: 1000.00,
          currency: 'EUR',
          unit_type: 'currency',
          unit_value: 10.00
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating default settings:', createError)
        return NextResponse.json(
          { error: 'Errore nella creazione delle impostazioni' },
          { status: 500 }
        )
      }

      return NextResponse.json(newSettings)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna le impostazioni X-BANK dell'utente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      initial_bankroll, 
      current_bankroll, 
      currency, 
      unit_type, 
      unit_value, 
      risk_management 
    } = body

    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token di autenticazione mancante' },
        { status: 401 }
      )
    }

    // Verifica l'utente con il token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utente non autenticato' },
        { status: 401 }
      )
    }

    // Verifica che l'utente sia VIP
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Prepara i dati per l'aggiornamento
    const updateData: SettingsUpdateData = {
      updated_at: new Date().toISOString()
    }

    if (initial_bankroll !== undefined) updateData.initial_bankroll = parseFloat(initial_bankroll)
    if (current_bankroll !== undefined) updateData.current_bankroll = parseFloat(current_bankroll)
    if (currency !== undefined) updateData.currency = currency
    if (unit_type !== undefined) updateData.unit_type = unit_type
    if (unit_value !== undefined) updateData.unit_value = parseFloat(unit_value)
    if (risk_management !== undefined) updateData.risk_management = risk_management

    // Aggiorna le impostazioni
    const { data, error } = await supabaseAdmin
      .from('xbank_user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating X-BANK settings:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento delle impostazioni' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Impostazioni aggiornate con successo',
      settings: data 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}