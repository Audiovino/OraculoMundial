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
    const saveButtons = page.locator('button', { hasText: 'Guardar Pronóstico' });
    console.log('save buttons count:', await saveButtons.count());
    for (let i = 0; i < Math.min(10, await saveButtons.count()); i++) {
      const text = await saveButtons.nth(i).innerText();
      const outer = await saveButtons.nth(i).evaluate(el => el.outerHTML);
      console.log(`save button ${i}:`, text, outer.slice(0, 400));
      const parent = await saveButtons.nth(i).locator('..').evaluate(el => el.outerHTML);
      console.log(`parent ${i}:`, parent.slice(0, 400));
    }
    const cardLocators = page.locator('div:has-text("Argentina"):has-text("Argelia")');
    console.log('Argentina vs Argelia card count:', await cardLocators.count());
    if (await cardLocators.count()) {
      console.log('Argentina vs Argelia card innerHTML:', (await cardLocators.first().evaluate(el => el.innerHTML)).slice(0, 1200));
    }
    await page.screenshot({ path: 'scratch/debug_match_buttons.png', fullPage: true });
    console.log('screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();