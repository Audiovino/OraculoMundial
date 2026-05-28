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
    await page.click('button:has-text("Partidos")').catch(() => {});
    await page.waitForTimeout(1000);
    const items = await page.evaluate(() => {
      const entries = [];
      const nodes = Array.from(document.querySelectorAll('div'));
      for (const node of nodes) {
        const text = node.innerText || '';
        if (text.includes('Argentina') && text.includes('Argelia')) {
          const rect = node.getBoundingClientRect();
          const style = window.getComputedStyle(node);
          const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
          entries.push({
            text: text.slice(0, 500),
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            visible,
            className: node.className,
            tagName: node.tagName
          });
        }
      }
      return entries.slice(0, 20);
    });
    console.log('matches found:', items.length);
    console.log(JSON.stringify(items, null, 2));

    const inputInfo = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[placeholder="0"]')).map((input, idx) => {
        const rect = input.getBoundingClientRect();
        const style = window.getComputedStyle(input);
        const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
        return {
          idx,
          type: input.type,
          value: input.value,
          placeholder: input.placeholder,
          visible,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          parentText: input.closest('div')?.innerText.slice(0, 200) || ''
        };
      }).slice(0, 20);
    });
    console.log('input info sample:', JSON.stringify(inputInfo, null, 2));

    await page.screenshot({ path: 'scratch/debug_match_visibility.png', fullPage: true });
    console.log('screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();