import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

(async () => {
  const email = `schema_${Date.now()}@t.local`;
  const { data: auth } = await supabase.auth.signUp({ email, password: 'SchemaPass123!' });
  const uid = auth?.user?.id;
  console.log('user', uid);

  const tries = [
    { nombre: 'T1', creador_id: uid },
    { name: 'T2', creator_id: uid },
    { nombre: 'T3', codigo: 'ABC123', creador_id: uid },
    { nombre: 'T4', invite_code: 'ABC123', creator_id: uid },
    { nombre: 'T5', code: 'ABC123', created_by: uid },
  ];
  for (const row of tries) {
    const r = await supabase.from('private_leagues').insert([row]);
    console.log('insert', JSON.stringify(row), '->', r.error?.code, r.error?.message || 'ok');
    if (!r.error) console.log('  data', r.data);
  }
})();
