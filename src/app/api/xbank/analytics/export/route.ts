import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    // Verifica ruolo VIP
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (userError || !user || user.role !== 'abbonato_vip') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { timeRange, sport } = await request.json()

    // Costruisci filtri per le query
    const now = new Date()
    let query = supabaseAdmin
      .from('xbank_custom_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    switch (timeRange) {
      case '7d':
        query = query.gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        break
      case '30d':
        query = query.gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
        break
      case '90d':
        query = query.gte('created_at', new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString())
        break
      case '1y':
        query = query.gte('created_at', new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString())
        break
    }
    
    if (sport !== 'all') {
      query = query.eq('category', sport)
    }
    
    const { data: predictions, error: predictionsError } = await query
    
    if (predictionsError) {
      throw new Error('Errore nel recupero dei pronostici')
    }

    // Genera CSV
    const csvHeaders = [
      'Data',
      'Titolo',
      'Evento',
      'Sport/Categoria',
      'Quota',
      'Stake',
      'Confidenza',
      'Stato',
      'Profitto/Perdita',
      'Bookmaker',
      'Tipo Scommessa',
      'Note'
    ]

    const csvRows = predictions?.map((p: any) => {
      const profit = p.status === 'won' 
        ? ((p.stake_amount || 0) * (p.odds || 1)) - (p.stake_amount || 0)
        : p.status === 'lost' 
        ? -(p.stake_amount || 0)
        : 0

      return [
        new Date(p.created_at).toLocaleDateString('it-IT'),
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.event_name || '').replace(/"/g, '""')}"`,
        p.category || '',
        p.odds || '',
        p.stake_amount || '',
        p.confidence || '',
        p.status || '',
        profit.toFixed(2),
        p.bookmaker || '',
        p.bet_type || '',
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ].join(',')
    }) || []

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')

    // Calcola statistiche di riepilogo
    const totalPredictions = predictions?.length || 0
    const settledPredictions = predictions?.filter((p: any) => p.status !== 'pending') || []
    const wonPredictions = predictions?.filter((p: any) => p.status === 'won') || []
    const winRate = settledPredictions.length > 0 ? (wonPredictions.length / settledPredictions.length) * 100 : 0
    
    const totalStake = predictions?.reduce((sum: number, p: any) => sum + (p.stake_amount || 0), 0) || 0
    const totalReturn = wonPredictions.reduce((sum: number, p: any) => sum + ((p.stake_amount || 0) * (p.odds || 1)), 0)
    const totalProfit = totalReturn - totalStake
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0

    // Aggiungi statistiche di riepilogo al CSV
    const summarySection = [
      '',
      '--- STATISTICHE RIEPILOGO ---',
      `Totale Pronostici,${totalPredictions}`,
      `Pronostici Chiusi,${settledPredictions.length}`,
      `Pronostici Vinti,${wonPredictions.length}`,
      `Win Rate,${winRate.toFixed(1)}%`,
      `Stake Totale,${totalStake.toFixed(2)}`,
      `Ritorno Totale,${totalReturn.toFixed(2)}`,
      `Profitto Totale,${totalProfit.toFixed(2)}`,
      `ROI,${roi.toFixed(1)}%`,
      '',
      `Esportato il,${new Date().toLocaleString('it-IT')}`
    ]

    const finalCsvContent = csvContent + '\n' + summarySection.join('\n')

    // Restituisci il file CSV
    return new NextResponse(finalCsvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="xbank-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Errore nell\'esportazione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}