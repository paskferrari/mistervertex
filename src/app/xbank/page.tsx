'use client'

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Settings, TrendingUp, Target, Users, BarChart3, Plus, ArrowLeft, Save, Wallet, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Dynamic import dei componenti pesanti per migliorare stabilità in dev
const BankrollManager = dynamic(() => import('@/components/xbank/BankrollManager'), { ssr: false })
const PredictionsList = dynamic(() => import('@/components/xbank/PredictionsList'), { ssr: false })
const GroupsManager = dynamic(() => import('@/components/xbank/GroupsManager'), { ssr: false })
const AnalyticsDashboard = dynamic(() => import('@/components/xbank/AnalyticsDashboard'), { ssr: false })
const ScalateManager = dynamic(() => import('@/components/xbank/ScalateManager'), { ssr: false })
const PersonalBoard = dynamic(() => import('@/components/xbank/PersonalBoard'), { ssr: false })
const BackupManager = dynamic(() => import('@/components/xbank/BackupManager'), { ssr: false })
const InitialBudgetModal = dynamic(() => import('@/components/xbank/InitialBudgetModal'), { ssr: false })

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
  const [mockEnabled, setMockEnabled] = useState(false)
  const [showInitialModal, setShowInitialModal] = useState(false)
  
  // Sidebar: sezioni disponibili (sostituisce i tab)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'bankroll', label: 'Bankroll', icon: Wallet },
    { id: 'predictions', label: 'Pronostici', icon: Target },
    { id: 'groups', label: 'Gruppi', icon: Users },
    { id: 'scalate', label: 'Scalate', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'board', label: 'Bacheca', icon: MessageSquare },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
    { id: 'backup', label: 'Backup', icon: Plus }
  ]


  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Dev/Test: consenti modalità mock via query (?mock=1) o env
        if (mockEnabled) {
          const mockUser: UserData = { id: 'mock-user', email: 'vip@mock.dev', role: 'abbonato_vip' }
          setUser(mockUser)
          setSettings({
            initial_bankroll: 1000,
            current_bankroll: 1250,
            currency: 'EUR',
            unit_type: 'currency',
            unit_value: 10,
          })
          return
        }
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
      await loadSettings()
    } catch (error) {
      console.error('Errore durante il controllo utente:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, mockEnabled])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  // Abilita mock via query (?mock=1) o env NEXT_PUBLIC_XBANK_MOCK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const fromQuery = params.get('mock') === '1'
      const fromEnv = process.env.NEXT_PUBLIC_XBANK_MOCK === 'true'
      setMockEnabled(fromQuery || fromEnv)
    }
  }, [])



  const loadSettings = async () => {
    try {
      if (mockEnabled) {
        // In modalità mock i dati sono settati in checkUser
        return
      }
      const response = await fetch('/api/xbank/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)

        // Mostra il modal al primo accesso: nessuna transazione e bankroll invariato
        try {
          const token = (await supabase.auth.getSession()).data.session?.access_token
          if (token) {
            const txRes = await fetch('/api/xbank/bankroll?limit=1', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (txRes.ok) {
              const txData = await txRes.json()
              const txCount = txData?.pagination?.total ?? (Array.isArray(txData?.transactions) ? txData.transactions.length : 0)
              const shouldShow = (Number(data?.initial_bankroll) === Number(data?.current_bankroll)) && txCount === 0
              if (shouldShow) setShowInitialModal(true)
            }
          }
        } catch (e) {
          // Se il controllo transazioni fallisce, non bloccare la pagina
          console.warn('Controllo transazioni iniziali fallito:', e)
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento impostazioni:', error)
    }
  }

  const saveSettings = async () => {
    if (!settings || !user) return

    setSaving(true)
    try {
      if (mockEnabled) {
        // Simula salvataggio in modalità mock
        await new Promise(res => setTimeout(res, 400))
        alert('Impostazioni salvate (mock)!')
        setSaving(false)
        return
      }
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
      <div className="text-secondary text-base sm:text-lg font-medium animate-pulse">{message}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary text-lg sm:text-xl font-medium animate-pulse">Caricamento X-BANK...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-primary text-primary supports-[height:100dvh]:min-h-[100dvh]">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 max-w-7xl">

        {/* Header sezione (non fisso, separato dalla topbar globale) */}
        <header className="bg-white/10 backdrop-blur-sm border-b border-white/10 text-primary rounded-xl">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="touch-target flex items-center justify-center w-10 h-10 bg-accent-gold-weak rounded-full hover:opacity-90 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  aria-label="Torna al Dashboard"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                <div>
                  <h1 className="text-lg font-bold">X-BANK</h1>
                  <p className="text-xs text-secondary">Gestione avanzata</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="card p-3">
                  <div className="text-xs text-secondary font-medium mb-1">Bankroll</div>
                  <div className="text-lg font-bold">
                    {settings?.current_bankroll?.toFixed(2) || '0.00'} {settings?.currency || 'EUR'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Layout con Sidebar (sostituisce i tab) */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <aside 
              role="navigation" 
              aria-label="Selezione sezioni X-BANK" 
              className="card p-3 lg:p-4" 
              style={{ position: 'sticky', top: 'calc(var(--nav-height) + 12px)' }}
            >
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`list-card w-full flex items-center gap-3 px-3 py-2 ${active ? 'bg-accent-gold-weak border-accent-gold-fade' : ''}`}
                    >
                      <div className={`p-2 rounded-xl ${active ? 'bg-white/10' : 'bg-white/5'}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-medium text-primary">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Content */}
            <main className="card p-4 lg:p-6" tabIndex={-1}>
            {activeTab === 'dashboard' && (
             <section id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">Dashboard</h2>
                  <p className="text-secondary text-sm">Panoramica del tuo portafoglio</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="touch-target card p-4 transition-all duration-300 hover:scale-105 gpu-accelerated" role="article" aria-labelledby="initial-bankroll-label">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div id="initial-bankroll-label" className="text-secondary text-xs font-medium mb-1">Bankroll Iniziale</div>
                    <div className="text-lg font-bold text-primary" aria-describedby="initial-bankroll-label">
                      {settings?.initial_bankroll?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-secondary">{settings?.currency || 'EUR'}</div>
                  </div>
                  
                  <div className="touch-target card p-4 transition-all duration-300 hover:scale-105 gpu-accelerated" role="article" aria-labelledby="current-bankroll-label">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div id="current-bankroll-label" className="text-secondary text-xs font-medium mb-1">Bankroll Attuale</div>
                    <div className="text-lg font-bold text-primary" aria-describedby="current-bankroll-label">
                      {settings?.current_bankroll?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-secondary">{settings?.currency || 'EUR'}</div>
                  </div>
                  
                  <div className="touch-target card p-4 transition-all duration-300 hover:scale-105 gpu-accelerated" role="article" aria-labelledby="profit-loss-label">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        dashboardMetrics?.isPositive ? 'bg-accent-gold-weak' : 'bg-red-500'
                      }`}>
                        <Target className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div id="profit-loss-label" className="text-secondary text-xs font-medium mb-1">Profitto/Perdita</div>
                    <div className={`text-lg font-bold ${
                      dashboardMetrics?.isPositive ? 'text-primary' : 'text-red-500'
                    }`} aria-describedby="profit-loss-label">
                      {dashboardMetrics?.profit || '0.00'}
                    </div>
                    <div className="text-xs text-secondary">{settings?.currency || 'EUR'}</div>
                  </div>
                  
                  <div className="touch-target card p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 gpu-accelerated" role="article" aria-labelledby="roi-label">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        dashboardMetrics?.isPositive ? 'bg-accent-gold-weak' : 'bg-red-500'
                      }`}>
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div id="roi-label" className="text-secondary text-xs font-medium mb-1">ROI</div>
                    <div className={`text-lg font-bold ${
                      dashboardMetrics?.isPositive ? 'text-secondary' : 'text-red-600'
                    }`} aria-describedby="roi-label">
                      {dashboardMetrics?.roi || '0.00'}%
                    </div>
                    <div className="text-xs text-secondary">Rendimento</div>
                  </div>
                </div>
                
                <div className="card p-6 rounded-2xl shadow-lg" role="banner">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-accent-gold-weak rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Benvenuto in X-BANK</h3>
                    <p className="text-secondary text-sm mb-4">Il tuo sistema di gestione avanzato per il betting professionale</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-white/10 text-primary rounded-full text-xs font-medium">Gestione Bankroll</span>
                      <span className="px-3 py-1 bg-white/10 text-primary rounded-full text-xs font-medium">Analytics</span>
                      <span className="px-3 py-1 bg-accent-gold-weak text-white rounded-full text-xs font-medium">Pronostici</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'bankroll' && (
             <Suspense fallback={<LoadingComponent message="Caricamento gestione bankroll..." />}>
                 <BankrollManager 
                   currency={settings?.currency || 'EUR'}
                   mock={mockEnabled}
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
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">I Tuoi Pronostici</h2>
                   </div>
                   <Suspense fallback={<LoadingComponent message="Caricamento pronostici..." />}>
                     <PredictionsList 
                       currency={settings?.currency || 'EUR'}
                       mock={mockEnabled}
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
                <ScalateManager currency={settings?.currency || 'EUR'} mock={mockEnabled} />
              </Suspense>
            )}

            {activeTab === 'analytics' && (
              <Suspense fallback={<LoadingComponent message="Caricamento analytics..." />}>
                <AnalyticsDashboard currency={settings?.currency || 'EUR'} />
              </Suspense>
            )}

            {activeTab === 'board' && (
              <div>
                <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-accent-gold" />
                    Bacheca Mister Vertex
                  </h2>
                  <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4">
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
                       <li className="flex items-center"><span className="w-2 h-2 bg-accent-gold-weak rounded-full mr-3 flex-shrink-0"></span>Valutazioni collaborative</li>
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
                      <div id="initial-bankroll-help" className="sr-only">Inserisci l&apos;importo iniziale del tuo bankroll</div>
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
                      <div id="current-bankroll-help" className="sr-only">Inserisci l&apos;importo attuale del tuo bankroll</div>
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
                <Suspense fallback={<LoadingComponent message="Caricamento backup..." />}>
                  <BackupManager userId={user.id} />
                </Suspense>
              </div>
            )}
            {/* Modal di budget iniziale */}
            <InitialBudgetModal
              isOpen={showInitialModal}
              onClose={() => setShowInitialModal(false)}
              onSaved={(s) => setSettings(s)}
            />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}