export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    const { data, error } = await supabase().auth.signInWithPassword({ email, password })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      const code = msg.includes('confirm') ? 401 : 400
      return NextResponse.json({ error: error.message }, { status: code })
    }
    return NextResponse.json({ user: data.user, session: data.session })
  } catch (e: any) {
    console.error('[auth/login] 500:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
