import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Registrarse")');
    const testEmail = `debug_${Date.now()}@test.com`;
    await page.fill('input[placeholder="tu@email.com"]', testEmail);
    await page.fill('input[placeholder="••••••••"]', 'DebugPass123!');
    const testUsername = `dbg${Date.now().toString().slice(-6)}`;
    await page.fill('input[placeholder="tu_usuario"]', testUsername);
    await page.click('button:has-text("Crear Cuenta")');
    await page.waitForTimeout(10000);
    const url = page.url();
    console.log('After submit URL:', url);
    const bodyText = await page.locator('body').innerText();
    console.log('Body text snippet after submit:\n', bodyText.slice(0, 800));
    const signedIn = await page.locator('button:has-text("Salir")').count();
    console.log('Logout button count:', signedIn);
    await page.screenshot({ path: 'scratch/debug_after_login_postsubmit.png', fullPage: true });
    console.log('Saved post-submit screenshot');
    if (!signedIn) {
      throw new Error('Did not sign in successfully');
    }
    await page.waitForTimeout(5000);
    const mainText = bodyText;
    console.log('Body text first 1200 chars:\n', mainText.slice(0, 1200));
    const cards = await page.locator('text=Argentina').count();
    console.log('Argentina text count:', cards);
    const groups = await page.locator('select').allTextContents();
    console.log('Select contents:', groups);
    const html = await page.content();
    await page.screenshot({ path: 'scratch/debug_after_login.png', fullPage: true });
    console.log('Screenshot saved');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();