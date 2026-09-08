import { expect, test } from '@playwright/test';
import * as THREE from 'three';

test('the duck offers facts and hints and remembers a pond break', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: /Talk to the duck/ });
  await opener.click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Meet your rubber duck');
  await page.getByRole('button', { name: 'Tell me a joke' }).click();
  await expect(page.locator('.duck-speech')).toContainText('pond');
  await page.getByRole('button', { name: 'Give me a hint' }).click();
  await expect(page.locator('.duck-speech')).toContainText('studio');
  await page.getByRole('button', { name: 'About Idris', exact: true }).click();
  await expect(page.locator('.duck-speech')).toContainText('Eight years');
  await page.getByRole('button', { name: /let the duck rest/ }).click();
  await expect(page.getByRole('button', { name: 'Bring the duck along' })).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.reload();
  await opener.click();
  await expect(page.getByRole('button', { name: 'Bring the duck along' })).toBeVisible();
});

test('the terminal handles history, navigation, themes and untrusted text safely', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Secret terminal');
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await expect(input).toBeFocused();
  async function command(text: string) { await input.fill(text); await input.press('Enter'); }
  await command('whoami');
  await expect(page.locator('.terminal-log')).toContainText('Idris Lawal');
  await command('theme night');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('theme night');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('');
  await command('<img src=x onerror=alert(1)>');
  await expect(page.locator('.terminal-log img')).toHaveCount(0);
  await expect(page.locator('.terminal-log')).toContainText('Command not found');
  await command('sudo make-coffee');
  await expect(page.locator('.terminal-log')).toContainText('imaginary coffee');
  await command('clear');
  await expect(page.locator('.terminal-log')).toBeEmpty();
  await command('open work');
  await expect(page.getByRole('dialog')).toHaveAccessibleName('The arcade');
  await page.keyboard.press('Escape');
  await page.locator('.destination-work').click();
  await page.getByRole('tab', { name: /Clippy/ }).click();
  await page.getByLabel('A little note to send').fill('a ` note');
  await expect(page.getByRole('dialog')).toHaveAccessibleName('The arcade');
});

test('three genuine portfolio debugging cases can be solved and persist', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /A little bug hunt/ }).click();
  await expect(page.locator('.panel-lead')).toContainText('not invented career');
  const cases = [
    { name: 'The scroll thief', answer: 'A pointer-up with very little movement' },
    { name: 'The forgetful spark', answer: 'In React state above both views' },
    { name: 'The blank-screen gremlin', answer: 'Show a fallback and keep the content cards working' },
  ];
  for (const [index, bug] of cases.entries()) {
    await page.getByRole('button', { name: new RegExp(bug.name) }).click();
    if (index === 0) { await page.getByRole('button', { name: /Every pointer-down event/ }).click(); await expect(page.locator('.bug-feedback')).toContainText('Try another'); }
    await page.getByRole('button', { name: new RegExp(bug.answer) }).click();
    await expect(page.locator('.bug-resolution')).toContainText('PATCH ACCEPTED');
    await page.getByRole('button', { name: 'All three cases' }).click();
  }
  await expect(page.locator('.quest-complete')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /A little bug hunt/ })).toContainText('3/3');
});

test('the launchpad unlocks through exploration and completes a replayable finale', async ({ page }) => {
  await page.goto('/');
  await page.locator('.launch-invitation').click();
  await expect(page.getByRole('button', { name: 'Ship it!', exact: true })).toHaveCount(0);
  for (const id of ['about', 'work', 'writing', 'podcast', 'contact']) {
    await page.keyboard.press('Escape');
    await page.locator(`.destination-${id}`).click();
  }
  await page.keyboard.press('Escape');
  await page.locator('.launch-invitation').click();
  await page.getByRole('button', { name: 'Ship it!', exact: true }).click();
  await expect(page.locator('.launch-status')).toContainText('Launch in');
  await expect(page.locator('.launch-scene')).toHaveClass(/launch-done/, { timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Launch again' })).toBeEnabled();
  await page.getByRole('button', { name: 'Keep a postcard' }).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Your explorer postcard');
  await expect(page.locator('.postcard-preview canvas')).toHaveAttribute('aria-label', /mission shipped/);
});

test('starting a hunt returns to the island and a 3D bug opens its case', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: /A little bug hunt/ }).click();
  await page.getByRole('button', { name: 'Hunt on the island' }).click();
  const canvas = page.locator('.world canvas');
  await expect(canvas).toBeInViewport();
  const box = (await canvas.boundingBox())!;
  const aspect = box.width / box.height, halfWidth = Math.max(9.5, 7.1 * aspect);
  const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfWidth / aspect, -halfWidth / aspect, .1, 100);
  camera.position.set(13, 16, 20); camera.lookAt(0, .2, 0); camera.updateMatrixWorld();
  const target = new THREE.Vector3(-.6, .5, 4.1).project(camera);
  await canvas.click({ position: { x: (target.x * .5 + .5) * box.width, y: (-target.y * .5 + .5) * box.height } });
  await expect(page.getByRole('dialog')).toHaveAccessibleName('The debugging quest');
  await expect(page.locator('.bug-case h3')).toHaveText('The forgetful spark');
});

test('postcards export a personalized PNG locally and work in Read mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Read', exact: true }).click();
  await page.getByRole('button', { name: /Make a postcard/ }).click();
  await page.getByLabel('Sign your postcard').fill('Lagos explorer');
  await expect(page.locator('.postcard-preview canvas')).toHaveAttribute('aria-label', /Lagos explorer/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download postcard/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('my-idris-ng-postcard.png');
  expect(await download.failure()).toBeNull();
  const stream = await download.createReadStream();
  const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(chunk);
  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(800);
});

test('the real welcome is opt-in, can pause and replay, and stops when leaving the booth', async ({ page }) => {
  await page.goto('/');
  await page.locator('.destination-podcast').click();
  const booth = page.getByRole('region', { name: 'BytesBurn recording booth' });
  const audio = booth.locator('audio');
  await expect(audio).toHaveAttribute('src', '/audio/bytesburn-welcome.mp3');
  await expect(audio).toHaveAttribute('preload', 'none');
  expect(await audio.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await booth.getByRole('button', { name: 'Play Idris’s welcome' }).click();
  await expect(booth.locator('.on-air-sign')).toHaveText('ON AIR');
  await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(0);
  expect(await audio.evaluate((el: HTMLAudioElement) => el.duration)).toBeGreaterThan(10);
  await booth.getByRole('button', { name: 'Pause welcome' }).click();
  expect(await audio.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await expect(booth.locator('.on-air-sign')).toHaveText('MIC CHECK');
  await booth.getByRole('button', { name: 'Play Idris’s welcome' }).click();
  await audio.evaluate((el: HTMLAudioElement) => { el.currentTime = el.duration - .1; });
  await expect(booth.getByRole('button', { name: 'Play Idris’s welcome' })).toBeVisible();
  await booth.getByRole('button', { name: 'Play Idris’s welcome' }).click();
  const player = await audio.elementHandle();
  await page.getByRole('button', { name: 'Close panel' }).click();
  expect(await player!.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await player!.dispose();
});

test('welcome playback pauses on a simulated hidden tab and reports a missing file', async ({ page }) => {
  await page.goto('/');
  await page.locator('.destination-podcast').click();
  const booth = page.getByRole('region', { name: 'BytesBurn recording booth' });
  await booth.getByRole('button', { name: 'Play Idris’s welcome' }).click();
  await expect(booth.locator('.on-air-sign')).toHaveText('ON AIR');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  expect(await booth.locator('audio').evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; });
  await page.reload();
  await page.route('**/audio/bytesburn-welcome.mp3', route => route.fulfill({ status: 404, body: 'Not found' }));
  await page.locator('.destination-podcast').click();
  await booth.getByRole('button', { name: 'Play Idris’s welcome' }).click();
  await expect(booth.getByRole('status')).toContainText(/could not play|unavailable/);
});

test('all side quests fit narrow screens and reduced-motion launches skip animation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('idris-visited', JSON.stringify(['about', 'work', 'writing', 'podcast', 'contact'])));
  await page.goto('/');
  for (const selector of ['.duck-card', '.adventure-card:has-text("bug hunt")', '.terminal-card', '.adventure-card:has-text("postcard")', '.launch-invitation']) {
    await page.locator(selector).click();
    expect(await page.locator('.detail-panel').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByRole('button', { name: 'Close panel' }).click();
  }
  await page.locator('.launch-invitation').click();
  await page.getByRole('button', { name: 'Ship it!', exact: true }).click();
  await expect(page.locator('.launch-scene')).toHaveClass(/launch-done/);
  expect(await page.locator('.confetti-word span').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
