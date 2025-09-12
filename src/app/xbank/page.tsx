'use client'

import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Zap, Settings, TrendingUp, Target, Users, BarChart3, Plus, ArrowLeft, Save, Wallet, MessageSquare } from 'lucide-react'
import NotificationCenter from '@/components/xbank/NotificationCenter'
import Image from 'next/image'

// Lazy load dei componenti pesanti per migliorare le performance
const BankrollManager = lazy(() => import('@/components/xbank/BankrollManager'))
const PredictionsList = lazy(() => import('@/components/xbank/PredictionsList'))
const GroupsManager = lazy(() => import('@/components/xbank/GroupsManager'))
const AnalyticsDashboard = lazy(() => import('@/components/xbank/AnalyticsDashboard'))
const ScalateManager = lazy(() => import('@/components/xbank/ScalateManager'))
const PersonalBoard = lazy(() => import('@/components/xbank/PersonalBoard'))
const BackupManager = lazy(() => import('@/components/xbank/BackupManager'))

interface UserData {
  id: string
  email: string
  role: 'admin' | 'guest' | 'abbonato_base' | 'abbonato_premium' | 'abbonato_vip'
}

interface XBankSettings {
  initial_bankroll: number
  current_bankroll: number
  currency: string
  unit_type: string
  unit_value: number
}

export default function XBankPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [settings, setSettings] = useState<XBankSettings | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  // Funzione per mostrare il toast
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Gestione navigazione da tastiera
   useEffect(() => {
     const tabs = ['dashboard', 'pronostici', 'gruppi', 'scalate', 'analytics', 'bacheca', 'community', 'settings']
     
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Tab') {
         setIsKeyboardNavigation(true)
       }
       
       // Navigazione con frecce sui tab
       if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
         const currentIndex = tabs.indexOf(activeTab)
         if (currentIndex !== -1) {
           e.preventDefault()
           const nextIndex = e.key === 'ArrowRight' 
             ? (currentIndex + 1) % tabs.length
             : (currentIndex - 1 + tabs.length) % tabs.length
           setActiveTab(tabs[nextIndex])
         }
       }
     }

     const handleMouseDown = () => {
       setIsKeyboardNavigation(false)
     }

     document.addEventListener('keydown', handleKeyDown)
     document.addEventListener('mousedown', handleMouseDown)

     return () => {
       document.removeEventListener('keydown', handleKeyDown)
       document.removeEventListener('mousedown', handleMouseDown)
     }
   }, [activeTab])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Verifica i dati dell'utente
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        router.push('/login')
        return
      }

      // Verifica che l'utente sia VIP
      if (userData.role !== 'abbonato_vip' && userData.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(userData)
      await loadSettings(userData.id)
    } catch (error) {
      console.error('Errore durante il controllo utente:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async (userId: string) => {
    try {
      const response = await fetch('/api/xbank/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Errore nel caricamento impostazioni:', error)
    }
  }

  const saveSettings = async () => {
    if (!settings || !user) return

    setSaving(true)
    try {
      const response = await fetch('/api/xbank/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          initial_bankroll: settings.initial_bankroll,
          current_bankroll: settings.current_bankroll,
          currency: settings.currency,
          unit_type: settings.unit_type,
          unit_value: settings.unit_value
        })
      })

      if (response.ok) {
        alert('Impostazioni salvate con successo!')
      } else {
        alert('Errore nel salvataggio delle impostazioni')
      }
    } catch (error) {
      console.error('Errore nel salvataggio:', error)
      alert('Errore nel salvataggio delle impostazioni')
    } finally {
      setSaving(false)
    }
  }

  // Memoizza i calcoli costosi per migliorare le performance
  const dashboardMetrics = useMemo(() => {
    if (!settings) return null
    
    const profit = settings.current_bankroll - settings.initial_bankroll
    const isPositive = profit >= 0
    const roi = settings.initial_bankroll > 0 ? 
      (profit * 100) / settings.initial_bankroll : 0
    
    return { profit: profit.toFixed(2), isPositive, roi: roi.toFixed(2) }
  }, [settings])

  // Componente di loading per Suspense
  const LoadingComponent = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center py-8 sm:py-12">
      <div className="text-blue-700 text-base sm:text-lg font-medium animate-pulse">{message}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-800 text-lg sm:text-xl font-medium animate-pulse">Caricamento X-BANK...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 supports-[height:100dvh]:min-h-[100dvh]">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6 max-w-7xl">
        {/* Toast Notification */}
        <div 
          id="toast-container" 
          className="fixed top-4 right-4 z-50" 
          role="region" 
          aria-label="Notifiche"
          aria-live="polite"
        ></div>

        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-blue-200 shadow-lg rounded-t-2xl lg:rounded-t-3xl">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-1 sm:space-x-2 text-blue-700 hover:text-blue-900 transition-all duration-200 p-2 sm:p-3 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
                  aria-label="Torna alla dashboard"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="logo-container p-2 sm:p-3 bg-white rounded-xl shadow-lg border-2 border-blue-400/30">
                    <Image 
                      src="/logoVertex.png" 
                      alt="Logo Vertex" 
                      width={32} 
                      height={32}
                      className="drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">X-BANK</h1>
                    <p className="text-xs sm:text-sm text-blue-700 hidden sm:block">Sistema di Gestione Avanzato</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationCenter userId={user.id} />
                <div className="text-right bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-3 lg:p-4 rounded-xl border border-blue-200 shadow-sm">
                  <div className="text-xs sm:text-sm text-blue-700 font-medium">Bankroll</div>
                  <div className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900">
                    {settings?.current_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
           <nav role="tablist" aria-label="Sezioni X-BANK" className="flex space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-lg rounded-2xl p-2 sm:p-3 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto shadow-xl border border-blue-200 scrollbar-hide snap-x snap-mandatory relative">
             <div className="flex space-x-1 sm:space-x-2 min-w-max pb-1">
               {/* Indicatore di scroll per mobile */}
               <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-300 rounded-full opacity-50 sm:hidden"></div>
            {[
                 { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: BarChart3 },
                 { id: 'bankroll', label: 'Bankroll', shortLabel: 'Bank', icon: Wallet },
                 { id: 'predictions', label: 'Pronostici', shortLabel: 'Pred', icon: Target },
                 { id: 'groups', label: 'Gruppi', shortLabel: 'Gruppi', icon: Users },
                 { id: 'scalate', label: 'Scalate', shortLabel: 'Scale', icon: TrendingUp },
                 { id: 'analytics', label: 'Analytics', shortLabel: 'Stats', icon: BarChart3 },
                 { id: 'board', label: 'Bacheca Mister', shortLabel: 'Bacheca', icon: MessageSquare },
                 { id: 'community', label: 'Community', shortLabel: 'Community', icon: Users },
                 { id: 'settings', label: 'Impostazioni', shortLabel: 'Set', icon: Settings },
                 { id: 'backup', label: 'Backup', shortLabel: 'Back', icon: Plus }
              ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-3 sm:px-4 lg:px-6 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation snap-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl scale-105 border border-blue-300'
                      : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden truncate">{tab.shortLabel}</span>
                </button>
               )
             })}
             </div>
           </nav>

          {/* Content */}
          <main className="bg-white/85 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-blue-200 focus:outline-none" tabIndex={-1}>
            {activeTab === 'dashboard' && (
              <section id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-6 sm:mb-8">Dashboard X-BANK</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 sm:p-5 lg:p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" role="article" aria-labelledby="initial-bankroll-label">
                    <div id="initial-bankroll-label" className="text-blue-700 text-xs sm:text-sm font-medium mb-2">Bankroll Iniziale</div>
                     <div className="text-base sm:text-lg lg:text-2xl font-bold text-blue-900" aria-describedby="initial-bankroll-label">
                      {settings?.initial_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-200 rounded-xl p-4 sm:p-5 lg:p-6 border border-indigo-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" role="article" aria-labelledby="current-bankroll-label">
                    <div id="current-bankroll-label" className="text-indigo-700 text-xs sm:text-sm font-medium mb-2">Bankroll Attuale</div>
                     <div className="text-base sm:text-lg lg:text-2xl font-bold text-indigo-900" aria-describedby="current-bankroll-label">
                      {settings?.current_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-4 sm:p-5 lg:p-6 border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" role="article" aria-labelledby="profit-loss-label">
                    <div id="profit-loss-label" className="text-teal-700 text-xs sm:text-sm font-medium mb-2">Profitto o Perdita</div>
                    <div className={`text-base sm:text-lg lg:text-2xl font-bold ${
                      dashboardMetrics?.isPositive ? 'text-teal-700' : 'text-red-600'
                    }`} aria-describedby="profit-loss-label" aria-label={`Profitto o Perdita: ${dashboardMetrics?.profit || '0.00'} ${settings?.currency || 'EUR'}`}>
                      {dashboardMetrics?.profit || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 sm:p-5 lg:p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" role="article" aria-labelledby="roi-label">
                    <div id="roi-label" className="text-purple-700 text-xs sm:text-sm font-medium mb-2">ROI</div>
                    <div className={`text-base sm:text-lg lg:text-2xl font-bold ${
                      dashboardMetrics?.isPositive ? 'text-teal-700' : 'text-red-600'
                    }`} aria-describedby="roi-label" aria-label={`ROI: ${dashboardMetrics?.roi || '0.00'}%`}>
                      {dashboardMetrics?.roi || '0.00'}%
                    </div>
                  </div>
                </div>
                
                <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-100 p-4 sm:p-6 rounded-xl lg:rounded-2xl border border-blue-200 shadow-lg" role="banner">
                  <p className="text-blue-800 text-base sm:text-lg font-medium">Benvenuto in X-BANK! Seleziona una sezione dal menu per iniziare.</p>
                </div>
              </section>
            )}

            {activeTab === 'bankroll' && (
               <Suspense fallback={<LoadingComponent message="Caricamento gestione bankroll..." />}>
                 <BankrollManager 
                   currentBankroll={settings?.current_bankroll || 0}
                   currency={settings?.currency || 'EUR'}
                   onBankrollUpdate={(newBankroll) => {
                     if (settings) {
                       setSettings({ ...settings, current_bankroll: newBankroll })
                     }
                   }}
                 />
               </Suspense>
             )}

             {activeTab === 'predictions' && (
                 <div>
                   <div className="mb-6 sm:mb-8">
                     <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">I Tuoi Pronostici</h2>
                   </div>
                   <Suspense fallback={<LoadingComponent message="Caricamento pronostici..." />}>
                     <PredictionsList 
                       currency={settings?.currency || 'EUR'}
                       onBankrollUpdate={(amount) => {
                         if (settings) {
                           const newBankroll = settings.current_bankroll + amount
                           setSettings({ ...settings, current_bankroll: newBankroll })
                         }
                       }}
                     />
                   </Suspense>
                 </div>
               )}

            {activeTab === 'groups' && (
              <Suspense fallback={<LoadingComponent message="Caricamento gruppi..." />}>
                <GroupsManager currency={settings?.currency || 'EUR'} />
              </Suspense>
            )}

            {activeTab === 'scalate' && (
              <Suspense fallback={<LoadingComponent message="Caricamento scalate..." />}>
                <ScalateManager currency={settings?.currency || 'EUR'} />
              </Suspense>
            )}

            {activeTab === 'analytics' && (
              <Suspense fallback={<LoadingComponent message="Caricamento analytics..." />}>
                <AnalyticsDashboard currency={settings?.currency || 'EUR'} />
              </Suspense>
            )}

            {activeTab === 'board' && (
              <div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" />
                    Bacheca Mister Vertex
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                    Qui trovi i pronostici proposti dai nostri esperti Mister Vertex. 
                    Analisi professionali e consigli per le tue scommesse.
                  </p>
                </div>
                <Suspense fallback={<LoadingComponent message="Caricamento bacheca..." />}>
                  <PersonalBoard currency={settings?.currency || 'EUR'} />
                </Suspense>
              </div>
            )}

            {activeTab === 'community' && (
              <div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-indigo-600" />
                    Community Utenti
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                    Spazio dedicato allo scambio di opinioni tra utenti sui pronostici. 
                    Condividi le tue analisi e discuti con la community.
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                     <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Funzionalità Community</h3>
                     <ul className="space-y-2 text-sm sm:text-base text-slate-600">
                       <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>Discussioni sui pronostici</li>
                       <li className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0"></span>Condivisione strategie</li>
                       <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>Valutazioni collaborative</li>
                       <li className="flex items-center"><span className="w-2 h-2 bg-teal-500 rounded-full mr-3 flex-shrink-0"></span>Forum di discussione</li>
                     </ul>
                     <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-blue-200">
                       <p className="text-xs sm:text-sm text-slate-600 italic">
                         🚧 Sezione in sviluppo - Presto disponibili nuove funzionalità per la community!
                       </p>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <section id="panel-settings" role="tabpanel" aria-labelledby="tab-settings">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4 sm:mb-6 lg:mb-8 flex items-center">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 sm:mr-3 text-blue-600" aria-hidden="true" />
                  Impostazioni X-BANK
                </h2>
                
                <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }} className="space-y-4 sm:space-y-6">
                  <fieldset className="space-y-6">
                    <legend className="sr-only">Impostazioni finanziarie</legend>
                    
                    <div>
                      <label htmlFor="initial-bankroll" className="block text-blue-800 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                        Bankroll Iniziale ({settings?.currency || 'EUR'})
                      </label>
                      <input
                        id="initial-bankroll"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.initial_bankroll || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, initial_bankroll: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-4 py-3 sm:py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 text-base sm:text-lg touch-manipulation"
                        placeholder="Inserisci il bankroll iniziale"
                        aria-describedby="initial-bankroll-help"
                        inputMode="decimal"
                        autoComplete="off"
                      />
                      <div id="initial-bankroll-help" className="sr-only">Inserisci l'importo iniziale del tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="current-bankroll" className="block text-blue-800 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                        Bankroll Attuale ({settings?.currency || 'EUR'})
                      </label>
                      <input
                        id="current-bankroll"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.current_bankroll || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, current_bankroll: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-4 py-3 sm:py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 text-base sm:text-lg touch-manipulation"
                        placeholder="Inserisci il bankroll attuale"
                        aria-describedby="current-bankroll-help"
                        inputMode="decimal"
                        autoComplete="off"
                      />
                      <div id="current-bankroll-help" className="sr-only">Inserisci l'importo attuale del tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-blue-800 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                        Valuta
                      </label>
                      <select
                        id="currency"
                        value={settings?.currency || 'EUR'}
                        onChange={(e) => setSettings(prev => prev ? {...prev, currency: e.target.value} : null)}
                        className="w-full px-4 py-3 sm:py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 text-base sm:text-lg touch-manipulation"
                        aria-describedby="currency-help"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <div id="currency-help" className="sr-only">Seleziona la valuta per il tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="unit-type" className="block text-blue-800 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                        Tipo Unità
                      </label>
                      <select
                        id="unit-type"
                        value={settings?.unit_type || 'currency'}
                        onChange={(e) => setSettings(prev => prev ? {...prev, unit_type: e.target.value} : null)}
                        className="w-full px-4 py-3 sm:py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 text-base sm:text-lg touch-manipulation"
                        aria-describedby="unit-type-help"
                      >
                        <option value="currency">Valuta</option>
                        <option value="percentage">Percentuale</option>
                        <option value="units">Unità</option>
                      </select>
                      <div id="unit-type-help" className="sr-only">Seleziona il tipo di unità per le scommesse</div>
                    </div>

                    <div>
                      <label htmlFor="unit-value" className="block text-blue-800 text-sm sm:text-base font-medium mb-2 sm:mb-3">
                        Valore Unità
                      </label>
                      <input
                        id="unit-value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.unit_value || 1}
                        onChange={(e) => setSettings(prev => prev ? {...prev, unit_value: parseFloat(e.target.value) || 1} : null)}
                        className="w-full px-4 py-3 sm:py-4 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-blue-900 placeholder-blue-400 text-base sm:text-lg touch-manipulation"
                        placeholder="Inserisci il valore di una unità"
                        aria-describedby="unit-value-help"
                        inputMode="decimal"
                        autoComplete="off"
                      />
                      <div id="unit-value-help" className="sr-only">Inserisci il valore di una unità</div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      aria-describedby="save-button-help"
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-medium text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation w-full sm:w-auto"
                    >
                      <Save className="h-5 w-5" aria-hidden="true" />
                      <span>{saving ? 'Salvando...' : 'Salva Impostazioni'}</span>
                    </button>
                    <div id="save-button-help" className="sr-only">Salva le modifiche alle impostazioni</div>
                  </fieldset>
                </form>
              </section>
            )}

            {activeTab === 'backup' && (
              <div>
                <BackupManager userId={user.id} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}