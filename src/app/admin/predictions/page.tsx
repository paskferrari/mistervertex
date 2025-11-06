'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import Image from 'next/image'

interface Prediction {
  id: string
  title: string
  description: string
  sport: string
  match_info?: string
  prediction_type?: string
  odds: number
  confidence_level: number
  access_level: number
  status: string
  result?: string
  match_date?: string
  created_at: string
}

interface PredictionForm {
  title: string
  description: string
  sport: string
  match_info: string
  prediction_type: string
  odds: string
  confidence_level: string
  access_level: string
}

const initialForm: PredictionForm = {
  title: '',
  description: '',
  sport: '',
  match_info: '',
  prediction_type: '',
  odds: '',
  confidence_level: '3',
  access_level: '0'
}

export default function AdminPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PredictionForm>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const response = await fetch('/api/predictions')
      const data = await response.json()
      if (response.ok) {
        setPredictions(data.predictions)
      } else {
        console.error(data.error || 'Errore nel caricamento dei pronostici')
      }
    } catch {
      console.error('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/predictions/${editingId}` : '/api/predictions'
      const method = editingId ? 'PUT' : 'POST'
      
      // Converti i valori stringa in numeri
      const formData = {
        ...form,
        odds: parseFloat(form.odds),
        confidence_level: parseInt(form.confidence_level),
        access_level: parseInt(form.access_level)
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(data.message)
        setShowForm(false)
        setEditingId(null)
        setForm(initialForm)
        loadPredictions()
      } else {
        console.error(data.error || 'Errore nell\'operazione')
      }
    } catch {
      console.error('Errore di connessione')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (prediction: Prediction) => {
    setForm({
      title: prediction.title,
      description: prediction.description,
      sport: prediction.sport,
      match_info: prediction.match_info || '',
      prediction_type: prediction.prediction_type || '',
      odds: prediction.odds.toString(),
      confidence_level: prediction.confidence_level.toString(),
      access_level: prediction.access_level.toString()
    })
    setEditingId(prediction.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo pronostico?')) return

    try {
      const response = await fetch(`/api/predictions/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        console.log(data.message)
        loadPredictions()
      } else {
        console.error(data.error || 'Errore nell\'eliminazione')
      }
    } catch {
      console.error('Errore di connessione')
    }
  }

  const getAccessLevelBadge = (level: number) => {
    switch (level) {
      case 2: return <span className="px-2 py-1 bg-accent-gold-weak text-white text-xs rounded-full border border-accent-gold-fade">VIP</span>
      case 1: return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">Premium</span>
      case 0: return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Base</span>
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">Sconosciuto</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Attivo</span>
      case 'completed': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">Completato</span>
      case 'cancelled': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">Annullato</span>
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full border border-gray-500/30">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary text-primary flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="logo-container p-2 bg-white rounded-full shadow-lg border border-accent-gold-fade">
                <Image 
                  src="/media/logoBianco.svg" 
                  alt="Logo Mister Vertex" 
                  width={40} 
                  height={40}
                  className="drop-shadow-sm"
                />
              </div>
              <span className="text-2xl font-bold text-white">Mister Vertex - Admin</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Gestione Pronostici</h1>
          <button 
            onClick={() => {
              setForm(initialForm)
              setEditingId(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 lux-cta px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuovo Pronostico
          </button>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Modifica Pronostico' : 'Nuovo Pronostico'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Titolo *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})}
                    className="lux-input w-full px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sport *</label>
                  <input
                    type="text"
                    value={form.sport}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, sport: e.target.value})}
                    className="lux-input w-full px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrizione *</label>
                <textarea
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})}
                  className="lux-input w-full px-3 py-2"
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Info Partita</label>
                  <input
                    type="text"
                    value={form.match_info}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, match_info: e.target.value})}
                    className="lux-input w-full px-3 py-2"
                    placeholder="es. Team A vs Team B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo Pronostico</label>
                  <input
                    type="text"
                    value={form.prediction_type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, prediction_type: e.target.value})}
                    className="lux-input w-full px-3 py-2"
                    placeholder="es. 1X2, Over/Under"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Quote *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={form.odds}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value.replace(',', '.')
                      // Non normalizziamo in fixed qui per permettere editing libero; salviamo stringa pulita
                      setForm({ ...form, odds: raw })
                    }}
                    className="lux-input w-full px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Livello Fiducia *</label>
                  <select
                    value={form.confidence_level}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, confidence_level: e.target.value})}
                    className="lux-select w-full px-3 py-2"
                  >
                    <option value="1">1 - Molto Bassa</option>
                    <option value="2">2 - Bassa</option>
                    <option value="3">3 - Media</option>
                    <option value="4">4 - Alta</option>
                    <option value="5">5 - Molto Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Livello Accesso *</label>
                  <select
                    value={form.access_level}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, access_level: e.target.value})}
                    className="lux-select w-full px-3 py-2"
                  >
                    <option value="0">Base</option>
                    <option value="1">Premium</option>
                    <option value="2">VIP</option>
                  </select>
                </div>
              </div>



              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 lux-cta disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Salvando...' : 'Salva'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setForm(initialForm)
                  }}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-white">{prediction.title}</h3>
                  <p className="text-gray-300 mb-2">{prediction.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">{prediction.sport}</span>
                    {getAccessLevelBadge(prediction.access_level)}
                    {getStatusBadge(prediction.status)}
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">Quote: {prediction.odds}</span>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full border border-gray-500/30">Fiducia: {prediction.confidence_level}/5</span>
                  </div>
                  {prediction.match_info && (
                    <p className="text-sm text-gray-400 mb-1">
                      <strong>Partita:</strong> {prediction.match_info}
                    </p>
                  )}
                  {prediction.match_date && (
                    <p className="text-sm text-gray-400">
                      <strong>Data:</strong> {new Date(prediction.match_date).toLocaleString('it-IT')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    onClick={() => handleEdit(prediction)}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    onClick={() => handleDelete(prediction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {predictions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nessun pronostico trovato</p>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 lux-cta text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Crea il primo pronostico
            </button>
          </div>
        )}
      </div>
    </div>
  )
}