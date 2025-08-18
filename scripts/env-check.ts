const names = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];
for (const n of names) {
  console.log(`${n}=${process.env[n] ? '[SET]' : '[MISSING]'}`);
}
