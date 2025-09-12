import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface PredictionUpdateData {
  updated_at: string
  title?: string
  description?: string
  sport?: string
  match_info?: string
  prediction_type?: string
  odds?: number
  confidence_level?: number
  access_level?: number
  status?: string
  result?: string
}

interface PredictionInputData {
  title?: string
  description?: string
  sport?: string
  match_info?: string
  prediction_type?: string
  odds?: string | number
  confidence_level?: string | number
  access_level?: string | number
  status?: string
  result?: string
}

// GET - Recupera un pronostico specifico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching prediction:', error)
      return NextResponse.json(
        { error: 'Pronostico non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prediction: data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna un pronostico (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json() as PredictionInputData
    const {
      title,
      description,
      sport,
      match_info,
      prediction_type,
      odds,
      confidence_level,
      access_level,
      status,
      result
    } = body

    // Prepara i dati per l'aggiornamento
    const updateData: PredictionUpdateData = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (sport !== undefined) updateData.sport = sport
    if (match_info !== undefined) updateData.match_info = match_info
    if (prediction_type !== undefined) updateData.prediction_type = prediction_type
    if (odds !== undefined) updateData.odds = typeof odds === 'string' ? parseFloat(odds) : odds
    if (confidence_level !== undefined) {
      const confidenceNum = typeof confidence_level === 'string' ? parseInt(confidence_level) : confidence_level
      if (confidenceNum < 1 || confidenceNum > 5) {
        return NextResponse.json(
          { error: 'Il livello di fiducia deve essere tra 1 e 5' },
          { status: 400 }
        )
      }
      updateData.confidence_level = confidenceNum
    }
    if (access_level !== undefined) {
      const accessNum = typeof access_level === 'string' ? parseInt(access_level) : access_level
      if (![0, 1, 2].includes(accessNum)) {
        return NextResponse.json(
          { error: 'Livello di accesso non valido' },
          { status: 400 }
        )
      }
      updateData.access_level = accessNum
    }
    if (status !== undefined) {
      if (!['active', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Status non valido' },
          { status: 400 }
        )
      }
      updateData.status = status
    }
    if (result !== undefined) {
      if (!['win', 'loss', 'void', 'pending'].includes(result)) {
        return NextResponse.json(
          { error: 'Risultato non valido' },
          { status: 400 }
        )
      }
      updateData.result = result
    }


    const { data, error } = await supabaseAdmin
      .from('predictions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating prediction:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento del pronostico' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Pronostico aggiornato con successo',
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

// DELETE - Elimina un pronostico (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await supabaseAdmin
      .from('predictions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prediction:', error)
      return NextResponse.json(
        { error: 'Errore nell\'eliminazione del pronostico' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Pronostico eliminato con successo' 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}