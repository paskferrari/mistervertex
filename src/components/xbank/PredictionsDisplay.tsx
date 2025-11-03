'use client'

import { useState, useEffect } from 'react'
import { Target, Star, XCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Prediction {
  id: string
  title: string
  description: string
  sport: string
  odds: number
  confidence: number
  status: 'pending' | 'won' | 'lost' | 'void'
  access_level: number
  created_at: string
}

interface PredictionsDisplayProps {
  currency: string
}

const PredictionsDisplay = ({ currency }: PredictionsDisplayProps) => {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setError('Accesso non autorizzato')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError('Errore nel caricamento dei pronostici')
        return
      }

      setPredictions(data || [])
    } catch (err) {
      console.error('Errore durante il fetch dei pronostici:', err)
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'won':
        return {
          icon: CheckCircle,
          label: 'Vinta',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'lost':
        return {
          icon: XCircle,
          label: 'Persa',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'void':
        return {
          icon: XCircle,
          label: 'Annullata',
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
      default:
        return {
          icon: Clock,
          label: 'In Attesa',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        }
    }
  }

  const getAccessLevelInfo = (level: number) => {
    switch (level) {
      case 0:
        return {
          label: 'Base',
          color: 'text-accent-blue',
          bgColor: 'bg-accent-blue-weak',
          borderColor: 'border-accent-blue-fade'
        }
      case 1:
        return {
          label: 'Premium',
          color: 'text-accent-blue',
          bgColor: 'bg-accent-blue-weak',
          borderColor: 'border-accent-blue-fade'
        }
      case 2:
        return {
          label: 'VIP',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        }
      default:
        return {
          label: 'Base',
          color: 'text-accent-blue',
          bgColor: 'bg-accent-blue-weak',
          borderColor: 'border-accent-blue-fade'
        }
    }
  }

  const renderStars = (confidence: number) => {
    const stars = []
    const fullStars = Math.floor(confidence / 20)
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-500'
          }`}
        />
      )
    }
    
    return stars
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nessun pronostico disponibile</h3>
        <p className="text-gray-700">I pronostici appariranno qui quando saranno disponibili.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {predictions.map((prediction) => {
        const statusInfo = getStatusInfo(prediction.status)
        const accessInfo = getAccessLevelInfo(prediction.access_level)
        const StatusIcon = statusInfo.icon

        return (
          <div
            key={prediction.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{prediction.title}</h3>
                <p className="text-gray-700 mb-3">{prediction.description}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-gray-700">
                    <span className="font-medium">Sport:</span> {prediction.sport}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Quota:</span> {prediction.odds}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${accessInfo.bgColor} ${accessInfo.color} ${accessInfo.borderColor} border`}>
                  {accessInfo.label}
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} border`}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Fiducia:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(prediction.confidence)}
                </div>
                <span className="text-sm font-medium text-gray-700">{prediction.confidence}%</span>
              </div>
              
              <div className="text-sm text-gray-600">
                {new Date(prediction.created_at).toLocaleDateString('it-IT')}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PredictionsDisplay