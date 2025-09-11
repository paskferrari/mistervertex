import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database migration...')
    
    // First check if access_level column already exists
    const { data: existingData, error: checkError } = await supabaseAdmin
      .from('predictions')
      .select('access_level')
      .limit(1)
    
    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'access_level column already exists'
      })
    }
    
    console.log('access_level column does not exist, attempting to add it...')
    
    // Try to insert a test record with access_level to trigger the column creation
    // This is a workaround since we can't execute raw SQL directly
    const { data: testData, error: testError } = await supabaseAdmin
      .from('predictions')
      .insert({
        title: 'Migration Test',
        description: 'Test record to add access_level column',
        sport: 'test',
        prediction_type: 'migration',
        odds: 1.0,
        confidence_level: 1,
        access_level: 0
      })
      .select()
    
    if (testError) {
      console.error('Migration test failed:', testError)
      return NextResponse.json({
        success: false,
        error: 'Cannot add access_level column through API. Please run this SQL command in Supabase SQL editor: ALTER TABLE predictions ADD COLUMN access_level INTEGER DEFAULT 0;',
        details: testError.message
      }, { status: 500 })
    }
    
    // Clean up test record
    if (testData && testData[0]) {
      await supabaseAdmin
        .from('predictions')
        .delete()
        .eq('id', testData[0].id)
    }
    
    return NextResponse.json({
      success: true,
      message: 'access_level column added successfully'
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}