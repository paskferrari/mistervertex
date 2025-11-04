export async function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  try {
    const body = JSON.stringify({ name, payload, ts: Date.now() })
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
  } catch {
    // Fallback silenzioso
  }
}