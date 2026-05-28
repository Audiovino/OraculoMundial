import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const code = process.argv[2] || '9CBQ5K';

const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const email = `joiner_${Date.now()}@t.local`;
const { data: auth } = await s.auth.signUp({ email, password: 'JoinPass123!' });
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${auth.session.access_token}` } },
});

const league = await client.from('private_leagues').select('id,name,invite_code').eq('invite_code', code).single();
console.log('lookup', league.error?.message || 'ok', league.data);

if (league.data) {
  const member = await client.from('league_members').upsert([{ liga_id: league.data.id, user_id: auth.user.id }]);
  console.log('join', member.error?.code, member.error?.message || 'ok');
}
