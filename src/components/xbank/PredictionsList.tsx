'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Target, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PredictionForm from './PredictionForm'

interface Bet {
  market: string
  selection: string
  odds: number
  stake?: number
}

interface Prediction {
  id?: string
  title: string
  description: string
  sport: string
  league?: string
  match?: string
  prediction_type: 'single' | 'multiple'
  total_stake?: number
  potential_win: number
  confidence_level: number
  status?: 'pending' | 'won' | 'lost' | 'void'
  event_date: string
  created_at?: string
  notes?: string
  bets: Bet[]
  result_profit?: number
  stake?: number
  total_odds?: number
}

interface PredictionsListProps {
  currency: string
  onBankrollUpdate: (amount: number) => void
  mock?: boolean
}

const PredictionsList = ({ currency, onBankrollUpdate, mock = false }: PredictionsListProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showForm, setShowForm] = useState(false)

  const [showFilters, setShowFilters] = useState(false)

  const sports = [
    'Calcio', 'Tennis', 'Basket', 'Pallavolo', 'Rugby', 
    'Hockey', 'Baseball', 'Football Americano', 'MMA', 'Boxing', 'Altri'
  ]

  const statusOptions = [
    { value: 'pending', label: 'In Attesa', color: 'text-orange-400' },
    { value: 'won', label: 'Vinta', color: 'text-green-400' },
    { value: 'lost', label: 'Persa', color: 'text-red-400' },
    { value: 'void', label: 'Annullata', color: 'text-gray-400' }
  ]

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      if (mock) {
        const sample: Prediction[] = [
          { id: 'p1', title: 'Juve vs Milan', description: '1X', sport: 'Calcio', prediction_type: 'single', total_stake: 25, stake: 25, total_odds: 2.10, potential_win: 52.5, confidence_level: 4, status: 'pending', event_date: new Date().toISOString(), bets: [] as Bet[] },
          { id: 'p2', title: 'Federer vs Nadal', description: 'Over 22.5', sport: 'Tennis', prediction_type: 'single', total_stake: 30, stake: 30, total_odds: 1.85, potential_win: 55.5, confidence_level: 3, status: 'won', event_date: new Date().toISOString(), bets: [] as Bet[] },
          { id: 'p3', title: 'Lakers vs Celtics', description: 'Celtics ML', sport: 'Basket', prediction_type: 'single', total_stake: 20, stake: 20, total_odds: 2.40, potential_win: 48, confidence_level: 4, status: 'lost', event_date: new Date().toISOString(), bets: [] as Bet[] }
        ]
        setPredictions(sample)
      } else {
        // Ottieni il token di sessione
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          console.error('Sessione non valida')
          return
        }

        const response = await fetch('/api/xbank/predictions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPredictions(data.predictions || [])
        } else {
          console.error('Errore nel caricamento:', response.status)
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento dei pronostici:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrediction = async (predictionData: Prediction) => {
    try {
      if (mock) {
        const stake = predictionData.stake || predictionData.total_stake || 0
        const created: Prediction = {
          ...predictionData,
          id: `mock-${Date.now()}`,
          status: 'pending',
          prediction_type: predictionData.prediction_type || 'single',
          bets: predictionData.bets || ([] as Bet[]),
          created_at: new Date().toISOString()
        }
        setPredictions(prev => [created, ...prev])
        if (onBankrollUpdate && stake) {
          onBankrollUpdate(-Math.abs(stake))
        }
        setShowForm(false)
        return
      }

      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }

      // Mappa i dati del form ai campi dell'API
      const apiData = {
        title: predictionData.title || '',
        description: predictionData.description || '',
        odds: predictionData.total_odds || 1.1,
        stake_amount: predictionData.stake || 10,
        stake_type: 'fixed',
        confidence: (predictionData.confidence_level || 3) * 20, // Converti da 1-5 a 20-100
        event_date: predictionData.event_date || new Date().toISOString(),
        bookmaker: predictionData.sport || 'Sconosciuto',
        market_type: predictionData.prediction_type || 'single',
        group_id: null,
        tags: predictionData.bets?.map((bet: Bet) => bet.market).filter(Boolean) || []
      }

      // Validazione aggiuntiva lato client
      if (!apiData.title.trim()) {
        throw new Error('Il titolo è obbligatorio')
      }
      if (apiData.stake_amount <= 0) {
        throw new Error('L\'importo della puntata deve essere maggiore di 0')
      }
      if (apiData.odds <= 1) {
        throw new Error('La quota deve essere maggiore di 1')
      }

      const response = await fetch('/api/xbank/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        await loadPredictions()
        setShowForm(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel salvare il pronostico')
      }
    } catch (error) {
      console.error('Errore:', error)
      throw error
    }
  }

  const handleUpdatePrediction = async (id: string, updates: Partial<Prediction>) => {
    try {
      if (mock) {
        setPredictions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
        if (updates.status && updates.result_profit !== undefined) {
          onBankrollUpdate(updates.result_profit)
        }
        return
      }
      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }

      const response = await fetch(`/api/xbank/predictions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await loadPredictions()
        if (updates.status && updates.result_profit !== undefined) {
          onBankrollUpdate(updates.result_profit)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nell\'aggiornare il pronostico')
      }
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const handleDeletePrediction = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pronostico?')) return

    try {
      if (mock) {
        setPredictions(prev => prev.filter(p => p.id !== id))
        return
      }
      const response = await fetch(`/api/xbank/predictions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadPredictions()
      } else {
        throw new Error('Errore nell\'eliminare il pronostico')
      }
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const markAsWon = (prediction: Prediction) => {
    if (!prediction.id) return
    const stake = prediction.stake || prediction.total_stake || 0
    const profit = prediction.potential_win - stake
    handleUpdatePrediction(prediction.id, {
      status: 'won',
      result_profit: profit
    })
  }

  const markAsLost = (prediction: Prediction) => {
    if (!prediction.id) return
    const stake = prediction.stake || prediction.total_stake || 0
    handleUpdatePrediction(prediction.id, {
      status: 'lost',
      result_profit: -stake
    })
  }

  const markAsVoid = (prediction: Prediction) => {
    if (!prediction.id) return
    handleUpdatePrediction(prediction.id, {
      status: 'void',
      result_profit: 0
    })
  }

  const filteredPredictions = predictions
    .filter(prediction => {
      const matchesSearch = prediction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prediction.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSport = !selectedSport || prediction.sport === selectedSport
      const matchesStatus = !selectedStatus || prediction.status === selectedStatus
      return matchesSearch && matchesSport && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Prediction]
      const bValue = b[sortBy as keyof Prediction]
      const modifier = sortOrder === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier
      }
      return 0
    })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'lost': return <XCircle className="h-4 w-4 text-red-400" />
      case 'void': return <XCircle className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-orange-400" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption?.color || 'text-gray-400'
  }

  const calculateStats = () => {
    const total = predictions.length
    const won = predictions.filter(p => p.status === 'won').length
    const lost = predictions.filter(p => p.status === 'lost').length
    const pending = predictions.filter(p => p.status === 'pending').length
    const totalProfit = predictions
      .filter(p => p.result_profit !== undefined)
      .reduce((sum, p) => sum + (p.result_profit || 0), 0)
    
    const winRate = total > 0 ? ((won / (won + lost)) * 100) : 0
    
    return { total, won, lost, pending, totalProfit, winRate }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-6">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700 font-medium">Totali</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-emerald-700">{stats.won}</div>
          <div className="text-sm text-emerald-700 font-medium">Vinte</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-red-700">{stats.lost}</div>
          <div className="text-sm text-red-700 font-medium">Perse</div>
        </div>
        <div className="card p-6">
          <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
          <div className="text-sm text-amber-700 font-medium">In Attesa</div>
        </div>
        <div className="bg-accent-gold-weak rounded-xl p-6 border border-accent-gold-fade shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)} {currency}
          </div>
          <div className="text-sm text-secondary font-medium">Profitto</div>
        </div>
      </div>

      {/* Controlli */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Ricerca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca pronostici..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lux-input w-full pl-10 pr-4 py-3"
            />
          </div>

          {/* Filtri */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2 px-5 py-3 font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>Filtri</span>
          </button>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-medium"
        >
          <Target className="h-5 w-5" />
          <span>Nuovo Pronostico</span>
        </button>
      </div>

      {/* Pannello filtri */}
      {showFilters && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 space-y-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">Sport</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
              >
                <option value="">Tutti gli sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
              >
                <option value="">Tutti gli status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">Ordina per</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                >
                  <option value="created_at">Data Creazione</option>
                  <option value="event_date">Data Evento</option>
                  <option value="stake">Stake</option>
                  <option value="total_odds">Quota</option>
                  <option value="confidence_level">Confidenza</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors shadow-sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista pronostici */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <div className="text-center text-amber-700 py-12">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50 text-amber-400" />
            <p className="text-lg font-medium">Nessun pronostico trovato.</p>
            {predictions.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Inizia aggiungendo il tuo primo pronostico!
              </p>
            )}
          </div>
        ) : (
          filteredPredictions.map(prediction => (
            <div key={prediction.id} className="bg-gradient-to-br from-white to-amber-50 rounded-xl border border-amber-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(prediction.status || 'pending')}
                    <h3 className="text-lg font-semibold text-amber-900">{prediction.title}</h3>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-medium">
                      {prediction.sport}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(prediction.status || 'pending')}`}>
                      {statusOptions.find(s => s.value === prediction.status)?.label}
                    </span>
                  </div>
                  {prediction.description && (
                    <p className="text-amber-700 text-sm mb-3">{prediction.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {prediction.status === 'pending' && (
                    <>
                      <button
                        onClick={() => markAsWon(prediction)}
                        className="text-emerald-600 hover:text-emerald-700 transition-colors p-1 rounded-lg hover:bg-emerald-100"
                        title="Segna come vinta"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => markAsLost(prediction)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-100"
                        title="Segna come persa"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => markAsVoid(prediction)}
                        className="text-amber-600 hover:text-amber-700 transition-colors p-1 rounded-lg hover:bg-amber-100"
                        title="Segna come annullata"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => prediction.id && handleDeletePrediction(prediction.id)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1 rounded-lg hover:bg-red-100"
                    title="Elimina"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-amber-600 font-medium">Tipo:</span>
                  <p className="text-amber-900 font-semibold">
                    {prediction.prediction_type === 'single' ? 'Singola' : 'Multipla'}
                  </p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Quota:</span>
                  <p className="text-amber-900 font-semibold">{(prediction.total_odds || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Stake:</span>
                  <p className="text-amber-900 font-semibold">{(prediction.stake || 0).toFixed(2)} {currency}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Vincita Pot.:</span>
                  <p className="text-emerald-700 font-semibold">{(prediction.potential_win || 0).toFixed(2)} {currency}</p>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Confidenza:</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < prediction.confidence_level ? 'bg-amber-500' : 'bg-amber-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-amber-600 font-medium">Data Evento:</span>
                  <p className="text-amber-900 font-semibold">
                    {new Date(prediction.event_date).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>

              {prediction.result_profit !== undefined && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-medium">Risultato:</span>
                    <span className={`font-bold text-lg ${
                      prediction.result_profit > 0 ? 'text-emerald-700' : 
                      prediction.result_profit < 0 ? 'text-red-700' : 'text-amber-600'
                    }`}>
                      {(prediction.result_profit || 0) > 0 ? '+' : ''}{(prediction.result_profit || 0).toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form per nuovo pronostico */}
      <PredictionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreatePrediction}
        currency={currency}
      />
    </div>
  )
}

export default PredictionsList