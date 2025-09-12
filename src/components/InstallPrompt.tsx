'use client'

import { useState, useEffect } from 'react'
import { usePWA } from './PWAManager'

export default function InstallPrompt() {
  const { canInstall, installApp, isInstalled } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Mostra il prompt dopo 3 secondi se l'app può essere installata
    if (canInstall && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled, dismissed])

  const handleInstall = async () => {
    await installApp()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    // Ricorda la dismissione per questa sessione
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  useEffect(() => {
    // Controlla se il prompt è stato già dismesso in questa sessione
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 1v10h12V5H4z" clipRule="evenodd" />
                <path d="M6 7h8v2H6V7zM6 11h8v2H6v-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Installa Mister Vertex</h3>
              <p className="text-white/90 text-sm">Accesso rapido e offline</p>
            </div>
          </div>
        </div>

        {/* Contenuto */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Accesso istantaneo</h4>
                <p className="text-gray-600 text-sm">Apri l&apos;app direttamente dalla home screen</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.734.99A.996.996 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zM6 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Funziona offline</h4>
                <p className="text-gray-600 text-sm">Usa le funzioni principali anche senza internet</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Performance migliori</h4>
                <p className="text-gray-600 text-sm">Caricamento più veloce e esperienza fluida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="p-6 pt-0 flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Non ora
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Installa
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente per il banner di installazione più discreto
export function InstallBanner() {
  const { canInstall, installApp, isInstalled } = usePWA()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => setVisible(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [canInstall, isInstalled])

  if (!visible || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 max-w-sm mx-auto">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 1v10h12V5H4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">Installa l'app</h4>
          <p className="text-gray-600 text-xs">Per un'esperienza migliore</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
          <button
            onClick={installApp}
            className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-purple-700 transition-colors"
          >
            Installa
          </button>
        </div>
      </div>
    </div>
  )
}