import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    const cards = await page.locator('div:has-text("Argentina")').elementHandles();
    console.log('Argentina locator count:', cards.length);
    for (let i = 0; i < cards.length; i++) {
      const text = await cards[i].innerText();
      console.log('--- CARD', i, '---');
      console.log(text.slice(0, 500));
      console.log('-----------------------');
    }

    const dom = await page.content();
    console.log('Page length:', dom.length);
    await page.screenshot({ path: 'scratch/debug_match_cards.png', fullPage: true });
    console.log('saved screenshot scratch/debug_match_cards.png');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
