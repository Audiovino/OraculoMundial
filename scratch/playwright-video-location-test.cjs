const { chromium, devices } = require('playwright');

(async () => {
  // Mobile emulation: iPhone 12
  const iPhone = devices['iPhone 12'];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
    geolocation: { latitude: -34.6037, longitude: -58.3816, accuracy: 100 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  // Go to dev server
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Ensure the page is fully loaded – wait a short extra time
  await page.waitForTimeout(1000);

  // Find the Video Demo button using a robust selector (contains text)
  const demoButton = page.locator('button', { hasText: /ver video demo/i }).first();
  await demoButton.waitFor({ state: 'visible', timeout: 10000 });
  await demoButton.click();

  // Wait for the iframe inside the modal to appear
  await page.waitForSelector('iframe', { state: 'visible', timeout: 10000 });

  // Capture a screenshot of the modal area
  await page.screenshot({ path: 'video_demo_mobile.png', fullPage: false });
  console.log('Screenshot saved: video_demo_mobile.png');

  // Check iframe dimensions
  const iframe = await page.$('iframe');
  const bounding = await iframe.boundingBox();
  console.log('Iframe dimensions:', bounding);

  await browser.close();
})();
