const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const ts = Date.now();
  const testEmail = `testuser_${ts}@test.com`;
  const testPass = 'TestPass123!';
  const testUser = `testuser_${ts}`;

  console.log('=== TEST 1: SIGNUP ===');
  console.log(`Email: ${testEmail}`);
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded.');

    // Click "Registrarse" tab
    const registerTab = await page.locator('text=Registrarse').first();
    if (await registerTab.isVisible()) {
      await registerTab.click();
      console.log('Clicked "Registrarse" tab.');
    }
    await page.waitForTimeout(500);

    // Fill signup form
    const usernameInput = await page.locator('input[placeholder*="usuario"], input[name="username"]').first();
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(testUser);
      console.log('Filled username.');
    }

    const emailInput = await page.locator('input[type="email"], input[placeholder*="correo"], input[placeholder*="email"]').first();
    await emailInput.fill(testEmail);
    console.log('Filled email.');

    const passwordInputs = await page.locator('input[type="password"]').all();
    for (const pwInput of passwordInputs) {
      await pwInput.fill(testPass);
    }
    console.log('Filled password(s).');

    // Submit
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Registr")').first();
    await submitBtn.click();
    console.log('Clicked submit.');

    await page.waitForTimeout(5000);

    // Check for errors
    const bodyText = await page.locator('body').textContent();
    const hasDbError = bodyText.includes('Database error') || bodyText.includes('error guardando') || bodyText.includes('Error en registro');
    
    if (hasDbError) {
      console.log('❌ SIGNUP FAILED - Database error found in page');
    } else {
      console.log('✅ No database errors detected!');
    }

    // Check for any visible error elements  
    const errorEls = await page.locator('[class*="error"], [role="alert"]').all();
    for (const el of errorEls) {
      if (await el.isVisible()) {
        const text = await el.textContent();
        if (text && text.trim()) console.log(`⚠️ Error element: "${text.trim()}"`);
      }
    }

    // Check admin visibility for this new regular user
    console.log('\n=== TEST 2: ADMIN VISIBILITY ===');
    const adminVisible = await page.locator('text=Admin').first().isVisible().catch(() => false);
    if (adminVisible) {
      console.log('❌ Admin button IS visible for regular user!');
    } else {
      console.log('✅ Admin button NOT visible for regular user. Correct!');
    }

    await page.screenshot({ path: 'test-signup-result.png', fullPage: true });
    console.log('Screenshot: test-signup-result.png');

  } catch (err) {
    console.error('Test error:', err.message);
    await page.screenshot({ path: 'test-signup-error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
    console.log('\n=== DONE ===');
  }
})();
