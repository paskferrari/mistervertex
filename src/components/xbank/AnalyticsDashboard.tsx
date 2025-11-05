'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { TrendingUp, TrendingDown, Target, Award, BarChart3, PieChart, Activity, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'success' | 'error' | null

interface InlineFeedback {
  type: FeedbackType
  message: string
}

interface AnalyticsData {
  totalPredictions: number
  winRate: number
  avgOdds: number
  totalProfit: number
  roi: number
  streak: {
    current: number
    best: number
    type: 'win' | 'loss'
  }
  monthlyData: {
    month: string
    profit: number
    predictions: number
    winRate: number
  }[]
  sportStats: {
    sport: string
    predictions: number
    winRate: number
    profit: number
    roi: number
  }[]
  confidenceStats: {
    level: number
    predictions: number
    winRate: number
    avgOdds: number
    profit: number
  }[]
  qualityScore: {
    overall: number
    consistency: number
    riskManagement: number
    profitability: number
    accuracy: number
  }
  indices: {
    sharpnessIndex: number
    valueIndex: number
    disciplineIndex: number
    growthIndex: number
  }
}

interface AnalyticsDashboardProps {
  currency: string
}

function AnalyticsDashboard({ currency }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [feedback, setFeedback] = useState<InlineFeedback | null>(null)

  const showFeedback = (type: FeedbackType, message: string) => {
    if (!type) return
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange,
        sport: selectedSport
      })
      
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/xbank/analytics?${params}`, {
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      if (!response.ok) throw new Error('Errore nel caricamento delle analisi')
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nel caricamento delle analisi')
    } finally {
      setLoading(false)
    }
  }, [timeRange, selectedSport])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])



  const exportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/xbank/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ timeRange, sport: selectedSport })
      })
      
      if (!response.ok) throw new Error('Errore nell\'esportazione')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xbank-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showFeedback('success', 'Dati esportati con successo')
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nell\'esportazione dei dati')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent-gold'
    if (score >= 60) return 'text-secondary'
    return 'text-secondary'
  }

  const getScoreBackground = (score: number) => {
    return 'bg-white/10'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-gold)]"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center text-secondary py-12">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Nessun dato disponibile per le analisi</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Feedback inline */}
      {feedback && feedback.type && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg px-3 py-2 text-sm ${
            feedback.type === 'success'
              ? 'bg-white/5 border border-[var(--accent-gold)] text-primary'
              : 'bg-white/5 border border-white/10 text-secondary'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {/* Header con filtri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Dashboard Analisi</h2>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="lux-select flex-1 sm:flex-none"
          >
            <option value="all">Tutto il periodo</option>
            <option value="7d">Ultimi 7 giorni</option>
            <option value="30d">Ultimi 30 giorni</option>
            <option value="90d">Ultimi 90 giorni</option>
            <option value="1y">Ultimo anno</option>
          </select>
          
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="lux-select flex-1 sm:flex-none"
          >
            <option value="all">Tutti gli sport</option>
            <option value="football">Calcio</option>
            <option value="basketball">Basket</option>
            <option value="tennis">Tennis</option>
            <option value="other">Altri</option>
          </select>
          
          <button
            onClick={exportData}
            className="btn-secondary flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Esporta</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Metriche principali */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium">Profitto Totale</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-primary' : 'text-secondary'}`}>
                {analytics.totalProfit >= 0 ? '+' : ''}{analytics.totalProfit.toFixed(2)} {currency}
              </p>
            </div>
            {analytics.totalProfit >= 0 ? (
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-accent-gold" />
            ) : (
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
            )}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium">Win Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-primary">{analytics.winRate.toFixed(1)}%</p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-accent-gold" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm font-medium">ROI</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.roi >= 0 ? 'text-primary' : 'text-secondary'}`}>
                {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-accent-gold" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-xs sm:text-sm">Streak Attuale</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.streak.type === 'win' ? 'text-accent-gold' : 'text-secondary'}`}>
                {analytics.streak.current} {analytics.streak.type === 'win' ? 'W' : 'L'}
              </p>
            </div>
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-accent-gold" />
          </div>
        </div>
      </div>

      {/* Quality Score e Indici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quality Score */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4 flex items-center">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-accent-gold" />
            Quality Score
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center mb-4 sm:mb-6">
              <div className={`text-2xl sm:text-4xl font-bold ${getScoreColor(analytics.qualityScore.overall)} mb-2`}>
                {analytics.qualityScore.overall}/100
              </div>
              <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getScoreBackground(analytics.qualityScore.overall)} ${getScoreColor(analytics.qualityScore.overall)}`}>
                {analytics.qualityScore.overall >= 80 ? 'Eccellente' : analytics.qualityScore.overall >= 60 ? 'Buono' : 'Da migliorare'}
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries({
                consistency: 'Consistenza',
                riskManagement: 'Gestione Rischio',
                profitability: 'Profittabilità',
                accuracy: 'Precisione'
              }).map(([key, label]) => {
                const score = analytics.qualityScore[key as keyof typeof analytics.qualityScore] as number
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary">{label}</span>
                      <span className={getScoreColor(score)}>{score}/100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${score >= 80 ? 'bg-accent-gold' : score >= 60 ? 'bg-white/40' : 'bg-white/20'}`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Indici */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4 flex items-center">
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-accent-gold" />
            Indici di Performance
          </h3>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Object.entries({
              sharpnessIndex: 'Sharpness',
              valueIndex: 'Value',
              disciplineIndex: 'Disciplina',
              growthIndex: 'Crescita'
            }).map(([key, label]) => {
              const value = analytics.indices[key as keyof typeof analytics.indices]
              return (
                <div key={key} className="text-center p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-lg sm:text-2xl font-bold text-primary mb-1">
                    {value.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-secondary">{label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Statistiche per Sport */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">Performance per Sport</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-secondary">Sport</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-secondary">Pred.</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-secondary">Win%</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-secondary">Profitto</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-secondary">ROI</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sportStats.map((sport, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-primary font-medium capitalize">{sport.sport}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-secondary">{sport.predictions}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-primary">{sport.winRate.toFixed(1)}%</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${sport.profit >= 0 ? 'text-accent-gold' : 'text-secondary'}`}>
                    <span className="hidden sm:inline">{sport.profit >= 0 ? '+' : ''}{sport.profit.toFixed(2)} {currency}</span>
                    <span className="sm:hidden">{sport.profit >= 0 ? '+' : ''}{sport.profit.toFixed(0)}</span>
                  </td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${sport.roi >= 0 ? 'text-accent-gold' : 'text-secondary'}`}>
                    {sport.roi >= 0 ? '+' : ''}{sport.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiche per Livello di Confidenza */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">Performance per Confidenza</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {analytics.confidenceStats.map((conf, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3 sm:p-4 text-center border border-white/10">
              <div className="text-base sm:text-lg font-bold text-accent-gold mb-2">
                {conf.level} ⭐
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="text-secondary">
                  {conf.predictions} pred.
                </div>
                <div className="text-primary font-medium">
                  {conf.winRate.toFixed(1)}%
                </div>
                <div className={`font-medium ${conf.profit >= 0 ? 'text-accent-gold' : 'text-secondary'}`}>
                  <span className="hidden sm:inline">{conf.profit >= 0 ? '+' : ''}{conf.profit.toFixed(2)} {currency}</span>
                  <span className="sm:hidden">{conf.profit >= 0 ? '+' : ''}{conf.profit.toFixed(0)}</span>
                </div>
                <div className="text-secondary hidden sm:block">
                  Quota: {conf.avgOdds.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Esporta il componente memoizzato per evitare re-render non necessari
export default memo(AnalyticsDashboard)