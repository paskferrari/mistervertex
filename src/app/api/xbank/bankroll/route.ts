import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

interface DecodedToken {
  sub: string
  email?: string
  iat?: number
  exp?: number
}

// GET - Recupera lo storico delle transazioni bankroll
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.decode(token) as DecodedToken | null
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const userId = decoded.sub

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const type = url.searchParams.get('type')
    const offset = (page - 1) * limit

    let query = supabase
      .from('xbank_bankroll_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('transaction_type', type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('Error fetching bankroll transactions:', error)
      return NextResponse.json({ error: 'Errore nel recupero delle transazioni' }, { status: 500 })
    }

    // Conta il totale per la paginazione
    let countQuery = supabase
      .from('xbank_bankroll_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (type) {
      countQuery = countQuery.eq('transaction_type', type)
    }

    const { count } = await countQuery

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in bankroll GET:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// POST - Crea una nuova transazione bankroll
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.decode(token) as DecodedToken | null
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const userId = decoded.sub

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = await request.json()
    const { transaction_type, amount, description, prediction_id } = body

    // Validazione
    if (!transaction_type || amount === undefined || !description) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    if (!['bet', 'win', 'loss', 'adjustment', 'deposit', 'withdrawal'].includes(transaction_type)) {
      return NextResponse.json({ error: 'Tipo di transazione non valido' }, { status: 400 })
    }

    // Ottieni il bankroll attuale
    const { data: settings, error: settingsError } = await supabase
      .from('xbank_user_settings')
      .select('current_bankroll')
      .eq('user_id', userId)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ error: 'Impostazioni utente non trovate' }, { status: 404 })
    }

    const balanceBefore = settings.current_bankroll
    let balanceAfter = balanceBefore

    // Calcola il nuovo balance in base al tipo di transazione
    switch (transaction_type) {
      case 'bet':
        balanceAfter = balanceBefore - Math.abs(amount)
        break
      case 'win':
        balanceAfter = balanceBefore + Math.abs(amount)
        break
      case 'loss':
        // Per le perdite, l'importo è già stato sottratto con la bet
        balanceAfter = balanceBefore
        break
      case 'deposit':
      case 'adjustment':
        balanceAfter = balanceBefore + amount
        break
      case 'withdrawal':
        balanceAfter = balanceBefore - Math.abs(amount)
        break
    }

    // Verifica che il balance non diventi negativo (eccetto per adjustments)
    if (balanceAfter < 0 && transaction_type !== 'adjustment') {
      return NextResponse.json({ error: 'Fondi insufficienti' }, { status: 400 })
    }

    // Inizia una transazione
    const { data: transaction, error: transactionError } = await supabase
      .from('xbank_bankroll_tracking')
      .insert({
        user_id: userId,
        prediction_id,
        transaction_type,
        amount,
        description,
        balance_before: balanceBefore,
        balance_after: balanceAfter
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return NextResponse.json({ error: 'Errore nella creazione della transazione' }, { status: 500 })
    }

    // Aggiorna il bankroll nelle impostazioni
    const { error: updateError } = await supabase
      .from('xbank_user_settings')
      .update({ current_bankroll: balanceAfter })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating bankroll:', updateError)
      // Rollback della transazione se l'aggiornamento fallisce
      await supabase
        .from('xbank_bankroll_tracking')
        .delete()
        .eq('id', transaction.id)
      
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del bankroll' }, { status: 500 })
    }

    return NextResponse.json({
      transaction,
      new_balance: balanceAfter
    }, { status: 201 })

  } catch (error) {
    console.error('Error in bankroll POST:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// PUT - Aggiorna una transazione esistente (solo adjustments)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token di autorizzazione mancante' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.decode(token) as DecodedToken | null
    
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
    }

    const userId = decoded.sub

    // Verifica che l'utente sia VIP
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = await request.json()
    const { transaction_id, amount, description } = body

    if (!transaction_id || amount === undefined) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    // Verifica che la transazione esista e sia di tipo adjustment
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('xbank_bankroll_tracking')
      .select('*')
      .eq('id', transaction_id)
      .eq('user_id', userId)
      .eq('transaction_type', 'adjustment')
      .single()

    if (fetchError || !existingTransaction) {
      return NextResponse.json({ error: 'Transazione non trovata o non modificabile' }, { status: 404 })
    }

    // Calcola la differenza
    const difference = amount - existingTransaction.amount
    const newBalanceAfter = existingTransaction.balance_after + difference

    // Aggiorna la transazione
    const { error: updateTransactionError } = await supabase
      .from('xbank_bankroll_tracking')
      .update({
        amount,
        description: description || existingTransaction.description,
        balance_after: newBalanceAfter
      })
      .eq('id', transaction_id)

    if (updateTransactionError) {
      console.error('Error updating transaction:', updateTransactionError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento della transazione' }, { status: 500 })
    }

    // Aggiorna il bankroll corrente
    const { error: updateBankrollError } = await supabase
      .from('xbank_user_settings')
      .update({ current_bankroll: newBalanceAfter })
      .eq('user_id', userId)

    if (updateBankrollError) {
      console.error('Error updating bankroll:', updateBankrollError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del bankroll' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Transazione aggiornata con successo',
      new_balance: newBalanceAfter
    })

  } catch (error) {
    console.error('Error in bankroll PUT:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}