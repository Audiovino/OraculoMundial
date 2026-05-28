import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const code = process.argv[2] || '9CBQ5K';

const anon = await s.from('private_leagues').select('*').eq('invite_code', code);
console.log('anon select', anon.error?.message || 'ok', anon.data?.length);

const email = `q_${Date.now()}@t.local`;
const { data: auth } = await s.auth.signUp({ email, password: 'Qpass123!' });
const authed = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
});
const authSel = await authed.from('private_leagues').select('*').eq('invite_code', code);
console.log('authed select', authSel.error?.message || 'ok', authSel.data);
