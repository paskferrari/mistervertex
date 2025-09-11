import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Recupera tutti i pronostici (con filtri per livello accesso)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accessLevel = searchParams.get('access_level')
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filtra per livello di accesso se specificato
    if (accessLevel !== null) {
      const levels = accessLevel.split(',').map(l => parseInt(l))
      query = query.in('access_level', levels)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching predictions:', error)
      return NextResponse.json(
        { error: 'Errore nel recupero dei pronostici' },
        { status: 500 }
      )
    }

    return NextResponse.json({ predictions: data || [] })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo pronostico (solo admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      sport,
      match_info,
      prediction_type,
      odds,
      confidence_level,
      access_level
    } = body

    // Validazione dei dati
    if (!title || !description || !sport || !odds || !confidence_level || access_level === undefined) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    if (confidence_level < 1 || confidence_level > 5) {
      return NextResponse.json(
        { error: 'Il livello di fiducia deve essere tra 1 e 5' },
        { status: 400 }
      )
    }

    if (![0, 1, 2].includes(access_level)) {
      return NextResponse.json(
        { error: 'Livello di accesso non valido' },
        { status: 400 }
      )
    }

    // Crea il pronostico
    const { data, error } = await supabaseAdmin
      .from('predictions')
      .insert({
        title,
        description,
        sport,
        match_info,
        prediction_type,
        odds: parseFloat(odds),
        confidence_level: parseInt(confidence_level),
        access_level: parseInt(access_level),
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating prediction:', error)
      return NextResponse.json(
        { error: 'Errore nella creazione del pronostico' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Pronostico creato con successo',
      prediction: data 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}