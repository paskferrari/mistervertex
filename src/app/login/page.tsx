'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, safeSupabaseAuth } from '@/lib/supabase'
import { isValidEmail } from '@/lib/utils'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) {
      setError('Inserisci un indirizzo email valido')
      return
    }

    if (!password) {
      setError('Inserisci la password')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: authError } = await safeSupabaseAuth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email o password non corretti')
        } else {
          setError('Errore durante il login. Riprova più tardi.')
        }
        return
      }

      if (data.user) {
        // Verifica se l'utente esiste nella tabella users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (userError || !userData) {
          setError('Utente non autorizzato')
          await supabase.auth.signOut()
          return
        }

        // Reindirizza alla pagina di benvenuto
        router.push('/welcome')
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Torna alla Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Mister Vertex</span>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white rounded-full border-2 border-purple-500/30 shadow-lg">
                  <Image 
                    src="/logoVertex.png" 
                    alt="Logo Vertex" 
                    width={48} 
                    height={48}
                    className="drop-shadow-sm"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Accedi alla Piattaforma</h1>
              <p className="text-gray-300">Inserisci le tue credenziali per accedere</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="La tua email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="La tua password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Non hai ancora un account?{' '}
                <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Richiedi l&apos;accesso
                </Link>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-center">
              <h3 className="text-blue-400 font-medium mb-2">Accesso Riservato</h3>
              <p className="text-blue-300 text-sm">
                L'accesso alla piattaforma è riservato agli utenti approvati da Mister Vertex.
                Se non hai ancora un account, richiedi l'accesso dalla home page.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8">
        <div className="text-center">
          {/* Footer Logo */}
          <div className="flex justify-center mb-4">
            <div className="logo-container p-2 bg-white/10 rounded-full border border-white/20">
               <Image 
                 src="/logoVertex.png" 
                 alt="Logo Vertex" 
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
    </div>
  )
}