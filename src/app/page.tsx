'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { isValidEmail } from '@/lib/utils'
import { Mail, TrendingUp, Users, Award, CheckCircle, AlertCircle, LogIn, HelpCircle } from 'lucide-react'
import OnboardingGuide, { useOnboarding } from '@/components/OnboardingGuide'
import LazyImage from '@/components/LazyImage'
import { useHapticFeedback, useDeviceType } from '@/hooks/useTouch'
import { useOfflineOperations } from '@/components/OfflineSupport'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  // Onboarding state
  const { isOnboardingOpen, completeOnboarding, openOnboarding, closeOnboarding } = useOnboarding()
  
  // PWA enhancements
  const { lightTap, success, error: errorVibration } = useHapticFeedback()
  const { isTouchDevice } = useDeviceType()
  const { isOnline, saveEmailOffline } = useOfflineOperations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!isValidEmail(email)) {
      setError('Inserisci un indirizzo email valido')
      return
    }

    // Verifica se Supabase è configurato
    if (!isSupabaseConfigured()) {
      setError('Piattaforma in configurazione. Riprova più tardi.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isOnline) {
        // Modalità online - invia direttamente al database
        const { error } = await supabase
          .from('email_requests')
          .insert([{ email, status: 'pending' }])

        if (error) {
          if (error.code === '23505') {
            setError('Questa email è già stata registrata')
          } else {
            setError('Errore durante la registrazione. Riprova più tardi.')
          }
        } else {
          setIsSubmitted(true)
          setEmail('')
          if (isTouchDevice) success() // Feedback tattile per successo
        }
      } else {
        // Modalità offline - salva localmente
        const saved = saveEmailOffline(email)
        if (saved) {
          setIsSubmitted(true)
          setEmail('')
          setError('Email salvata offline. Verrà inviata quando tornerai online.')
          if (isTouchDevice) success() // Feedback tattile per successo
        } else {
          setError('Errore nel salvare l\'email offline. Riprova più tardi.')
          if (isTouchDevice) errorVibration()
        }
      }
    } catch {
      setError('Errore di connessione. Riprova più tardi.')
      if (isTouchDevice) errorVibration() // Feedback tattile per errore
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-full border border-accent-gold-fade backdrop-blur-sm">
              <LazyImage 
                src="/media/logoBianco.svg" 
                alt="Logo Mister Vertex" 
                width={40} 
                height={40}
                className="drop-shadow-sm"
                priority={true}
              />
            </div>
            <span className="text-2xl font-bold brand-gradient">Mister Vertex</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                openOnboarding()
                if (isTouchDevice) lightTap()
              }}
              className="btn-secondary inline-flex items-center space-x-2 px-3 py-2 smooth-transition touch-optimized"
              title="Apri guida"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Guida</span>
            </button>
            <Link 
              href="/login"
              className="lux-cta inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              <span>Accedi</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="avatar-container p-4 bg-white rounded-full shadow-2xl border border-accent-gold-fade">
                <Image 
                  src="/media/logoColorato.png" 
                  alt="Avatar Mister Vertex" 
                  width={120} 
                  height={120}
                  className="rounded-full object-cover drop-shadow-lg"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-accent-gold-weak rounded-full shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            La Community di
            <span className="brand-gradient">
              {' '}Betting{' '}
            </span>
            del Futuro
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Unisciti alla community esclusiva di <strong>Mister Vertex</strong> e accedi ai pronostici
            più accurati del settore. Trasforma la tua passione in profitto.
          </p>

          {/* Configuration Notice */}
          {!isSupabaseConfigured() && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h3 className="text-yellow-400 font-medium">Configurazione in Corso</h3>
                    <p className="text-yellow-300 text-sm mt-1">
                      La piattaforma è in fase di configurazione. Per completare il setup, configura Supabase seguendo le istruzioni nel README.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Form */}
          <div className="max-w-md mx-auto mb-12">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Inserisci la tua email"
                    className="lux-input w-full pl-10 pr-4 py-4"
                    disabled={isSubmitting}
                  />
                </div>
                
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="lux-cta w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registrazione...' : 'Richiedi Accesso Esclusivo'}
                </button>
              </form>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Richiesta Inviata!</h3>
                <p className="text-gray-300">
                  Grazie per il tuo interesse. Riceverai presto le credenziali di accesso.
                </p>
              </div>
            )}
            
            <div className="text-center mt-6">
               <p className="text-secondary">
                 Hai già un account?{' '}
                 <Link href="/login" className="lux-link">
                   Accedi qui
                 </Link>
               </p>
             </div>
           </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card p-6">
              <TrendingUp className="h-12 w-12 text-accent-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Pronostici Accurati</h3>
              <p className="text-gray-300">
                Analisi approfondite e pronostici basati su dati statistici avanzati
              </p>
            </div>
            
            <div className="card p-6">
              <Users className="h-12 w-12 text-accent-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Community Esclusiva</h3>
              <p className="text-gray-300">
                Accesso limitato per garantire qualità e risultati superiori
              </p>
            </div>
            
            <div className="card p-6">
              <Award className="h-12 w-12 text-accent-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Esperienza Premium</h3>
              <p className="text-gray-300">
                Diversi livelli di abbonamento per ogni tipo di scommettitore
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          {/* Footer Logo */}
          <div className="flex justify-center mb-4">
            <div className="logo-container p-2 bg-white/10 rounded-full border border-accent-gold-fade">
              <Image 
                src="/media/logoBianco.svg" 
                alt="Logo Mister Vertex" 
                width={32} 
                height={32}
                className="drop-shadow-sm"
              />
            </div>
          </div>
          <div className="text-gray-400">
            <p>&copy; 2024 Mister Vertex. Tutti i diritti riservati.</p>
            <p className="mt-2 text-sm">
              Gioca responsabilmente. Il gioco può causare dipendenza.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Onboarding Guide */}
      <OnboardingGuide 
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}
