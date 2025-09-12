'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, safeSupabaseAuth } from '@/lib/supabase'
import { TrendingUp, Star, Trophy, Crown, Users, ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  id: string
  email: string
  role: 'admin' | 'guest' | 'abbonato_base' | 'abbonato_premium' | 'abbonato_vip'
  created_at: string
}

export default function WelcomePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await safeSupabaseAuth.getUser()
      
      if (!authUser) {
        router.push('/')
        return
      }

      // Ottieni i dati dell'utente dal database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !userData) {
        router.push('/')
        return
      }

      setUser(userData)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Amministratore',
          description: 'Accesso completo alla piattaforma e gestione utenti',
          icon: Crown,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30'
        }
      case 'abbonato_vip':
        return {
          title: 'Abbonato VIP',
          description: 'Accesso a tutti i pronostici premium e VIP',
          icon: Crown,
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/30'
        }
      case 'abbonato_premium':
        return {
          title: 'Abbonato Premium',
          description: 'Accesso ai pronostici premium e base',
          icon: Trophy,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30'
        }
      case 'abbonato_base':
        return {
          title: 'Abbonato Base',
          description: 'Accesso ai pronostici base',
          icon: Star,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30'
        }
      default:
        return {
          title: 'Guest',
          description: 'Accesso limitato alla piattaforma',
          icon: Users,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30'
        }
    }
  }

  const handleContinue = () => {
    if (user?.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleInfo = getRoleInfo(user.role)
  const IconComponent = roleInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="logo-container p-2 bg-white rounded-full shadow-lg border-2 border-purple-400/30">
              <Image 
                src="/logoVertex.png" 
                alt="Logo Vertex" 
                width={48} 
                height={48}
                className="drop-shadow-sm"
              />
            </div>
            <span className="text-3xl font-bold text-white">Mister Vertex</span>
          </div>
        </div>
      </header>

      {/* Welcome Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Welcome Message */}
          <div className="mb-12">
            {/* Welcome Avatar */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="p-4 bg-white rounded-full shadow-2xl border-4 border-green-400/50">
                  <Image 
                    src="/avatarOnBoarding.png" 
                    alt="Avatar Welcome" 
                    width={100} 
                    height={100}
                    className="rounded-full object-cover drop-shadow-lg"
                  />
                </div>
                <div className="avatar-container absolute -top-2 -right-2 p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Benvenuto!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Sei stato accettato nella community esclusiva di <strong>Mister Vertex</strong>
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`p-4 rounded-full ${roleInfo.bgColor} ${roleInfo.borderColor} border`}>
                <IconComponent className={`h-12 w-12 ${roleInfo.color}`} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{user.email}</h2>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${roleInfo.bgColor} ${roleInfo.borderColor} border mb-4`}>
              <span className={`font-medium ${roleInfo.color}`}>{roleInfo.title}</span>
            </div>
            <p className="text-gray-300">{roleInfo.description}</p>
          </div>

          {/* Features Based on Role */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Pronostici Accurati</h3>
              <p className="text-gray-300 text-sm">
                Accedi ai pronostici di Mister Vertex basati su analisi approfondite
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community Esclusiva</h3>
              <p className="text-gray-300 text-sm">
                Fai parte di una community selezionata di appassionati di betting
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200"
          >
            <span>Continua</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
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