export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseServer = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('[auth/me] getUser error:', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (e:any) {
    console.error('[auth/me] 500:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
