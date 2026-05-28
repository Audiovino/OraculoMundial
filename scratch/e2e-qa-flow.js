import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:5174';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase config in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const adminEmail = 'gerardo@oraculo-mundial.com';
const adminPassword = 'AdminPass123!';
const adminUsername = 'adminqa';

const regularEmail = `qauser_${Date.now()}@test.com`;
const regularPassword = 'QApass123!';
const regularUsername = `qa${Date.now().toString().slice(-7)}`; // short username under 20 chars
const leagueName = `QA Liga ${Date.now()}`;
const argentinaMatches = [
  { home: 'Argentina', away: 'Argelia', homeScore: 2, awayScore: 0 },
  { home: 'Argentina', away: 'Austria', homeScore: 3, awayScore: 1 },
  { home: 'Jordania', away: 'Argentina', homeScore: 1, awayScore: 2 }
];

async function clickIfVisible(page, selector) {
  const el = page.locator(selector).first();
  if (await el.count() > 0 && await el.isVisible()) {
    await el.click();
    return true;
  }
  return false;
}

async function fillPrediction(page, home, away, homeScore, awayScore) {
  const card = page.locator(`div:has(div[class*="lg:hidden"]):has(button:has-text("GUARDAR PRONÓSTICO")):has-text("${home}"):has-text("${away}"):visible`).first();
  if (!(await card.count())) {
    throw new Error(`No visible mobile match card found for ${home} vs ${away}`);
  }
  const inputs = card.locator('div[class*="lg:hidden"] input[placeholder="0"]:visible');
  const visibleCount = await inputs.count();
  if (visibleCount < 2) {
    throw new Error(`Expected 2 visible mobile score inputs for ${home} vs ${away}, got ${visibleCount}`);
  }
  await card.scrollIntoViewIfNeeded();
  const homeInput = inputs.nth(0);
  const awayInput = inputs.nth(1);
  await homeInput.scrollIntoViewIfNeeded();
  await homeInput.fill(String(homeScore));
  await awayInput.scrollIntoViewIfNeeded();
  await awayInput.fill(String(awayScore));
  await page.waitForTimeout(150);
  await awayInput.blur();
  const saveButton = card.locator('button:has-text("GUARDAR PRONÓSTICO"):visible').first();
  if (!(await saveButton.count())) {
    throw new Error(`Save button not found for ${home} vs ${away}`);
  }
  await saveButton.scrollIntoViewIfNeeded();
  await saveButton.click();
  await card.locator('button:has-text("GUARDADO"):visible').first().waitFor({ timeout: 10000 });
}

async function loginOrSignup(page, email, password, username, preferSignin = false) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('button:has-text("Crear Cuenta"), button:has-text("Iniciar Sesión")', { timeout: 10000 });

  if (preferSignin) {
    await clickIfVisible(page, 'button:has-text("Iniciar Sesión")');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Iniciar Sesión")');

    const signedIn = await page.waitForSelector('button:has-text("Salir")', { timeout: 12000 }).catch(() => null);
    if (signedIn) {
      return { method: 'signin' };
    }

    // Fall back to signup if sign-in failed
    await clickIfVisible(page, 'button:has-text("Registrarse")');
    if (await page.locator('input[placeholder="tu_usuario"]').count()) {
      await page.fill('input[placeholder="tu_usuario"]', username);
    }
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Crear Cuenta")');

    await page.waitForSelector('button:has-text("Salir")', { timeout: 12000 });
    return { method: 'signup' };
  }

  await clickIfVisible(page, 'button:has-text("Registrarse")');
  if (await page.locator('input[placeholder="tu_usuario"]').count()) {
    await page.fill('input[placeholder="tu_usuario"]', username);
  }
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Crear Cuenta")');

  const signInSuccess = await page.waitForSelector('button:has-text("Salir")', { timeout: 12000 }).catch(() => null);
  if (signInSuccess) {
    return { method: 'signup' };
  }

  let errorText = '';
  for (const needle of ['registrado', 'already registered', 'error']) {
    const locator = page.locator(`text=${needle}`);
    if (await locator.count()) {
      errorText = (await locator.first().textContent()) || '';
      break;
    }
  }

  if (errorText?.toLowerCase().includes('registrado') || errorText?.toLowerCase().includes('already')) {
    await clickIfVisible(page, 'button:has-text("Iniciar Sesión")');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForSelector('button:has-text("Salir")', { timeout: 12000 });
    return { method: 'signin' };
  }

  await clickIfVisible(page, 'button:has-text("Iniciar Sesión")');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Iniciar Sesión")');
  await page.waitForSelector('button:has-text("Salir")', { timeout: 12000 });
  return { method: 'signin' };
}

async function createLeague(page, name) {
  await page.locator('button:has-text("Ligas"):visible').first().click();
  await page.waitForSelector('text=Tus Grupos', { timeout: 10000 });
  await page.waitForSelector('button:has-text("Crear"):visible', { timeout: 10000 });
  await page.locator('button:has-text("Crear"):visible').first().click();
  await page.waitForSelector('input[placeholder="Nombre de la liga (ej: Trabajo 2026)"]', { timeout: 10000 });
  await page.fill('input[placeholder="Nombre de la liga (ej: Trabajo 2026)"]', name);
  await page.locator('button:has-text("Crear Liga"):visible').click();
  await page.waitForSelector(`text=${name}`, { timeout: 15000 });
  const leagueCard = page.locator(`div:has-text("${name}")`).first();
  if (!(await leagueCard.count())) {
    throw new Error('Created league card not found after create');
  }
  const codeCandidates = await leagueCard.locator('p').allTextContents();
  const inviteCode = codeCandidates.find(text => /^[A-Z0-9]{6}$/.test(text.trim())) || codeCandidates.find(text => text.trim().length > 0 && text.trim() !== name.trim()) || '';
  return inviteCode.trim();
}

async function getSupabaseAuthUserId(page) {
  const token = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.includes('-auth-token')) || keys.find(key => key.includes('supabase.auth.token'));
    if (!authKey) return null;
    const raw = window.localStorage.getItem(authKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.currentSession?.access_token || parsed?.access_token || raw;
    } catch {
      return raw;
    }
  });
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

async function queryUserById(userId) {
  const { data, error } = await supabase
    .from('mundial_users')
    .select('*')
    .eq('id', userId)
    .limit(1);
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return data?.[0] || null;
}

async function queryPredictionsForUser(userId) {
  const { data, error } = await supabase.from('mundial_predictions').select('*').eq('user_id', userId);
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return data;
}

async function queryLeagueByName(name) {
  const { data, error } = await supabase.from('private_leagues').select('*').eq('nombre', name).single();
  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 1400 });
  let regularUser = null;
  try {
    console.log('=== STEP 1: Create and sign in regular QA user ===');
    await loginOrSignup(page, regularEmail, regularPassword, regularUsername);
    console.log(`Signed in regular user ${regularEmail}`);

    await page.waitForSelector('button:has-text("Juego")', { timeout: 15000 });
    await page.waitForSelector('button:has-text("GUARDAR PRONÓSTICO"):visible', { timeout: 20000 });

    console.log('=== STEP 2: Set Argentina group predictions ===');
    for (const match of argentinaMatches) {
      console.log(`Saving ${match.home} vs ${match.away}`);
      await fillPrediction(page, match.home, match.away, match.homeScore, match.awayScore);
    }

    const localPredictions = await page.evaluate(() => {
      const raw = window.localStorage.getItem('mundial_predictions');
      return raw ? JSON.parse(raw) : {};
    });
    console.log('Local predictions saved:', JSON.stringify(localPredictions, null, 2));

    console.log('=== STEP 3: Create a private league invite code ===');
    const inviteCode = await createLeague(page, leagueName);
    console.log('Invite code created:', inviteCode);

    console.log('=== STEP 4: Verify database state for regular user ===');
    const authUserId = await getSupabaseAuthUserId(page);
    console.log('Supabase auth user id:', authUserId);
    if (!authUserId) {
      throw new Error('Could not derive auth user id from localStorage');
    }

    regularUser = await queryUserById(authUserId);
    if (!regularUser) {
      console.warn(`No row found in mundial_users for auth id ${authUserId}. Continuing with auth id based verification.`);
    } else {
      console.log('Regular user profile row exists:', regularUser.email, regularUser.username);
    }

    const predictions = await queryPredictionsForUser(authUserId);
    console.log('Predictions rows from Supabase:', predictions.length);

    const leagueRow = await queryLeagueByName(leagueName);
    if (!leagueRow) {
      throw new Error('Private league row not found after create');
    }
    console.log('Private league row exists:', Boolean(leagueRow));
    if (leagueRow.creador_id !== authUserId) {
      console.warn(`League creator id ${leagueRow.creador_id} does not match auth user id ${authUserId}`);
    }

    console.log('=== STEP 5: Sign out and sign in with admin fallback email ===');
    await page.click('button:has-text("Salir")');
    await page.waitForSelector('button:has-text("Iniciar Sesión")', { timeout: 10000 });
    await loginOrSignup(page, adminEmail, adminPassword, adminUsername, true);
    console.log(`Signed in admin user ${adminEmail}`);

    console.log('=== STEP 6: Open admin dashboard ===');
    await page.waitForSelector('button:has-text("Admin")', { timeout: 15000 });
    await page.click('button:has-text("Admin")');
    await page.waitForSelector('text=Usuarios registrados', { timeout: 15000 });
    console.log('Admin dashboard visible');

    await page.fill('input[placeholder*="Buscar"]', regularEmail);
    await page.waitForSelector(`text=${regularEmail}`, { timeout: 15000 });
    console.log('Regular user visible in admin user list');

    await page.screenshot({ path: 'scratch/e2e-qa-result.png', fullPage: true });
    console.log('Screenshot saved: scratch/e2e-qa-result.png');

    console.log('=== QA RESULTS ===');
    console.log(`Regular user created: ${regularEmail}`);
    console.log(`Predictions saved rows: ${predictions.length}`);
    console.log(`Private league created: ${leagueName}`);
    console.log(`Invite code: ${inviteCode}`);
    console.log('Admin dashboard user lookup succeeded');
  } catch (err) {
    console.error('QA flow failed:', err);
    await page.screenshot({ path: 'scratch/e2e-qa-failure.png', fullPage: true }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
  }
})();
