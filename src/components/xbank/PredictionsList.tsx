'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Target, Trash2, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Edit } from 'lucide-react'
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
  result_amount?: number
  stake_amount?: number
  odds?: number
  stake?: number
  total_odds?: number
  xbank_prediction_odds?: XBankPredictionOdd[]
}

interface XBankPredictionOdd {
  id: string
  prediction_id: string
  label?: string | null
  market_type?: string | null
  selection?: string | null
  odds: number
  status: 'pending' | 'won' | 'lost' | 'void'
  result_amount?: number | null
  created_at?: string
  updated_at?: string
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
const [editingPrediction, setEditingPrediction] = useState<Prediction | null>(null)
  const [expandedPredictionId, setExpandedPredictionId] = useState<string | null>(null)
  const [newOdd, setNewOdd] = useState<{ label: string; market_type: string; selection: string; odds: string }>({ label: '', market_type: '', selection: '', odds: '' })
  const [addingOdd, setAddingOdd] = useState<boolean>(false)
  const [addOddError, setAddOddError] = useState<string>('')

  const [showFilters, setShowFilters] = useState(false)

  // Adatta la schedina selezionata alla forma attesa dal PredictionForm
  const toFormInitial = (p: Prediction) => {
    return {
      title: p.title || '',
      description: p.description || '',
      sport: p.sport || '',
      stake: typeof p.stake === 'number' ? p.stake : (typeof p.total_stake === 'number' ? p.total_stake : 0),
      confidence_level: typeof p.confidence_level === 'number' ? p.confidence_level : 3,
      prediction_type: (p.prediction_type || 'single') as 'single' | 'multiple',
      event_date: p.event_date || '',
      notes: p.notes || '',
      bets: Array.isArray(p.bets) && p.bets.length
        ? p.bets.map((b, idx) => ({
            id: String(idx + 1),
            match: p.match || '',
            market: b.market || '',
            selection: b.selection || '',
            odds: typeof b.odds === 'number' ? b.odds : 1.0
          }))
        : []
    }
  }

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
        const created = await response.json()
        const createdPrediction = created?.prediction

        // Se ci sono scommesse nel form, salvarle come quote del pronostico appena creato
        if (createdPrediction?.id && Array.isArray(predictionData.bets) && predictionData.bets.length > 0) {
          const oddsPayloads = predictionData.bets
            .filter((b: Bet) => Number(b.odds) > 1)
            .map((b: Bet) => ({
              label: `${b.market || ''} ${b.selection || ''}`.trim() || null,
              market_type: b.market || null,
              selection: b.selection || null,
              odds: Number(b.odds)
            }))

          for (const payload of oddsPayloads) {
            try {
              await fetch(`/api/xbank/predictions/${createdPrediction.id}/odds`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
              })
            } catch (e) {
              console.warn('Errore nel salvataggio quota:', e)
            }
          }
        }

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
        const profit = updates.result_profit ?? updates.result_amount
        if (updates.status && profit !== undefined) {
          onBankrollUpdate(profit)
        }
        return
      }
      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }

      // Prepara payload conforme all'API (/api/xbank/predictions/[id])
      const payload: any = {}
      if (updates.status !== undefined) payload.status = updates.status
      if (updates.result_amount !== undefined || updates.result_profit !== undefined) {
        payload.result_amount = updates.result_amount !== undefined ? updates.result_amount : updates.result_profit
      }
      if (updates.stake_amount !== undefined) payload.stake_amount = updates.stake_amount
      if (updates.odds !== undefined) payload.odds = updates.odds

      const response = await fetch(`/api/xbank/predictions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await loadPredictions()
        const profit = payload.result_amount ?? updates.result_amount ?? updates.result_profit
        if (updates.status && profit !== undefined) {
          onBankrollUpdate(profit)
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
    if (!confirm('Sei sicuro di voler eliminare questa schedina?')) return

    try {
      if (mock) {
        setPredictions(prev => prev.filter(p => p.id !== id))
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }
      const response = await fetch(`/api/xbank/predictions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
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

  const openEditPrediction = (prediction: Prediction) => {
    setEditingPrediction(prediction)
    setShowForm(true)
  }

  const handleEditSubmit = async (updated: Prediction) => {
    try {
      if (!editingPrediction?.id) throw new Error('ID schedina mancante')

      if (mock) {
        setPredictions(prev => prev.map(p => p.id === editingPrediction.id ? {
          ...p,
          ...updated,
          total_odds: updated.total_odds,
          stake: updated.stake,
          description: updated.description,
          title: updated.title,
          sport: updated.sport,
          prediction_type: updated.prediction_type,
          event_date: updated.event_date
        } : p))
        setEditingPrediction(null)
        setShowForm(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Sessione non valida')

      const payload = {
        title: updated.title,
        description: updated.description,
        odds: updated.total_odds,
        stake_amount: updated.stake,
        confidence: String(Math.round(updated.confidence_level * 20)),
        event_date: updated.event_date,
        bookmaker: updated.sport,
        market_type: updated.prediction_type,
        tags: updated.bets?.map(b => b.market).filter(Boolean) || []
      }

      const response = await fetch(`/api/xbank/predictions/${editingPrediction.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify(payload)
        }
      )
      if (!response.ok) {
        const err = await response.json().catch(() => null)
        throw new Error(err?.error || 'Errore nell\'aggiornamento della schedina')
      }
      await loadPredictions()
      setEditingPrediction(null)
      setShowForm(false)
    } catch (error) {
      console.error('Errore:', error)
      throw error
    }
  }

  const updateOddStatus = async (
    predictionId: string,
    oddId: string,
    status: 'pending' | 'won' | 'lost' | 'void',
    result_amount?: number
  ) => {
    try {
      if (mock) {
        setPredictions(prev => prev.map(p => {
          if (p.id !== predictionId) return p
          const odds = (p.xbank_prediction_odds || []).map(o => o.id === oddId ? { ...o, status, result_amount } : o)
          return { ...p, xbank_prediction_odds: odds }
        }))
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Sessione non valida')

      const response = await fetch(`/api/xbank/predictions/${predictionId}/odds`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          odds_updates: [{ id: oddId, status, result_amount }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Errore nell\'aggiornare la quota')
      }
      await loadPredictions()
    } catch (error) {
      console.error('Errore aggiornamento quota:', error)
    }
  }

  const addOddToPrediction = async (predictionId: string) => {
    try {
      setAddOddError('')
      setAddingOdd(true)
      // Normalizza decimali (supporta virgola) e limita a 2 decimali
      const normalized = (newOdd.odds || '').replace(',', '.')
      const parsed = parseFloat(normalized)
      const oddsValue = Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : NaN
      if (!Number.isFinite(oddsValue) || oddsValue <= 1) {
        throw new Error('Inserisci una quota valida (> 1.00)')
      }

      if (mock) {
        const createdOdd: XBankPredictionOdd = {
          id: `mock-odd-${Date.now()}`,
          prediction_id: predictionId,
          label: newOdd.label || null,
          market_type: newOdd.market_type || null,
          selection: newOdd.selection || null,
          odds: oddsValue,
          status: 'pending',
          result_amount: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, xbank_prediction_odds: [...(p.xbank_prediction_odds || []), createdOdd] } : p))
        setNewOdd({ label: '', market_type: '', selection: '', odds: '' })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Sessione non valida')

      const response = await fetch(`/api/xbank/predictions/${predictionId}/odds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          label: newOdd.label || null,
          market_type: newOdd.market_type || null,
          selection: newOdd.selection || null,
          odds: oddsValue
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        const statusText = response.status === 401 ? 'Non autenticato' : response.status === 403 ? 'Accesso negato' : 'Errore'
        throw new Error(err.error ? `${statusText}: ${err.error}` : `Errore nell'aggiunta della quota (HTTP ${response.status})`)
      }
      const { odd } = await response.json()
      if (odd) {
        setPredictions(prev => prev.map(p => p.id === predictionId ? { ...p, xbank_prediction_odds: [...(p.xbank_prediction_odds || []), odd] } : p))
      } else {
        await loadPredictions()
      }
      setNewOdd({ label: '', market_type: '', selection: '', odds: '' })
    } catch (error: any) {
      console.error('Errore aggiunta quota:', error)
      setAddOddError(error?.message || 'Errore sconosciuto')
    } finally {
      setAddingOdd(false)
    }
  }

  const markAsWon = (prediction: Prediction) => {
    if (!prediction.id) return
    const stake = prediction.stake_amount ?? prediction.stake ?? prediction.total_stake ?? 0
    const odds = prediction.odds ?? prediction.total_odds ?? (stake > 0 && prediction.potential_win ? (prediction.potential_win / stake) : undefined)
    const profit = (odds !== undefined && stake > 0) 
      ? (stake * odds - stake) 
      : (prediction.potential_win !== undefined ? (prediction.potential_win - stake) : 0)
    handleUpdatePrediction(prediction.id, {
      status: 'won',
      result_amount: Number.isFinite(profit) ? profit : 0,
      stake_amount: stake,
      odds: odds
    })
  }

  const markAsLost = (prediction: Prediction) => {
    if (!prediction.id) return
    const stake = prediction.stake_amount ?? prediction.stake ?? prediction.total_stake ?? 0
    handleUpdatePrediction(prediction.id, {
      status: 'lost',
      result_amount: Number.isFinite(stake) ? -Math.abs(stake) : 0,
      stake_amount: stake
    })
  }

  const markAsVoid = (prediction: Prediction) => {
    if (!prediction.id) return
    handleUpdatePrediction(prediction.id, {
      status: 'void',
      result_amount: 0
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
      .map(p => (p.result_amount ?? p.result_profit ?? 0))
      .reduce((sum, v) => sum + v, 0)
    
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
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-secondary font-medium">Totali</div>
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
              placeholder="Cerca schedine..."
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
          onClick={() => { setEditingPrediction(null); setShowForm(true) }}
          className="btn-primary flex items-center space-x-2 px-6 py-3 font-medium"
        >
          <Target className="h-5 w-5" />
          <span>Nuova Schedina</span>
        </button>
      </div>

      {/* Pannello filtri */}
      {showFilters && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Sport</label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-white/80 border border-white/20 rounded-xl px-3 py-2 text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold shadow-sm"
              >
                <option value="">Tutti gli sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white/80 border border-white/20 rounded-xl px-3 py-2 text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold shadow-sm"
              >
                <option value="">Tutti gli status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Ordina per</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-white/80 border border-white/20 rounded-xl px-3 py-2 text-primary focus:ring-2 focus:ring-accent-gold focus:border-accent-gold shadow-sm"
                >
                  <option value="created_at">Data Creazione</option>
                  <option value="event_date">Data Evento</option>
                  <option value="stake">Stake</option>
                  <option value="total_odds">Quota</option>
                  <option value="confidence_level">Confidenza</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-white/80 border border-white/20 rounded-xl px-3 py-2 text-secondary hover:bg-white/70 transition-colors shadow-sm"
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
          <div className="text-center text-secondary py-12">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-70 text-accent-gold" />
            <p className="text-lg font-medium">Nessun pronostico trovato.</p>
            {predictions.length === 0 && (
              <p className="text-sm text-secondary mt-2">
                Inizia aggiungendo il tuo primo pronostico!
              </p>
            )}
          </div>
        ) : (
          filteredPredictions.map(prediction => (
            <div key={prediction.id} className="card p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(prediction.status || 'pending')}
                    <h3 className="text-lg font-semibold text-primary">{prediction.title}</h3>
                    <span className="text-xs bg-white/10 text-secondary border border-white/20 px-2 py-1 rounded-full font-medium">
                      {prediction.sport}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(prediction.status || 'pending')}`}>
                      {statusOptions.find(s => s.value === prediction.status)?.label}
                    </span>
                  </div>
                  {prediction.description && (
                    <p className="text-secondary text-sm mb-3">{prediction.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {prediction.status === 'pending' && (
                    <>
                      <button
                        onClick={() => markAsWon(prediction)}
                        className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                        title="Segna come vinta"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => markAsLost(prediction)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                        title="Segna come persa"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => markAsVoid(prediction)}
                        className="text-orange-400 hover:text-orange-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                        title="Segna come annullata"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpandedPredictionId(expandedPredictionId === prediction.id ? null : (prediction.id || null))}
                    className="text-secondary hover:text-primary transition-colors p-1 rounded-lg hover:bg-white/10"
                    title={expandedPredictionId === prediction.id ? 'Chiudi dettaglio' : 'Apri dettaglio'}
                  >
                    {expandedPredictionId === prediction.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => openEditPrediction(prediction)}
                    className="text-secondary hover:text-primary transition-colors p-1 rounded-lg hover:bg-white/10"
                    title="Modifica"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => prediction.id && handleDeletePrediction(prediction.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                    title="Elimina"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-secondary font-medium">Tipo Schedina:</span>
                  <p className="text-primary font-semibold">
                    {prediction.prediction_type === 'single' ? 'Singola' : 'Multipla'}
                  </p>
                </div>
                <div>
                  <span className="text-secondary font-medium">Quota:</span>
                  <p className="text-primary font-semibold">{(prediction.total_odds || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-secondary font-medium">Stake:</span>
                  <p className="text-primary font-semibold">{(prediction.stake || 0).toFixed(2)} {currency}</p>
                </div>
                <div>
                  <span className="text-secondary font-medium">Vincita Pot.:</span>
                  <p className="text-green-400 font-semibold">{(prediction.potential_win || 0).toFixed(2)} {currency}</p>
                </div>
                <div>
                  <span className="text-secondary font-medium">Confidenza:</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i < prediction.confidence_level ? 'bg-accent-gold' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-secondary font-medium">Data Evento:</span>
                  <p className="text-primary font-semibold">
                    <time dateTime={prediction.event_date} suppressHydrationWarning>
                      {new Date(prediction.event_date).toLocaleDateString('it-IT', { timeZone: 'UTC' })}
                    </time>
                  </p>
                </div>
              </div>

              {(prediction.result_amount ?? prediction.result_profit) !== undefined && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-medium">Risultato:</span>
                    {(() => {
                      const res = prediction.result_amount ?? prediction.result_profit ?? 0
                      const colorClass = res > 0 ? 'text-green-400' : res < 0 ? 'text-red-400' : 'text-secondary'
                      const sign = res > 0 ? '+' : ''
                      return (
                        <span className={`font-bold text-lg ${colorClass}`}>
                          {sign}{res.toFixed(2)} {currency}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )}

              {expandedPredictionId === prediction.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-secondary font-medium">Quote del pronostico</span>
                    <span className="text-xs text-secondary">
                      {(prediction.xbank_prediction_odds || []).length} elemento/i
                    </span>
                  </div>
                  {(prediction.xbank_prediction_odds || []).length === 0 ? (
                    <div className="text-sm text-secondary">Nessuna quota associata.</div>
                  ) : (
                    <div className="space-y-2">
                      {(prediction.xbank_prediction_odds || []).map(odd => (
                        <div key={odd.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-semibold truncate">
                                {odd.label || odd.selection || odd.market_type || 'Quota'}
                              </span>
                              <span className="text-xs text-secondary">@ {odd.odds.toFixed(2)}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(odd.status)} border border-white/10`}>
                                {statusOptions.find(s => s.value === odd.status)?.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => prediction.id && updateOddStatus(prediction.id, odd.id, 'pending')}
                              className="text-orange-400 hover:text-orange-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10 text-xs"
                            >In Attesa</button>
                            <button
                              onClick={() => prediction.id && updateOddStatus(prediction.id, odd.id, 'won')}
                              className="text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10 text-xs"
                            >Vinta</button>
                            <button
                              onClick={() => prediction.id && updateOddStatus(prediction.id, odd.id, 'lost')}
                              className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10 text-xs"
                            >Persa</button>
                            <button
                              onClick={() => prediction.id && updateOddStatus(prediction.id, odd.id, 'void')}
                              className="text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/10 text-xs"
                            >Annullata</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form aggiunta nuova quota */}
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <input
                        type="text"
                        placeholder="Etichetta"
                        value={newOdd.label}
                        onChange={(e) => setNewOdd(prev => ({ ...prev, label: e.target.value }))}
                        className="lux-input w-full"
                      />
                      <input
                        type="text"
                        placeholder="Mercato"
                        value={newOdd.market_type}
                        onChange={(e) => setNewOdd(prev => ({ ...prev, market_type: e.target.value }))}
                        className="lux-input w-full"
                      />
                      <input
                        type="text"
                        placeholder="Selezione"
                        value={newOdd.selection}
                        onChange={(e) => setNewOdd(prev => ({ ...prev, selection: e.target.value }))}
                        className="lux-input w-full"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="1.01"
                        placeholder="Quota"
                        value={newOdd.odds}
                        onChange={(e) => setNewOdd(prev => ({ ...prev, odds: e.target.value }))}
                        className="lux-input w-full"
                      />
                      <button
                        disabled={addingOdd || !prediction.id}
                        onClick={() => prediction.id && addOddToPrediction(prediction.id)}
                        className="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-60"
                      >{addingOdd ? 'Aggiungo...' : 'Aggiungi quota'}</button>
                    </div>
                    {addOddError && (
                      <div className="text-red-400 text-xs mt-2">{addOddError}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Schedina (creazione/modifica) */}
      <PredictionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPrediction(null) }}
        onSubmit={(data) => editingPrediction ? handleEditSubmit(data) : handleCreatePrediction(data)}
        currency={currency}
        mode={editingPrediction ? 'edit' : 'create'}
        initialPrediction={editingPrediction ? toFormInitial(editingPrediction) : undefined}
      />
    </div>
  )
}

export default PredictionsList