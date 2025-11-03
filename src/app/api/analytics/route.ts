import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, payload, ts } = await request.json()
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Missing event name' }, { status: 400 })
    }

    // Se Supabase è configurato, prova a salvare l'evento
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabaseAdmin
          .from('cta_events')
          .insert({ name, payload, ts })
        if (error) {
          console.warn('Analytics insert error:', error.message)
        }
      } catch (e: any) {
        console.warn('Analytics store failed:', e?.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}