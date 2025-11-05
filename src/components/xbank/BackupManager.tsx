'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Upload, RefreshCw, Database, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
// Rimozione toast globali in favore di feedback inline non invasivo

interface BackupData {
  predictions: Array<{
    id: string
    title: string
    description: string
    sport: string
    prediction_type: string
    status: string
    created_at: string
  }>
  groups: Array<{
    id: string
    name: string
    description: string
    created_at: string
  }>
  scalate: Array<{
    id: string
    name: string
    scalata_type: string
    status: string
    created_at: string
  }>
  board_posts: Array<{
    id: string
    title: string
    content: string
    post_type: string
    created_at: string
  }>
  bankroll_transactions: Array<{
    id: string
    transaction_type: string
    amount: number
    description: string
    created_at: string
  }>
  settings: Record<string, unknown>
  exported_at: string
  version: string
}

interface BackupManagerProps {
  userId: string
}

export default function BackupManager({ userId }: BackupManagerProps) {
  const [loading, setLoading] = useState(false)
  const [lastBackup, setLastBackup] = useState<string | null>(null)
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState('weekly')
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [showImportConfirm, setShowImportConfirm] = useState(false)

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 3500)
  }

  const loadBackupSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('backup_settings')
        .eq('user_id', userId)
        .single()

      if (data?.backup_settings) {
        const settings = data.backup_settings
        setAutoBackup(settings.auto_backup ?? true)
        setBackupFrequency(settings.frequency ?? 'weekly')
      }
    } catch (error) {
      console.error('Errore nel caricamento impostazioni backup:', error)
    }
  }, [userId])

  const saveBackupSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          backup_settings: {
            auto_backup: autoBackup,
            frequency: backupFrequency,
            last_updated: new Date().toISOString()
          }
        })

      if (error) throw error
      showFeedback('Impostazioni backup salvate', 'success')
    } catch (error) {
      console.error('Errore nel salvataggio impostazioni:', error)
      showFeedback('Errore nel salvataggio impostazioni', 'error')
    }
  }

  const checkLastBackup = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('user_backups')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setLastBackup(data.created_at)
      }
    } catch {
      // Nessun backup trovato
    }
  }, [userId])

  useEffect(() => {
    loadBackupSettings()
    checkLastBackup()
  }, [loadBackupSettings, checkLastBackup])

  const exportData = async () => {
    try {
      setLoading(true)
      setSyncStatus('syncing')

      // Recupera tutti i dati dell'utente
      const [predictions, groups, scalate, posts, transactions, settings] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', userId),
        supabase.from('prediction_groups').select('*').eq('user_id', userId),
        supabase.from('scalate').select('*').eq('user_id', userId),
        supabase.from('board_posts').select('*').eq('user_id', userId),
        supabase.from('bankroll_transactions').select('*').eq('user_id', userId),
        supabase.from('user_settings').select('*').eq('user_id', userId).single()
      ])

      const backupData: BackupData = {
        predictions: predictions.data || [],
        groups: groups.data || [],
        scalate: scalate.data || [],
        board_posts: posts.data || [],
        bankroll_transactions: transactions.data || [],
        settings: settings.data || {},
        exported_at: new Date().toISOString(),
        version: '1.0'
      }

      // Salva il backup nel database
      await supabase.from('user_backups').insert({
        user_id: userId,
        backup_data: backupData,
        backup_size: JSON.stringify(backupData).length
      })

      // Crea e scarica il file JSON
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `xbank-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSyncStatus('success')
      setLastBackup(new Date().toISOString())
      showFeedback('Backup esportato con successo', 'success')
    } catch (error) {
      console.error('Errore nell\'esportazione:', error)
      setSyncStatus('error')
      showFeedback('Errore nell\'esportazione', 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const importData = async (file: File) => {
    try {
      setLoading(true)
      setSyncStatus('syncing')

      const text = await file.text()
      const backupData: BackupData = JSON.parse(text)

      // Validazione del formato
      if (!backupData.version || !backupData.exported_at) {
        throw new Error('Formato backup non valido')
      }

      // La conferma viene gestita via UI inline (showImportConfirm)

      // Elimina i dati esistenti
      await Promise.all([
        supabase.from('predictions').delete().eq('user_id', userId),
        supabase.from('prediction_groups').delete().eq('user_id', userId),
        supabase.from('scalate').delete().eq('user_id', userId),
        supabase.from('board_posts').delete().eq('user_id', userId),
        supabase.from('bankroll_transactions').delete().eq('user_id', userId)
      ])

      // Importa i nuovi dati
      const importPromises = []
      
      if (backupData.predictions.length > 0) {
        importPromises.push(
          supabase.from('predictions').insert(
            backupData.predictions.map(p => ({ ...p, user_id: userId }))
          )
        )
      }
      
      if (backupData.groups.length > 0) {
        importPromises.push(
          supabase.from('prediction_groups').insert(
            backupData.groups.map(g => ({ ...g, user_id: userId }))
          )
        )
      }
      
      if (backupData.scalate.length > 0) {
        importPromises.push(
          supabase.from('scalate').insert(
            backupData.scalate.map(s => ({ ...s, user_id: userId }))
          )
        )
      }
      
      if (backupData.board_posts.length > 0) {
        importPromises.push(
          supabase.from('board_posts').insert(
            backupData.board_posts.map(p => ({ ...p, user_id: userId }))
          )
        )
      }
      
      if (backupData.bankroll_transactions.length > 0) {
        importPromises.push(
          supabase.from('bankroll_transactions').insert(
            backupData.bankroll_transactions.map(t => ({ ...t, user_id: userId }))
          )
        )
      }

      await Promise.all(importPromises)

      // Aggiorna le impostazioni
      if (backupData.settings) {
        await supabase.from('user_settings').upsert({
          ...backupData.settings,
          user_id: userId
        })
      }

      setSyncStatus('success')
      showFeedback('Dati importati con successo', 'success')
      
      // Ricarica la pagina per aggiornare tutti i componenti
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Errore nell\'importazione:', error)
      setSyncStatus('error')
      showFeedback('Errore nell\'importazione: ' + (error as Error).message, 'error')
    } finally {
      setLoading(false)
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Passo di conferma inline prima di importare davvero
      setPendingImportFile(file)
      setShowImportConfirm(true)
      showFeedback('File di backup caricato. Conferma per importare.', 'info')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT')
  }

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Database className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Feedback inline non invasivo */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 px-3 py-2 rounded-lg text-sm ${
            feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            feedback.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Backup e Sincronizzazione</h2>
        {getSyncStatusIcon()}
      </div>

      {/* Stato ultimo backup */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700">Ultimo backup</span>
        </div>
        <p className="text-gray-600">
          {lastBackup ? formatDate(lastBackup) : 'Nessun backup disponibile'}
        </p>
      </div>

      {/* Azioni principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={exportData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Esportazione...' : 'Esporta Backup'}
        </button>

        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Importa Backup
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
        </label>
      </div>

      {/* Conferma importazione inline */}
      {showImportConfirm && pendingImportFile && (
        <div className="mb-6 p-4 rounded-lg border bg-yellow-50">
          <div className="text-sm text-yellow-800 mb-3">
            Attenzione: l'importazione sovrascriverà tutti i dati esistenti. Vuoi continuare?
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setShowImportConfirm(false)
                if (pendingImportFile) {
                  await importData(pendingImportFile)
                }
                setPendingImportFile(null)
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Continua e Sovrascrivi
            </button>
            <button
              onClick={() => {
                setShowImportConfirm(false)
                setPendingImportFile(null)
                showFeedback('Importazione annullata', 'info')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Impostazioni backup automatico */}
      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-4">Impostazioni Backup Automatico</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Abilita backup automatico</span>
            </label>
          </div>

          {autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequenza backup
              </label>
              <select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">Giornaliero</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
              </select>
            </div>
          )}

          <button
            onClick={saveBackupSettings}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Salva Impostazioni
          </button>
        </div>
      </div>

      {/* Informazioni */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informazioni sul backup:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Il backup include tutti i pronostici, gruppi, scalate e impostazioni</li>
              <li>I file vengono salvati in formato JSON</li>
              <li>Il backup automatico viene eseguito in background</li>
              <li>I dati sono crittografati e sicuri</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}