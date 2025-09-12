import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Recupera i pronostici salvati nel wallet dell'utente
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = user.id

    // Recupera i pronostici salvati con i dettagli del pronostico originale
    const { data, error } = await supabaseAdmin
      .from('wallet')
      .select(`
        *,
        prediction:predictions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching wallet:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero del wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Aggiunge un pronostico al wallet dell'utente
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { prediction_id, stake_amount, notes } = body
    const user_id = user.id

    if (!prediction_id) {
      return NextResponse.json(
        { error: 'ID pronostico richiesto' },
        { status: 400 }
      )
    }

    // Verifica che il pronostico esista
    const { data: prediction, error: predictionError } = await supabaseAdmin
      .from('predictions')
      .select('id, access_level')
      .eq('id', prediction_id)
      .single()

    if (predictionError || !prediction) {
      return NextResponse.json(
        { error: 'Pronostico non trovato' },
        { status: 404 }
      )
    }

    // Verifica se il pronostico è già nel wallet
    const { data: existing } = await supabaseAdmin
      .from('wallet')
      .select('id')
      .eq('user_id', user_id)
      .eq('prediction_id', prediction_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Pronostico già presente nel wallet' },
        { status: 409 }
      )
    }

    // Aggiunge il pronostico al wallet
    const { data, error } = await supabaseAdmin
      .from('wallet')
      .insert({
        user_id,
        prediction_id,
        stake_amount: stake_amount ? parseFloat(stake_amount) : null,
        notes,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        prediction:predictions(*)
      `)
      .single()

    if (error) {
      console.error('Error adding to wallet:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiunta al wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Pronostico aggiunto al wallet con successo',
      wallet_item: data 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}