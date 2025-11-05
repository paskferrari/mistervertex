import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Prediction {
  id: string
  status: 'won' | 'lost' | 'pending'
  stake_amount: string | number
  result_amount?: string | number
  odds: string | number
  market?: string
  market_type?: string
  confidence?: string
  created_at: string
}

interface MarketStats {
  total: number
  won: number
  staked: number
  returns: number
}

interface ConfidenceStats {
  [key: string]: {
    total: number
    won: number
    staked: number
    returns: number
  }
}

// GET - Recupera le statistiche complete dell'utente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // giorni
    const group_id = searchParams.get('group_id')
    
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
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || (userData.role !== 'abbonato_vip' && userData.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Accesso negato: X-BANK disponibile solo per utenti VIP' },
        { status: 403 }
      )
    }

    // Validazione e calcolo della data di inizio del periodo
    const periodDays = parseInt(period)
    if (isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
      return NextResponse.json(
        { error: 'Periodo non valido. Deve essere tra 1 e 365 giorni' },
        { status: 400 }
      )
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Query base per i pronostici
    let predictionsQuery = supabaseAdmin
      .from('xbank_custom_predictions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (group_id) {
      predictionsQuery = predictionsQuery.eq('group_id', group_id)
    }

    const { data: predictions, error: predictionsError } = await predictionsQuery

    if (predictionsError) {
      console.error('Error fetching predictions for stats:', predictionsError)
      return NextResponse.json(
        { error: 'Errore nel recupero dei pronostici' },
        { status: 500 }
      )
    }

    // Recupera le impostazioni utente per il bankroll
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('xbank_user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError)
    }

    // Recupera il tracking del bankroll
    const { data: bankrollHistory, error: bankrollError } = await supabaseAdmin
      .from('bankroll_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (bankrollError) {
      console.error('Error fetching bankroll history:', bankrollError)
    }

    // Calcola le statistiche
    const totalPredictions = predictions?.length || 0
    const wonPredictions = predictions?.filter((p: Prediction) => p.status === 'won').length || 0
    const lostPredictions = predictions?.filter((p: Prediction) => p.status === 'lost').length || 0
    const pendingPredictions = predictions?.filter((p: Prediction) => p.status === 'pending').length || 0
    
    const totalStaked = predictions?.reduce((sum: number, p: Prediction) => {
      const stake = parseFloat(String(p.stake_amount)) || 0
      return sum + stake
    }, 0) || 0
    
    const totalReturns = predictions
      ?.filter((p: Prediction) => p.status === 'won')
      .reduce((sum: number, p: Prediction) => {
        const resultAmount = parseFloat(String(p.result_amount)) || (parseFloat(String(p.stake_amount)) * parseFloat(String(p.odds)))
        return sum + resultAmount
      }, 0) || 0
      
    const totalLosses = predictions
      ?.filter((p: Prediction) => p.status === 'lost')
      .reduce((sum: number, p: Prediction) => {
        const stake = parseFloat(String(p.stake_amount)) || 0
        return sum + stake
      }, 0) || 0
    
    const profit = totalReturns - totalLosses
    const roi = totalStaked > 0 ? ((profit / totalStaked) * 100) : 0
    const winRate = (wonPredictions + lostPredictions) > 0 ? ((wonPredictions / (wonPredictions + lostPredictions)) * 100) : 0
    
    // Calcola l'average odds per tutte le predizioni (non solo quelle vinte)
    const totalPredictionsWithOdds = predictions?.filter((p: Prediction) => p.odds && parseFloat(String(p.odds)) > 0).length || 0
    const avgOdds = totalPredictionsWithOdds > 0 
      ? (predictions
          ?.filter((p: Prediction) => p.odds && parseFloat(String(p.odds)) > 0)
          ?.reduce((sum: number, p: Prediction) => sum + parseFloat(String(p.odds)), 0) || 0) / totalPredictionsWithOdds
      : 0

    // Calcola le statistiche per sport/mercato
    const marketStats = predictions?.reduce((acc: Record<string, MarketStats>, p: Prediction) => {
      const market = p.market_type || 'Altro'
      if (!acc[market]) {
        acc[market] = { total: 0, won: 0, staked: 0, returns: 0 }
      }
      acc[market].total++
      if (p.status === 'won') {
        acc[market].won++
        acc[market].returns += parseFloat(String(p.result_amount)) || (parseFloat(String(p.stake_amount)) * parseFloat(String(p.odds)))
      }
      acc[market].staked += parseFloat(String(p.stake_amount)) || 0
      return acc
    }, {}) || {}

    // Calcola le statistiche per confidence level
    const confidenceStats = predictions?.reduce((acc: ConfidenceStats, p: Prediction) => {
      const confidenceValue = parseFloat(String(p.confidence))
      if (isNaN(confidenceValue) || confidenceValue < 0 || confidenceValue > 100) {
        return acc // Salta predizioni con confidence non valida
      }
      
      const confidence = Math.floor(confidenceValue / 10) * 10 // Raggruppa per decine
      const key = `${confidence}-${confidence + 9}%`
      if (!acc[key]) {
        acc[key] = { total: 0, won: 0, staked: 0, returns: 0 }
      }
      acc[key].total++
      if (p.status === 'won') {
        acc[key].won++
        acc[key].returns += parseFloat(String(p.result_amount || 0)) || (parseFloat(String(p.stake_amount || 0)) * parseFloat(String(p.odds || 0)))
      }
      acc[key].staked += parseFloat(String(p.stake_amount || 0)) || 0
      return acc
    }, {}) || {}

    // Prepara i dati del grafico del bankroll
    interface BankrollEntry {
      created_at: string
      balance_after: string | number
      transaction_type: string
      amount: string | number
    }
    
    const bankrollChart = bankrollHistory?.map((entry: BankrollEntry) => ({
      date: entry.created_at,
      balance: parseFloat(String(entry.balance_after)) || 0,
      transaction_type: entry.transaction_type,
      amount: parseFloat(String(entry.amount)) || 0
    })) || []

    // Calcola il yield (profitto annualizzato)
    const daysInPeriod = periodDays
    const initialBankroll = parseFloat(settings?.initial_bankroll) || 0
    const annualizedYield = daysInPeriod > 0 && initialBankroll > 0
      ? ((profit / initialBankroll) * (365 / daysInPeriod) * 100)
      : 0

    return NextResponse.json({
      period: periodDays,
      current_bankroll: parseFloat(settings?.current_bankroll) || 0,
      initial_bankroll: initialBankroll,
      currency: settings?.currency || 'EUR',
      overview: {
        total_predictions: totalPredictions,
        won_predictions: wonPredictions,
        lost_predictions: lostPredictions,
        pending_predictions: pendingPredictions,
        win_rate: Math.round(winRate * 100) / 100,
        total_staked: Math.round(totalStaked * 100) / 100,
        total_returns: Math.round(totalReturns * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        roi: Math.round(roi * 100) / 100,
        avg_odds: Math.round((avgOdds || 0) * 100) / 100,
        yield: Math.round(annualizedYield * 100) / 100
      },
      market_breakdown: Object.entries(marketStats).map(([market, stats]) => {
        const marketStatsTyped = stats as MarketStats
        return {
          market,
          total: marketStatsTyped.total,
          won: marketStatsTyped.won,
          win_rate: marketStatsTyped.total > 0 ? Math.round((marketStatsTyped.won / marketStatsTyped.total) * 10000) / 100 : 0,
          profit: Math.round((marketStatsTyped.returns - marketStatsTyped.staked) * 100) / 100,
          roi: marketStatsTyped.staked > 0 ? Math.round(((marketStatsTyped.returns - marketStatsTyped.staked) / marketStatsTyped.staked) * 10000) / 100 : 0
        }
      }),
      confidence_breakdown: Object.entries(confidenceStats).map(([range, stats]) => {
        const confidenceStatsTyped = stats as ConfidenceStats[string]
        return {
          confidence_range: range,
          total: confidenceStatsTyped.total,
          won: confidenceStatsTyped.won,
          win_rate: confidenceStatsTyped.total > 0 ? Math.round((confidenceStatsTyped.won / confidenceStatsTyped.total) * 10000) / 100 : 0,
          profit: Math.round((confidenceStatsTyped.returns - confidenceStatsTyped.staked) * 100) / 100,
          roi: confidenceStatsTyped.staked > 0 ? Math.round(((confidenceStatsTyped.returns - confidenceStatsTyped.staked) / confidenceStatsTyped.staked) * 10000) / 100 : 0
        }
      }),
      bankroll_history: bankrollChart
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}