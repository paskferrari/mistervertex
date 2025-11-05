import { describe, it, expect } from 'vitest'
import { validateAndComputeNewBalance } from '@/lib/xbank/bankroll'

describe('validateAndComputeNewBalance', () => {
  it('calcola correttamente il deposito', () => {
    const { newBalance } = validateAndComputeNewBalance(100, 'deposit', 50)
    expect(newBalance).toBe(150)
  })

  it('calcola correttamente il prelievo', () => {
    const { newBalance } = validateAndComputeNewBalance(100, 'withdrawal', 40)
    expect(newBalance).toBe(60)
  })

  it('impedisce saldo negativo', () => {
    expect(() => validateAndComputeNewBalance(10, 'withdrawal', 20)).toThrow(/Fondi insufficienti/)
  })

  it('accetta adjustment negativo', () => {
    const { newBalance } = validateAndComputeNewBalance(100, 'adjustment', -25.5)
    expect(newBalance).toBe(74.5)
  })

  it('rifiuta importi non numerici', () => {
    // @ts-expect-error test input non numerico
    expect(() => validateAndComputeNewBalance(100, 'deposit', 'a')).toThrow(/Importo non valido/)
  })

  // Nuovi casi: bankroll a saldo zero
  it('consente deposito con bankroll zero', () => {
    const { newBalance } = validateAndComputeNewBalance(0, 'deposit', 50)
    expect(newBalance).toBe(50)
  })

  it('impedisce prelievo con bankroll zero', () => {
    expect(() => validateAndComputeNewBalance(0, 'withdrawal', 10)).toThrow(/Fondi insufficienti/)
  })

  it('consente adjustment positivo con bankroll zero', () => {
    const { newBalance } = validateAndComputeNewBalance(0, 'adjustment', 25)
    expect(newBalance).toBe(25)
  })

  it('impedisce adjustment negativo che porta saldo sotto zero', () => {
    expect(() => validateAndComputeNewBalance(0, 'adjustment', -5)).toThrow(/Fondi insufficienti/)
  })
})