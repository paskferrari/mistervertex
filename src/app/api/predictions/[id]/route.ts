import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const body = await request.json()
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
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (sport !== undefined) updateData.sport = sport
    if (match_info !== undefined) updateData.match_info = match_info
    if (prediction_type !== undefined) updateData.prediction_type = prediction_type
    if (odds !== undefined) updateData.odds = parseFloat(odds)
    if (confidence_level !== undefined) {
      if (confidence_level < 1 || confidence_level > 5) {
        return NextResponse.json(
          { error: 'Il livello di fiducia deve essere tra 1 e 5' },
          { status: 400 }
        )
      }
      updateData.confidence_level = parseInt(confidence_level)
    }
    if (access_level !== undefined) {
      if (![0, 1, 2].includes(access_level)) {
        return NextResponse.json(
          { error: 'Livello di accesso non valido' },
          { status: 400 }
        )
      }
      updateData.access_level = parseInt(access_level)
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