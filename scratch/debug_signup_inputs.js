import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Registrarse")');
    await page.waitForTimeout(2000);
    const inputs = await page.locator('input').elementHandles();
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      const value = await inputs[i].inputValue();
      console.log(`input ${i}: type=${type} name=${name} placeholder=${placeholder} value=${value}`);
    }
    const labels = await page.locator('label').allTextContents();
    console.log('labels:', labels);
    const buttons = await page.locator('button').allTextContents();
    console.log('buttons:', buttons);
    await page.screenshot({ path: 'scratch/debug_signup_inputs.png', fullPage: true });
    console.log('screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();