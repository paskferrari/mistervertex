'use client'

import { useState, useEffect } from 'react'
import { Target, Play, Pause, RotateCcw, Plus, Trash2, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ScalataStep {
  id: string
  sequence: number
  title: string
  odds: number
  stake: number
  status: 'pending' | 'won' | 'lost' | 'void'
  prediction_id?: string
  custom_prediction_id?: string
  completed_at?: string
}

interface Scalata {
  id: string
  name: string
  description: string
  scalata_type: 'progressive' | 'fixed' | 'fibonacci' | 'custom'
  initial_stake: number
  target_profit: number
  max_steps: number
  current_step: number
  current_bankroll: number
  status: 'active' | 'completed' | 'failed' | 'paused'
  steps: ScalataStep[]
  settings: {
    multiplier?: number
    reset_on_loss?: boolean
    max_loss?: number
    auto_progression?: boolean
  }
  created_at: string
  updated_at: string
}

interface ScalateManagerProps {
  currency: string
}

export default function ScalateManager({ currency }: ScalateManagerProps) {
  const [scalate, setScalate] = useState<Scalata[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedScalata, setSelectedScalata] = useState<Scalata | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filter, setFilter] = useState('all')

  // Form state per nuova scalata
  const [newScalata, setNewScalata] = useState({
    name: '',
    description: '',
    scalata_type: 'progressive' as Scalata['scalata_type'],
    initial_stake: 10,
    target_profit: 100,
    max_steps: 10,
    multiplier: 2,
    reset_on_loss: true,
    max_loss: 100,
    auto_progression: false
  })

  useEffect(() => {
    loadScalate()
  }, [])

  const loadScalate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/xbank/scalate')
      if (!response.ok) throw new Error('Errore nel caricamento delle scalate')
      
      const data = await response.json()
      setScalate(data)
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nel caricamento delle scalate')
    } finally {
      setLoading(false)
    }
  }

  const createScalata = async () => {
    try {
      const response = await fetch('/api/xbank/scalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScalata)
      })
      
      if (!response.ok) throw new Error('Errore nella creazione della scalata')
      
      await loadScalate()
      setShowCreateModal(false)
      setNewScalata({
        name: '',
        description: '',
        scalata_type: 'progressive',
        initial_stake: 10,
        target_profit: 100,
        max_steps: 10,
        multiplier: 2,
        reset_on_loss: true,
        max_loss: 100,
        auto_progression: false
      })
      toast.success('Scalata creata con successo')
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nella creazione della scalata')
    }
  }

  const updateScalataStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/xbank/scalate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) throw new Error('Errore nell\'aggiornamento della scalata')
      
      await loadScalate()
      toast.success('Scalata aggiornata')
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nell\'aggiornamento della scalata')
    }
  }

  const deleteScalata = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa scalata?')) return
    
    try {
      const response = await fetch(`/api/xbank/scalate/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Errore nell\'eliminazione della scalata')
      
      await loadScalate()
      toast.success('Scalata eliminata')
    } catch (error) {
      console.error('Errore:', error)
      toast.error('Errore nell\'eliminazione della scalata')
    }
  }

  // const addStepToScalata = async (scalataId: string, stepData: { prediction_id: string; step_number: number; stake: number; odds: number; potential_win: number }) => {
  //   try {
  //     const response = await fetch(`/api/xbank/scalate/${scalataId}/steps`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(stepData)
  //     })
  //     
  //     if (!response.ok) throw new Error('Errore nell\'aggiunta del passo')
  //     
  //     await loadScalate()
  //     toast.success('Passo aggiunto alla scalata')
  //   } catch (error) {
  //     console.error('Errore:', error)
  //     toast.error('Errore nell\'aggiunta del passo')
  //   }
  // }

  const getScalataTypeLabel = (type: string) => {
    switch (type) {
      case 'progressive': return 'Progressiva'
      case 'fixed': return 'Fissa'
      case 'fibonacci': return 'Fibonacci'
      case 'custom': return 'Personalizzata'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-300'
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'failed': return 'text-red-600 bg-red-100 border-red-300'
      case 'paused': return 'text-amber-600 bg-amber-100 border-amber-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva'
      case 'completed': return 'Completata'
      case 'failed': return 'Fallita'
      case 'paused': return 'In Pausa'
      default: return status
    }
  }

  const filteredScalate = scalate.filter(scalata => {
    if (filter === 'all') return true
    return scalata.status === filter
  })

  const calculateProgress = (scalata: Scalata) => {
    if (scalata.status === 'completed') return 100
    if (scalata.status === 'failed') return 0
    return (scalata.current_step / scalata.max_steps) * 100
  }

  const calculateCurrentProfit = (scalata: Scalata) => {
    return scalata.current_bankroll - scalata.initial_stake
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-100">Scalate e Serie</h2>
        
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-amber-300 text-gray-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm text-sm sm:text-base min-h-[44px]"
          >
            <option value="all">Tutte le scalate</option>
            <option value="active">Attive</option>
            <option value="completed">Completate</option>
            <option value="failed">Fallite</option>
            <option value="paused">In Pausa</option>
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl min-h-[44px] text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span>Nuova Scalata</span>
          </button>
        </div>
      </div>

      {/* Lista Scalate */}
      {filteredScalate.length === 0 ? (
        <div className="text-center text-amber-200 py-12">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Nessuna scalata trovata. Crea la tua prima scalata per iniziare!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredScalate.map((scalata) => (
            <div key={scalata.id} className="bg-white rounded-lg p-4 sm:p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
              {/* Header Scalata */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-1 truncate">{scalata.name}</h3>
                  <p className="text-amber-700 text-xs sm:text-sm line-clamp-2">{scalata.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(scalata.status)}`}>
                    {getStatusLabel(scalata.status)}
                  </span>
                </div>
              </div>

              {/* Metriche */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <p className="text-amber-700 text-sm">Progresso</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-amber-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(scalata)}%` }}
                      ></div>
                    </div>
                    <span className="text-amber-900 text-sm">
                      {scalata.current_step}/{scalata.max_steps}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-amber-700 text-sm">Profitto Attuale</p>
                  <p className={`font-bold ${calculateCurrentProfit(scalata) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calculateCurrentProfit(scalata) >= 0 ? '+' : ''}{calculateCurrentProfit(scalata).toFixed(2)} {currency}
                  </p>
                </div>
              </div>

              {/* Info Aggiuntive */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-amber-700">Tipo</p>
                  <p className="text-amber-900 font-medium">{getScalataTypeLabel(scalata.scalata_type)}</p>
                </div>
                <div>
                  <p className="text-amber-700">Stake Iniziale</p>
                  <p className="text-amber-900 font-medium">{scalata.initial_stake} {currency}</p>
                </div>
                <div>
                  <p className="text-amber-700">Target</p>
                  <p className="text-amber-900 font-medium">{scalata.target_profit} {currency}</p>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {scalata.status === 'active' && (
                    <button
                      onClick={() => updateScalataStatus(scalata.id, 'paused')}
                      className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1 rounded text-sm transition-all shadow-md"
                    >
                      <Pause className="h-3 w-3" />
                      <span>Pausa</span>
                    </button>
                  )}
                  
                  {scalata.status === 'paused' && (
                    <button
                      onClick={() => updateScalataStatus(scalata.id, 'active')}
                      className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1 rounded text-sm transition-all shadow-md"
                    >
                      <Play className="h-3 w-3" />
                      <span>Riprendi</span>
                    </button>
                  )}
                  
                  {(scalata.status === 'failed' || scalata.status === 'completed') && (
                    <button
                      onClick={() => updateScalataStatus(scalata.id, 'active')}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-1 rounded text-sm transition-all shadow-md"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Riavvia</span>
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setSelectedScalata(scalata)
                      setShowDetailsModal(true)
                    }}
                    className="flex items-center justify-center space-x-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded text-sm transition-all border border-amber-300 min-h-[40px]"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Dettagli</span>
                  </button>
                  
                  <button
                    onClick={() => deleteScalata(scalata.id)}
                    className="flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors min-h-[40px]"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Elimina</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Creazione Scalata */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-50/98 to-white/98 backdrop-blur-sm rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-amber-300/50 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6">Crea Nuova Scalata</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-800 text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    value={newScalata.name}
                    onChange={(e) => setNewScalata({ ...newScalata, name: e.target.value })}
                    className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-500 text-sm sm:text-base min-h-[44px]"
                    placeholder="Nome della scalata"
                  />
                </div>
                
                <div>
                  <label className="block text-amber-800 text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={newScalata.scalata_type}
                    onChange={(e) => setNewScalata({ ...newScalata, scalata_type: e.target.value as Scalata['scalata_type'] })}
                    className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="progressive">Progressiva</option>
                    <option value="fixed">Fissa</option>
                    <option value="fibonacci">Fibonacci</option>
                    <option value="custom">Personalizzata</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-amber-800 text-sm font-medium mb-2">Descrizione</label>
                <textarea
                  value={newScalata.description}
                  onChange={(e) => setNewScalata({ ...newScalata, description: e.target.value })}
                  className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-500 text-sm sm:text-base resize-none"
                  rows={3}
                  placeholder="Descrizione della scalata"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-amber-800 text-sm font-medium mb-2">Stake Iniziale ({currency})</label>
                  <input
                      type="number"
                      value={newScalata.initial_stake}
                      onChange={(e) => setNewScalata({ ...newScalata, initial_stake: Number(e.target.value) })}
                      className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                      min="0"
                      step="0.01"
                    />
                </div>
                
                <div>
                  <label className="block text-amber-800 text-sm font-medium mb-2">Target Profitto ({currency})</label>
                  <input
                      type="number"
                      value={newScalata.target_profit}
                      onChange={(e) => setNewScalata({ ...newScalata, target_profit: Number(e.target.value) })}
                      className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                      min="0"
                      step="0.01"
                    />
                </div>
                
                <div>
                  <label className="block text-amber-800 text-sm font-medium mb-2">Max Passi</label>
                  <input
                      type="number"
                      value={newScalata.max_steps}
                      onChange={(e) => setNewScalata({ ...newScalata, max_steps: Number(e.target.value) })}
                      className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                      min="1"
                      max="50"
                    />
                </div>
              </div>
              
              {newScalata.scalata_type === 'progressive' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-800 text-sm font-medium mb-2">Moltiplicatore</label>
                    <input
                        type="number"
                        value={newScalata.multiplier}
                        onChange={(e) => setNewScalata({ ...newScalata, multiplier: Number(e.target.value) })}
                        className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                        min="1.1"
                        step="0.1"
                      />
                  </div>
                  
                  <div>
                    <label className="block text-amber-800 text-sm font-medium mb-2">Max Perdita ({currency})</label>
                    <input
                        type="number"
                        value={newScalata.max_loss}
                        onChange={(e) => setNewScalata({ ...newScalata, max_loss: Number(e.target.value) })}
                        className="w-full bg-amber-50 border border-amber-300 text-amber-900 px-3 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                        min="0"
                        step="0.01"
                      />
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newScalata.reset_on_loss}
                    onChange={(e) => setNewScalata({ ...newScalata, reset_on_loss: e.target.checked })}
                    className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-amber-800 text-sm">Reset su perdita</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newScalata.auto_progression}
                    onChange={(e) => setNewScalata({ ...newScalata, auto_progression: e.target.checked })}
                    className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-amber-800 text-sm">Progressione automatica</span>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
              >
                Annulla
              </button>
              
              <button
                type="submit"
                onClick={createScalata}
                disabled={!newScalata.name.trim()}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg text-sm sm:text-base min-h-[44px]"
              >
                Crea Scalata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dettagli Scalata */}
      {showDetailsModal && selectedScalata && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50/98 to-white/98 backdrop-blur-sm rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-amber-300/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-amber-900">{selectedScalata.name}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-amber-600 hover:text-amber-800"
              >
                ✕
              </button>
            </div>
            
            {/* Contenuto dettagli scalata */}
            <div className="space-y-6">
              {/* Informazioni generali */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-amber-700 text-sm">Stato</p>
                  <p className="text-amber-900 font-medium">{getStatusLabel(selectedScalata.status)}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-amber-700 text-sm">Progresso</p>
                  <p className="text-amber-900 font-medium">{selectedScalata.current_step}/{selectedScalata.max_steps}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <p className="text-amber-700 text-sm">Bankroll Attuale</p>
                  <p className="text-amber-900 font-medium">{selectedScalata.current_bankroll.toFixed(2)} {currency}</p>
                </div>
              </div>
              
              {/* Lista passi */}
              <div>
                <h4 className="text-lg font-bold text-amber-900 mb-4">Passi della Scalata</h4>
                {selectedScalata.steps && selectedScalata.steps.length > 0 ? (
                  <div className="space-y-2">
                    {selectedScalata.steps.map((step, index) => (
                      <div key={step.id} className="bg-amber-50 rounded-lg p-4 flex justify-between items-center border border-amber-200">
                        <div className="flex items-center space-x-4">
                          <span className="text-amber-600 font-medium">#{step.sequence}</span>
                          <div>
                            <p className="text-amber-900 font-medium">{step.title}</p>
                            <p className="text-amber-700 text-sm">Quota: {step.odds} • Stake: {step.stake} {currency}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                          {getStatusLabel(step.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-amber-600 text-center py-8">Nessun passo aggiunto ancora</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}