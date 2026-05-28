import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const email = `debug_${Date.now()}@test.local`;
const password = 'DebugPass123!';

(async () => {
  const { data: auth, error: signErr } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: 'debuguser' } },
  });
  console.log('signUp', signErr?.message || 'ok', auth?.user?.id);

  if (!auth?.user) return;

  const profile = await supabase.from('mundial_users').upsert([{
    id: auth.user.id,
    user_id: auth.user.id,
    email,
    username: 'debuguser',
  }], { onConflict: 'id' });
  console.log('mundial_users upsert', profile.error?.message || 'ok');

  const league = await supabase.from('private_leagues').insert([{
    id: crypto.randomUUID(),
    nombre: 'Debug Liga',
    codigo_invitacion: 'DBG123',
    creador_id: auth.user.id,
  }]);
  console.log('private_leagues insert', league.error?.code, league.error?.message || 'ok', league.data);

  const join = await supabase.from('league_members').upsert([{
    liga_id: league.data?.[0]?.id || '00000000-0000-0000-0000-000000000001',
    user_id: auth.user.id,
  }]);
  console.log('league_members upsert', join.error?.code, join.error?.message || 'ok');
})();
