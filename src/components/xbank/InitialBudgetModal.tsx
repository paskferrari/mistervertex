'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface InitialBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (settings: { initial_bankroll: number; current_bankroll: number; currency: string; unit_type: string; unit_value: number }) => void
}

export default function InitialBudgetModal({ isOpen, onClose, onSaved }: InitialBudgetModalProps) {
  const [initialBankroll, setInitialBankroll] = useState<number>(1000)
  const [currency, setCurrency] = useState<string>('EUR')
  const [unitType, setUnitType] = useState<string>('currency')
  const [unitValue, setUnitValue] = useState<number>(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const validate = () => {
    if (!Number.isFinite(initialBankroll) || initialBankroll <= 0) {
      setError('Inserisci un budget iniziale valido (> 0).')
      return false
    }
    if (!Number.isFinite(unitValue) || unitValue <= 0) {
      setError('Inserisci un valore unità valido (> 0).')
      return false
    }
    setError(null)
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Sessione non valida')

      const response = await fetch('/api/xbank/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          initial_bankroll: initialBankroll,
          current_bankroll: initialBankroll,
          currency,
          unit_type: unitType,
          unit_value: unitValue
        })
      })

      if (!response.ok) throw new Error('Errore nel salvataggio delle impostazioni')

      onSaved({
        initial_bankroll: initialBankroll,
        current_bankroll: initialBankroll,
        currency,
        unit_type: unitType,
        unit_value: unitValue
      })
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleConfigureLater = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Sessione non valida')

      // Inserisce una transazione di tipo "adjustment" con importo 0 per segnare che l'onboarding è stato mostrato
      await fetch('/api/xbank/bankroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transaction_type: 'adjustment',
          amount: 0,
          description: 'Onboarding X-BANK: configurazione iniziale rimandata'
        })
      })

      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-white/90 border border-white/20 shadow-xl">
        <div className="px-6 py-5 border-b border-white/20">
          <h2 className="text-lg font-semibold text-primary">Configura il budget iniziale</h2>
          <p className="mt-1 text-sm text-secondary">Imposta ora il tuo budget iniziale per utilizzare tutte le funzionalità di X‑BANK.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg px-3 py-2 bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Budget iniziale</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={initialBankroll}
              onChange={(e) => setInitialBankroll(parseFloat(e.target.value))}
              className="lux-input w-full"
              placeholder="Es. 1000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Valuta</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="lux-input w-full">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Tipo unità</label>
              <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="lux-input w-full">
                <option value="currency">Valuta</option>
                <option value="percent">Percentuale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Valore unità</label>
              <input
                type="number"
                min={1}
                step="0.01"
                value={unitValue}
                onChange={(e) => setUnitValue(parseFloat(e.target.value))}
                className="lux-input w-full"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-white/20 flex items-center justify-between">
          <button
            type="button"
            onClick={handleConfigureLater}
            className="btn-secondary px-4 py-2"
            disabled={saving}
          >
            Configura più tardi
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2"
              disabled={saving}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary px-4 py-2"
              disabled={saving}
            >
              {saving ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}