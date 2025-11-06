import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type StepStatus = 'pending' | 'won' | 'lost'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, stepId: string }> }
) {
  const { id, stepId } = await params
  try {
    // Auth
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // VIP/Admin role
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    // Verify scalata ownership
    const { data: scalata } = await supabaseAdmin
      .from('scalate')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (!scalata) {
      return NextResponse.json({ error: 'Scalata non trovata' }, { status: 404 })
    }

    // Verify step exists and belongs to scalata
    const { data: step } = await supabaseAdmin
      .from('scalata_steps')
      .select('id, scalata_id')
      .eq('id', stepId)
      .single()
    if (!step || step.scalata_id !== id) {
      return NextResponse.json({ error: 'Passo non trovato' }, { status: 404 })
    }

    const body = await request.json() as { status?: StepStatus }
    const status = body.status
    if (!status || !['pending', 'won', 'lost'].includes(status)) {
      return NextResponse.json({ error: 'Stato non valido' }, { status: 400 })
    }

    const completedAt = status === 'pending' ? null : new Date().toISOString()

    // Try update with english columns
    const { data: updated, error } = await supabaseAdmin
      .from('scalata_steps')
      .update({ status, completed_at: completedAt })
      .eq('id', stepId)
      .eq('scalata_id', id)
      .select()
      .single()

    if (!error && updated) {
      return NextResponse.json(updated)
    }

    // Fallback for Italian column names
    const { data: updatedIt, error: errorIt } = await supabaseAdmin
      .from('scalata_steps')
      .update({ risultato: status, completato_il: completedAt })
      .eq('id', stepId)
      .eq('scalata_id', id)
      .select()
      .single()

    if (errorIt) {
      console.error('Errore aggiornamento passo:', error || errorIt)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del passo' }, { status: 500 })
    }

    return NextResponse.json(updatedIt)
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}