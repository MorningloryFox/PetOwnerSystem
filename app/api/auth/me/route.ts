export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ user })
  } catch (e: any) {
    console.error('[auth/me] 500:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
