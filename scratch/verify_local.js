import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const response = await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('status', response?.status());
    console.log('url', page.url());
    console.log('title', await page.title());
    const html = await page.content();
    console.log('body snippet', html.slice(0, 400).replace(/\n/g, ' '));
  } catch (err) {
    console.error('goto error', err);
  } finally {
    await browser.close();
  }
})();
