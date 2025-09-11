'use client'

import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Zap, Settings, TrendingUp, Target, Users, BarChart3, Plus, ArrowLeft, Save, Wallet, MessageSquare } from 'lucide-react'
import NotificationCenter from '@/components/xbank/NotificationCenter'

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

  useEffect(() => {
    checkUser()
  }, [])

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
    <div className="flex items-center justify-center py-12">
      <div className="text-amber-700 text-lg font-medium">{message}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-800 text-xl font-medium">Caricamento X-BANK...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Toast Notification */}
        <div 
          id="toast-container" 
          className="fixed top-4 right-4 z-50" 
          role="region" 
          aria-label="Notifiche"
          aria-live="polite"
        ></div>

        {/* Header */}
        <header className="bg-white bg-opacity-80 backdrop-blur-md border-b border-amber-200 shadow-sm">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-1 sm:space-x-2 text-amber-700 hover:text-amber-900 transition-colors p-2 rounded-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  aria-label="Torna alla dashboard"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl shadow-lg">
                    <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">X-BANK</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationCenter userId={user.id} />
                <div className="text-right bg-gradient-to-br from-amber-100 to-orange-100 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                  <div className="text-xs sm:text-sm text-amber-700 font-medium">Bankroll</div>
                  <div className="text-lg sm:text-xl font-bold text-amber-900">
                    {settings?.current_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <nav role="tablist" aria-label="Sezioni X-BANK" className="flex space-x-1 sm:space-x-2 bg-white bg-opacity-60 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-2 mb-6 sm:mb-8 overflow-x-auto shadow-lg border border-amber-200 scrollbar-hide">
            {[
              { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: BarChart3 },
              { id: 'bankroll', label: 'Bankroll', shortLabel: 'Bank', icon: Wallet },
              { id: 'predictions', label: 'Pronostici', shortLabel: 'Pred', icon: Target },
              { id: 'groups', label: 'Gruppi', shortLabel: 'Grup', icon: Users },
              { id: 'scalate', label: 'Scalate', shortLabel: 'Scal', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', shortLabel: 'Anal', icon: BarChart3 },
              { id: 'board', label: 'Bacheca', shortLabel: 'Bach', icon: MessageSquare },
              { id: 'settings', label: 'Impostazioni', shortLabel: 'Imp', icon: Settings },
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
                  className={`flex items-center space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap min-w-0 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105 border border-amber-400'
                      : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100 hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden truncate">{tab.shortLabel}</span>
                </button>
              )
            })}
          </nav>

          {/* Content */}
          <main className="bg-white bg-opacity-70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-amber-200">
            {activeTab === 'dashboard' && (
              <section id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
                <h2 className="text-3xl font-bold text-amber-900 mb-8">Dashboard X-BANK</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-200 shadow-md hover:shadow-lg transition-shadow duration-300" role="article" aria-labelledby="initial-bankroll-label">
                    <div id="initial-bankroll-label" className="text-amber-700 text-sm font-medium mb-2">Bankroll Iniziale</div>
                    <div className="text-2xl font-bold text-amber-900" aria-describedby="initial-bankroll-label">
                      {settings?.initial_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-300" role="article" aria-labelledby="current-bankroll-label">
                    <div id="current-bankroll-label" className="text-blue-700 text-sm font-medium mb-2">Bankroll Attuale</div>
                    <div className="text-2xl font-bold text-blue-900" aria-describedby="current-bankroll-label">
                      {settings?.current_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-6 border border-emerald-200 shadow-md hover:shadow-lg transition-shadow duration-300" role="article" aria-labelledby="profit-loss-label">
                    <div id="profit-loss-label" className="text-emerald-700 text-sm font-medium mb-2">Profitto o Perdita</div>
                    <div className={`text-2xl font-bold ${
                      dashboardMetrics?.isPositive ? 'text-emerald-700' : 'text-red-600'
                    }`} aria-describedby="profit-loss-label" aria-label={`Profitto o Perdita: ${dashboardMetrics?.profit || '0.00'} ${settings?.currency || 'EUR'}`}>
                      {dashboardMetrics?.profit || '0.00'} {settings?.currency || 'EUR'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200 shadow-md hover:shadow-lg transition-shadow duration-300" role="article" aria-labelledby="roi-label">
                    <div id="roi-label" className="text-purple-700 text-sm font-medium mb-2">ROI</div>
                    <div className={`text-2xl font-bold ${
                      dashboardMetrics?.isPositive ? 'text-emerald-700' : 'text-red-600'
                    }`} aria-describedby="roi-label" aria-label={`ROI: ${dashboardMetrics?.roi || '0.00'}%`}>
                      {dashboardMetrics?.roi || '0.00'}%
                    </div>
                  </div>
                </div>
                
                <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-xl border border-amber-200" role="banner">
                  <p className="text-amber-800 text-lg font-medium">Benvenuto in X-BANK! Seleziona una sezione dal menu per iniziare.</p>
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
                   <div className="mb-8">
                     <h2 className="text-3xl font-bold text-amber-900">I Tuoi Pronostici</h2>
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
              <Suspense fallback={<LoadingComponent message="Caricamento bacheca..." />}>
                <PersonalBoard currency={settings?.currency || 'EUR'} />
              </Suspense>
            )}

            {activeTab === 'settings' && (
              <section id="panel-settings" role="tabpanel" aria-labelledby="tab-settings">
                <h2 className="text-3xl font-bold text-amber-900 mb-8">Impostazioni X-BANK</h2>
                
                <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }} className="space-y-6">
                  <fieldset className="space-y-6">
                    <legend className="sr-only">Impostazioni finanziarie</legend>
                    
                    <div>
                      <label htmlFor="initial-bankroll" className="block text-amber-800 text-sm font-medium mb-2">
                        Bankroll Iniziale ({settings?.currency || 'EUR'})
                      </label>
                      <input
                        id="initial-bankroll"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.initial_bankroll || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, initial_bankroll: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900 placeholder-amber-400"
                        placeholder="Inserisci il bankroll iniziale"
                        aria-describedby="initial-bankroll-help"
                      />
                      <div id="initial-bankroll-help" className="sr-only">Inserisci l'importo iniziale del tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="current-bankroll" className="block text-amber-800 text-sm font-medium mb-2">
                        Bankroll Attuale ({settings?.currency || 'EUR'})
                      </label>
                      <input
                        id="current-bankroll"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.current_bankroll || 0}
                        onChange={(e) => setSettings(prev => prev ? {...prev, current_bankroll: parseFloat(e.target.value) || 0} : null)}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900 placeholder-amber-400"
                        placeholder="Inserisci il bankroll attuale"
                        aria-describedby="current-bankroll-help"
                      />
                      <div id="current-bankroll-help" className="sr-only">Inserisci l'importo attuale del tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-amber-800 text-sm font-medium mb-2">
                        Valuta
                      </label>
                      <select
                        id="currency"
                        value={settings?.currency || 'EUR'}
                        onChange={(e) => setSettings(prev => prev ? {...prev, currency: e.target.value} : null)}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900"
                        aria-describedby="currency-help"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <div id="currency-help" className="sr-only">Seleziona la valuta per il tuo bankroll</div>
                    </div>

                    <div>
                      <label htmlFor="unit-type" className="block text-amber-800 text-sm font-medium mb-2">
                        Tipo Unità
                      </label>
                      <select
                        id="unit-type"
                        value={settings?.unit_type || 'currency'}
                        onChange={(e) => setSettings(prev => prev ? {...prev, unit_type: e.target.value} : null)}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900"
                        aria-describedby="unit-type-help"
                      >
                        <option value="currency">Valuta</option>
                        <option value="percentage">Percentuale</option>
                        <option value="units">Unità</option>
                      </select>
                      <div id="unit-type-help" className="sr-only">Seleziona il tipo di unità per le scommesse</div>
                    </div>

                    <div>
                      <label htmlFor="unit-value" className="block text-amber-800 text-sm font-medium mb-2">
                        Valore Unità
                      </label>
                      <input
                        id="unit-value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={settings?.unit_value || 1}
                        onChange={(e) => setSettings(prev => prev ? {...prev, unit_value: parseFloat(e.target.value) || 1} : null)}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-900 placeholder-amber-400"
                        placeholder="Inserisci il valore di una unità"
                        aria-describedby="unit-value-help"
                      />
                      <div id="unit-value-help" className="sr-only">Inserisci il valore di una unità</div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      aria-describedby="save-button-help"
                      className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
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