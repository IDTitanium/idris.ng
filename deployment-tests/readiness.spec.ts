import { expect, test } from '@playwright/test';

for (const path of ['/health', '/up']) {
  test(`${path} supports uncached GET and HEAD readiness probes`, async ({ request }) => {
    const response = await request.get(path, {
      headers: { 'User-Agent': 'kube-probe/1.32' },
      timeout: 2000,
      maxRedirects: 0,
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(response.headers()['cache-control']).toBe('no-store');

    const head = await request.head(path, { timeout: 2000, maxRedirects: 0 });
    expect(head.status()).toBe(200);
    expect(head.headers()['cache-control']).toBe('no-store');
    expect(await head.body()).toHaveLength(0);
  });
}

test('the root responds to a readiness probe without executing browser JavaScript', async ({ request }) => {
  const response = await request.get('/', { timeout: 2000, maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('idris.ng');
});

test('health compatibility does not turn missing assets into successful responses', async ({ request }) => {
  const response = await request.get('/missing-deployment-asset.js');
  expect(response.status()).toBe(404);
});
