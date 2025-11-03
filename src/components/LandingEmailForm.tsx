"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { isValidEmail } from '@/lib/utils'
import { useHapticFeedback, useDeviceType } from '@/hooks/useTouch'
import { useOfflineOperations } from '@/components/OfflineSupport'
import Button from '@/ui/Button'

export default function LandingEmailForm({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

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

    if (!supabaseConfigured) {
      setError('Piattaforma in configurazione. Riprova più tardi.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isOnline) {
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
          if (isTouchDevice) success()
        }
      } else {
        const saved = saveEmailOffline(email)
        if (saved) {
          setIsSubmitted(true)
          setEmail('')
          setError('Email salvata offline. Verrà inviata quando tornerai online.')
          if (isTouchDevice) success()
        } else {
          setError('Errore nel salvare l\'email offline. Riprova più tardi.')
          if (isTouchDevice) errorVibration()
        }
      }
    } catch {
      setError('Errore di connessione. Riprova più tardi.')
      if (isTouchDevice) errorVibration()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mb-12">
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="email-form-label">
        <div className="sr-only" id="email-form-label">Richiesta accesso esclusivo</div>
        <div className="relative">
          <label htmlFor="landing-email" className="sr-only">Email</label>
          <input
            type="email"
            id="landing-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Inserisci la tua email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'landing-email-error' : undefined}
            className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            required
          />
        </div>
        {error && (
          <p id="landing-email-error" className="text-sm" style={{ color: 'var(--accent-red)' }}>{error}</p>
        )}
        <Button className="w-full py-4" type="submit">
          {isSubmitting ? 'Registrazione...' : 'Richiedi Accesso Esclusivo'}
        </Button>
      </form>
      <div className="text-center mt-6">
        <p className="text-gray-400">
          Hai già un account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Accedi qui
          </Link>
        </p>
      </div>
    </div>
  )
}