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
    const visibleMatches = await page.evaluate(() => {
      const data = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent || '';
        if (text.includes('Argentina') && text.includes('Argelia')) {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
          if (visible) {
            data.push({
              tag: node.tagName,
              className: node.className,
              text: text.slice(0, 400).replace(/\s+/g, ' '),
              width: rect.width,
              height: rect.height,
              top: rect.top,
              bottom: rect.bottom,
              id: node.id || null,
            });
          }
        }
      }
      return data;
    });
    console.log('visible matches count:', visibleMatches.length);
    console.log(JSON.stringify(visibleMatches, null, 2));
    const visibleInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[placeholder="0"]')).map((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
          type: el.type,
          placeholder: el.placeholder,
          visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0',
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          parentText: el.parentElement?.textContent?.slice(0, 200).replace(/\s+/g, ' ') || ''
        };
      }).slice(0, 40);
    });
    console.log('input sample:', JSON.stringify(visibleInputs, null, 2));
    await page.screenshot({ path: 'scratch/debug_visible_match_cards.png', fullPage: true });
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();