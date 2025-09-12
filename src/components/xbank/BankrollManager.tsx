'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, RefreshCw } from 'lucide-react'

interface BankrollTransaction {
  id: string
  user_id: string
  prediction_id?: string
  transaction_type: 'bet' | 'win' | 'loss' | 'adjustment' | 'deposit' | 'withdrawal'
  amount: number
  description: string
  balance_before: number
  balance_after: number
  created_at: string
}

interface BankrollManagerProps {
  currentBankroll: number
  currency: string
  onBankrollUpdate: (newBankroll: number) => void
}

export default function BankrollManager({ currentBankroll, currency, onBankrollUpdate }: BankrollManagerProps) {
  const [transactions, setTransactions] = useState<BankrollTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form state per nuova transazione
  const [newTransaction, setNewTransaction] = useState<{
    transaction_type: 'bet' | 'win' | 'loss' | 'adjustment' | 'deposit' | 'withdrawal'
    amount: number
    description: string
  }>({
    transaction_type: 'deposit',
    amount: 0,
    description: ''
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    loadTransactions()
  }, [page, filterType])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (filterType !== 'all') {
        params.append('type', filterType)
      }

      const response = await fetch(`/api/xbank/bankroll?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions)
        setTotalPages(data.pagination.totalPages)
      } else {
        showToast('Errore nel caricamento delle transazioni', 'error')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      showToast('Errore nel caricamento delle transazioni', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      if (!newTransaction.description.trim() || newTransaction.amount === 0) {
        showToast('Compila tutti i campi', 'error')
        return
      }

      const response = await fetch('/api/xbank/bankroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newTransaction)
      })

      if (response.ok) {
        const data = await response.json()
        showToast('Transazione aggiunta con successo', 'success')
        setShowAddModal(false)
        setNewTransaction({
          transaction_type: 'deposit',
          amount: 0,
          description: ''
        })
        onBankrollUpdate(data.new_balance)
        loadTransactions()
      } else {
        const error = await response.json()
        showToast(error.error || 'Errore nell\'aggiunta della transazione', 'error')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      showToast('Errore nell\'aggiunta della transazione', 'error')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'win':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'withdrawal':
      case 'bet':
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      case 'adjustment':
        return <DollarSign className="h-4 w-4 text-orange-400" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-400" />
    }
  }



  const formatTransactionType = (type: string) => {
    const types: { [key: string]: string } = {
      'deposit': 'Deposito',
      'withdrawal': 'Prelievo',
      'bet': 'Scommessa',
      'win': 'Vincita',
      'loss': 'Perdita',
      'adjustment': 'Aggiustamento'
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-white ${
          toast.type === 'success' ? 'bg-emerald-500 border border-emerald-400' : 'bg-red-500 border border-red-400'
        } shadow-2xl transform transition-all duration-300`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-amber-900">Gestione Bankroll</h3>
          <p className="text-amber-700">Traccia depositi, prelievi e aggiustamenti</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Nuova Transazione</span>
        </button>
      </div>

      {/* Filtri */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2" role="search" aria-label="Filtri per le transazioni">
          <Filter className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <select
            id="transaction-filter"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setPage(1)
            }}
            className="bg-white/80 border border-amber-300 rounded-xl px-3 py-2 text-amber-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            aria-label="Filtra transazioni per tipo"
            aria-describedby="filter-help"
          >
            <option value="all">Tutte le transazioni</option>
            <option value="deposit">Depositi</option>
            <option value="withdrawal">Prelievi</option>
            <option value="bet">Scommesse</option>
            <option value="win">Vincite</option>
            <option value="loss">Perdite</option>
            <option value="adjustment">Aggiustamenti</option>
          </select>
          <div id="filter-help" className="sr-only">Seleziona il tipo di transazione da visualizzare</div>
        </div>
        <button
          onClick={loadTransactions}
          className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl px-2 py-1"
          aria-label="Ricarica lista transazioni"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Aggiorna</span>
        </button>
      </div>

      {/* Lista Transazioni */}
      <section className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-amber-200 shadow-lg" aria-label="Lista delle transazioni">
        {loading ? (
          <div className="p-8 text-center text-amber-700" role="status" aria-live="polite">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" aria-hidden="true" />
            <p>Caricamento transazioni...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-amber-700" role="status" aria-live="polite">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p>Nessuna transazione trovata</p>
          </div>
        ) : (
          <div className="divide-y divide-amber-200" role="list" aria-label={`${transactions.length} transazioni trovate`}>
            {transactions.map((transaction) => (
              <article key={transaction.id} className="p-4 hover:bg-amber-50 transition-colors" role="listitem">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div aria-hidden="true">{getTransactionIcon(transaction.transaction_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-900 font-medium">
                          {formatTransactionType(transaction.transaction_type)}
                        </span>
                        <span className={`text-sm font-bold ${
                          transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                          (transaction.transaction_type === 'adjustment' && transaction.amount > 0)
                            ? 'text-emerald-600' : 'text-red-600'
                        }`}
                        aria-label={`${transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                           (transaction.transaction_type === 'adjustment' && transaction.amount > 0) ? 'Entrata' : 'Uscita'} di ${Math.abs(transaction.amount).toFixed(2)} ${currency}`}
                        >
                          {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                           (transaction.transaction_type === 'adjustment' && transaction.amount > 0) ? '+' : '-'}
                          {Math.abs(transaction.amount).toFixed(2)} {currency}
                        </span>
                      </div>
                      <p className="text-amber-700 text-sm">{transaction.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-amber-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <time dateTime={transaction.created_at}>
                            {new Date(transaction.created_at).toLocaleDateString('it-IT')}
                          </time>
                        </span>
                        <span aria-label={`Saldo dopo la transazione: ${transaction.balance_after.toFixed(2)} ${currency}`}>
                          Balance: {transaction.balance_after.toFixed(2)} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Paginazione */}
      {totalPages > 1 && (
        <nav role="navigation" aria-label="Paginazione transazioni" className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/80 text-amber-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 transition-colors border border-amber-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Vai alla pagina precedente"
          >
            Precedente
          </button>
          <span className="text-amber-700 font-medium" aria-current="page" aria-live="polite">
            Pagina {page} di {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white/80 text-amber-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 transition-colors border border-amber-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Vai alla pagina successiva"
          >
            Successiva
          </button>
        </nav>
      )}

      {/* Modal Nuova Transazione */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md border border-amber-200 shadow-2xl">
            <h3 id="modal-title" className="text-xl font-bold text-amber-900 mb-4">Nuova Transazione</h3>
            
            <form role="form" aria-label="Form per aggiungere nuova transazione">
              <div className="space-y-4">
                <div>
                  <label htmlFor="transaction-type" className="block text-sm font-medium text-amber-800 mb-2">
                    Tipo di Transazione
                  </label>
                  <select
                    id="transaction-type"
                    value={newTransaction.transaction_type}
                    onChange={(e) => setNewTransaction({
                      ...newTransaction,
                      transaction_type: e.target.value as 'bet' | 'win' | 'loss' | 'adjustment' | 'deposit' | 'withdrawal'
                    })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    aria-describedby="transaction-type-help"
                  >
                    <option value="deposit">Deposito</option>
                    <option value="withdrawal">Prelievo</option>
                    <option value="adjustment">Aggiustamento</option>
                  </select>
                  <div id="transaction-type-help" className="sr-only">Seleziona il tipo di transazione da registrare</div>
                </div>
              
                <div>
                  <label htmlFor="transaction-amount" className="block text-sm font-medium text-amber-800 mb-2">
                    Importo ({currency})
                  </label>
                  <input
                    id="transaction-amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    placeholder="0.00"
                    aria-describedby="amount-help"
                    required
                  />
                  <div id="amount-help" className="sr-only">Inserisci l&apos;importo della transazione in {currency}</div>
                </div>
              
                <div>
                  <label htmlFor="transaction-description" className="block text-sm font-medium text-amber-800 mb-2">
                    Descrizione
                  </label>
                  <input
                    id="transaction-description"
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({
                      ...newTransaction,
                      description: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    placeholder="Descrizione della transazione"
                    aria-describedby="description-help"
                    required
                  />
                  <div id="description-help" className="sr-only">Inserisci una descrizione per identificare questa transazione</div>
                </div>
              </div>
            </form>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-amber-700 hover:text-amber-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-xl"
                aria-label="Chiudi modal senza salvare"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={addTransaction}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Salva nuova transazione"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}