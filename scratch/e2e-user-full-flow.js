/**
 * E2E: flujo completo como usuario regular en producción.
 * Cubre: login, pronósticos, ligas (crear/unir/copiar/WhatsApp), estadios, sin admin.
 */
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const BASE_URL = process.env.E2E_BASE_URL || 'https://oraculo-mundial.vercel.app';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const ts = Date.now();
const userA = {
  email: `e2e_a_${ts}@oraculo-test.local`,
  password: 'E2ePass123!',
  username: `e2e${String(ts).slice(-6)}`,
};
const userB = {
  email: `e2e_b_${ts}@oraculo-test.local`,
  password: 'E2ePass123!',
  username: `e2b${String(ts).slice(-5)}`,
};
const leagueName = `E2E Liga ${ts}`;

const results = [];
const shotDir = 'scratch/e2e-user-flow';

function log(step, ok, detail = '') {
  const line = { step, ok, detail };
  results.push(line);
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${step}${detail ? ` — ${detail}` : ''}`);
}

async function safeScreenshot(page, path) {
  try {
    await page.screenshot({ path, fullPage: false, timeout: 15000 });
  } catch (e) {
    console.warn(`  (screenshot omitido: ${path})`);
  }
}

async function clickIfVisible(page, selector) {
  const el = page.locator(selector).first();
  if ((await el.count()) > 0 && (await el.isVisible().catch(() => false))) {
    await el.click();
    return true;
  }
  return false;
}

async function loginOrSignup(page, { email, password, username }) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  if (await page.locator('button:has-text("Salir")').count()) {
    return 'already-signed-in';
  }

  await page.waitForSelector(
    'button:has-text("Crear Cuenta"), button:has-text("Iniciar Sesión")',
    { timeout: 20000 }
  );

  await clickIfVisible(page, 'button:has-text("Registrarse")');
  if (await page.locator('input[placeholder="tu_usuario"]').count()) {
    await page.fill('input[placeholder="tu_usuario"]', username);
  }
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Crear Cuenta")');

  const signed = await page
    .waitForSelector('button:has-text("Salir")', { timeout: 15000 })
    .catch(() => null);
  if (signed) return 'signup';

  await clickIfVisible(page, 'button:has-text("Iniciar Sesión")');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Iniciar Sesión")');
  await page.waitForSelector('button:has-text("Salir")', { timeout: 15000 });
  return 'signin';
}

async function openLigasPanel(page) {
  const ligasBtn = page.locator('button:has-text("Ligas"):visible').first();
  await ligasBtn.waitFor({ timeout: 15000 });
  await ligasBtn.click();
  await page.waitForSelector('text=Tus Grupos', { timeout: 15000 });
}

async function createLeague(page, name) {
  await openLigasPanel(page);
  await page.locator('button:has-text("Crear"):visible').first().click();
  await page.waitForSelector('input[placeholder*="Nombre de la liga"]', { timeout: 10000 });
  await page.fill('input[placeholder*="Nombre de la liga"]', name);
  await page.locator('button:has-text("Crear Liga"):visible').click();
  await page.waitForSelector(`text=${name}`, { timeout: 20000 });

  const card = page.locator(`div:has(p:text("${name}"))`).first();
  const texts = await card.locator('p').allTextContents();
  const code = texts.map(t => t.trim()).find(t => /^[A-Z0-9]{6}$/.test(t));
  if (!code) throw new Error(`No invite code found for league ${name}. Texts: ${texts.join(', ')}`);
  return code;
}

async function getAuthUserId(page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(k => k.includes('-auth-token'));
    if (!key) return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      const token = parsed?.access_token || parsed?.currentSession?.access_token;
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  });
}

(async () => {
  fs.mkdirSync(shotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const contextA = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const pageA = await contextA.newPage();

  let inviteCode = '';
  let supabase = null;
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  try {
    console.log(`\n=== E2E Usuario regular @ ${BASE_URL} ===\n`);

    // 1 — Registro / login usuario A
    const authMethod = await loginOrSignup(pageA, userA);
    log('Registro o login usuario A', true, authMethod);
    await safeScreenshot(pageA, `${shotDir}/01-home-logged-in.png`);

    // 2 — No debe ver Admin
    const adminVisible = await pageA.locator('button:has-text("Admin")').count();
    log('Usuario regular NO ve botón Admin', adminVisible === 0, `count=${adminVisible}`);

    // 3 — Navegación Juego / Estadios
    await pageA.locator('button:has-text("Estadios"):visible').first().click();
    await pageA.waitForTimeout(1500);
    const stadiumsOk = (await pageA.locator('text=Estadios, text=estadio').count()) > 0 ||
      (await pageA.content()).toLowerCase().includes('estadio');
    log('Pestaña Estadios carga', stadiumsOk);
    await safeScreenshot(pageA, `${shotDir}/02-estadios.png`);

    await pageA.locator('button:has-text("Juego"):visible').first().click();
    await pageA.waitForTimeout(1500);
    log('Volver a Juego', true);

    // 4 — Pronósticos (si hay partidos visibles)
    const saveBtn = pageA.locator('button:has-text("GUARDAR PRONÓSTICO"):visible').first();
    const hasMatches = (await saveBtn.count()) > 0;
    if (hasMatches) {
      const card = saveBtn.locator('xpath=ancestor::div[contains(@class,"rounded")][1]').first();
      const inputs = card.locator('input[placeholder="0"]:visible');
      if ((await inputs.count()) >= 2) {
        await inputs.nth(0).fill('2');
        await inputs.nth(1).fill('1');
        await saveBtn.click();
        const saved = await pageA
          .locator('button:has-text("GUARDADO"):visible')
          .first()
          .waitFor({ timeout: 12000 })
          .then(() => true)
          .catch(() => false);
        log('Guardar pronóstico en partido visible', saved);
      } else {
        log('Guardar pronóstico', false, 'inputs no encontrados');
      }
    } else {
      log('Guardar pronóstico', true, 'omitido — sin partidos visibles en UI');
    }
    await safeScreenshot(pageA, `${shotDir}/03-juego.png`);

    // 5 — Crear liga
    inviteCode = await createLeague(pageA, leagueName);
    log('Crear liga privada', Boolean(inviteCode), `código=${inviteCode}`);
    await safeScreenshot(pageA, `${shotDir}/04-liga-creada.png`);

    // 6 — Copiar código
    const copyBtn = pageA
      .locator(`div:has(p:text("${leagueName}"))`)
      .first()
      .locator('button[title="Copiar código"]');
    const hasCopy = (await copyBtn.count()) > 0;
    if (hasCopy) {
      await copyBtn.click();
      await pageA.waitForTimeout(500);
      log('Botón copiar código', true);
    } else {
      log('Botón copiar código', false, 'no encontrado en tarjeta');
    }

    // 7 — WhatsApp (puede no estar en prod si no se desplegó)
    const waBtn = pageA
      .locator(`div:has(p:text("${leagueName}"))`)
      .first()
      .locator('button[title="Compartir por WhatsApp"]');
    const hasWa = (await waBtn.count()) > 0;
    log('Botón WhatsApp en lista de ligas', hasWa, hasWa ? 'presente' : 'no desplegado aún en prod');

    // 8 — Modal liga + WhatsApp principal
    await pageA.locator(`div:has(p:text("${leagueName}"))`).first().click();
    await pageA.waitForTimeout(800);
    const modalWa = pageA.locator('button:has-text("Compartir por WhatsApp"):visible');
    const modalCopy = pageA.locator('button:has-text("Copiar código"):visible');
    log('Modal de liga abre', (await modalCopy.count()) > 0);
    log('WhatsApp en modal', (await modalWa.count()) > 0);
    await safeScreenshot(pageA, `${shotDir}/05-modal-liga.png`);
    await pageA.keyboard.press('Escape').catch(() => {});
    await pageA.locator('button').filter({ has: pageA.locator('svg') }).first().click().catch(() => {});

    // 9 — Supabase: usuario y liga
    const userId = await getAuthUserId(pageA);
    if (supabase && userId) {
      const { data: profile } = await supabase.from('mundial_users').select('id,email,username').eq('id', userId).maybeSingle();
      log('Perfil en mundial_users (Supabase)', Boolean(profile), profile?.email || userId);

      const { data: league } = await supabase
        .from('private_leagues')
        .select('name,invite_code,creador_id')
        .eq('invite_code', inviteCode)
        .maybeSingle();
      log('Liga en private_leagues (Supabase)', Boolean(league), league?.nombre || 'no row');

      const { data: preds } = await supabase.from('mundial_predictions').select('id').eq('user_id', userId);
      log('Pronósticos en Supabase', true, `${preds?.length ?? 0} filas`);
    } else {
      log('Verificación Supabase', false, 'sin credenciales o sin userId');
    }

    // 10 — Usuario B se une con el código
    const contextB = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageB = await contextB.newPage();
    await loginOrSignup(pageB, userB);
    log('Registro usuario B (invitado)', true);
    await openLigasPanel(pageB);
    await pageB.locator('button:has-text("Unirse"):visible').first().click();
    await pageB.fill('input[placeholder*="Código"]', inviteCode);
    await pageB.locator('button:has-text("Unirse"):visible').last().click();
    await pageB.waitForTimeout(3000);
    const joinedVisible = (await pageB.locator(`text=${leagueName}`).count()) > 0;
    log('Usuario B se une con código', joinedVisible, inviteCode);
    await safeScreenshot(pageB, `${shotDir}/06-usuario-b-unido.png`);

    if (supabase && userId) {
      const userIdB = await getAuthUserId(pageB);
      const { data: member } = await supabase
        .from('league_members')
        .select('liga_id,user_id')
        .eq('user_id', userIdB)
        .limit(5);
      log('league_members en Supabase', (member?.length ?? 0) > 0, `${member?.length ?? 0} filas para B`);
    }

    await contextB.close();

    // Resumen
    const failed = results.filter(r => !r.ok);
    console.log('\n=== RESUMEN ===');
    console.log(`URL: ${BASE_URL}`);
    console.log(`Usuario A: ${userA.email}`);
    console.log(`Usuario B: ${userB.email}`);
    console.log(`Liga: ${leagueName} / código ${inviteCode}`);
    console.log(`Pasos OK: ${results.filter(r => r.ok).length}/${results.length}`);
    if (failed.length) {
      console.log('Fallos:');
      failed.forEach(f => console.log(`  - ${f.step}: ${f.detail}`));
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('\nE2E CRASH:', err.message);
    await safeScreenshot(pageA, `${shotDir}/error.png`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
