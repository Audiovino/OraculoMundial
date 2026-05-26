import { chromium } from 'playwright';
import fs from 'fs';

async function recordDemo() {
  // Forzamos el uso de la GPU de NVIDIA para la captura
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--use-gl=desktop',
      '--enable-webgl',
      '--ignore-gpu-blocklist'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 430, height: 932 }, // iPhone 14 Pro Max Viewport
    deviceScaleFactor: 2, // Optimizado para balance velocidad/calidad
    locale: 'es-ES',
    recordVideo: {
      dir: './demos_raw/',
      size: { width: 393, height: 852 }
    }
  });

  const page = await context.newPage();
  console.log('🎬 Iniciando grabación cinematográfica de Oráculo Mundial...');

  try {
    // 1. Navegar a la web
    await page.goto('https://oraculo-mundial.vercel.app');
    await page.waitForTimeout(2000);

    // 2. Scroll suave para mostrar la interfaz premium
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // 3. Simular la entrada de un pronóstico (Core del juego)
    console.log('⚽ Simulando interacción de usuario...');
    const input = page.locator('input').first();
    if (await input.isVisible()) {
        await input.fill('2');
        await page.keyboard.press('Tab');
        await page.keyboard.type('1');
    }
    await page.waitForTimeout(2000);

    // 4. Explorar Estadios (Sincronizado con tu video manual)
    console.log('🏟️ Abriendo sección de Estadios...');
    await page.click('button:has-text("Estadios")');
    await page.waitForSelector('.stadium-card', { timeout: 5000 }).catch(() => console.log("Nota: No se detectaron stadium-cards, continuando..."));
    await page.waitForTimeout(2000);

    // 5. Simular filtrado por país (Como en tu demo manual)
    console.log('🇲🇽 Filtrando por México...');
    await page.click('button:has-text("México")').catch(() => {});
    await page.waitForTimeout(4000);

    // 6. FINAL HERMES: Close-up al trofeo en la cabecera
    console.log('🏆 Realizando zoom final al trofeo...');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      const trophy = document.querySelector('header img, [src*="trophy"], .trophy-icon');
      if (trophy) {
        trophy.style.transition = 'all 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        trophy.style.transform = 'scale(5) translateY(40px)';
        trophy.style.filter = 'drop-shadow(0 0 40px rgba(250, 204, 21, 0.7))';
      }
    });
    await page.waitForTimeout(3500);

    console.log('✅ Captura raw finalizada.');
  } catch (error) {
    console.error('❌ Error en la grabación:', error);
  } finally {
    const videoPath = await page.video()?.path();
    if (videoPath) {
        fs.copyFileSync(videoPath, './demos/video_generado.webm');
    }
    await context.close();
    await browser.close();
  }
}

recordDemo();