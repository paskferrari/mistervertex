'use client'

import { useEffect, useState } from 'react'
import InstallPrompt from './InstallPrompt'
import OfflineSupport, { OfflineIndicator } from './OfflineSupport'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAManagerProps {
  children?: React.ReactNode
}

export default function PWAManager({ children }: PWAManagerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Registra il service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrato:', reg)
          setRegistration(reg)
          
          // Controlla aggiornamenti
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && typeof window !== 'undefined' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Errore registrazione Service Worker:', error)
        })
    }

    // Monitora lo stato della connessione
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return (
    <OfflineSupport>
      {children}
      
      {/* Prompt di installazione PWA */}
      <InstallPrompt />
      
      {/* Indicatore stato offline */}
      <OfflineIndicator />
      
      {/* Indicatore stato offline legacy per compatibilità */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            📱 Modalità offline - Alcune funzionalità potrebbero essere limitate
          </span>
        </div>
      )}
      
      {/* Notifica aggiornamento disponibile */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 shadow-lg z-50 max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">Aggiornamento disponibile</h4>
              <p className="text-xs opacity-90 mt-1">
                Una nuova versione dell&apos;app è pronta
              </p>
            </div>
            <button
              onClick={handleUpdate}
              className="ml-3 bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Aggiorna
            </button>
          </div>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="absolute top-1 right-1 text-white/70 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </OfflineSupport>
  )
}

// Hook per controllare lo stato PWA
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Controlla se l'app è già installata
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }
    }

    // Gestisce l'evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Gestisce l'installazione completata
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled as EventListener)
    }
  }, [])

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setCanInstall(false)
        setDeferredPrompt(null)
      }
    }
  }

  return {
    isInstalled,
    canInstall,
    installApp
  }
}