'use client'

import { useState } from 'react'
import { X, Plus, Trash2, DollarSign, Target, TrendingUp } from 'lucide-react'

interface Prediction {
  title: string
  description: string
  sport: string
  stake: number
  confidence_level: number
  prediction_type: 'single' | 'multiple'
  event_date: string
  notes: string
  bets: Bet[]
  total_odds: number
  potential_win: number
}

interface PredictionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prediction: Prediction) => void
  currency: string
}

interface Bet {
  id: string
  match: string
  market: string
  selection: string
  odds: number
}

const PredictionForm = ({ isOpen, onClose, onSubmit, currency }: PredictionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    stake: 0,
    confidence_level: 3,
    prediction_type: 'single' as 'single' | 'multiple',
    event_date: '',
    notes: ''
  })

  const [bets, setBets] = useState<Bet[]>([
    { id: '1', match: '', market: '', selection: '', odds: 1.0 }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const sports = [
    'Calcio', 'Tennis', 'Basket', 'Pallavolo', 'Rugby', 
    'Hockey', 'Baseball', 'Football Americano', 'MMA', 'Boxing', 'Altri'
  ]

  const markets = [
    '1X2', 'Over/Under', 'Handicap', 'Entrambe le squadre segnano',
    'Primo tempo/Finale', 'Numero gol', 'Corner', 'Cartellini', 'Altri'
  ]

  const addBet = () => {
    const newBet: Bet = {
      id: Date.now().toString(),
      match: '',
      market: '',
      selection: '',
      odds: 1.0
    }
    setBets([...bets, newBet])
  }

  const removeBet = (id: string) => {
    if (bets.length > 1) {
      setBets(bets.filter(bet => bet.id !== id))
    }
  }

  const updateBet = (id: string, field: keyof Bet, value: string | number) => {
    setBets(bets.map(bet => 
      bet.id === id ? { ...bet, [field]: value } : bet
    ))
  }

  const calculateTotalOdds = () => {
    if (formData.prediction_type === 'single') {
      return bets[0]?.odds || 1.0
    }
    return bets.reduce((total, bet) => total * bet.odds, 1)
  }

  const calculatePotentialWin = () => {
    return formData.stake * calculateTotalOdds()
  }

  const validateForm = () => {
    const validationErrors = []
    
    // Campi obbligatori
    if (!formData.title.trim()) {
      validationErrors.push('Il titolo è obbligatorio')
    }
    if (formData.stake <= 0) {
      validationErrors.push('L\'importo della puntata deve essere maggiore di 0')
    }
    
    // Validazione lunghezza
    if (formData.title.length > 200) {
      validationErrors.push('Il titolo non può superare i 200 caratteri')
    }
    if (formData.description.length > 1000) {
      validationErrors.push('La descrizione non può superare i 1000 caratteri')
    }
    
    // Validazione confidenza
    if (formData.confidence_level < 1 || formData.confidence_level > 5) {
      validationErrors.push('La confidenza deve essere tra 1 e 5')
    }
    
    // Validazione data evento
    if (formData.event_date) {
      const eventDate = new Date(formData.event_date)
      if (isNaN(eventDate.getTime())) {
        validationErrors.push('La data dell\'evento non è valida')
      }
    }
    
    // Validazione bets
    const totalOdds = calculateTotalOdds()
    if (totalOdds <= 1) {
      validationErrors.push('La quota totale deve essere maggiore di 1')
    }
    
    // Validazione singole scommesse
    for (let i = 0; i < bets.length; i++) {
      const bet = bets[i]
      if (!bet.match.trim()) {
        validationErrors.push(`Match ${i + 1}: Il nome del match è obbligatorio`)
      }
      if (!bet.market.trim()) {
        validationErrors.push(`Match ${i + 1}: Il mercato è obbligatorio`)
      }
      if (!bet.selection.trim()) {
        validationErrors.push(`Match ${i + 1}: La selezione è obbligatoria`)
      }
      if (bet.odds <= 1) {
        validationErrors.push(`Match ${i + 1}: La quota deve essere maggiore di 1`)
      }
    }
    
    return validationErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validazione lato client
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setErrors([])
    setIsSubmitting(true)

    try {
      const predictionData = {
        ...formData,
        bets,
        total_odds: calculateTotalOdds(),
        potential_win: calculatePotentialWin()
      }
      
      await onSubmit(predictionData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        sport: '',
        stake: 0,
        confidence_level: 3,
        prediction_type: 'single',
        event_date: '',
        notes: ''
      })
      setBets([{ id: '1', match: '', market: '', selection: '', odds: 1.0 }])
      setErrors([])
      onClose()
    } catch (error) {
      console.error('Errore nel salvare il pronostico:', error)
      if (error instanceof Error) {
        setErrors([error.message])
      } else {
        setErrors(['Errore nel salvare il pronostico'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-lg sm:rounded-xl border border-gray-600/40 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            <span className="hidden sm:inline">Nuovo Pronostico</span>
            <span className="sm:hidden">Pronostico</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Errori di validazione */}
          {errors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-red-400 mb-2">Errori di validazione:</h3>
                  <ul className="text-xs sm:text-sm text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-400">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Informazioni generali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Titolo Pronostico *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es: Inter vs Milan - Vittoria Inter"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Sport *
              </label>
              <select
                required
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Seleziona sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Data Evento *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Tipo Pronostico
              </label>
              <select
                value={formData.prediction_type}
                onChange={(e) => setFormData({ ...formData, prediction_type: e.target.value as 'single' | 'multiple' })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="single">Singola</option>
                <option value="multiple">Multipla</option>
              </select>
            </div>
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Descrivi la tua analisi e motivazione..."
            />
          </div>

          {/* Scommesse */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Scommesse</h3>
              {formData.prediction_type === 'multiple' && (
                <button
                  type="button"
                  onClick={addBet}
                  className="flex items-center space-x-1 sm:space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Aggiungi Scommessa</span>
                  <span className="sm:hidden">Aggiungi</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {bets.map((bet, index) => (
                <div key={bet.id} className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-300">
                      Scommessa {index + 1}
                    </span>
                    {formData.prediction_type === 'multiple' && bets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBet(bet.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Match/Evento *
                      </label>
                      <input
                        type="text"
                        required
                        value={bet.match}
                        onChange={(e) => updateBet(bet.id, 'match', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Es: Inter vs Milan"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Mercato *
                      </label>
                      <select
                        required
                        value={bet.market}
                        onChange={(e) => updateBet(bet.id, 'market', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs sm:text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="">Seleziona mercato</option>
                        {markets.map(market => (
                          <option key={market} value={market}>{market}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Selezione *
                      </label>
                      <input
                        type="text"
                        required
                        value={bet.selection}
                        onChange={(e) => updateBet(bet.id, 'selection', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs sm:text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Es: 1 (Vittoria Inter)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Quota *
                      </label>
                      <input
                        type="number"
                        required
                        min="1.01"
                        step="0.01"
                        value={bet.odds}
                        onChange={(e) => updateBet(bet.id, 'odds', parseFloat(e.target.value) || 1.0)}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs sm:text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stake e Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Stake ({currency}) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.stake}
                  onChange={(e) => setFormData({ ...formData, stake: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Livello di Confidenza: {formData.confidence_level}/5
              </label>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.confidence_level}
                  onChange={(e) => setFormData({ ...formData, confidence_level: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs sm:text-sm text-gray-400 w-6 sm:w-8">{formData.confidence_level}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
              Note Aggiuntive
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Note private o strategie..."
            />
          </div>

          {/* Riepilogo */}
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Riepilogo</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400">Quota Totale:</span>
                <p className="text-white font-semibold">{calculateTotalOdds().toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-400">Stake:</span>
                <p className="text-white font-semibold">{formData.stake.toFixed(2)} {currency}</p>
              </div>
              <div>
                <span className="text-gray-400">Vincita Potenziale:</span>
                <p className="text-green-400 font-semibold">{calculatePotentialWin().toFixed(2)} {currency}</p>
              </div>
              <div>
                <span className="text-gray-400">Profitto Potenziale:</span>
                <p className="text-green-400 font-semibold">{(calculatePotentialWin() - formData.stake).toFixed(2)} {currency}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Salva Pronostico</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PredictionForm