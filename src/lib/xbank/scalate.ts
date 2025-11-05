export interface Scalata {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'failed' | 'paused'
}

// Ritorna true quando non ci sono scalate: usato per mostrare la CTA
export function shouldShowCreateCTA(list: Scalata[]): boolean {
  return Array.isArray(list) && list.length === 0
}