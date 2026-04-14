/**
 * 隔离的前端稳定性测试脚本
 * 测试目标：验证页面加载、主题切换、功能交互的稳定性
 */

import puppeteer from 'puppeteer';

const TEST_CONFIG = {
  url: 'http://localhost:5173',
  iterations: 100,
  timeout: 30000,
  viewport: { width: 1920, height: 1080 }
};

interface TestResult {
  iteration: number;
  success: boolean;
  error?: string;
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    themeSwitchTime?: number;
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPageLoad(page: puppeteer.Page): Promise<{ loadTime: number; domContentLoaded: number }> {
  const startTime = Date.now();
  
  await page.goto(TEST_CONFIG.url, { waitUntil: 'networkidle0', timeout: TEST_CONFIG.timeout });
  
  const loadTime = Date.now() - startTime;
  const domContentLoaded = await page.evaluate(() => {
    const perf = performance.timing;
    return perf.domContentLoadedEventEnd - perf.navigationStart;
  });
  
  return { loadTime, domContentLoaded };
}

async function testThemeSwitch(page: puppeteer.Page): Promise<number> {
  const startTime = Date.now();
  
  // 尝试点击主题按钮
  const themeButtons = await page.$$('button[title="苔藓"], button[title="陶土"], button[title="干花"], button[title="樱花"]');
  if (themeButtons.length > 0) {
    await themeButtons[0].click();
    await sleep(100);
  }
  
  return Date.now() - startTime;
}

async function testPageInteraction(page: puppeteer.Page): Promise<boolean> {
  try {
    // 检查页面元素是否存在
    const rootElement = await page.$('#root');
    if (!rootElement) return false;
    
    // 检查是否有内容渲染
    const bodyContent = await page.evaluate(() => document.body.innerHTML.length);
    if (bodyContent < 100) return false;
    
    // 检查控制台错误
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await sleep(500);
    
    // 过滤掉非关键错误
    const criticalErrors = consoleErrors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools') &&
      !e.includes('warning')
    );
    
    return criticalErrors.length === 0;
  } catch {
    return false;
  }
}

async function runSingleTest(browser: puppeteer.Browser, iteration: number): Promise<TestResult> {
  const page = await browser.newPage();
  page.setViewport(TEST_CONFIG.viewport);
  
  const result: TestResult = {
    iteration,
    success: false,
    metrics: { loadTime: 0, domContentLoaded: 0 }
  };
  
  try {
    // 页面加载测试
    const { loadTime, domContentLoaded } = await testPageLoad(page);
    result.metrics.loadTime = loadTime;
    result.metrics.domContentLoaded = domContentLoaded;
    
    // 交互测试
    const interactionSuccess = await testPageInteraction(page);
    if (!interactionSuccess) {
      throw new Error('Page interaction test failed');
    }
    
    // 主题切换测试
    const themeSwitchTime = await testThemeSwitch(page);
    result.metrics.themeSwitchTime = themeSwitchTime;
    
    result.success = true;
  } catch (error: any) {
    result.success = false;
    result.error = error.message;
  } finally {
    await page.close();
  }
  
  return result;
}

async function runStabilityTest(): Promise<void> {
  console.log('='.repeat(60));
  console.log('隔离前端稳定性测试');
  console.log('='.repeat(60));
  console.log(`测试URL: ${TEST_CONFIG.url}`);
  console.log(`测试次数: ${TEST_CONFIG.iterations}`);
  console.log(`视口大小: ${TEST_CONFIG.viewport.width}x${TEST_CONFIG.viewport.height}`);
  console.log('='.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results: TestResult[] = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= TEST_CONFIG.iterations; i++) {
    const result = await runSingleTest(browser, i);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(
      `${status} 第 ${i.toString().padStart(3)} 次测试 | ` +
      `加载: ${result.metrics.loadTime}ms | ` +
      `DOM: ${result.metrics.domContentLoaded}ms | ` +
      `主题切换: ${result.metrics.themeSwitchTime || '-'}ms` +
      (result.error ? ` | 错误: ${result.error}` : '')
    );
    
    // 每10次输出一次统计
    if (i % 10 === 0) {
      const passedCount = results.filter(r => r.success).length;
      const failedCount = i - passedCount;
      console.log('-'.repeat(60));
      console.log(`进度: ${i}/${TEST_CONFIG.iterations} | 成功: ${passedCount} | 失败: ${failedCount} | 成功率: ${((passedCount / i) * 100).toFixed(1)}%`);
      console.log('-'.repeat(60));
    }
  }
  
  await browser.close();
  
  // 生成报告
  console.log('\n' + '='.repeat(60));
  console.log('测试报告');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const failedResults = results.filter(r => !r.success);
  
  const loadTimes = results.map(r => r.metrics.loadTime);
  const domLoadTimes = results.map(r => r.metrics.domContentLoaded);
  const themeSwitchTimes = results.map(r => r.metrics.themeSwitchTime || 0).filter(t => t > 0);
  
  console.log(`总测试次数: ${TEST_CONFIG.iterations}`);
  console.log(`成功次数: ${successCount} (${((successCount / TEST_CONFIG.iterations) * 100).toFixed(1)}%)`);
  console.log(`失败次数: ${failedResults.length} (${((failedResults.length / TEST_CONFIG.iterations) * 100).toFixed(1)}%)`);
  console.log(`总耗时: ${Date.now() - startTime}ms`);
  
  console.log('\n性能指标:');
  console.log(`页面加载时间 - 平均: ${(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length).toFixed(0)}ms | 最小: ${Math.min(...loadTimes)}ms | 最大: ${Math.max(...loadTimes)}ms`);
  console.log(`DOM加载时间 - 平均: ${(domLoadTimes.reduce((a, b) => a + b, 0) / domLoadTimes.length).toFixed(0)}ms | 最小: ${Math.min(...domLoadTimes)}ms | 最大: ${Math.max(...domLoadTimes)}ms`);
  if (themeSwitchTimes.length > 0) {
    console.log(`主题切换时间 - 平均: ${(themeSwitchTimes.reduce((a, b) => a + b, 0) / themeSwitchTimes.length).toFixed(0)}ms | 最小: ${Math.min(...themeSwitchTimes)}ms | 最大: ${Math.max(...themeSwitchTimes)}ms`);
  }
  
  if (failedResults.length > 0) {
    console.log('\n失败详情:');
    const errorGroups: Record<string, number> = {};
    failedResults.forEach(r => {
      const error = r.error || 'Unknown error';
      errorGroups[error] = (errorGroups[error] || 0) + 1;
    });
    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(`  - ${error}: ${count}次`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
  
  process.exit(failedResults.length > 0 ? 1 : 0);
}

runStabilityTest().catch(console.error);
