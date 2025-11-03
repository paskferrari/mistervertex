'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, safeSupabaseAuth } from '@/lib/supabase'
import { Star, Trophy, Crown, LogOut, Calendar, Target, TrendingUp, TrendingDown, User, Copy, Wallet, Zap } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  id: string
  email: string
  role: 'admin' | 'guest' | 'abbonato_base' | 'abbonato_premium' | 'abbonato_vip'
  created_at: string
}

interface Prediction {
  id: string
  title: string
  description: string
  odds: number
  confidence: number
  status: 'pending' | 'won' | 'lost'
  access_level: number // 0 = base, 1 = premium, 2 = vip
  created_at: string
}

interface WalletItem {
  id: string
  prediction_id: string
  prediction: Prediction
  stake_amount: number
  notes?: string
}

export default function UserDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'predictions' | 'profile' | 'wallet'>('predictions')
  const [walletItems, setWalletItems] = useState<WalletItem[]>([])
  const [isScrolled, setIsScrolled] = useState(false)

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Verifica se un pronostico è già nel wallet
  const isInWallet = (predictionId: string) => {
    return walletItems.some(item => item.prediction_id === predictionId)
  }

  const checkUserAndLoadData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await safeSupabaseAuth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      // Ottieni i dati dell'utente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError || !userData) {
        router.push('/login')
        return
      }

      setUser(userData)
      await loadPredictions(userData.role)
      await loadWallet()
    } catch (error) {
      console.error('Error loading data:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkUserAndLoadData()
  }, [checkUserAndLoadData])

  // Gestione scroll per ottimizzazioni UI
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    console.log('🎨 Wallet items state changed:', walletItems.length, walletItems)
  }, [walletItems])

  const loadWallet = async () => {
    try {
      console.log('🔄 Loading wallet...')
      // Ottieni il token di sessione
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('❌ Sessione non trovata')
        return
      }

      console.log('✅ Session found, calling API...')
      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      console.log('📡 API Response status:', response.status)
      const data = await response.json()
      console.log('📦 API Response data:', data)
      
      if (response.ok) {
        setWalletItems(data || [])
        console.log('🎨 Wallet state updated with:', data?.length || 0, 'items')
      } else {
        console.error('❌ Error loading wallet:', data.error)
      }
    } catch (error) {
      console.error('❌ Error in loadWallet:', error)
    }
  }

  const loadPredictions = async (userRole: string) => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading predictions:', error)
        return
      }

      // Filtra i pronostici in base al ruolo dell'utente
      const filteredPredictions = data.filter(prediction => {
        if (userRole === 'guest') return false
        if (userRole === 'abbonato_base') return prediction.access_level === 0
        if (userRole === 'abbonato_premium') return prediction.access_level <= 1
        if (userRole === 'abbonato_vip') return prediction.access_level <= 2
        return true // admin può vedere tutto
      })

      setPredictions(filteredPredictions)
    } catch (error) {
      console.error('Error loading predictions:', error)
    }
  }

  const copyToWallet = async (prediction: Prediction) => {
    try {
      setLoadingOperation(`copy-${prediction.id}`)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Errore di autenticazione', 'error')
        return
      }

      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prediction_id: prediction.id,
          stake_amount: 10, // Default stake
          notes: ''
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        showToast('Pronostico aggiunto al wallet!', 'success')
        await loadWallet() // Ricarica il wallet
      } else {
        console.error('Copy to wallet error:', data)
        showToast(data.error || 'Errore durante l\'aggiunta al wallet', 'error')
      }
    } catch (error) {
      console.error('Error copying to wallet:', error)
      showToast('Errore durante l\'aggiunta al wallet', 'error')
    } finally {
      setLoadingOperation(null)
    }
  }

  const removeFromWallet = async (walletItemId: string) => {
    try {
      setLoadingOperation(`remove-${walletItemId}`)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Errore di autenticazione', 'error')
        return
      }

      const response = await fetch(`/api/wallet/${walletItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        showToast('Pronostico rimosso dal wallet', 'success')
        await loadWallet() // Ricarica il wallet
      } else {
        const data = await response.json()
        showToast(data.error || 'Errore durante la rimozione', 'error')
      }
    } catch (error) {
      console.error('Error removing from wallet:', error)
      showToast('Errore durante la rimozione', 'error')
    } finally {
      setLoadingOperation(null)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Amministratore',
          icon: Crown,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30'
        }
      case 'abbonato_vip':
        return {
          title: 'VIP',
          icon: Crown,
          color: 'text-white',
          bgColor: 'bg-accent-gold-weak',
          borderColor: 'border-accent-gold-fade'
        }
      case 'abbonato_premium':
        return {
          title: 'Premium',
          icon: Trophy,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        }
      case 'abbonato_base':
        return {
          title: 'Base',
          icon: Star,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        }
      default:
        return {
          title: 'Guest',
          icon: User,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30'
        }
    }
  }

  const getAccessLevelBadge = (level: number) => {
    switch (level) {
      case 0:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            Base
          </span>
        )
      case 1:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
            Premium
          </span>
        )
      case 2:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-accent-gold-weak text-white rounded-full border border-accent-gold-fade">
            VIP
          </span>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'lost':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Calendar className="h-4 w-4 text-yellow-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleInfo = getRoleInfo(user.role)
  const IconComponent = roleInfo.icon

  return (
    <div className="min-h-screen bg-primary">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-accent-gold" />
                <span className="text-2xl font-bold text-white">Mister Vertex</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${roleInfo.bgColor} ${roleInfo.borderColor} border`}>
                <IconComponent className={`h-4 w-4 ${roleInfo.color}`} />
                <span className={`text-sm font-medium ${roleInfo.color}`}>{roleInfo.title}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">{user.email}</span>
              {user.role === 'abbonato_vip' && (
                <button
                  onClick={() => router.push('/xbank')}
                  className="lux-cta inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  <Zap className="h-4 w-4" />
                  <span>X-BANK</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <LogOut className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
                <span>Esci</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-6 max-w-lg">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 touch-optimized touch-target ${
              activeTab === 'predictions'
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Pronostici
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 touch-optimized touch-target ${
              activeTab === 'wallet'
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 touch-optimized touch-target ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Profilo
          </button>
        </div>

        {/* Content */}
        {activeTab === 'predictions' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 animate-slide-down">Bacheca Pronostici di Mr Vertex</h1>
            
            {user.role === 'guest' ? (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
                <h3 className="text-yellow-400 font-medium mb-2">Accesso Limitato</h3>
                <p className="text-yellow-300">
                  Come utente Guest, non hai accesso ai pronostici. Contatta Mister Vertex per aggiornare il tuo abbonamento.
                </p>
              </div>
            ) : predictions.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nessun Pronostico Disponibile</h3>
                <p className="text-gray-300">Al momento non ci sono pronostici disponibili per il tuo livello di abbonamento.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {predictions.map((prediction, index) => (
                  <div 
                    key={prediction.id} 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{prediction.title}</h3>
                          {getAccessLevelBadge(prediction.access_level)}
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(prediction.status)}
                            <span className={`text-sm capitalize ${
                              prediction.status === 'won' ? 'text-green-400' :
                              prediction.status === 'lost' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {prediction.status === 'pending' ? 'In Corso' :
                               prediction.status === 'won' ? 'Vinta' : 'Persa'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{prediction.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">
                              {new Date(prediction.created_at).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <div className="text-gray-400">
                            Quota: <span className="text-white font-medium">{prediction.odds}</span>
                          </div>
                          <div className="text-gray-400">
                            Fiducia: <span className="text-white font-medium">{prediction.confidence}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isInWallet(prediction.id) ? (
                          <button
                            onClick={() => copyToWallet(prediction)}
                            disabled={loadingOperation === `copy-${prediction.id}`}
                            className="lux-cta flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-optimized touch-target"
                          >
                            {loadingOperation === `copy-${prediction.id}` ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Copy className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                            )}
                            <span>{loadingOperation === `copy-${prediction.id}` ? 'Aggiungendo...' : 'Copia nel Wallet'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1 bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm">
                            <Wallet className="h-4 w-4" />
                            <span>Nel Wallet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 animate-slide-down">Il Tuo Wallet</h1>
            
            {walletItems.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Wallet Vuoto</h3>
                <p className="text-gray-300">Non hai ancora copiato nessun pronostico nel tuo wallet.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {walletItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{item.prediction.title}</h3>
                          {getAccessLevelBadge(item.prediction.access_level)}
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.prediction.status)}
                            <span className={`text-sm capitalize ${
                              item.prediction.status === 'won' ? 'text-green-400' :
                              item.prediction.status === 'lost' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {item.prediction.status === 'pending' ? 'In Corso' :
                               item.prediction.status === 'won' ? 'Vinta' : 'Persa'}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{item.prediction.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">
                              {new Date(item.prediction.created_at).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <div className="text-gray-400">
                            Quota: <span className="text-white font-medium">{item.prediction.odds}</span>
                          </div>
                          <div className="text-gray-400">
                            Fiducia: <span className="text-white font-medium">{item.prediction.confidence}%</span>
                          </div>
                          <div className="text-gray-400">
                            Puntata: <span className="text-white font-medium">€{item.stake_amount}</span>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <p className="text-gray-300 text-sm">
                              <strong>Note:</strong> {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromWallet(item.id)}
                          disabled={loadingOperation === `remove-${item.id}`}
                          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loadingOperation === `remove-${item.id}` ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : null}
                          <span>{loadingOperation === `remove-${item.id}` ? 'Rimuovendo...' : 'Rimuovi'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6 animate-slide-down">Il Tuo Profilo</h1>
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white p-3 rounded-full shadow-xl border-4 border-gray-200">
                    <Image 
                     src="/avatarOnBoarding.png" 
                     alt="Avatar utente" 
                     width={72} 
                     height={72} 
                     className="rounded-full object-cover drop-shadow-lg"
                    />
                  </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{user.email}</h2>
                  <p className={`${roleInfo.color} font-medium`}>{roleInfo.title}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informazioni Account</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ruolo:</span>
                      <span className="text-white">{roleInfo.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Membro dal:</span>
                      <span className="text-white">
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Accesso ai Pronostici</h3>
                  <div className="space-y-2">
                    {user.role === 'guest' ? (
                      <p className="text-gray-400 text-sm">Nessun accesso ai pronostici</p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-sm">Pronostici Base</span>
                        </div>
                        {(user.role === 'abbonato_premium' || user.role === 'abbonato_vip') && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-blue-400 text-sm">Pronostici Premium</span>
                          </div>
                        )}
                        {user.role === 'abbonato_vip' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-accent-gold-weak rounded-full"></div>
                            <span className="text-secondary text-sm">Pronostici VIP</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}