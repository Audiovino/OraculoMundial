import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Registrarse")');
    const testEmail = `debug_${Date.now()}@test.com`;
    const testUsername = `dbg${Date.now().toString().slice(-6)}`;
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="tu_usuario"]', testUsername);
    await page.fill('input[placeholder="••••••••"]', 'DebugPass123!');
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForSelector('button:has-text("Salir")', { timeout: 20000 });
    await page.waitForTimeout(2000);
    const matches = [
      { home: 'Argentina', away: 'Argelia' },
      { home: 'Argentina', away: 'Austria' },
      { home: 'Jordania', away: 'Argentina' }
    ];
    for (const match of matches) {
      const locator = page.locator('div:has-text("' + match.home + '"):has-text("' + match.away + '")').first();
      const count = await locator.count();
      console.log(`Match ${match.home} vs ${match.away} count:`, count);
      if (count) {
        const outer = await locator.evaluate(el => el.outerHTML);
        console.log('outerHTML snippet:', outer.slice(0, 1200));
      }
    }
    const cards = await page.locator('div:has-text("Argentina")').all();
    console.log('Argentina card count:', cards.length);
    const bodyHtml = await page.locator('body').innerHTML();
    await page.screenshot({ path: 'scratch/debug_match_card_structure.png', fullPage: true });
    console.log('Screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();