# Deploy idris.ng on Laravel Cloud

The repository uses a thin Next.js production host around the existing React / Three.js portfolio. Laravel Cloud supports Next.js on Node; there is no Laravel/PHP application to configure. The Vite development server and optional static build are preserved.

## Application settings

Connect GitHub in Laravel Cloud, then create an application from `IDTitanium/idris.ng` with these settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Framework | Next.js |
| Runtime | Node.js 22 |
| Application root | Repository root (not `src/`, `app/`, or `dist/`) |
| Port | `3000` |
| Start command | `npm start` |
| Deploy commands | Leave empty |

Choose the region and compute size in the dashboard for your needs. No database, cache, queue, object storage, or persistent disk is needed.

Set the **build commands** to:

```sh
npm ci --include=dev --no-audit
npm run build
```

`--include=dev` ensures TypeScript and build tools are installed even when `NODE_ENV=production`. The build creates `.next/`; do not publish `dist/` or use `npm run preview` as the Cloud start command. Cloud starts the production server with `npm start` after building. There are no migrations or other deploy commands.

Cloud injects `NODE_ENV=production` and its configured `PORT`. The start script listens on `0.0.0.0` and reads that port. Cloud also supplies `NEXT_PUBLIC_SITE_URL`; the portfolio deliberately keeps its canonical and social URLs fixed to `https://idris.ng/` in `app/layout.tsx`, so preview domains do not replace the public identity. No custom environment variables or `.env` file are required.

## Deploy and verify

1. Review push-to-deploy before connecting the production branch; Cloud enables automatic deployments by default.
2. Click **Deploy** and wait for a successful build and startup.
3. Open the assigned Cloud domain and verify that the island loads, project panels open, and mobile controls work.
4. Request `https://<your-cloud-domain>/health`. Expect HTTP 200, `{"status":"ok"}`, and `Cache-Control: no-store`.
5. Add `idris.ng` under the environment's Domains settings. Add the exact DNS records Cloud displays at your DNS provider. Wait for DNS verification and the managed TLS certificate, then verify `https://idris.ng/`. Add `www.idris.ng` separately only if wanted.

The browser keeps game progress locally. There is no server-side user data to migrate or persist across deploys. Google Fonts are fetched by the visitor's browser, with system-font fallbacks; the build does not require Google Fonts access.

## Local production check

```sh
npm ci --include=dev --no-audit
npm run build
npx playwright install chromium
npm run test:production
```

The production browser suite starts a fresh server on port `4173` and exercises the same interaction and mobile tests as the Vite suite. To try it manually:

```sh
PORT=3000 npm start
```

Open http://localhost:3000 and http://localhost:3000/health. `npm start` requires a successful `npm run build` first. To recover from a failed deployment, inspect the build/application logs and redeploy a known-good commit through Cloud; do not alter the production filesystem manually.

## References

- [Laravel Cloud quickstart — Next.js settings and commands](https://laravel.com/cloud/docs/quickstart)
- [Supported runtimes](https://laravel.com/cloud/docs/runtimes)
- [Deployments and push-to-deploy](https://laravel.com/cloud/docs/deployments)
- [Custom domains](https://laravel.com/cloud/docs/domains)
- [Next.js Vite migration guide](https://nextjs.org/docs/app/guides/migrating/from-vite)
