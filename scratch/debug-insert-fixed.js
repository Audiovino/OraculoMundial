import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const email = `fixtest_${Date.now()}@t.local`;
const { data: auth } = await s.auth.signUp({ email, password: 'FixPass123!' });
const uid = auth.user.id;

const ins = await s
  .from('private_leagues')
  .insert([{ id: crypto.randomUUID(), name: 'Test Liga', invite_code: 'FIX123', creador_id: uid }])
  .select();
console.log('insert', ins.error?.message || 'ok', ins.data);

const sel = await s.from('private_leagues').select('*').eq('invite_code', 'FIX123');
console.log('select', sel.error?.message || 'ok', sel.data);
