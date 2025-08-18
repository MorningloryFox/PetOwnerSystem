async function main() {
  const base = process.env.BASE_URL || 'http://localhost:3000'

  // 1) Login
  const r1 = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email: process.env.TEST_USER!, password: process.env.TEST_PASS! })
  })
  const j1: any = await r1.json().catch(() => ({}))

  console.log('[login] status=', r1.status, 'keys=', Object.keys(j1))

  // 2) Me
  const token = j1?.session?.access_token
  const r2 = await fetch(`${base}/api/auth/me`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const j2: any = await r2.json().catch(() => ({}))
  console.log('[me] status=', r2.status, 'keys=', Object.keys(j2))
}
main().catch(e=>{ console.error(e); process.exit(1) })
