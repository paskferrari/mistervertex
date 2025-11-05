import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type TransactionType = 'deposit' | 'withdrawal' | 'adjustment'

interface CreateTransactionBody {
  transaction_type: TransactionType
  amount: number
  description: string
}

// GET /api/xbank/bankroll?page=1&limit=10&type=deposit|withdrawal|bet|win|loss|adjustment
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
    }

    // Verifica ruolo VIP o admin
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)))
    const type = searchParams.get('type') || undefined

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('bankroll_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type && type !== 'all') {
      query = query.eq('transaction_type', type)
    }

    const { data: transactions, error, count } = await query.range(from, to)
    if (error) {
      // Fallback: tabella mancante (PGRST205) -> ritorna lista vuota
      if ((error as any).code === 'PGRST205') {
        console.warn('bankroll_history non presente: ritorno lista vuota')
        return NextResponse.json({
          transactions: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
          note: 'Tabella bankroll_history assente: tracking transazioni disabilitato temporaneamente'
        })
      }
      console.error('Errore nel recupero transazioni:', error)
      return NextResponse.json({ error: 'Errore nel recupero delle transazioni' }, { status: 500 })
    }

    const total = count || 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      transactions: transactions || [],
      pagination: { page, limit, total, totalPages }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

// POST /api/xbank/bankroll
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token di autenticazione mancante' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
    }

    // Verifica ruolo VIP o admin
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' }, { status: 403 })
    }

    const body = await request.json() as CreateTransactionBody
    const { transaction_type, amount, description } = body

    // Validazione input
    const validTypes: TransactionType[] = ['deposit', 'withdrawal', 'adjustment']
    if (!transaction_type || !validTypes.includes(transaction_type)) {
      return NextResponse.json({ error: 'Tipo di transazione non valido' }, { status: 400 })
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json({ error: 'Importo non valido' }, { status: 400 })
    }

    if (transaction_type !== 'adjustment' && amount <= 0) {
      return NextResponse.json({ error: 'L\'importo deve essere maggiore di 0' }, { status: 400 })
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Descrizione obbligatoria' }, { status: 400 })
    }

    // Recupera impostazioni utente (current_bankroll)
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('xbank_user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      console.error('Errore nel recupero impostazioni X-BANK:', settingsError)
      return NextResponse.json({ error: 'Impostazioni utente non trovate' }, { status: 400 })
    }

    const currentBalance = parseFloat(String(settings.current_bankroll)) || 0
    const delta = transaction_type === 'deposit' 
      ? Math.abs(amount)
      : transaction_type === 'withdrawal' 
        ? -Math.abs(amount)
        : amount // adjustment può essere positivo o negativo

    const newBalance = Math.round((currentBalance + delta) * 100) / 100

    if (newBalance < 0) {
      return NextResponse.json({ error: 'Fondi insufficienti per l\'operazione' }, { status: 400 })
    }

    // Registra transazione
    let inserted: any = null
    const { data: insData, error: insertError } = await supabaseAdmin
      .from('bankroll_history')
      .insert({
        user_id: user.id,
        transaction_type,
        amount: Math.round(Math.abs(amount) * 100) / 100,
        description: description.trim(),
        balance_before: currentBalance,
        balance_after: newBalance
      })
      .select()
      .single()

    if (insertError) {
      // Fallback: tabella mancante -> aggiorna solo il saldo
      if ((insertError as any).code === 'PGRST205') {
        console.warn('bankroll_history non presente: aggiorno solo il saldo corrente')
        inserted = null
      } else {
        console.error('Errore nel salvataggio transazione:', insertError)
        return NextResponse.json({ error: 'Errore nel salvataggio della transazione' }, { status: 500 })
      }
    } else {
      inserted = insData
    }

    // Aggiorna bankroll corrente
    const { error: updateError } = await supabaseAdmin
      .from('xbank_user_settings')
      .update({ current_bankroll: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Errore nell\'aggiornamento del bankroll:', updateError)
      return NextResponse.json({ error: 'Errore nell\'aggiornamento del bankroll' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Transazione aggiunta con successo',
      new_balance: newBalance,
      transaction: inserted,
      note: inserted ? undefined : 'Tabella bankroll_history assente: transazione non registrata nello storico'
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}