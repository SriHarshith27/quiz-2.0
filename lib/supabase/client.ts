import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Supabase Client Error: Missing env vars', {
      url: url ? 'Defined' : 'Missing',
      key: key ? 'Defined' : 'Missing'
    });
  } else {
    // console.log('Supabase Client: Env vars loaded', { url, key: key.substring(0, 5) + '...' });
  }

  return createBrowserClient(url!, key!)
}
