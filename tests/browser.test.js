const { chromium } = require('/home/user/.testbrowser/node_modules/playwright');
const path = require('path');

const HTML = 'file://' + path.resolve('/home/user/EndlessPuzzles/build/apkassets/index.html');
const SHOTS = '/home/user/EndlessPuzzles/screens';
require('fs').mkdirSync(SHOTS, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(HTML);
  await page.waitForSelector('.hero-btn');
  await page.screenshot({ path: SHOTS + '/01-home.png', fullPage: true });
  console.log('home ok');

  // Run level 1: Sudoku, solved via hints to exercise hint + win + next.
  await page.click('[data-act="run"]');
  await page.waitForSelector('.sudoku-grid');
  await page.screenshot({ path: SHOTS + '/02-sudoku.png', fullPage: true });
  for (let i = 0; i < 85; i++) {
    if (await page.$('.overlay')) break;
    await page.click('[data-act="hint"]');
  }
  const win1 = await page.textContent('.overlay');
  if (!/cleared/.test(win1)) throw new Error('Sudoku did not complete: ' + win1);
  await page.screenshot({ path: SHOTS + '/03-win.png' });
  console.log('sudoku win ok');

  // Next in run: Flow level 2.
  await page.click('[data-act="next"]');
  await page.waitForSelector('.flow-canvas');
  await page.screenshot({ path: SHOTS + '/04-flow.png', fullPage: true });
  for (let i = 0; i < 25; i++) {
    if (await page.$('.overlay')) break;
    await page.click('[data-act="hint"]');
  }
  const win2 = await page.textContent('.overlay');
  if (!/cleared/.test(win2)) throw new Error('Flow did not complete: ' + win2);
  console.log('flow win ok');
  await page.click('.overlay [data-act="home"]');

  // Each free-play game mounts and responds to input.
  for (const id of ['sudoku', 'flow', 'slide', 'merge', 'mines', 'code']) {
    await page.click('[data-act="play"][data-game="' + id + '"]');
    await page.waitForSelector('.board-panel');
    await page.waitForTimeout(120);
    await page.screenshot({ path: SHOTS + '/game-' + id + '.png', fullPage: true });
    console.log('mounted', id);
    if (id === 'slide') {
      const before = await page.textContent('#hud-moves');
      const tiles = await page.$$eval('.tile', els => els.map(e => e.textContent.trim()));
      const n = Math.sqrt(tiles.length), blank = tiles.indexOf('');
      const candidates = [];
      if (blank % n > 0) candidates.push(blank - 1);
      if (blank % n < n - 1) candidates.push(blank + 1);
      if (blank >= n) candidates.push(blank - n);
      if (blank + n < tiles.length) candidates.push(blank + n);
      await page.click('[data-act="stile"][data-i="' + candidates[0] + '"]');
      const after = await page.textContent('#hud-moves');
      if (before === after) throw new Error('slide move did not count');
      await page.click('[data-act="hint"]');
    }
    if (id === 'merge') {
      const box = await page.$eval('#mgGrid', e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      for (const [dx, dy] of [[70, 0], [0, 70], [-70, 0], [0, -70]]) {
        await page.mouse.move(box.x, box.y); await page.mouse.down();
        await page.mouse.move(box.x + dx, box.y + dy, { steps: 6 }); await page.mouse.up();
      }
      await page.click('[data-act="hint"]');
    }
    if (id === 'mines') {
      await page.click('[data-act="mcell"][data-i="0"]');
      await page.click('[data-act="mflag"]');
      await page.click('[data-act="mcell"][data-i="1"]');
      await page.click('[data-act="hint"]');
    }
    if (id === 'code') {
      const palCount = await page.$$eval('[data-act="cpal"]', els => els.length);
      await page.click('[data-act="cpal"][data-v="0"]');
      await page.click('[data-act="cpal"][data-v="1"]');
      await page.click('[data-act="cpal"][data-v="2"]');
      await page.click('[data-act="csubmit"]');
      await page.click('[data-act="hint"]');
      if (palCount < 4) throw new Error('code palette too small');
    }
    if (id === 'sudoku' || id === 'flow') await page.click('[data-act="hint"]');
    await page.click('.game-top [data-act="home"]');
    await page.waitForSelector('.hero-btn');
  }

  // Settings interactions.
  await page.click('[data-act="settings"]');
  await page.waitForSelector('[data-act="toggle"]');
  await page.click('[data-act="toggle"][data-key="sound"]');
  await page.click('[data-act="accent"][data-val="magenta"]');
  await page.screenshot({ path: SHOTS + '/05-settings.png', fullPage: true });
  if (await page.getAttribute('body', 'data-accent') !== 'magenta') throw new Error('accent failed');
  console.log('settings ok');

  console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
  if (errors.length) process.exit(1);
  console.log('BROWSER_TESTS_OK');
})().catch(e => { console.error(e); process.exit(1); });
