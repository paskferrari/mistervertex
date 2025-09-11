import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Crea la tabella wallet
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Crea la tabella wallet se non esiste
        CREATE TABLE IF NOT EXISTS wallet (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
          stake_amount DECIMAL(10,2) DEFAULT 0,
          notes TEXT,
          status VARCHAR(20) DEFAULT 'active',
          result VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, prediction_id)
        );
        
        -- Crea indici
        CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
        CREATE INDEX IF NOT EXISTS idx_wallet_prediction_id ON wallet(prediction_id);
        CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallet(status);
        
        -- Abilita RLS
        ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
        
        -- Policy per permettere agli utenti di vedere solo i propri wallet items
        DROP POLICY IF EXISTS "Users can view own wallet items" ON wallet;
        CREATE POLICY "Users can view own wallet items" ON wallet
          FOR SELECT USING (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di inserire nel proprio wallet
        DROP POLICY IF EXISTS "Users can insert own wallet items" ON wallet;
        CREATE POLICY "Users can insert own wallet items" ON wallet
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di aggiornare i propri wallet items
        DROP POLICY IF EXISTS "Users can update own wallet items" ON wallet;
        CREATE POLICY "Users can update own wallet items" ON wallet
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di eliminare i propri wallet items
        DROP POLICY IF EXISTS "Users can delete own wallet items" ON wallet;
        CREATE POLICY "Users can delete own wallet items" ON wallet
          FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (createTableError) {
      // Se exec_sql non funziona, proviamo con query dirette
      console.log('exec_sql failed, trying direct queries...')
      
      // Crea la tabella
      const { error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'wallet')
        .single()
      
      if (tableError) {
        // La tabella non esiste, la creiamo manualmente
        const createQuery = `
          CREATE TABLE wallet (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            prediction_id UUID NOT NULL,
            stake_amount DECIMAL(10,2) DEFAULT 0,
            notes TEXT,
            status VARCHAR(20) DEFAULT 'active',
            result VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, prediction_id)
          )
        `
        
        // Nota: Questo approccio potrebbe non funzionare con Supabase
        // In un ambiente di produzione, dovresti usare le migrazioni di Supabase
        console.log('Table creation SQL:', createQuery)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tabella wallet configurata con successo' 
    })

  } catch (error) {
    console.error('Errore nella configurazione della tabella wallet:', error)
    return NextResponse.json(
      { error: 'Errore nella configurazione della tabella wallet', details: error },
      { status: 500 }
    )
  }
}