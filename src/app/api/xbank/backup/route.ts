import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface PredictionBackup {
  id?: string
  title?: string
  event_name?: string
  category?: string
  odds?: number
  stake_amount?: number
  confidence?: number
  status: string
  bookmaker?: string
  bet_type?: string
  notes?: string
  created_at?: string
  user_id?: string
}

interface GroupBackup {
  id?: string
  name?: string
  description?: string
  created_at?: string
  user_id?: string
}

interface ScalataBackup {
  id?: string
  name?: string
  target_amount?: number
  current_amount?: number
  status?: string
  created_at?: string
  user_id?: string
}

interface PostBackup {
  id?: string
  title?: string
  content?: string
  category?: string
  created_at?: string
  user_id?: string
}

interface TransactionBackup {
  id?: string
  type?: string
  amount?: number
  description?: string
  created_at?: string
  user_id?: string
}

interface BackupData {
  predictions?: PredictionBackup[]
  groups?: GroupBackup[]
  scalate?: ScalataBackup[]
  board_posts?: PostBackup[]
  bankroll_transactions?: TransactionBackup[]
  settings?: Record<string, unknown>
  exported_at?: string
  version?: string
  user_id?: string
}

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'vip') {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'export') {
      // Esporta tutti i dati dell'utente
      const [predictions, groups, scalate, posts, transactions, settings] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', user.id),
        supabase.from('prediction_groups').select('*').eq('user_id', user.id),
        supabase.from('scalate').select('*').eq('user_id', user.id),
        supabase.from('board_posts').select('*').eq('user_id', user.id),
        supabase.from('bankroll_transactions').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      ])

      const backupData = {
        predictions: predictions.data || [],
        groups: groups.data || [],
        scalate: scalate.data || [],
        board_posts: posts.data || [],
        bankroll_transactions: transactions.data || [],
        settings: settings.data || {},
        exported_at: new Date().toISOString(),
        version: '1.0',
        user_id: user.id
      }

      // Salva il backup nel database
      await supabase.from('user_backups').insert({
        user_id: user.id,
        backup_data: backupData,
        backup_size: JSON.stringify(backupData).length
      })

      return NextResponse.json(backupData)
    } else {
      // Lista dei backup disponibili
      const { data: backups, error } = await supabase
        .from('user_backups')
        .select('id, created_at, backup_size')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Errore nel recupero backup:', error)
        return NextResponse.json({ error: 'Errore nel recupero backup' }, { status: 500 })
      }

      return NextResponse.json({ backups: backups || [] })
    }
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica ruolo VIP
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'vip') {
      return NextResponse.json({ error: 'Accesso riservato agli utenti VIP' }, { status: 403 })
    }

    const body = await request.json()
    const { backup_data, action }: { backup_data: BackupData; action: string } = body

    if (action === 'import') {
      // Validazione del formato
      if (!backup_data.version || !backup_data.exported_at) {
        return NextResponse.json({ error: 'Formato backup non valido' }, { status: 400 })
      }

      // Elimina i dati esistenti (in una transazione)
      const deletePromises = [
        supabase.from('predictions').delete().eq('user_id', user.id),
        supabase.from('prediction_groups').delete().eq('user_id', user.id),
        supabase.from('scalate').delete().eq('user_id', user.id),
        supabase.from('board_posts').delete().eq('user_id', user.id),
        supabase.from('bankroll_transactions').delete().eq('user_id', user.id)
      ]

      await Promise.all(deletePromises)

      // Importa i nuovi dati
      const importPromises = []
      
      if (backup_data.predictions?.length > 0) {
        importPromises.push(
          supabase.from('predictions').insert(
            backup_data.predictions.map((p: PredictionBackup) => ({ ...p, user_id: user.id }))
          )
        )
      }
      
      if (backup_data.groups?.length > 0) {
        importPromises.push(
          supabase.from('prediction_groups').insert(
            backup_data.groups.map((g: GroupBackup) => ({ ...g, user_id: user.id }))
          )
        )
      }
      
      if (backup_data.scalate?.length > 0) {
        importPromises.push(
          supabase.from('scalate').insert(
            backup_data.scalate.map((s: ScalataBackup) => ({ ...s, user_id: user.id }))
          )
        )
      }
      
      if (backup_data.board_posts?.length > 0) {
        importPromises.push(
          supabase.from('board_posts').insert(
            backup_data.board_posts.map((p: PostBackup) => ({ ...p, user_id: user.id }))
          )
        )
      }
      
      if (backup_data.bankroll_transactions?.length > 0) {
        importPromises.push(
          supabase.from('bankroll_transactions').insert(
            backup_data.bankroll_transactions.map((t: TransactionBackup) => ({ ...t, user_id: user.id }))
          )
        )
      }

      await Promise.all(importPromises)

      // Aggiorna le impostazioni
      if (backup_data.settings) {
        await supabase.from('user_settings').upsert({
          ...backup_data.settings,
          user_id: user.id
        })
      }

      // Salva il record dell'importazione
      await supabase.from('user_backups').insert({
        user_id: user.id,
        backup_data: backup_data,
        backup_size: JSON.stringify(backup_data).length,
        backup_type: 'import'
      })

      return NextResponse.json({ message: 'Backup importato con successo' })
    } else {
      // Crea un nuovo backup manuale
      const [predictions, groups, scalate, posts, transactions, settings] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', user.id),
        supabase.from('prediction_groups').select('*').eq('user_id', user.id),
        supabase.from('scalate').select('*').eq('user_id', user.id),
        supabase.from('board_posts').select('*').eq('user_id', user.id),
        supabase.from('bankroll_transactions').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      ])

      const backupData = {
        predictions: predictions.data || [],
        groups: groups.data || [],
        scalate: scalate.data || [],
        board_posts: posts.data || [],
        bankroll_transactions: transactions.data || [],
        settings: settings.data || {},
        exported_at: new Date().toISOString(),
        version: '1.0',
        user_id: user.id
      }

      const { data: backup, error } = await supabase
        .from('user_backups')
        .insert({
          user_id: user.id,
          backup_data: backupData,
          backup_size: JSON.stringify(backupData).length,
          backup_type: 'manual'
        })
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione backup:', error)
        return NextResponse.json({ error: 'Errore nella creazione backup' }, { status: 500 })
      }

      return NextResponse.json(backup, { status: 201 })
    }
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}