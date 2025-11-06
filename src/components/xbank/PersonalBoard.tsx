'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Heart, Share2, Eye, Plus, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

interface BoardPost {
  id: string
  title: string
  content: string
  prediction_id?: string
  custom_prediction_id?: string
  post_type: 'prediction' | 'analysis' | 'tip' | 'discussion'
  visibility: 'public' | 'followers' | 'vip'
  tags: string[]
  likes_count: number
  comments_count: number
  views_count: number
  is_liked: boolean
  is_following_author: boolean
  author: {
    id: string
    username: string
    avatar_url?: string
    role: string
    followers_count: number
    win_rate?: number
  }
  prediction_data?: {
    sport: string
    odds: number
    stake: number
    status: string
    result?: string
  }
  created_at: string
  updated_at: string
}

interface PersonalBoardProps {
  currency: string
}

export default function PersonalBoard({ currency }: PersonalBoardProps) {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [myPosts, setMyPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts'>('feed')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }


  // Form state per nuovo post
  const [newPost, setNewPost] = useState<{
    title: string
    content: string
    post_type: 'prediction' | 'analysis' | 'tip' | 'discussion'
    visibility: 'public' | 'followers' | 'vip'
    tags: string[]
    prediction_id: string
    custom_prediction_id: string
  }>({
    title: '',
    content: '',
    post_type: 'discussion',
    visibility: 'public',
    tags: [],
    prediction_id: '',
    custom_prediction_id: ''
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadPosts()
    if (activeTab === 'my-posts') {
      loadMyPosts()
    }
  }, [activeTab])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/xbank/board/posts', {
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      if (!response.ok) throw new Error('Errore nel caricamento dei post')
      
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nel caricamento dei post')
    } finally {
      setLoading(false)
    }
  }

  const loadMyPosts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/xbank/board/my-posts', {
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      if (!response.ok) throw new Error('Errore nel caricamento dei tuoi post')
      
      const data = await response.json()
      setMyPosts(data)
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nel caricamento dei tuoi post')
    }
  }

  const createPost = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/xbank/board/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify(newPost)
      })
      
      if (!response.ok) throw new Error('Errore nella creazione del post')
      
      await loadPosts()
      if (activeTab === 'my-posts') {
        await loadMyPosts()
      }
      
      setShowCreateModal(false)
      setNewPost({
        title: '',
        content: '',
        post_type: 'discussion',
        visibility: 'public',
        tags: [],
        prediction_id: '',
        custom_prediction_id: ''
      })
      setTagInput('')
      showFeedback('success', 'Post pubblicato con successo')
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nella creazione del post')
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/xbank/board/posts/${postId}/like`, {
        method: 'POST'
        ,
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      
      if (!response.ok) throw new Error('Errore nel like')
      
      // Aggiorna i post localmente
      const updatePosts = (posts: BoardPost[]) => 
        posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
              }
            : post
        )
      
      setPosts(updatePosts)
      setMyPosts(updatePosts)
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nel like')
    }
  }

  const followUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/xbank/board/users/${userId}/follow`, {
        method: 'POST'
        ,
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      
      if (!response.ok) throw new Error('Errore nel follow')
      
      // Aggiorna i post localmente
      const updatePosts = (posts: BoardPost[]) => 
        posts.map(post => 
          post.author.id === userId 
            ? { 
                ...post, 
                is_following_author: !post.is_following_author,
                author: {
                  ...post.author,
                  followers_count: post.is_following_author 
                    ? post.author.followers_count - 1 
                    : post.author.followers_count + 1
                }
              }
            : post
        )
      
      setPosts(updatePosts)
      setMyPosts(updatePosts)
      
      const nowFollowing = !(posts.find(p => p.author.id === userId)?.is_following_author)
      showFeedback('success', nowFollowing ? 'Ora segui questo utente' : 'Non segui più questo utente')
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nel follow')
    }
  }

  const deletePost = (postId: string) => {
    setConfirmDeleteId(postId)
  }

  const confirmDeletePost = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/xbank/board/posts/${postId}`, {
        method: 'DELETE',
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
      })
      
      if (!response.ok) throw new Error('Errore nell\'eliminazione del post')
      
      await loadPosts()
      await loadMyPosts()
      setConfirmDeleteId(null)
      showFeedback('success', 'Post eliminato')
    } catch (error) {
      console.error('Errore:', error)
      showFeedback('error', 'Errore nell\'eliminazione del post')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'prediction': return 'Pronostico'
      case 'analysis': return 'Analisi'
      case 'tip': return 'Consiglio'
      case 'discussion': return 'Discussione'
      default: return type
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'bg-green-500/20 text-green-400'
      case 'analysis': return 'bg-blue-500/20 text-blue-400'
      case 'tip': return 'bg-orange-500/20 text-orange-400'
      case 'discussion': return 'bg-white/10 text-secondary'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }



  const filteredPosts = (activeTab === 'feed' ? posts : myPosts).filter(post => {
    if (filter !== 'all' && post.post_type !== filter) return false
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Feedback inline */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-lg px-3 py-2 text-sm border ${
            feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Bacheca Personale</h2>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nuovo Post</span>
        </button>
      </div>

      {/* Tabs */}
      <nav role="tablist" aria-label="Navigazione bacheca" className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          role="tab"
          aria-selected={activeTab === 'feed'}
          aria-controls="panel-feed"
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-3 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            activeTab === 'feed'
              ? 'bg-orange-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
          aria-label="Visualizza feed globale dei post"
        >
          <span className="hidden sm:inline">Feed Globale</span>
          <span className="sm:hidden">Feed</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'my-posts'}
          aria-controls="panel-my-posts"
          onClick={() => setActiveTab('my-posts')}
          className={`flex-1 py-3 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            activeTab === 'my-posts'
              ? 'bg-orange-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
          aria-label="Visualizza i tuoi post personali"
        >
          <span className="hidden sm:inline">I Miei Post</span>
          <span className="sm:hidden">Miei</span>
        </button>
      </nav>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3" role="search" aria-label="Filtri per la ricerca dei post">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" aria-hidden="true" />
            <input
              id="search-posts"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca nei post..."
              className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
              aria-label="Campo di ricerca per i post"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">Inserisci parole chiave per cercare nei post</div>
          </div>
        </div>
        
        <select
          id="filter-posts"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white px-3 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base min-h-[44px] w-full sm:w-auto"
          aria-label="Filtra per tipo di post"
          aria-describedby="filter-help"
        >
          <option value="all">Tutti i tipi</option>
          <option value="prediction">Pronostici</option>
          <option value="analysis">Analisi</option>
          <option value="tip">Consigli</option>
          <option value="discussion">Discussioni</option>
        </select>
        <div id="filter-help" className="sr-only">Seleziona il tipo di post da visualizzare</div>
      </div>

      {/* Lista Post */}
      <main 
        role="tabpanel" 
        id={activeTab === 'feed' ? 'panel-feed' : 'panel-my-posts'}
        aria-labelledby={activeTab === 'feed' ? 'tab-feed' : 'tab-my-posts'}
      >
        {filteredPosts.length === 0 ? (
          <div className="text-center text-gray-300 py-12" role="status" aria-live="polite">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p>Nessun post trovato. {activeTab === 'my-posts' ? 'Crea il tuo primo post!' : 'Sii il primo a pubblicare qualcosa!'}</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6" role="feed" aria-label={`Lista dei ${activeTab === 'feed' ? 'post globali' : 'tuoi post'}`}>
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg p-4 sm:p-6">
                {/* Header Post */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {post.author.avatar_url ? (
                      <Image 
                        src={post.author.avatar_url} 
                        alt={`Avatar di ${post.author.username}`} 
                        width={40} 
                        height={40} 
                        className="rounded-full object-cover"
                      />
                    ) : (
                       <div className="bg-white rounded-full p-1 shadow-lg border-2 border-gray-200">
                         <Image 
                           src="/media/logoColorato.png" 
                           alt="Avatar predefinito" 
                           width={36} 
                           height={36} 
                           className="rounded-full object-cover drop-shadow-sm"
                         />
                       </div>
                      )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h4 className="text-white font-medium truncate">{post.author.username}</h4>
                      <div className="flex items-center space-x-2">
                        {post.author.role === 'vip' && (
                          <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                          VIP
                        </span>
                        )}
                        {post.author.win_rate && (
                          <span className="text-gray-400 text-xs sm:text-sm">
                            {post.author.win_rate}% WR
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {post.author.followers_count} follower • {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}>
                    {getPostTypeLabel(post.post_type)}
                  </span>
                  
                  {activeTab === 'my-posts' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-400 hover:text-red-300 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {confirmDeleteId === post.id && (
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            onClick={() => confirmDeletePost(post.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Conferma
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Annulla
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenuto Post */}
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 break-words">{post.title}</h3>
                <p className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base break-words">{post.content}</p>
              </div>

              {/* Dati Pronostico */}
              {post.prediction_data && (
                <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-400">Sport</p>
                      <p className="text-white font-medium truncate">{post.prediction_data.sport}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Quota</p>
                      <p className="text-white font-medium">{post.prediction_data.odds}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stake</p>
                      <p className="text-white font-medium truncate">{post.prediction_data.stake} {currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stato</p>
                      <p className={`font-medium ${
                        post.prediction_data.status === 'won' ? 'text-green-400' :
                        post.prediction_data.status === 'lost' ? 'text-red-400' :
                        'text-orange-400'
                      }`}>
                        {post.prediction_data.status === 'won' ? 'Vinto' :
                         post.prediction_data.status === 'lost' ? 'Perso' :
                         post.prediction_data.status === 'void' ? 'Annullato' : 'In Corso'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                      <span key={index} className="bg-white/10 text-secondary border border-white/20 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                  ))}
                </div>
              )}

              {/* Azioni */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex space-x-3 sm:space-x-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center space-x-1 transition-colors p-1 min-h-[40px] ${
                      post.is_liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes_count}</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors p-1 min-h-[40px]">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 text-gray-400 p-1 min-h-[40px]">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{post.views_count}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 w-full sm:w-auto">
                  {activeTab === 'feed' && !post.is_following_author && (
                    <button
                      onClick={() => followUser(post.author.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm transition-colors min-h-[40px] flex-1 sm:flex-none"
                    >
                      Segui
                    </button>
                  )}
                  
                  <button className="text-gray-400 hover:text-white transition-colors p-2 min-h-[40px] min-w-[40px] flex items-center justify-center">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>

      {/* Modal Creazione Post */}
      {showCreateModal && (
        <div className="modal-root bg-black/60 backdrop-blur-md safe-area-sides">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-post-title"
            className="bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-sm rounded-2xl w-full max-w-2xl border border-gray-600/40 shadow-2xl modal-responsive modal-content-scroll mx-4"
          >
            <div className="modal-header flex items-center justify-between p-6 border-b border-gray-600/40">
              <h3 id="create-post-title" className="text-xl font-bold text-white">Crea Nuovo Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-300 hover:text-white p-2 rounded-lg min-h-[44px] min-w-[44px] touch-target"
                aria-label="Chiudi modale crea post"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 p-6 mobile-scroll">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Titolo</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Titolo del post"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={newPost.post_type}
                    onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value as 'prediction' | 'analysis' | 'tip' | 'discussion' })}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="discussion">Discussione</option>
                    <option value="prediction">Pronostico</option>
                    <option value="analysis">Analisi</option>
                    <option value="tip">Consiglio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Visibilità</label>
                  <select
                    value={newPost.visibility}
                    onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value as 'public' | 'followers' | 'vip' })}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="public">Pubblico</option>
                    <option value="followers">Solo Follower</option>
                    <option value="vip">Solo VIP</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Contenuto</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={6}
                  placeholder="Scrivi il contenuto del tuo post..."
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Aggiungi tag"
                  />
                  <button
                    onClick={addTag}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Aggiungi
                  </button>
                </div>
                
                {newPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newPost.tags.map((tag, index) => (
                      <span key={index} className="bg-white/10 text-secondary border border-white/20 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions flex justify-end space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors min-h-[44px] touch-target"
              >
                Annulla
              </button>
              <button
                onClick={createPost}
                disabled={!newPost.title.trim() || !newPost.content.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors min-h-[44px] touch-target"
              >
                Pubblica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}