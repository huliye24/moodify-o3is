/**
 * Moodify 详细诊断测试
 */

const { chromium } = require('playwright');

const URL = 'http://localhost:5173';

async function run() {
  console.log('启动浏览器...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));

  console.log(`访问 ${URL}...`);
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('页面加载完成');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('页面加载失败:', e.message);
    await browser.close();
    return;
  }

  // 列出所有按钮
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    return Array.from(btns).map(b => ({
      text: b.textContent?.trim().substring(0, 30),
      ariaLabel: b.getAttribute('aria-label'),
      class: b.className?.substring(0, 50),
    }));
  });
  console.log(`找到 ${buttons.length} 个按钮:`);
  buttons.slice(0, 20).forEach(b => console.log(`  - "${b.text}" | ${b.ariaLabel}`));

  // 尝试找 Tab 按钮
  const tabSelectors = [
    'button:has-text("歌词创作")',
    'button:has-text("情绪播放")',
    'button:has-text("品牌故事")',
  ];

  for (const sel of tabSelectors) {
    const el = await page.locator(sel).first();
    const count = await page.locator(sel).count();
    console.log(`${sel}: ${count} 个`);
    if (count > 0) {
      await el.click().catch(e => console.log(`  点击失败: ${e.message}`));
      await page.waitForTimeout(500);
      console.log(`  点击成功，当前URL稳定`);
    }
  }

  // 错误汇总
  const realErrors = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('pixabay') &&
    !e.includes('DevTools') &&
    !e.includes('console-ninja')
  );

  console.log(`\n错误数: ${realErrors.length}`);
  realErrors.forEach(e => console.log(`  - ${e.substring(0, 150)}`));

  await browser.close();
  console.log('\n完成');
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
