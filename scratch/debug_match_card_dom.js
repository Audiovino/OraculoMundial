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

    const data = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.trim() === 'GUARDAR PRONÓSTICO');
      return buttons.slice(0, 5).map((button) => {
        const card = button.closest('div[style], div[class]');
        let node = button.parentElement;
        while (node && node !== document.body && node.querySelectorAll('button').length < 10) {
          node = node.parentElement;
        }
        const text = node?.innerText || '';
        const outer = node?.outerHTML || '';
        return {
          buttonText: button.textContent?.trim(),
          cardText: text.slice(0, 1200),
          className: node?.className,
          outerHTML: outer.slice(0, 1200)
        };
      });
    });
    console.log(JSON.stringify(data, null, 2));
    await page.screenshot({ path: 'scratch/debug_match_card_dom.png', fullPage: true });
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();