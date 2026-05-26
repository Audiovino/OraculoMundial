// playwright-video-location-test.js
// This script uses Playwright to test the VideoDemo modal layout on a mobile device (Argentina) and checks IP‑based location detection.
// It emulates an iPhone 12 with locale "es-AR" and timezone "America/Argentina/Buenos_Aires".
// After loading the app (http://localhost:5173), it opens the video demo, verifies the iframe fills the modal, and captures a screenshot.
// Then it fetches the public IP info via ipapi.co to log the inferred country for verification.

const { chromium, devices } = require('playwright');

(async () => {
  const iPhone = devices['iPhone 12'];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  });
  const page = await context.newPage();

  // Navigate to local dev server
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Page loaded');

  // Click the "Ver Video Demo" button
  const demoButton = await page.locator('text=Ver Video Demo').first();
  await demoButton.click();
  console.log('Clicked video demo button');

  // Wait for modal iframe to appear
  const iframe = page.frameLocator('iframe');
  await iframe.waitFor();
  console.log('Iframe loaded');

  // Verify iframe fills the modal container (check dimensions)
  const modal = page.locator('div[role="dialog"]'); // fallback selector if any
  const modalBox = await modal.boundingBox();
  const iframeBox = await iframe.first().boundingBox();
  if (modalBox && iframeBox) {
    console.log(`Modal size: ${modalBox.width}x${modalBox.height}`);
    console.log(`Iframe size: ${iframeBox.width}x${iframeBox.height}`);
    const fits = Math.abs(modalBox.width - iframeBox.width) < 5 && Math.abs(modalBox.height - iframeBox.height) < 5;
    console.log('Iframe fits modal:', fits);
  }

  // Screenshot of the modal
  await page.screenshot({ path: 'video_demo_modal.png', fullPage: false });
  console.log('Screenshot saved: video_demo_modal.png');

  // Fetch public IP geolocation (to simulate "redes locales de celulares de Argentina")
  try {
    const ipRes = await page.evaluate(async () => {
      const resp = await fetch('https://ipapi.co/json/');
      return await resp.json();
    });
    console.log('Public IP info:', ipRes);
    console.log('Detected country (should be AR):', ipRes.country_code);
  } catch (e) {
    console.error('Failed to fetch IP info', e);
  }

  await browser.close();
  console.log('Test completed');
})();
