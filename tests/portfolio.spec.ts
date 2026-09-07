import { test, expect } from '@playwright/test';

test('the playable world collects sparks and retains them across view changes', async ({ page }) => {
  const errors: string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.world.is-ready')).toBeVisible();
  await page.getByRole('button',{name:'Let’s explore',exact:true}).click();
  await expect(page.locator('.spark-count')).toHaveText('1/8',{timeout:15000});
  await page.keyboard.press('Space');
  await page.getByRole('button',{name:'Read',exact:true}).click();
  await expect(page.getByText('All the corners of my world, one click away.')).toBeVisible();
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await expect(page.locator('.world.is-ready')).toBeVisible();
  await expect(page.locator('.spark-count')).toHaveText('1/8');
  expect(errors).toEqual([]);
});

test('every destination opens and discovery progress survives reload', async ({ page }) => {
  await page.goto('/');
  for (const [name,heading] of [['The studio','Good software.'],['The arcade','Small frictions.'],['The garden','Learn something.'],['The radio','A different kind'],['The portal','Great things start']]) {
    await page.locator('.destination-card').filter({hasText:name}).click();
    await expect(page.getByRole('dialog').locator('h2')).toContainText(heading);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await expect(page.locator('.exploration-progress strong')).toHaveText('5/5');
  await page.reload();
  await expect(page.locator('.exploration-progress strong')).toHaveText('5/5');
});

test('settings, modal focus and contact links work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to nighttime'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','night');
  await page.getByRole('button',{name:'Enable sound'}).click();
  await expect(page.getByRole('button',{name:'Mute sound'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Say hello',exact:true}).click();
  const close=page.getByRole('button',{name:'Close panel'});
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Go to The portal'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await expect(page.getByRole('link',{name:'Let’s connect on LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/lawal-idris-oluwaseun/');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Say hello',exact:true})).toBeFocused();
});

test('mobile and reduced motion retain all portfolio content without overflow', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.world.is-ready')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Explore The garden'}).click();
  await expect(page.getByRole('dialog').locator('h2')).toContainText('Learn something.');
  await page.getByRole('button',{name:'Close panel'}).click();
  await page.getByRole('button',{name:'How to play'}).click();
  await expect(page.getByRole('dialog',{name:'How to play'})).toBeVisible();
  await page.getByRole('button',{name:'I’m ready to explore'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the content remains accessible without WebGL', async ({ page }) => {
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type: string,...args: unknown[]){
      if(type.includes('webgl'))return null;
      return original.apply(this,[type,...args] as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.getByText('Your browser couldn’t open the 3D world.')).toBeVisible();
  await page.locator('.destination-about').click();
  await expect(page.getByRole('dialog').locator('h2')).toContainText('Good software.');
});

test('idris.ng showcases the two current products with working miniature interactions', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/idris\.ng/);
  await expect(page.getByRole('button',{name:'idris.ng home'})).toBeVisible();
  await page.locator('.destination-work').click();
  await expect(page.getByText('Dev Alert',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Explore SubSync',exact:true})).toHaveAttribute('href','https://web.mysubsync.com/');
  await expect(page.getByRole('link',{name:'Already using SubSync? Open the app'})).toHaveAttribute('href','https://mysubsync.com');
  await page.getByRole('button',{name:'Organize sample subscriptions'}).click();
  await expect(page.locator('.sync-core')).toHaveText('$30/ month');
  await page.getByRole('tab',{name:/Clippy/}).click();
  await page.getByLabel('A little note to send').fill('Hello from idris.ng!');
  await page.getByRole('button',{name:'Send to phone'}).click();
  await expect(page.locator('.phone-message')).toHaveText('Hello from idris.ng!');
  await expect(page.getByRole('link',{name:'Explore Clippy',exact:true})).toHaveAttribute('href','https://useclippy.cc');
  await page.getByLabel('A little note to send').fill('');
  await expect(page.getByRole('button',{name:'Send to phone'})).toBeDisabled();
  await page.getByRole('tab',{name:/Clippy/}).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab',{name:/SubSync/})).toHaveAttribute('aria-selected','true');
});

test('BytesBurn is the fifth discovery and the radio can be tuned with the keyboard', async ({ page }) => {
  await page.addInitScript(()=>localStorage.setItem('idris-visited',JSON.stringify(['about','work','writing','contact'])));
  await page.goto('/');
  await expect(page.locator('.exploration-progress strong')).toHaveText('4/5');
  await page.getByRole('button',{name:'Explore The radio'}).click();
  await expect(page.locator('.exploration-progress strong')).toHaveText('5/5');
  await expect(page.locator('.toast')).toContainText('World explorer!');
  const tuner=page.getByRole('slider',{name:'Tune the BytesBurn radio'});
  await page.getByRole('button',{name:'Find BytesBurn'}).click();
  await expect(tuner).toHaveValue('98.4');
  await expect(page.locator('.receiver-status')).toContainText('SIGNAL FOUND');
  await tuner.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.receiver-status')).toContainText('TUNING IN');
  await expect(page.getByRole('link',{name:'Watch BytesBurn on YouTube'})).toHaveAttribute('href','https://www.youtube.com/@BytesBurn');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Read',exact:true}).click();
  await expect(page.locator('.reading-overview').getByRole('button',{name:/The radio/})).toBeVisible();
});

test('mobile project demos and podcast fit the screen and retain their controls', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('.destination-work').click();
  await page.getByRole('tab',{name:/Clippy/}).click();
  await page.getByLabel('A little note to send').fill('A note from my phone');
  await page.getByLabel('A little note to send').press('Enter');
  await expect(page.locator('.phone-message')).toHaveText('A note from my phone');
  expect(await page.locator('.detail-panel').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.getByRole('button',{name:'Go to The radio'}).click();
  await page.getByRole('button',{name:'Find BytesBurn'}).click();
  await expect(page.locator('.receiver-status')).toContainText('SIGNAL FOUND');
  expect(await page.locator('.detail-panel').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
});
