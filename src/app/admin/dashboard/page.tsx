'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, safeSupabaseAuth } from '@/lib/supabase'
import { formatDate, generateRandomPassword } from '@/lib/utils'
import { 
  Mail, 
  Users, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react'
import Image from 'next/image'

interface EmailRequest {
  id: string
  email: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

interface User {
  id: string
  email: string
  role: 'admin' | 'guest' | 'abbonato_base' | 'abbonato_premium' | 'abbonato_vip'
  created_at: string
  approved_by?: string
}

export default function AdminDashboard() {
  const [emailRequests, setEmailRequests] = useState<EmailRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests')
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<User['role']>('guest')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await safeSupabaseAuth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }

    // Verifica se è admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single()

    if (!adminData) {
      await supabase.auth.signOut()
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [checkAuth])

  const fetchData = async () => {
    try {
      // Fetch email requests
      const { data: requests } = await supabase
        .from('email_requests')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      setEmailRequests(requests || [])

      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('email_requests')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', id)

      if (!error) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating email request:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserEmail || !generatedPassword) return

    try {
      // Ottieni l'email dell'admin corrente
      const { data: { user } } = await supabase.auth.getUser()
      const approvedBy = user?.email

      // Chiama l'API per creare l'utente
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: generatedPassword,
          role: newUserRole,
          approvedBy
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error creating user:', result.error)
        return
      }

      // Reset form e aggiorna dati
      setShowCreateUser(false)
      setNewUserEmail('')
      setNewUserRole('guest')
      setGeneratedPassword('')
      setShowPassword(false)
      fetchData()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const generatePassword = () => {
    const password = generateRandomPassword(12)
    setGeneratedPassword(password)
  }

  const handleLogout = async () => {
    await safeSupabaseAuth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary text-primary flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="logo-container p-2 bg-white rounded-full shadow-lg border border-accent-gold-fade">
                <Image 
                  src="/media/logoBianco.svg" 
                  alt="Logo Mister Vertex" 
                  width={40} 
                  height={40}
                  className="drop-shadow-sm"
                />
              </div>
              <span className="text-2xl font-bold text-white">Mister Vertex</span>
              <span className="text-sm text-gray-400 ml-4">Admin Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Richieste Pendenti</p>
                <p className="text-3xl font-bold text-white">
                  {emailRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Mail className="h-12 w-12 text-accent-gold" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Utenti Totali</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="h-12 w-12 text-accent-gold" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Richieste Approvate</p>
                <p className="text-3xl font-bold text-white">
                  {emailRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-accent-gold-weak text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Richieste Email
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-accent-gold-weak text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Utenti
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {emailRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Nessuna richiesta email</p>
                ) : (
                  emailRequests.map((request) => (
                    <div key={request.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{request.email}</p>
                          <p className="text-gray-400 text-sm">{formatDate(request.created_at)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {request.status === 'pending' ? 'In attesa' :
                             request.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                          </span>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleEmailAction(request.id, 'approve')}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEmailAction(request.id, 'reject')}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Utenti Registrati</h3>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="flex items-center space-x-2 lux-cta px-4 py-2 rounded-lg transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Crea Utente</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Nessun utente registrato</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{user.email}</p>
                            <p className="text-gray-400 text-sm">{formatDate(user.created_at)}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              user.role === 'abbonato_vip' ? 'bg-accent-gold-weak text-white' :
                              user.role === 'abbonato_premium' ? 'bg-blue-500/20 text-blue-400' :
                              user.role === 'abbonato_base' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Crea Nuovo Utente</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="lux-input w-full px-3 py-2"
                  placeholder="utente@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ruolo</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as User['role'])}
                  className="lux-select w-full px-3 py-2"
                >
                  <option value="guest">Guest</option>
                  <option value="abbonato_base">Abbonato Base</option>
                  <option value="abbonato_premium">Abbonato Premium</option>
                  <option value="abbonato_vip">Abbonato VIP</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="lux-link text-sm"
                  >
                    Genera
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassword}
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    className="lux-input w-full px-3 py-2 pr-10"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUser(false)
                    setNewUserEmail('')
                    setNewUserRole('guest')
                    setGeneratedPassword('')
                    setShowPassword(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 lux-cta text-white rounded-lg transition-colors"
                >
                  Crea Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}