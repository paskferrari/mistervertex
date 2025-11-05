import { describe, it, expect } from 'vitest'
import { shouldShowCreateCTA, type Scalata } from '@/lib/xbank/scalate'

describe('shouldShowCreateCTA', () => {
  it('ritorna true quando la lista è vuota', () => {
    const list: Scalata[] = []
    expect(shouldShowCreateCTA(list)).toBe(true)
  })

  it('ritorna false quando esiste almeno una scalata', () => {
    const list: Scalata[] = [{ id: '1', name: 'Test', status: 'active' } as unknown as Scalata]
    expect(shouldShowCreateCTA(list)).toBe(false)
  })

  it('ritorna false quando l’input non è un array', () => {
    // @ts-expect-error input non array
    expect(shouldShowCreateCTA(undefined)).toBe(false)
    // @ts-expect-error input non array
    expect(shouldShowCreateCTA(null)).toBe(false)
  })
})