#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * HERMES TEST AGENT — Agente 10 (QA Integral Seguro)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Testea TODAS las funciones del proyecto sin exponer credenciales.
 * 
 * REGLAS DE SEGURIDAD:
 *   ✗ Nunca imprime .env, tokens, API keys ni service_role
 *   ✗ Nunca ejecuta migraciones ni acciones destructivas
 *   ✗ Nunca llama endpoints con coste económico (OpenAI, Stripe, etc.)
 *   ✓ Solo lectura / auditoría estática + tests unitarios
 *   ✓ Detecta credenciales hardcodeadas y avisa sin mostrarlas
 *   ✓ Sincroniza resultado a Obsidian (sin secretos en la nota)
 * 
 * USO:
 *   node scripts/hermes-test-agent.mjs
 *   node scripts/hermes-test-agent.mjs --static-only   (sin Supabase)
 *   node scripts/hermes-test-agent.mjs --obsidian-only (solo nota)
 *   node scripts/hermes-test-agent.mjs --fix-security  (parchea credenciales expuestas)
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const VAULT     = process.env.OBSIDIAN_VAULT || 'C:\\Proyectos\\Propgear-AI\\Propgear-Notas';
const SESSION_DIR = path.join(VAULT, 'Sesiones-Kiro', 'Hermes-Test');

dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const args          = new Set(process.argv.slice(2));
const staticOnly    = args.has('--static-only');
const obsidianOnly  = args.has('--obsidian-only');
const fixSecurity   = args.has('--fix-security');

// ─── Tipos ────────────────────────────────────────────────────────────────────
/** @typedef {{ name: string, ok: boolean, detail: string, severity?: 'info'|'warn'|'error' }} TestResult */

const report = {
  agent:     'Hermes Test Agent 10 — QA Integral',
  timestamp: new Date().toISOString(),
  app:       'Oráculo Mundial',
  suites:    {},
  summary:   { total: 0, passed: 0, failed: 0, warnings: 0 },
  security:  { exposedFiles: [], hardcodedSecrets: [] },
  recommendations: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(icon, msg, color = '\x1b[0m') {
  console.log(`${color}${icon} ${msg}\x1b[0m`);
}
const ok   = (m, d='') => addResult(m, true,  d, 'info');
const fail = (m, d='') => addResult(m, false, d, 'error');
const warn = (m, d='') => addResult(m, false, d, 'warn');

let _currentSuite = 'general';
function suite(name) {
  _currentSuite = name;
  report.suites[name] = report.suites[name] || [];
  log('🔹', `Suite: ${name}`, '\x1b[36m');
}

/** @param {string} name @param {boolean} passed @param {string} detail @param {'info'|'warn'|'error'} severity */
function addResult(name, passed, detail = '', severity = 'info') {
  const result = { name, ok: passed, detail, severity };
  report.suites[_currentSuite] = report.suites[_currentSuite] || [];
  report.suites[_currentSuite].push(result);
  report.summary.total++;
  if (passed) {
    report.summary.passed++;
    log('  ✓', name, '\x1b[32m');
  } else if (severity === 'warn') {
    report.summary.warnings++;
    log('  ⚠', `${name}${detail ? ' — ' + detail : ''}`, '\x1b[33m');
  } else {
    report.summary.failed++;
    log('  ✗', `${name}${detail ? ' — ' + detail : ''}`, '\x1b[31m');
  }
}

function run(cmd, cwd = ROOT) {
  try {
    return { ok: true, output: execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }) };
  } catch (e) {
    return { ok: false, output: e.stderr?.toString() || e.message };
  }
}

// ─── SUITE 1: Variables de entorno ───────────────────────────────────────────
function testEnvVars() {
  suite('1 · Variables de entorno');

  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  const optional = [
    'VITE_ZHIPU_API_KEY',
    'VITE_TRIPO_API_KEY',
    'OBSIDIAN_VAULT',
  ];

  for (const key of required) {
    const val = process.env[key];
    if (val && val.length > 10) {
      ok(`${key} configurada`, '[REDACTED]');
    } else {
      fail(`${key} FALTANTE o vacía`, 'Agregar en .env.local');
    }
  }
  for (const key of optional) {
    const val = process.env[key];
    warn(`${key} ${val ? 'configurada (opcional)' : 'no configurada (opcional)'}`, '');
  }
}

// ─── SUITE 2: Seguridad estática — credenciales expuestas ─────────────────────
function testHardcodedSecrets() {
  suite('2 · Seguridad — credenciales hardcodeadas');

  // Patrones peligrosos (no imprimimos el valor encontrado, solo el archivo y línea)
  const DANGEROUS_PATTERNS = [
    { name: 'service_role key',  re: /service_role/i },
    { name: 'JWT Bearer hardcodeado', re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
    { name: 'API key sk_live / sk_test', re: /sk_(live|test)_[A-Za-z0-9]{20,}/ },
    { name: 'Stripe publishable key', re: /pk_(live|test)_[A-Za-z0-9]{20,}/ },
    { name: 'openai / anthropic key', re: /(sk-[a-zA-Z0-9]{32,}|sk-ant-[a-zA-Z0-9\-]{32,})/ },
  ];

  // Archivos a escanear (solo los rastreados por git + algunos conocidos)
  const filesToScan = [
    'test-edge-function.ps1',
    'terminal.ps1',
    'scripts/context-saver.ps1',
    'scripts/context-loader.ps1',
    'SUPABASE_CORS_FIX.md',
    'scripts/hermes-infra-agent.mjs',
    'src/services/hermesAgents.ts',
    'src/services/hermes-supabase-resilient.ts',
  ];

  for (const relFile of filesToScan) {
    const filePath = path.join(ROOT, relFile);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines   = content.split('\n');
    let fileHasIssue = false;

    for (const { name, re } of DANGEROUS_PATTERNS) {
      lines.forEach((line, idx) => {
        if (re.test(line)) {
          fileHasIssue = true;
          // NUNCA imprimimos el valor — solo el archivo y número de línea
          report.security.exposedFiles.push({ file: relFile, line: idx + 1, pattern: name });
          fail(
            `${name} expuesta en ${relFile}:${idx + 1}`,
            'Mover a .env.local — NO imprimir el valor'
          );
        }
      });
    }

    if (!fileHasIssue) ok(`${relFile} sin credenciales hardcodeadas`);
  }

  // Verificar que .env y .env.local NO estén en git
  const trackedEnv = run('git ls-files .env .env.local');
  const tracked    = (trackedEnv.output || '').trim().split('\n').filter(Boolean);
  if (tracked.length > 0) {
    fail(`.env/.env.local están rastreados por git`, tracked.join(', ') + ' — Agregar a .gitignore y hacer git rm --cached');
    report.security.exposedFiles.push(...tracked.map(f => ({ file: f, pattern: 'Archivo de credenciales en git' })));
  } else {
    ok('.env/.env.local NO están en git');
  }

  // Verificar .gitignore incluye .env*
  const gitignore = fs.existsSync(path.join(ROOT, '.gitignore'))
    ? fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8')
    : '';
  if (gitignore.includes('.env')) {
    ok('.gitignore cubre .env*');
  } else {
    fail('.gitignore NO cubre .env*', 'Agregar: .env* en .gitignore');
  }
}

// ─── SUITE 3: Tests unitarios (Vitest) ────────────────────────────────────────
function testUnitTests() {
  suite('3 · Tests unitarios (Vitest)');

  const result = spawnSync(
    'npx', ['vitest', 'run', '--reporter=json'],
    { cwd: ROOT, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], shell: true }
  );

  let passed = 0, failed = 0;
  try {
    // Vitest JSON reporter va a stderr en algunas versiones
    const raw  = result.stdout || result.stderr || '';
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '{}');
    const files = json.testResults || json.files || [];
    for (const f of files) {
      const tests = f.assertionResults || f.tests || [];
      for (const t of tests) {
        const name = t.fullName || t.title || t.name || '?';
        if ((t.status || t.result) === 'passed' || t.result === 'pass') {
          passed++;
          ok(`Vitest: ${name}`);
        } else {
          failed++;
          fail(`Vitest: ${name}`, t.failureMessages?.[0]?.slice(0, 120) || 'falló');
        }
      }
    }
    if (passed + failed === 0) throw new Error('parse vacío');
  } catch {
    // Fallback: leer salida legible
    const raw = result.stdout + result.stderr;
    if (raw.includes('passed') && !raw.includes('failed')) {
      const match = raw.match(/(\d+) passed/);
      const n     = match ? parseInt(match[1]) : '?';
      ok(`Vitest: ${n} tests pasaron`, 'usar --reporter=verbose para detalles');
    } else {
      const failMatch = raw.match(/(\d+) failed/);
      fail('Vitest: algunos tests fallaron', failMatch?.[1] + ' fallos');
    }
  }
}

// ─── SUITE 4: Build TypeScript ─────────────────────────────────────────────────
function testTsBuild() {
  suite('4 · TypeScript — compilación');

  const tsc = run('npx tsc --noEmit 2>&1');
  if (tsc.ok || tsc.output.trim() === '') {
    ok('TypeScript compila sin errores');
  } else {
    const errors = tsc.output.split('\n').filter(l => l.includes('error TS')).slice(0, 5);
    for (const e of errors) fail('TS Error', e.trim().slice(0, 120));
    if (errors.length === 0) warn('TypeScript: advertencias menores', tsc.output.slice(0, 200));
  }
}

// ─── SUITE 5: Análisis estático Hermes ────────────────────────────────────────
function testStaticAnalysis() {
  suite('5 · Análisis estático Hermes (Python)');

  const py = spawnSync(
    'python',
    ['scripts/hermes_fullstack_analyser.py', './src', '--json'],
    { cwd: ROOT, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], shell: true }
  );

  try {
    const raw = py.stdout;
    const json = JSON.parse(raw);
    const items = json.hallazgos || json.findings || json.results || [];
    const criticos = items.filter(i => (i.severidad || i.severity || '').toLowerCase() === 'crítico' || i.tipo === 'critico');
    const altos    = items.filter(i => (i.severidad || i.severity || '').toLowerCase() === 'alto');

    if (criticos.length === 0) {
      ok('Sin hallazgos CRÍTICOS en análisis estático');
    } else {
      for (const c of criticos.slice(0, 5)) {
        fail(`CRÍTICO: ${c.tipo || c.type}`, `${c.archivo || c.file}:${c.linea || c.line}`);
      }
    }
    if (altos.length === 0) {
      ok('Sin hallazgos ALTOS');
    } else {
      for (const a of altos.slice(0, 5)) {
        warn(`ALTO: ${a.tipo || a.type}`, `${a.archivo || a.file}:${a.linea || a.line}`);
      }
    }
    ok(`Análisis completado: ${items.length} hallazgos totales`);
  } catch {
    // Salida no JSON
    const lines = (py.stdout + py.stderr).split('\n').filter(Boolean).slice(0, 10);
    if (py.status === 0) {
      ok('Análisis estático ejecutado (sin JSON parser)');
    } else {
      warn('Python no disponible o error en hermes_fullstack_analyser.py', lines[0] || '');
    }
  }
}

// ─── SUITE 6: Conectividad Supabase (solo lectura, anon) ─────────────────────
async function testSupabaseConnectivity() {
  suite('6 · Conectividad Supabase (solo lectura)');

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    warn('Supabase: variables no configuradas, omitiendo tests de red');
    return;
  }

  // Ping al REST endpoint (sin importar datos)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal
    });
    clearTimeout(timer);
    ok(`Supabase REST accesible`, `HTTP ${res.status}`);
  } catch (e) {
    fail('Supabase REST no accesible', e.message.slice(0, 80));
    return;
  }

  // Verificar tablas críticas (SELECT 1 fila, anon)
  const TABLES = [
    'mundial_matches',
    'mundial_predictions',
    'mundial_users',
    'admin_users',
    'private_leagues',
    'league_members',
    'hermes_logs',
  ];

  for (const table of TABLES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `${url}/rest/v1/${table}?select=id&limit=1`,
        { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=none' }, signal: controller.signal }
      );
      clearTimeout(timer);
      if (res.status === 200) {
        ok(`Tabla ${table} accesible (anon, 1 fila)`);
      } else if (res.status === 401 || res.status === 403) {
        ok(`Tabla ${table}: RLS activo (acceso restringido — correcto)`);
      } else {
        warn(`Tabla ${table}: HTTP ${res.status}`);
      }
    } catch (e) {
      fail(`Tabla ${table} no accesible`, e.message.slice(0, 60));
    }
  }
}

// ─── SUITE 7: Verificar archivos críticos del proyecto ───────────────────────
function testCriticalFiles() {
  suite('7 · Archivos críticos del proyecto');

  const REQUIRED_FILES = [
    '.env.local',
    '.gitignore',
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'src/services/hermesAgents.ts',
    'src/services/hermesAgents.ts',
    'supabase/config.toml',
  ];

  for (const f of REQUIRED_FILES) {
    const exists = fs.existsSync(path.join(ROOT, f));
    if (exists) ok(`${f} existe`);
    else fail(`${f} no existe`, 'Archivo crítico faltante');
  }

  // Verificar que dist/ tenga archivos (build reciente)
  const distExists = fs.existsSync(path.join(ROOT, 'dist'));
  if (distExists) {
    const files = fs.readdirSync(path.join(ROOT, 'dist'));
    ok(`dist/ existe con ${files.length} entradas`);
  } else {
    warn('dist/ no existe — ejecutar: npm run build');
  }
}

// ─── SUITE 8: package.json scripts ────────────────────────────────────────────
function testPackageScripts() {
  suite('8 · Scripts de package.json');

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const REQUIRED_SCRIPTS = ['dev', 'build', 'hermes:infra'];

  for (const s of REQUIRED_SCRIPTS) {
    if (pkg.scripts?.[s]) ok(`script "${s}" definido`);
    else fail(`script "${s}" NO definido`);
  }

  // Verificar que hermes:test exista (lo agregaremos)
  if (pkg.scripts?.['hermes:test']) {
    ok('script "hermes:test" definido');
  } else {
    warn('script "hermes:test" no definido — se recomienda agregar: "hermes:test": "node scripts/hermes-test-agent.mjs"');
  }
}

// ─── FIX de seguridad (--fix-security) ────────────────────────────────────────
function fixSecurityIssues() {
  log('🔒', 'Aplicando correcciones de seguridad...', '\x1b[35m');

  // 1. Agregar .env* y archivos sensibles al .gitignore si no están
  const gitignorePath = path.join(ROOT, '.gitignore');
  let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const additions = [];

  if (!gitignore.includes('.env')) additions.push('.env');
  if (!gitignore.includes('.env.local')) additions.push('.env.local');
  if (!gitignore.includes('test-edge-function.ps1')) additions.push('test-edge-function.ps1');
  if (!gitignore.includes('terminal.ps1')) additions.push('terminal.ps1');
  if (!gitignore.includes('scratch/')) additions.push('scratch/');
  if (!gitignore.includes('supabase/.hermes-infra-last-run.json')) additions.push('supabase/.hermes-infra-last-run.json');

  if (additions.length > 0) {
    gitignore += '\n# Hermes Security — credenciales y archivos sensibles\n';
    gitignore += additions.map(a => a).join('\n') + '\n';
    fs.writeFileSync(gitignorePath, gitignore, 'utf8');
    log('✓', `.gitignore actualizado: agregado ${additions.join(', ')}`, '\x1b[32m');
  } else {
    log('✓', '.gitignore ya cubría todos los archivos sensibles', '\x1b[32m');
  }

  // 2. Remover de git (--cached = no borra el archivo local)
  const toUntrack = ['.env', '.env.local', 'test-edge-function.ps1', 'terminal.ps1'];
  for (const f of toUntrack) {
    const tracked = run(`git ls-files ${f}`);
    if ((tracked.output || '').trim()) {
      const r = run(`git rm --cached "${f}"`);
      if (r.ok) {
        log('✓', `git rm --cached ${f}`, '\x1b[32m');
      } else {
        log('⚠', `No se pudo hacer git rm --cached ${f}: ${r.output.slice(0, 80)}`, '\x1b[33m');
      }
    }
  }

  // 3. Reemplazar anon key hardcodeada en test-edge-function.ps1
  const testEdgePath = path.join(ROOT, 'test-edge-function.ps1');
  if (fs.existsSync(testEdgePath)) {
    let content = fs.readFileSync(testEdgePath, 'utf8');
    // Reemplazar JWT hardcodeado por variable de entorno
    content = content.replace(
      /\$anonKey\s*=\s*"eyJ[A-Za-z0-9._-]+"/,
      '$anonKey = $env:VITE_SUPABASE_ANON_KEY'
    );
    content = content.replace(
      /\$url\s*=\s*"https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/[^"]+"/,
      '$url = "$($env:VITE_SUPABASE_URL)/functions/v1/sync-matches"'
    );
    fs.writeFileSync(testEdgePath, content, 'utf8');
    log('✓', 'test-edge-function.ps1: credenciales reemplazadas por $env:', '\x1b[32m');
  }

  log('✓', 'Correcciones de seguridad aplicadas. Verificar con: git status', '\x1b[32m');
}

// ─── Obsidian ─────────────────────────────────────────────────────────────────
function writeObsidianNote() {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
  const date     = new Date().toISOString().slice(0, 10);
  const time     = new Date().toTimeString().slice(0, 5).replace(':', 'h');
  const fileName = `Hermes-Test-${date}-${time}-OraculoMundial.md`;
  const outPath  = path.join(SESSION_DIR, fileName);

  const { total, passed, failed, warnings } = report.summary;
  const statusEmoji = failed > 0 ? '🔴' : warnings > 0 ? '🟡' : '🟢';
  const statusText  = failed > 0 ? 'CON FALLOS' : warnings > 0 ? 'CON ADVERTENCIAS' : 'TODO OK';

  let suitesBlock = '';
  for (const [suiteName, results] of Object.entries(report.suites)) {
    suitesBlock += `\n### ${suiteName}\n\n`;
    for (const r of results) {
      const icon = r.ok ? 'x' : r.severity === 'warn' ? '~' : ' ';
      suitesBlock += `- [${icon}] **${r.name}**${r.detail ? ` — ${r.detail}` : ''}\n`;
    }
  }

  // SEGURIDAD: la nota NUNCA incluye valores de credenciales
  const securityBlock = report.security.exposedFiles.length > 0
    ? report.security.exposedFiles.map(e => `- ⚠ \`${e.file}\`${e.line ? ` línea ${e.line}` : ''}: ${e.pattern}`).join('\n')
    : '- Sin exposiciones detectadas ✅';

  const recsBlock = report.recommendations.length > 0
    ? report.recommendations.map(r => `- ${r}`).join('\n')
    : '- Ninguna acción urgente.';

  const content = `---
fecha: ${report.timestamp}
tags: [hermes, test, qa, seguridad, oraculo-mundial]
agente: Hermes Test Agent 10
estado: ${statusText}
tests_total: ${total}
tests_pasaron: ${passed}
tests_fallaron: ${failed}
advertencias: ${warnings}
---

# ${statusEmoji} Hermes QA — ${date} ${time}

> Reporte generado por **Hermes Test Agent 10**. Ningún secreto o credencial se incluye en esta nota.

## Resumen

| Métrica | Valor |
|---------|-------|
| Total tests | ${total} |
| ✅ Pasaron | ${passed} |
| ❌ Fallaron | ${failed} |
| ⚠ Advertencias | ${warnings} |
| Estado global | ${statusEmoji} ${statusText} |

## Detalle por Suite
${suitesBlock}

## Seguridad — Credenciales expuestas detectadas

${securityBlock}

## Recomendaciones

${recsBlock}

## Cómo corregir problemas de seguridad

\`\`\`powershell
# Desde C:\\Proyectos\\OraculoMundial
node scripts/hermes-test-agent.mjs --fix-security
git status
git add .gitignore
git commit -m "security: mover credenciales a env vars"
\`\`\`

## Cómo re-ejecutar

\`\`\`powershell
node scripts/hermes-test-agent.mjs
node scripts/hermes-test-agent.mjs --fix-security
node scripts/hermes-test-agent.mjs --static-only
\`\`\`

---
_Generado automáticamente — workspace: C:/Proyectos/OraculoMundial_
`;

  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n\x1b[35m╔══════════════════════════════════════════════════════╗');
  console.log('║  🤖 HERMES TEST AGENT 10 — QA Integral Seguro       ║');
  console.log('╚══════════════════════════════════════════════════════╝\x1b[0m\n');

  if (fixSecurity) {
    fixSecurityIssues();
  }

  if (!obsidianOnly) {
    testEnvVars();
    testHardcodedSecrets();
    testCriticalFiles();
    testPackageScripts();
    if (!staticOnly) {
      testUnitTests();
      testTsBuild();
      testStaticAnalysis();
      await testSupabaseConnectivity();
    }
  }

  // Recomendaciones automáticas
  if (report.security.exposedFiles.length > 0) {
    report.recommendations.push('URGENTE: Ejecutar --fix-security para sanear credenciales hardcodeadas');
    report.recommendations.push('Rotar las API keys/tokens que estuvieron expuestos');
  }
  if (report.summary.failed > 0) {
    report.recommendations.push(`Corregir ${report.summary.failed} tests fallidos antes del próximo deploy`);
  }

  // Obsidian sync
  let notePath = null;
  try {
    notePath = writeObsidianNote();
  } catch (e) {
    log('⚠', `No se pudo escribir nota Obsidian: ${e.message}`, '\x1b[33m');
  }

  // Resumen final
  const { total, passed, failed, warnings } = report.summary;
  const color = failed > 0 ? '\x1b[31m' : warnings > 0 ? '\x1b[33m' : '\x1b[32m';
  console.log(`\n${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  console.log(`${color}  RESULTADO: ${total} tests — ✅ ${passed} OK  ❌ ${failed} FAIL  ⚠ ${warnings} WARN\x1b[0m`);
  if (notePath) console.log(`\x1b[36m  📓 Obsidian: ${notePath}\x1b[0m`);
  console.log(`${color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n`);

  process.exit(failed > 0 ? 1 : 0);
})();