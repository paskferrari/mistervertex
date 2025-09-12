'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { TrendingUp, TrendingDown, Target, Award, BarChart3, PieChart, Activity, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'

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

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange,
        sport: selectedSport
      })
      
      const response = await fetch(`/api/xbank/analytics?${params}`)
      if (!response.ok) throw new Error('Errore nel caricamento delle analisi')
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nel caricamento delle analisi')
    } finally {
      setLoading(false)
    }
  }, [timeRange, selectedSport])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])



  const exportData = async () => {
    try {
      const response = await fetch('/api/xbank/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      
      toast.success('Dati esportati con successo')
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nell\'esportazione dei dati')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-emerald-100'
    if (score >= 60) return 'bg-amber-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center text-amber-700 py-12">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>Nessun dato disponibile per le analisi</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Dashboard Analisi</h2>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/80 border border-amber-300 text-amber-900 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm flex-1 sm:flex-none"
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
            className="bg-white/80 border border-amber-300 text-amber-900 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm flex-1 sm:flex-none"
          >
            <option value="all">Tutti gli sport</option>
            <option value="football">Calcio</option>
            <option value="basketball">Basket</option>
            <option value="tennis">Tennis</option>
            <option value="other">Altri</option>
          </select>
          
          <button
            onClick={exportData}
            className="flex items-center justify-center space-x-1 sm:space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Esporta</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Metriche principali */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-xs sm:text-sm font-medium">Profitto Totale</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {analytics.totalProfit >= 0 ? '+' : ''}{analytics.totalProfit.toFixed(2)} {currency}
              </p>
            </div>
            {analytics.totalProfit >= 0 ? (
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
            ) : (
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-xs sm:text-sm font-medium">Win Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-900">{analytics.winRate.toFixed(1)}%</p>
            </div>
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-xs sm:text-sm font-medium">ROI</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Streak Attuale</p>
              <p className={`text-lg sm:text-2xl font-bold ${analytics.streak.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                {analytics.streak.current} {analytics.streak.type === 'win' ? 'W' : 'L'}
              </p>
            </div>
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quality Score e Indici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quality Score */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-400" />
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
                      <span className="text-gray-300">{label}</span>
                      <span className={getScoreColor(score)}>{score}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
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
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
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
                <div key={key} className="text-center p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                    {value.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">{label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Statistiche per Sport */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Performance per Sport</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-300">Sport</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-300">Pred.</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-300">Win%</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-300">Profitto</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-300">ROI</th>
              </tr>
            </thead>
            <tbody>
              {analytics.sportStats.map((sport, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-white font-medium capitalize">{sport.sport}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-gray-300">{sport.predictions}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-white">{sport.winRate.toFixed(1)}%</td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${sport.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="hidden sm:inline">{sport.profit >= 0 ? '+' : ''}{sport.profit.toFixed(2)} {currency}</span>
                    <span className="sm:hidden">{sport.profit >= 0 ? '+' : ''}{sport.profit.toFixed(0)}</span>
                  </td>
                  <td className={`py-2 sm:py-3 px-2 sm:px-4 text-center font-medium ${sport.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {sport.roi >= 0 ? '+' : ''}{sport.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiche per Livello di Confidenza */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Performance per Confidenza</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {analytics.confidenceStats.map((conf, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-base sm:text-lg font-bold text-orange-400 mb-2">
                {conf.level} ⭐
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="text-gray-300">
                  {conf.predictions} pred.
                </div>
                <div className="text-white font-medium">
                  {conf.winRate.toFixed(1)}%
                </div>
                <div className={`font-medium ${conf.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="hidden sm:inline">{conf.profit >= 0 ? '+' : ''}{conf.profit.toFixed(2)} {currency}</span>
                  <span className="sm:hidden">{conf.profit >= 0 ? '+' : ''}{conf.profit.toFixed(0)}</span>
                </div>
                <div className="text-gray-400 hidden sm:block">
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