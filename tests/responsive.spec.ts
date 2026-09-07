import { test, expect } from '@playwright/test';

test('phone and tablet layouts fit at all breakpoint boundaries', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.world.is-ready')).toBeVisible();
  for (const width of [320, 360, 390, 480, 540, 640, 768, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const heading = document.querySelector('h1')!;
      const range = document.createRange(); range.selectNodeContents(heading);
      return {
        pageFits: document.documentElement.scrollWidth <= innerWidth,
        headingFits: [...range.getClientRects()].filter(rect => rect.width > 0).every(rect => rect.left >= 0 && rect.right <= innerWidth),
        cardsFit: [...document.querySelectorAll('.destination-card')].every(el => el.scrollWidth <= el.clientWidth),
      };
    });
    expect(layout, `Layout at ${width}px`).toEqual({ pageFits: true, headingFits: true, cardsFit: true });
  }
});

test('mobile pins and primary game controls have separate thumb-sized hit areas', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.locator('.world.is-ready')).toBeVisible();
  const pins = await page.locator('.world-label').evaluateAll(nodes => nodes.map(el => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x, y, width, height };
  }));
  for (const [i, pin] of pins.entries()) {
    expect(pin.width).toBeGreaterThanOrEqual(44);
    expect(pin.height).toBeGreaterThanOrEqual(44);
    for (const other of pins.slice(i + 1)) {
      expect(pin.x >= other.x + other.width || other.x >= pin.x + pin.width || pin.y >= other.y + other.height || other.y >= pin.y + pin.height).toBe(true);
    }
  }
  const targets = await page.locator('.world-controls button, .touch-controls button').evaluateAll(nodes => nodes.map(el => ({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})));
  expect(targets.length).toBe(8);
  for (const target of targets) { expect(target.width).toBeGreaterThanOrEqual(44); expect(target.height).toBeGreaterThanOrEqual(44); }
});

test('touch movement can reach a destination and stops on release', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const left = page.getByRole('button', { name: 'Move left', exact: true });
  await left.scrollIntoViewIfNeeded();
  const box = (await left.boundingBox())!;
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
  await expect(page.locator('.interact-prompt')).toContainText('garden', { timeout: 8000 });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(700);
  await expect(page.locator('.interact-prompt')).toContainText('garden');
  await page.locator('.interact-prompt').tap();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('The garden');
  await context.close();
});

test('narrow drawers and landscape keep content and closing controls reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  for (const place of ['about', 'work', 'writing', 'podcast', 'contact']) {
    await page.locator(`.destination-${place}`).click();
    expect(await page.locator('.detail-panel').evaluate(el => el.scrollWidth <= el.clientWidth), place).toBe(true);
    if (place === 'work') {
      await page.getByRole('tab', { name: /Clippy/ }).click();
      await page.getByLabel('A little note to send').fill('A note from a small screen');
      await page.getByRole('button', { name: 'Send to phone' }).click();
      await expect(page.locator('.phone-message')).toHaveText('A note from a small screen');
    }
    await page.locator('.detail-panel').evaluate(el => { el.scrollTop = el.scrollHeight; });
    const close = page.getByRole('button', { name: 'Close panel' });
    await expect(close).toBeInViewport();
    await close.click();
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('.destination-podcast').click();
  await page.getByRole('button', { name: 'Find BytesBurn' }).click();
  await expect(page.locator('.receiver-status')).toContainText('SIGNAL FOUND');
  await expect(page.getByRole('button', { name: 'Close panel' })).toBeInViewport();
});
