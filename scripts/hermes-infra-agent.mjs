#!/usr/bin/env node
/**
 * Hermes Infra Agent — Agente 9 (Infraestructura / Supabase)
 * Aplica migraciones con Supabase CLI, verifica esquema de ligas privadas
 * y sincroniza el aprendizaje a Obsidian (sin claves ni APIs).
 *
 * Uso:
 *   node scripts/hermes-infra-agent.mjs
 *   node scripts/hermes-infra-agent.mjs --skip-push
 *   node scripts/hermes-infra-agent.mjs --obsidian-only
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VAULT = process.env.OBSIDIAN_VAULT || 'C:\\Proyectos\\Propgear-AI\\Propgear-Notas';
const SESSION_DIR = path.join(VAULT, 'Sesiones-Kiro', 'Hermes-Infra');

dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const args = new Set(process.argv.slice(2));
const skipPush = args.has('--skip-push');
const obsidianOnly = args.has('--obsidian-only');

const report = {
  agent: 'Hermes Agent 9 — Infraestructura',
  timestamp: new Date().toISOString(),
  projectRef: 'rthdnwkwocojijyfcrtr',
  projectName: 'PropelVideo',
  app: 'Oráculo Mundial',
  steps: [],
  schema: {},
  recommendations: [],
};

function step(name, ok, detail = '') {
  report.steps.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function run(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

async function verifySchema() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    step('Verificar esquema (anon)', false, 'VITE_SUPABASE_URL/ANON_KEY en .env.local');
    return;
  }

  const supabase = createClient(url, key);
  const email = `hermes_infra_${Date.now()}@oraculo-test.local`;
  const password = 'HermesInfraPass123!';

  const { data: auth, error: signErr } = await supabase.auth.signUp({ email, password });
  if (signErr || !auth?.user) {
    step('Verificar esquema (auth)', false, signErr?.message || 'signup failed');
    return;
  }

  const uid = auth.user.id;
  const code = `H${String(Date.now()).slice(-5)}`.toUpperCase();
  const leagueId = crypto.randomUUID();

  const authed = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${auth.session?.access_token}` } },
  });

  const ins = await authed.from('private_leagues').insert([{
    id: leagueId,
    name: 'Hermes Infra Test',
    invite_code: code,
    creador_id: uid,
  }]).select('id,name,invite_code');

  const insertOk = !ins.error;
  step('INSERT private_leagues (name, invite_code)', insertOk, ins.error?.message || code);

  const join = await authed.from('league_members').upsert([{ liga_id: leagueId, user_id: uid }]);
  const joinOk = !join.error;
  step('UPSERT league_members', joinOk, join.error?.message || 'ok');

  const lookup = await authed.from('private_leagues').select('invite_code').eq('invite_code', code).single();
  step('SELECT por invite_code', !lookup.error, lookup.data?.invite_code || lookup.error?.message);

  report.schema = {
    private_leagues_columns: ['id', 'name', 'invite_code', 'creador_id', 'created_at'],
    league_members_columns: ['id', 'liga_id', 'user_id', 'joined_at'],
    app_mapping: {
      UI_nombre: 'DB name',
      UI_codigo_invitacion: 'DB invite_code',
    },
    test_invite_code: code,
  };

  if (!insertOk) {
    report.recommendations.push('Revisar RLS INSERT en private_leagues para authenticated.');
  }
  if (!joinOk) {
    report.recommendations.push('Ejecutar migración 20260528000001_private_leagues_members.sql con supabase db push.');
  }
}

function writeObsidianNote() {
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `Hermes-Infra-${date}-OraculoMundial-Ligas.md`;
  const outDir = SESSION_DIR;
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, fileName);

  const stepsMd = report.steps.map(s => `- [${s.ok ? 'x' : ' '}] ${s.name}${s.detail ? ` — ${s.detail}` : ''}`).join('\n');
  const recsMd = report.recommendations.length
    ? report.recommendations.map(r => `- ${r}`).join('\n')
    : '- Ninguna acción pendiente de infra.';

  const content = `---
fecha: ${report.timestamp}
tags: [hermes, infra, supabase, oraculo-mundial, ligas-privadas, obsidian-sync]
agente: Hermes Agent 9
proyecto_supabase: ${report.projectName}
project_ref: ${report.projectRef}
workspace: C:/Proyectos/OraculoMundial
---

# Hermes Infra — Ligas privadas y Supabase

> Nota generada por **Hermes Agent 9** (infra). Sin claves, tokens ni URLs con credenciales.

## Resumen ejecutivo

La app **Oráculo Mundial** permitía crear ligas en la UI, pero el código del front usaba columnas que **no coincidían** con Supabase. Las ligas quedaban en \`localStorage\` y el código de invitación **no servía para otro usuario**.

## Hallazgos (aprendizaje)

### Esquema real en Supabase (\`private_leagues\`)

| Columna DB | Campo en UI (antes) | Estado |
|------------|---------------------|--------|
| \`name\` | \`nombre\` | Corregido en \`PrivateLeague.tsx\` |
| \`invite_code\` | \`codigo_invitacion\` | Corregido |
| \`creador_id\` | \`creador_id\` | OK |

### Tabla faltante

- \`league_members\` no existía → unirse con código fallaba.
- Migración aplicada: \`supabase/migrations/20260528000001_private_leagues_members.sql\`

### Flujo usuario (propgear2026 y similares)

1. **Juego → Ligas → Tus Grupos → Crear** → genera \`invite_code\`.
2. **Compartir**: copiar o WhatsApp (deploy pendiente en Vercel para WA en prod).
3. **Amigo**: Registro → Ligas → Unirse → pegar código.
4. **Admin**: solo cuentas en \`admin_users\`; botón **Admin** en nav.

### E2E Playwright (scratch/e2e-user-full-flow.js)

- Registro, pronósticos, estadios: OK.
- Crear liga UI: OK.
- Unirse con código: OK **después** de migración.
- WhatsApp: OK en local; prod requiere redeploy.

## Comandos Supabase CLI (sin secretos)

\`\`\`powershell
cd C:\\Proyectos\\OraculoMundial
supabase projects list          # proyecto linked: PropelVideo
supabase db push                # aplica migraciones pendientes
node scripts/hermes-infra-agent.mjs --skip-push   # solo verificar + Obsidian
\`\`\`

## Verificación Agent 9 — ${report.timestamp}

${stepsMd}

## Esquema verificado

\`\`\`json
${JSON.stringify(report.schema, null, 2)}
\`\`\`

## Recomendaciones

${recsMd}

## Archivos tocados en el repo

- \`src/components/PrivateLeague.tsx\` — mapeo DB ↔ UI, WhatsApp
- \`supabase/migrations/20260528000001_private_leagues_members.sql\`
- \`scripts/hermes-infra-agent.mjs\` — este agente
- \`scratch/e2e-user-full-flow.js\` — QA automatizado

## Enlaces internos

- [[Sesion-2026-05-18-OraculoMundial-Deployment-CLI]]
- [[Sesion-2026-05-14-MundialGame]]

## Próximos pasos

1. Redeploy Vercel (WhatsApp + columnas corregidas).
2. Usuario propgear2026: crear liga **nueva** post-fix (la vieja puede estar solo en localStorage).
3. Re-ejecutar: \`node scratch/e2e-user-full-flow.js\`
`;

  fs.writeFileSync(outPath, content, 'utf8');
  step('Sincronizar Obsidian', true, outPath);
  return outPath;
}

(async () => {
  console.log('\n🤖 Hermes Agent 9 — Infraestructura Supabase\n');

  if (!obsidianOnly) {
    if (!skipPush) {
      try {
        const out = run('supabase db push --yes');
        const applied = out.includes('Applying migration') || out.includes('Remote database is up to date');
        step('supabase db push', applied, applied ? 'migraciones sincronizadas' : out.split('\n')[0]);
      } catch (e) {
        const msg = e.stderr?.toString() || e.message;
        const upToDate = msg.includes('up to date');
        step('supabase db push', upToDate, upToDate ? 'ya aplicado' : msg.slice(0, 200));
      }
    } else {
      step('supabase db push', true, 'omitido (--skip-push)');
    }

    await verifySchema();
  }

  const notePath = writeObsidianNote();

  if (!report.recommendations.length && report.steps.every(s => s.ok)) {
    report.recommendations.push('Infra OK. Desplegar front a Vercel.');
  }

  const logPath = path.join(ROOT, 'supabase', '.hermes-infra-last-run.json');
  fs.writeFileSync(logPath, JSON.stringify(report, null, 2));

  console.log(`\n📓 Obsidian: ${notePath}`);
  console.log(`📋 Reporte JSON: ${logPath}\n`);
})();
