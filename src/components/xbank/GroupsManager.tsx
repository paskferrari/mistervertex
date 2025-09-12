'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Target, Eye, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Group {
  id: string
  name: string
  description: string
  color: string
  created_at: string
  predictions_count: number
  total_stake: number
  total_profit: number
  win_rate: number
  avg_odds: number
  roi: number
}

interface Prediction {
  id: string
  title: string
  sport: string
  stake: number
  total_odds: number
  status: string
  result_profit?: number
  event_date: string
}

interface GroupsManagerProps {
  currency: string
}

const GroupsManager = ({ currency }: GroupsManagerProps) => {
  const [groups, setGroups] = useState<Group[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])

  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGroupDetails, setShowGroupDetails] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupPredictions, setGroupPredictions] = useState<Prediction[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#F59E0B'
  })

  const colors = [
    { name: 'Ambra Caldo', value: '#F59E0B' },
    { name: 'Arancione Dolce', value: '#FB923C' },
    { name: 'Pesca', value: '#FDBA74' },
    { name: 'Verde Smeraldo', value: '#10B981' },
    { name: 'Teal Rilassante', value: '#14B8A6' },
    { name: 'Blu Cielo', value: '#0EA5E9' },
    { name: 'Lavanda', value: '#A78BFA' },
    { name: 'Rosa Tenue', value: '#F472B6' }
  ]

  useEffect(() => {
    loadGroups()
    loadPredictions()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      
      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('Sessione non valida')
        return
      }

      const response = await fetch('/api/xbank/groups', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento dei gruppi:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPredictions = async () => {
    try {
      const response = await fetch('/api/xbank/predictions')
      if (response.ok) {
        const data = await response.json()
        setPredictions(data.predictions || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento dei pronostici:', error)
    }
  }

  const loadGroupPredictions = async (groupId: string) => {
    try {
      const response = await fetch(`/api/xbank/groups/${groupId}/predictions`)
      if (response.ok) {
        const data = await response.json()
        setGroupPredictions(data.predictions || [])
      }
    } catch (error) {
      console.error('Errore nel caricamento dei pronostici del gruppo:', error)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessione non valida')
      }

      const response = await fetch('/api/xbank/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadGroups()
        setFormData({ name: '', description: '', color: '#3B82F6' })
        setShowCreateForm(false)
      } else {
        throw new Error('Errore nel creare il gruppo')
      }
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo gruppo? I pronostici non verranno eliminati.')) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`/api/xbank/groups?id=${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        await loadGroups()
        if (showGroupDetails === groupId) {
          setShowGroupDetails(null)
        }
      } else {
        throw new Error('Errore nell\'eliminare il gruppo')
      }
    } catch (error) {
      console.error('Errore:', error)
    }
  }

  const handleShowGroupDetails = async (group: Group) => {
    setSelectedGroup(group)
    setShowGroupDetails(group.id)
    await loadGroupPredictions(group.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-400'
      case 'lost': return 'text-red-400'
      case 'void': return 'text-gray-400'
      default: return 'text-orange-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'won': return 'Vinta'
      case 'lost': return 'Persa'
      case 'void': return 'Annullata'
      default: return 'In Attesa'
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Gruppi di Pronostici</h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Organizza i tuoi pronostici in gruppi per analisi dettagliate</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 sm:px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Nuovo Gruppo</span>
        </button>
      </div>

      {/* Griglia gruppi */}
      {groups.length === 0 ? (
        <div className="text-center text-gray-300 py-12">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Nessun gruppo creato.</p>
          <p className="text-sm text-gray-400 mt-2">
            Crea il tuo primo gruppo per organizzare i pronostici!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl border border-amber-500/20 p-6 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{group.name}</h3>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleShowGroupDetails(group)}
                    className="text-gray-400 hover:text-white transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Visualizza dettagli"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Elimina gruppo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="text-gray-300 text-sm mb-4">{group.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="col-span-1">
                  <span className="text-gray-400 block">Pronostici:</span>
                  <p className="text-white font-semibold">{group.predictions_count}</p>
                </div>
                <div className="col-span-1">
                  <span className="text-gray-400 block">Win Rate:</span>
                  <p className="text-white font-semibold">{group.win_rate.toFixed(1)}%</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-400 block">Stake Totale:</span>
                  <p className="text-white font-semibold text-xs sm:text-sm">{group.total_stake.toFixed(2)} {currency}</p>
                </div>
                <div className="col-span-1">
                  <span className="text-gray-400 block">Profitto:</span>
                  <p className={`font-semibold text-xs sm:text-sm ${
                    group.total_profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {group.total_profit >= 0 ? '+' : ''}{group.total_profit.toFixed(2)} {currency}
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-gray-400 block">ROI:</span>
                  <p className={`font-semibold ${
                    group.roi >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {group.roi >= 0 ? '+' : ''}{group.roi.toFixed(1)}%
                  </p>
                </div>
                <div className="col-span-1">
                  <span className="text-gray-400 block">Quota Media:</span>
                  <p className="text-white font-semibold">{group.avg_odds.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <span className="text-xs text-amber-300/70">
                  Creato il {new Date(group.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal creazione gruppo */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-xl border border-amber-400/40 w-full max-w-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-500/20">
              <h3 className="text-lg sm:text-xl font-bold text-white">Nuovo Gruppo</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Gruppo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700/80 border border-gray-600/50 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:bg-gray-600/80"
                  placeholder="Es: Serie A - Gennaio 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-700/80 border border-gray-600/50 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:bg-gray-600/80"
                  placeholder="Descrizione del gruppo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Colore
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-full h-10 sm:h-12 rounded-lg border-2 transition-colors min-h-[44px] ${
                        formData.color === color.value ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="w-full sm:w-auto px-4 py-3 text-gray-300 hover:text-white transition-colors min-h-[44px] order-2 sm:order-1"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] order-1 sm:order-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Crea Gruppo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal dettagli gruppo */}
      {showGroupDetails && selectedGroup && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-xl border border-amber-400/40 w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-amber-500/20">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedGroup.color }}
                />
                <h3 className="text-lg sm:text-2xl font-bold text-white truncate">{selectedGroup.name}</h3>
              </div>
              <button
                onClick={() => setShowGroupDetails(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Statistiche gruppo */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-600/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-500/50">
                  <div className="text-2xl font-bold text-white">{selectedGroup.predictions_count}</div>
                  <div className="text-sm text-gray-400">Pronostici</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{selectedGroup.win_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className={`text-2xl font-bold ${
                    selectedGroup.total_profit >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedGroup.total_profit >= 0 ? '+' : ''}{selectedGroup.total_profit.toFixed(2)} {currency}
                  </div>
                  <div className="text-sm text-gray-400">Profitto</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className={`text-2xl font-bold ${
                    selectedGroup.roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedGroup.roi >= 0 ? '+' : ''}{selectedGroup.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">ROI</div>
                </div>
              </div>

              {/* Lista pronostici del gruppo */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Pronostici del Gruppo</h4>
                {groupPredictions.length === 0 ? (
                  <div className="text-center text-gray-300 py-8">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nessun pronostico in questo gruppo.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupPredictions.map(prediction => (
                      <div key={prediction.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-600/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-gray-500/50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-medium">{prediction.title}</h5>
                          <span className={`text-sm px-2 py-1 rounded ${getStatusColor(prediction.status)}`}>
                            {getStatusLabel(prediction.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-400 block">Sport:</span>
                            <p className="text-white">{prediction.sport}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Quota:</span>
                            <p className="text-white">{prediction.total_odds.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Stake:</span>
                            <p className="text-white">{prediction.stake.toFixed(2)} {currency}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Data:</span>
                            <p className="text-white">{new Date(prediction.event_date).toLocaleDateString('it-IT')}</p>
                          </div>
                        </div>
                        {prediction.result_profit !== undefined && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <span className={`text-sm font-medium ${
                              prediction.result_profit > 0 ? 'text-green-400' : 
                              prediction.result_profit < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              Risultato: {prediction.result_profit > 0 ? '+' : ''}{prediction.result_profit.toFixed(2)} {currency}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupsManager