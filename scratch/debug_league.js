import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Registrarse")');
    const email = `debug_${Date.now()}@test.com`;
    const username = `dbg${Date.now().toString().slice(-6)}`;
    await page.fill('input[placeholder="tu@email.com"]', email);
    await page.fill('input[placeholder="tu_usuario"]', username);
    await page.fill('input[placeholder="••••••••"]', 'DebugPass123!');
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForSelector('button:has-text("Salir")', { timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Ligas")').first().click();
    await page.waitForSelector('text=Tus Grupos', { timeout: 15000 });
    await page.screenshot({ path: 'scratch/debug_league_before.png', fullPage: true });
    await page.locator('button:has-text("Crear")').first().click();
    await page.waitForSelector('input[placeholder="Nombre de la liga (ej: Trabajo 2026)"]', { timeout: 15000 });
    const leagueName = `Debug Liga ${Date.now()}`;
    await page.fill('input[placeholder="Nombre de la liga (ej: Trabajo 2026)"]', leagueName);
    await page.click('button:has-text("Crear Liga")');
    await page.waitForSelector(`text=${leagueName}`, { timeout: 15000 });
    await page.screenshot({ path: 'scratch/debug_league_after.png', fullPage: true });
    const leagueCards = await page.locator('div:has-text("' + leagueName + '")').allTextContents();
    console.log('league cards count', leagueCards.length);
    console.log('league cards text', JSON.stringify(leagueCards.slice(0,10), null, 2));
    const inviteCode = await page.evaluate((name) => {
      const card = Array.from(document.querySelectorAll('div')).find(div => div.textContent?.includes(name));
      if (!card) return null;
      const codes = Array.from(card.querySelectorAll('p')).map(p => p.textContent?.trim()).filter(Boolean);
      return codes;
    }, leagueName);
    console.log('invite code candidates', inviteCode);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
