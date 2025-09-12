import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

interface JWTPayload {
  userId: string
  [key: string]: unknown
}

interface DateFilter {
  userId: string
  createdAt?: { $gte: Date }
  sport?: string
}

interface Prediction {
  id: string
  user_id: string
  status: 'pending' | 'won' | 'lost'
  stake_amount: number
  odds: number
  category: string
  created_at: string
  [key: string]: unknown
}

interface MonthlyData {
  month: string
  profit: number
  predictions: number
  winRate: number
}

interface SportData {
  sport: string
  predictions: number
  won: number
  stake: number
  return: number
}

interface SportStats {
  sport: string
  predictions: number
  winRate: number
  profit: number
  roi: number
}

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'all'
    const sport = searchParams.get('sport') || 'all'

    // Costruisci filtri per le query
    const dateFilter: DateFilter = { userId }
    const now = new Date()
    
    switch (timeRange) {
      case '7d':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        break
      case '30d':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        break
      case '90d':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
        break
      case '1y':
        dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
        break
    }

    if (sport !== 'all') {
      dateFilter.sport = sport
    }

    // Recupera tutti i pronostici
    let query = supabaseAdmin
      .from('xbank_custom_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (dateFilter.createdAt) {
      query = query.gte('created_at', dateFilter.createdAt.$gte.toISOString())
    }
    
    if (sport !== 'all') {
      query = query.eq('category', sport)
    }
    
    const { data: predictions, error: predictionsError } = await query
    
    if (predictionsError) {
      throw new Error('Errore nel recupero dei pronostici')
    }

    // Calcola metriche base
    const totalPredictions = predictions?.length || 0
    const settledPredictions = predictions?.filter((p: Prediction) => p.status !== 'pending') || []
    const wonPredictions = predictions?.filter((p: Prediction) => p.status === 'won') || []
    const winRate = settledPredictions.length > 0 ? (wonPredictions.length / settledPredictions.length) * 100 : 0
    
    const totalStake = predictions?.reduce((sum: number, p: Prediction) => sum + (p.stake_amount || 0), 0) || 0
    const totalReturn = wonPredictions.reduce((sum: number, p: Prediction) => sum + ((p.stake_amount || 0) * (p.odds || 1)), 0)
    const totalProfit = totalReturn - totalStake
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0
    
    const avgOdds = predictions?.length > 0 ? 
      predictions.reduce((sum: number, p: Prediction) => sum + (p.odds || 1), 0) / predictions.length : 0

    // Calcola streak
    let currentStreak = 0
    let bestStreak = 0
    let streakType: 'win' | 'loss' = 'win'
    let tempStreak = 0
    let tempType: 'win' | 'loss' = 'win'
    
    const sortedPredictions = [...settledPredictions].sort((a: Prediction, b: Prediction) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    for (let i = 0; i < sortedPredictions.length; i++) {
      const prediction = sortedPredictions[i]
      const isWin = prediction.status === 'won'
      
      if (i === 0) {
        tempType = isWin ? 'win' : 'loss'
        tempStreak = 1
        currentStreak = 1
        streakType = tempType
      } else {
        if ((isWin && tempType === 'win') || (!isWin && tempType === 'loss')) {
          tempStreak++
          if (i < 10) currentStreak = tempStreak // Solo per i primi 10
        } else {
          bestStreak = Math.max(bestStreak, tempStreak)
          tempStreak = 1
          tempType = isWin ? 'win' : 'loss'
          if (i < 10) {
            currentStreak = 1
            streakType = tempType
          }
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak)

    // Dati mensili
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthPredictions = predictions?.filter((p: Prediction) => {
        const pDate = new Date(p.created_at)
        return pDate >= date && pDate < nextDate
      }) || []
      
      const monthSettled = monthPredictions.filter((p: Prediction) => p.status !== 'pending')
      const monthWon = monthPredictions.filter((p: Prediction) => p.status === 'won')
      const monthStake = monthPredictions.reduce((sum: number, p: Prediction) => sum + (p.stake_amount || 0), 0)
      const monthReturn = monthWon.reduce((sum: number, p: Prediction) => sum + ((p.stake_amount || 0) * (p.odds || 1)), 0)
      
      monthlyData.push({
        month: date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        profit: monthReturn - monthStake,
        predictions: monthPredictions.length,
        winRate: monthSettled.length > 0 ? (monthWon.length / monthSettled.length) * 100 : 0
      })
    }

    // Statistiche per sport
    const sportsMap = new Map<string, SportData>()
    predictions?.forEach((p: Prediction) => {
      const sport = p.category || 'other'
      if (!sportsMap.has(sport)) {
        sportsMap.set(sport, {
          sport,
          predictions: 0,
          won: 0,
          stake: 0,
          return: 0
        })
      }
      
      const sportData = sportsMap.get(sport)
      sportData.predictions++
      sportData.stake += p.stake_amount || 0
      
      if (p.status === 'won') {
        sportData.won++
        sportData.return += (p.stake_amount || 0) * (p.odds || 1)
      }
    })
    
    const sportStats: SportStats[] = Array.from(sportsMap.values()).map((s: SportData) => ({
      sport: s.sport,
      predictions: s.predictions,
      winRate: s.predictions > 0 ? (s.won / s.predictions) * 100 : 0,
      profit: s.return - s.stake,
      roi: s.stake > 0 ? ((s.return - s.stake) / s.stake) * 100 : 0
    }))

    // Statistiche per livello di confidenza
    const confidenceMap = new Map()
    for (let level = 1; level <= 5; level++) {
      confidenceMap.set(level, {
        level,
        predictions: 0,
        won: 0,
        stake: 0,
        return: 0,
        totalOdds: 0
      })
    }
    
    predictions?.forEach((p: any) => {
      const level = p.confidence || 3
      const confData = confidenceMap.get(level)
      if (confData) {
        confData.predictions++
        confData.stake += p.stake_amount || 0
        confData.totalOdds += p.odds || 1
        
        if (p.status === 'won') {
          confData.won++
          confData.return += (p.stake_amount || 0) * (p.odds || 1)
        }
      }
    })
    
    const confidenceStats = Array.from(confidenceMap.values()).map((c: any) => ({
      level: c.level,
      predictions: c.predictions,
      winRate: c.predictions > 0 ? (c.won / c.predictions) * 100 : 0,
      avgOdds: c.predictions > 0 ? c.totalOdds / c.predictions : 0,
      profit: c.return - c.stake
    }))

    // Calcola Quality Score
    const consistency = Math.min(100, Math.max(0, 100 - (Math.abs(winRate - 60) * 2)))
    const riskManagement = Math.min(100, Math.max(0, 100 - (avgOdds > 3 ? (avgOdds - 3) * 20 : 0)))
    const profitability = Math.min(100, Math.max(0, roi > 0 ? Math.min(roi * 2, 100) : 0))
    const accuracy = Math.min(100, winRate * 1.5)
    const overall = Math.round((consistency + riskManagement + profitability + accuracy) / 4)

    // Calcola Indici
    const sharpnessIndex = Math.min(10, Math.max(0, winRate > 55 ? (winRate - 50) / 5 : 0))
    const valueIndex = Math.min(10, Math.max(0, roi > 5 ? Math.min(roi / 5, 10) : 0))
    const disciplineIndex = Math.min(10, Math.max(0, avgOdds < 3 ? 10 - (avgOdds - 1) * 2 : 5))
    const growthIndex = Math.min(10, Math.max(0, totalProfit > 0 ? Math.min(totalProfit / 100, 10) : 0))

    const analyticsData = {
      totalPredictions,
      winRate,
      avgOdds,
      totalProfit,
      roi,
      streak: {
        current: currentStreak,
        best: bestStreak,
        type: streakType
      },
      monthlyData,
      sportStats,
      confidenceStats,
      qualityScore: {
        overall,
        consistency: Math.round(consistency),
        riskManagement: Math.round(riskManagement),
        profitability: Math.round(profitability),
        accuracy: Math.round(accuracy)
      },
      indices: {
        sharpnessIndex: Number(sharpnessIndex.toFixed(1)),
        valueIndex: Number(valueIndex.toFixed(1)),
        disciplineIndex: Number(disciplineIndex.toFixed(1)),
        growthIndex: Number(growthIndex.toFixed(1))
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Errore nel recupero delle analisi:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}