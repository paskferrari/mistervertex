import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Crea la tabella wallet
    const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS wallet (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
          stake_amount DECIMAL(10,2),
          notes TEXT,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
          result VARCHAR(20) DEFAULT 'pending' CHECK (result IN ('win', 'loss', 'void', 'pending')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, prediction_id)
        );
        
        -- Crea indici per migliorare le performance
        CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
        CREATE INDEX IF NOT EXISTS idx_wallet_prediction_id ON wallet(prediction_id);
        CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallet(status);
        CREATE INDEX IF NOT EXISTS idx_wallet_created_at ON wallet(created_at);
        
        -- Abilita RLS (Row Level Security)
        ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
        
        -- Policy per permettere agli utenti di vedere solo i propri wallet items
        CREATE POLICY IF NOT EXISTS "Users can view own wallet items" ON wallet
          FOR SELECT USING (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di inserire nel proprio wallet
        CREATE POLICY IF NOT EXISTS "Users can insert own wallet items" ON wallet
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di aggiornare i propri wallet items
        CREATE POLICY IF NOT EXISTS "Users can update own wallet items" ON wallet
          FOR UPDATE USING (auth.uid() = user_id);
        
        -- Policy per permettere agli utenti di eliminare i propri wallet items
        CREATE POLICY IF NOT EXISTS "Users can delete own wallet items" ON wallet
          FOR DELETE USING (auth.uid() = user_id);
      `
    })

    if (createTableError) {
      console.error('Error creating wallet table:', createTableError)
      return NextResponse.json(
        { error: 'Errore nella creazione della tabella wallet', details: createTableError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Tabella wallet creata con successo',
      success: true
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}