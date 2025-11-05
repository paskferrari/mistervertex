export type TransactionKind = 'deposit' | 'withdrawal' | 'adjustment'

export function validateAndComputeNewBalance(currentBalance: number, type: TransactionKind, amount: number) {
  if (!Number.isFinite(currentBalance)) {
    throw new Error('Saldo corrente non valido')
  }
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Importo non valido')
  }
  if ((type === 'deposit' || type === 'withdrawal') && amount <= 0) {
    throw new Error('L\'importo deve essere maggiore di 0')
  }

  const delta = type === 'deposit' ? Math.abs(amount) : type === 'withdrawal' ? -Math.abs(amount) : amount
  const newBalance = Math.round((currentBalance + delta) * 100) / 100
  if (newBalance < 0) {
    throw new Error('Fondi insufficienti per l\'operazione')
  }
  return { newBalance }
}