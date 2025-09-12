import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface WalletUpdateData {
  updated_at: string
  stake_amount?: number | null
  notes?: string
  status?: string
  result?: string
}

interface WalletInputData {
  stake_amount?: string | number | null
  notes?: string
  status?: string
  result?: string
}

// PUT - Aggiorna un elemento del wallet (stake, note, status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json() as WalletInputData
    const { stake_amount, notes, status, result } = body

    // Prepara i dati per l'aggiornamento
    const updateData: WalletUpdateData = {
      updated_at: new Date().toISOString()
    }

    if (stake_amount !== undefined) {
      updateData.stake_amount = stake_amount ? (typeof stake_amount === 'string' ? parseFloat(stake_amount) : stake_amount) : null
    }
    if (notes !== undefined) updateData.notes = notes
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
      .from('wallet')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        prediction:predictions(*)
      `)
      .single()

    if (error) {
      console.error('Error updating wallet item:', error)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento dell\'elemento del wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Elemento del wallet aggiornato con successo',
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

// DELETE - Rimuove un pronostico dal wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await supabaseAdmin
      .from('wallet')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting wallet item:', error)
      return NextResponse.json(
        { error: 'Errore nella rimozione dal wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Pronostico rimosso dal wallet con successo' 
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}