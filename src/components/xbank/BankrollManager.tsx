'use client'

import { useState, useEffect, useCallback } from 'react'
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
  currency: string
  onBankrollUpdate: (newBankroll: number) => void
  mock?: boolean
}

export default function BankrollManager({ currency, onBankrollUpdate, mock = false }: BankrollManagerProps) {
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
    // Mostra feedback inline non invasivo; evita overlay fissi
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      if (mock) {
        const sample: BankrollTransaction[] = [
          { id: 't1', user_id: 'mock', transaction_type: 'deposit', amount: 500, description: 'Deposito iniziale', balance_before: 1000, balance_after: 1500, created_at: new Date().toISOString() },
          { id: 't2', user_id: 'mock', transaction_type: 'bet', amount: 25, description: 'Scommessa Juve-Milan', balance_before: 1500, balance_after: 1475, created_at: new Date().toISOString() },
          { id: 't3', user_id: 'mock', transaction_type: 'win', amount: 52.5, description: 'Vincita pronostico', balance_before: 1475, balance_after: 1527.5, created_at: new Date().toISOString() }
        ]
        setTransactions(sample)
        setTotalPages(1)
      } else {
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
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      showToast('Errore nel caricamento delle transazioni', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, filterType, mock])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const addTransaction = async () => {
    try {
      if (!newTransaction.description.trim()) {
        showToast('La descrizione è obbligatoria', 'error')
        return
      }
      if (newTransaction.amount === 0) {
        showToast('Compila tutti i campi', 'error')
        return
      }
      if ((newTransaction.transaction_type === 'deposit' || newTransaction.transaction_type === 'withdrawal') && newTransaction.amount <= 0) {
        showToast('Importo deve essere maggiore di 0', 'error')
        return
      }
      if (mock) {
        const delta = ['deposit','win','adjustment'].includes(newTransaction.transaction_type) ? Math.abs(newTransaction.amount) : -Math.abs(newTransaction.amount)
        const latest = transactions[0]
        const newBalance = (latest?.balance_after ?? 1500) + delta
        const created: BankrollTransaction = {
          id: `mock-${Date.now()}`,
          user_id: 'mock',
          transaction_type: newTransaction.transaction_type,
          amount: newTransaction.amount,
          description: newTransaction.description,
          balance_before: latest?.balance_after ?? 1500,
          balance_after: newBalance,
          created_at: new Date().toISOString()
        }
        setTransactions(prev => [created, ...prev])
        showToast('Transazione aggiunta con successo', 'success')
        setShowAddModal(false)
        setNewTransaction({ transaction_type: 'deposit', amount: 0, description: '' })
        onBankrollUpdate(newBalance)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

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
        return <TrendingUp className="h-4 w-4 text-[var(--accent-gold)]" />
      case 'withdrawal':
      case 'bet':
      case 'loss':
        return <TrendingDown className="h-4 w-4 text-secondary" />
      case 'adjustment':
        return <DollarSign className="h-4 w-4 text-secondary" />
      default:
        return <DollarSign className="h-4 w-4 text-secondary" />
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
        <div className={`mb-3 p-3 rounded-xl bg-white/5 border border-[var(--accent-gold)] text-primary`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary">Gestione Bankroll</h3>
          <p className="text-secondary">Traccia depositi, prelievi e aggiustamenti</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>Nuova Transazione</span>
        </button>
      </div>

      {/* Filtri */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2" role="search" aria-label="Filtri per le transazioni">
          <Filter className="h-4 w-4 text-secondary" aria-hidden="true" />
          <select
            id="transaction-filter"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setPage(1)
            }}
            className="lux-select px-3 py-2 text-sm min-h-[44px]"
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
          className="btn-secondary flex items-center space-x-2 px-2 py-1 min-h-[44px]"
          aria-label="Ricarica lista transazioni"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Aggiorna</span>
        </button>
      </div>

      {/* Lista Transazioni */}
      <section className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-lg" aria-label="Lista delle transazioni">
        {loading ? (
          <div className="p-8 text-center text-secondary" role="status" aria-live="polite">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" aria-hidden="true" />
            <p>Caricamento transazioni...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-secondary" role="status" aria-live="polite">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
            <p className="mb-3">Il tuo bankroll è vuoto. Puoi iniziare aggiungendo una transazione.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary px-4 py-2 rounded-xl"
                aria-label="Apri il form per aggiungere una nuova transazione"
              >
                Aggiungi Transazione
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]" role="list" aria-label={`${transactions.length} transazioni trovate`}>
            {transactions.map((transaction) => (
              <article key={transaction.id} className="p-4 hover:bg-white/10 transition-colors" role="listitem">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div aria-hidden="true">{getTransactionIcon(transaction.transaction_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-primary font-medium">
                          {formatTransactionType(transaction.transaction_type)}
                        </span>
                        <span className={`text-sm font-bold ${
                          transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                          (transaction.transaction_type === 'adjustment' && transaction.amount > 0)
                            ? 'text-[var(--accent-gold)]' : 'text-secondary'
                        }`}
                        aria-label={`${transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                           (transaction.transaction_type === 'adjustment' && transaction.amount > 0) ? 'Entrata' : 'Uscita'} di ${Math.abs(transaction.amount).toFixed(2)} ${currency}`}
                        >
                          {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'win' || 
                           (transaction.transaction_type === 'adjustment' && transaction.amount > 0) ? '+' : '-'}
                          {Math.abs(transaction.amount).toFixed(2)} {currency}
                        </span>
                      </div>
                      <p className="text-secondary text-sm">{transaction.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-secondary mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          <time dateTime={transaction.created_at} suppressHydrationWarning>
                            {new Date(transaction.created_at).toLocaleDateString('it-IT', { timeZone: 'UTC' })}
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
            className="btn-secondary px-4 py-2 rounded-xl min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Vai alla pagina precedente"
          >
            Precedente
          </button>
          <span className="text-secondary font-medium" aria-current="page" aria-live="polite">
            Pagina {page} di {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-4 py-2 rounded-xl min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Vai alla pagina successiva"
          >
            Successiva
          </button>
        </nav>
      )}

      {/* Modal Nuova Transazione */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="card p-6 w-full max-w-md">
            <h3 id="modal-title" className="text-xl font-bold text-primary mb-4">Nuova Transazione</h3>
            
            <form role="form" aria-label="Form per aggiungere nuova transazione">
              <div className="space-y-4">
                <div>
                  <label htmlFor="transaction-type" className="block text-sm font-medium text-secondary mb-2">
                    Tipo di Transazione
                  </label>
                  <select
                    id="transaction-type"
                    value={newTransaction.transaction_type}
                    onChange={(e) => setNewTransaction({
                      ...newTransaction,
                      transaction_type: e.target.value as 'bet' | 'win' | 'loss' | 'adjustment' | 'deposit' | 'withdrawal'
                    })}
                    className="lux-select w-full px-3 py-2 min-h-[44px]"
                    aria-describedby="transaction-type-help"
                  >
                    <option value="deposit">Deposito</option>
                    <option value="withdrawal">Prelievo</option>
                    <option value="adjustment">Aggiustamento</option>
                  </select>
                  <div id="transaction-type-help" className="sr-only">Seleziona il tipo di transazione da registrare</div>
                </div>
              
                <div>
                  <label htmlFor="transaction-amount" className="block text-sm font-medium text-secondary mb-2">
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
                    className="lux-input w-full px-3 py-2 min-h-[44px]"
                    placeholder="0.00"
                    aria-describedby="amount-help"
                    required
                  />
                  <div id="amount-help" className="sr-only">Inserisci l&apos;importo della transazione in {currency}</div>
                </div>
              
                <div>
                  <label htmlFor="transaction-description" className="block text-sm font-medium text-secondary mb-2">
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
                    className="lux-input w-full px-3 py-2 min-h-[44px]"
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
                className="btn-secondary px-4 py-2 rounded-xl min-h-[44px]"
                aria-label="Chiudi modal senza salvare"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={addTransaction}
                className="btn-primary px-4 py-2 rounded-2xl min-h-[44px]"
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