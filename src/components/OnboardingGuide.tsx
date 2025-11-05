'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, TrendingUp, Users, Award, Mail, LogIn, HelpCircle } from 'lucide-react'
import Image from 'next/image'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface OnboardingGuideProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingGuide({ isOpen, onClose, onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Benvenuto in Mister Vertex',
      description: 'La community di betting più esclusiva d\'Italia',
      icon: <TrendingUp className="h-8 w-8 text-accent-gold" />,
      content: (
        <div className="text-center space-y-4">
          <div className="bg-white rounded-full p-3 w-24 h-24 mx-auto flex items-center justify-center shadow-xl border border-accent-gold-fade">
              <Image 
               src="/media/logoColorato.png" 
               alt="Avatar OnBoarding" 
               width={72} 
               height={72} 
               className="rounded-full object-cover drop-shadow-lg"
              />
            </div>
          <h3 className="text-2xl font-bold text-white">Benvenuto nella Community</h3>
          <p className="text-gray-300 leading-relaxed">
            Sei entrato nella community di betting più esclusiva d&apos;Italia. Qui troverai pronostici accurati, 
            analisi approfondite e una community di scommettitori professionali.
          </p>
          <div className="bg-accent-gold-weak border border-accent-gold-fade rounded-lg p-4">
            <p className="text-secondary text-sm">
              💡 <strong>Suggerimento:</strong> Questa guida ti aiuterà a orientarti nella piattaforma.
              Puoi saltarla in qualsiasi momento o riaprirla dall&apos;icona di aiuto.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Funzionalità Principali',
      description: 'Scopri cosa puoi fare sulla piattaforma',
      icon: <Award className="h-8 w-8 text-accent-gold" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">Cosa Puoi Fare</h3>
          <div className="grid gap-4">
            <div className="flex items-start space-x-3 bg-white/5 rounded-lg p-4">
              <TrendingUp className="h-6 w-6 text-accent-gold mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Pronostici Accurati</h4>
                <p className="text-gray-300 text-sm">Accedi a pronostici basati su analisi statistiche avanzate</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 rounded-lg p-4">
              <Users className="h-6 w-6 text-accent-gold mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Community Esclusiva</h4>
                <p className="text-gray-300 text-sm">Interagisci con altri scommettitori professionali</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 rounded-lg p-4">
              <Award className="h-6 w-6 text-accent-gold mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Livelli Premium</h4>
                <p className="text-gray-300 text-sm">Diversi livelli di abbonamento per ogni esigenza</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'access',
      title: 'Come Accedere',
      description: 'Richiedi l\'accesso o effettua il login',
      icon: <LogIn className="h-8 w-8 text-accent-gold" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">Inizia Subito</h3>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Mail className="h-6 w-6 text-accent-gold" />
                <h4 className="font-semibold text-white">Nuovo Utente?</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Inserisci la tua email nel modulo qui sotto per richiedere l&apos;accesso esclusivo alla community.
              </p>
              <div className="text-xs text-secondary">
                ⏱️ Riceverai le credenziali entro 24 ore
              </div>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <LogIn className="h-6 w-6 text-accent-gold" />
                <h4 className="font-semibold text-white">Hai già un Account?</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Clicca sul pulsante &quot;Accedi&quot; in alto a destra per entrare nella tua area riservata.
              </p>
              <div className="text-xs text-secondary">
                🔐 Accesso sicuro e protetto
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Sei Pronto!',
      description: 'Inizia la tua esperienza con Mister Vertex',
      icon: <Award className="h-8 w-8 text-accent-gold" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-white rounded-full p-3 w-24 h-24 mx-auto flex items-center justify-center shadow-xl border-4 border-green-200">
              <Image 
               src="/media/logoColorato.png" 
               alt="Avatar OnBoarding" 
               width={72} 
               height={72} 
               className="rounded-full object-cover drop-shadow-lg"
              />
            </div>
          <h3 className="text-2xl font-bold text-white">Perfetto!</h3>
          <p className="text-gray-300 leading-relaxed">
            Ora conosci le basi della piattaforma. Inizia richiedendo l&apos;accesso o effettuando il login 
            se hai già un account.
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              🎯 <strong>Prossimo Passo:</strong> Scorri verso il basso per inserire la tua email 
              o clicca &quot;Accedi&quot; se hai già un account.
            </p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <p className="text-blue-300 text-sm">
                Puoi sempre riaprire questa guida cliccando sull&apos;icona di aiuto
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 150)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div className="relative bg-primary border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 modal-content-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            {currentStepData.icon}
            <div>
              <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-sm text-gray-400">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Passo {currentStep + 1} di {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-accent-gold-weak h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px] mobile-scroll">
          <div className={`transition-all duration-150 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {currentStepData.content}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Salta Guida
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Indietro</span>
            </button>
            
            {isLastStep ? (
              <button
                onClick={handleComplete}
                className="lux-cta px-6 py-2 rounded-lg font-medium"
              >
                <Award className="h-4 w-4" />
                <span>Inizia!</span>
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="lux-cta px-6 py-2 rounded-lg font-medium"
              >
                <span>Avanti</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook per gestire lo stato dell'onboarding
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('mistervertex-onboarding-seen')
    if (!seen) {
      setIsOnboardingOpen(true)
    } else {
      setHasSeenOnboarding(true)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem('mistervertex-onboarding-seen', 'true')
    setHasSeenOnboarding(true)
    setIsOnboardingOpen(false)
  }

  const openOnboarding = () => {
    setIsOnboardingOpen(true)
  }

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  return {
    hasSeenOnboarding,
    isOnboardingOpen,
    completeOnboarding,
    openOnboarding,
    closeOnboarding
  }
}