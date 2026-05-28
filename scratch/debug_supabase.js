import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await supabase.from('mundial_users').select('id,email,username,created_at').limit(20);
  console.log('mundial_users error', error);
  console.log('mundial_users data', data);
  const { data: leagues, error: le } = await supabase.from('private_leagues').select('*').limit(20);
  console.log('private_leagues error', le);
  console.log('private_leagues data count', leagues ? leagues.length : 0);
})();
