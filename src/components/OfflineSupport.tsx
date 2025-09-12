'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface PendingAction {
  type: string
  data: Record<string, unknown>
  timestamp: number
}

interface OfflineData {
  emails: string[]
  userPreferences: Record<string, unknown>
  lastSync: number
}

interface OfflineSupportProps {
  children?: React.ReactNode
}

export default function OfflineSupport({ children }: OfflineSupportProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])

  const syncPendingActions = useCallback(async () => {
    if (pendingActions.length === 0) return

    try {
      for (const action of pendingActions) {
        await processAction(action)
      }
      
      // Pulisci le azioni completate
      setPendingActions([])
      localStorage.removeItem('pending-actions')
      
      console.log('Sincronizzazione completata')
    } catch (error) {
      console.error('Errore durante la sincronizzazione:', error)
    }
  }, [pendingActions])

  useEffect(() => {
    // Monitora lo stato della connessione
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingActions()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      saveCurrentState()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true)
    loadOfflineData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncPendingActions])

  const saveCurrentState = () => {
    try {
      const currentData: OfflineData = {
        emails: JSON.parse(localStorage.getItem('offline-emails') || '[]'),
        userPreferences: JSON.parse(localStorage.getItem('user-preferences') || '{}'),
        lastSync: Date.now()
      }
      localStorage.setItem('offline-data', JSON.stringify(currentData))
    } catch (error) {
      console.error('Errore nel salvare i dati offline:', error)
    }
  }

  const loadOfflineData = () => {
    try {
      const pending = localStorage.getItem('pending-actions')
      if (pending) {
        setPendingActions(JSON.parse(pending))
      }
    } catch (error) {
      console.error('Errore nel caricare i dati offline:', error)
    }
  }



  const processAction = async (action: PendingAction) => {
    switch (action.type) {
      case 'email_request':
        const { error } = await supabase
          .from('email_requests')
          .insert([{ email: action.data.email, status: 'pending' }])
        
        if (error) {
          throw new Error(`Errore nell'inserimento email: ${error.message}`)
        }
        break
        
      case 'user_preference':
        // Sincronizza le preferenze utente
        localStorage.setItem('user-preferences', JSON.stringify(action.data))
        break
        
      default:
        console.warn('Tipo di azione non riconosciuto:', action.type)
    }
  }

  return (
    <>
      {children}
      
      {/* Indicatore di sincronizzazione */}
      {isOnline && pendingActions.length > 0 && (
        <div className="fixed top-16 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Sincronizzazione in corso...</span>
          </div>
        </div>
      )}
    </>
  )
}

// Hook per gestire le operazioni offline
export function useOfflineOperations() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
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

  const saveEmailOffline = (email: string) => {
    try {
      const existingEmails = JSON.parse(localStorage.getItem('offline-emails') || '[]')
      const updatedEmails = [...existingEmails, { email, timestamp: Date.now() }]
      localStorage.setItem('offline-emails', JSON.stringify(updatedEmails))
      
      // Aggiungi alle azioni pendenti
      const pendingActions = JSON.parse(localStorage.getItem('pending-actions') || '[]')
      pendingActions.push({
        type: 'email_request',
        data: { email },
        timestamp: Date.now()
      })
      localStorage.setItem('pending-actions', JSON.stringify(pendingActions))
      
      return true
    } catch (error) {
      console.error('Errore nel salvare email offline:', error)
      return false
    }
  }

  const getOfflineEmails = (): Record<string, unknown>[] => {
    try {
      return JSON.parse(localStorage.getItem('offline-emails') || '[]')
    } catch (error) {
      console.error('Errore nel recuperare email offline:', error)
      return []
    }
  }

  const saveUserPreference = (key: string, value: unknown) => {
    try {
      const preferences = JSON.parse(localStorage.getItem('user-preferences') || '{}')
      preferences[key] = value
      localStorage.setItem('user-preferences', JSON.stringify(preferences))
      
      if (!isOnline) {
        // Aggiungi alle azioni pendenti se offline
        const pendingActions = JSON.parse(localStorage.getItem('pending-actions') || '[]')
        pendingActions.push({
          type: 'user_preference',
          data: preferences,
          timestamp: Date.now()
        })
        localStorage.setItem('pending-actions', JSON.stringify(pendingActions))
      }
      
      return true
    } catch (error) {
      console.error('Errore nel salvare preferenza:', error)
      return false
    }
  }

  const getUserPreference = (key: string, defaultValue: unknown = null) => {
    try {
      const preferences = JSON.parse(localStorage.getItem('user-preferences') || '{}')
      return preferences[key] !== undefined ? preferences[key] : defaultValue
    } catch (error) {
      console.error('Errore nel recuperare preferenza:', error)
      return defaultValue
    }
  }

  const clearOfflineData = () => {
    try {
      localStorage.removeItem('offline-emails')
      localStorage.removeItem('pending-actions')
      localStorage.removeItem('offline-data')
      return true
    } catch (error) {
      console.error('Errore nel pulire dati offline:', error)
      return false
    }
  }

  const getPendingActionsCount = () => {
    try {
      const actions = JSON.parse(localStorage.getItem('pending-actions') || '[]')
      return actions.length
    } catch {
      return 0
    }
  }

  return {
    isOnline,
    saveEmailOffline,
    getOfflineEmails,
    saveUserPreference,
    getUserPreference,
    clearOfflineData,
    getPendingActionsCount
  }
}

// Componente per mostrare lo stato offline
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const { getPendingActionsCount } = useOfflineOperations()
  const pendingCount = getPendingActionsCount()

  useEffect(() => {
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

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className={`
      fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-40 rounded-lg p-3 shadow-lg
      ${isOnline ? 'bg-blue-600' : 'bg-yellow-600'} text-white
    `}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-sm font-medium">
          {isOnline ? (
            pendingCount > 0 ? `${pendingCount} azioni in sincronizzazione` : 'Online'
          ) : (
            'Modalità offline attiva'
          )}
        </span>
      </div>
      {!isOnline && (
        <p className="text-xs mt-1 opacity-90">
          Le tue azioni verranno sincronizzate quando tornerai online
        </p>
      )}
    </div>
  )
}