import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 1400 });
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
    const hasJuego = await page.locator('button:has-text("Juego")').count();
    console.log('Juego button count:', hasJuego);
    const buttons = await page.locator('button').allTextContents();
    console.log('Buttons text sample:', buttons.slice(0, 20));
    await page.screenshot({ path: 'scratch/debug_after_signup.png', fullPage: true });
    console.log('screenshot saved');
    await page.waitForTimeout(2000);
    const visibleCards = page.locator('div:has(button:has-text("GUARDAR PRONÓSTICO")):visible');
    console.log('visible save-card count', await visibleCards.count());
    const visibleArgentinaCards = page.locator('div:has(button:has-text("GUARDAR PRONÓSTICO")):has-text("Argentina"):has-text("Argelia"):visible');
    console.log('visible Argentina/Argelia card count', await visibleArgentinaCards.count());
    const allCards = page.locator('div:has(button:has-text("GUARDAR PRONÓSTICO"))');
    console.log('total save-card count', await allCards.count());
    for (let i = 0; i < await allCards.count(); i++) {
      const text = await allCards.nth(i).textContent();
      if (text?.includes('Argentina') && text?.includes('Argelia')) {
        console.log('found card index', i);
        console.log(text?.slice(0,500));
      }
    }
    const visibleInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[placeholder="0"]')).map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
        const path = [];
        let node = el;
        for (let i = 0; i < 6 && node; i += 1) {
          path.push(`${node.tagName.toLowerCase()}${node.id ? '#'+node.id : ''}${node.className ? '.'+node.className.split(' ').filter(Boolean).join('.') : ''}`);
          node = node.parentElement;
        }
        return {
          visible,
          width: rect.width,
          height: rect.height,
          text: el.parentElement?.textContent?.slice(0,200).replace(/\s+/g,' ') || '',
          path: path.join(' > ')
        };
      }).filter(Boolean).slice(0,20);
    });
    console.log('visible input sample', JSON.stringify(visibleInputs, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
