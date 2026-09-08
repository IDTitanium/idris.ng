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
4. Request `https://<your-cloud-domain>/health`. Expect HTTP 200, `{"status":"ok"}`, and `Cache-Control: no-store`. `/up` is also available for monitors configured with Laravel's conventional health path. Both endpoints support GET and HEAD without redirects; neither needs browser JavaScript.
5. Add `idris.ng` under the environment's Domains settings. Add the exact DNS records Cloud displays at your DNS provider. Wait for DNS verification and the managed TLS certificate, then verify `https://idris.ng/`. Add `www.idris.ng` separately only if wanted.

The browser keeps game progress locally. There is no server-side user data to migrate or persist across deploys. Google Fonts are fetched by the visitor's browser, with system-font fallbacks; the build does not require Google Fonts access.

## Local production check

```sh
npm ci --include=dev --no-audit
npm run build
npx playwright install chromium
npm run test:production
```

The production suite starts a fresh server on port `4173`, checks GET/HEAD health probes and missing-asset handling, and exercises the same interaction and mobile tests as the Vite suite. To try it manually:

```sh
PORT=3000 npm start
```

Open http://localhost:3000 and http://localhost:3000/health. `npm start` requires a successful `npm run build` first. To recover from a failed deployment, inspect the build/application logs and redeploy a known-good commit through Cloud; do not alter the production filesystem manually.

## If Cloud reports crashing after Next.js is ready

The `Ready` startup message confirms the server bound its port, not that Cloud's readiness check succeeded. A subsequent cluster shutdown with no application exception does not identify the cause by itself.

- Confirm the Cloud app is configured as Next.js and its application port matches the port printed at startup (normally `3000`). Remove a manually overridden `PORT` if it disagrees with the application port setting.
- Inspect access and proxy logs around startup for a failed probe's path and status. `/`, `/health`, and `/up` return 200; `/up` exists for compatibility, not because Cloud's public docs specify it as the Next.js probe path.
- Check compute metrics and termination details for out-of-memory or exit-code evidence. A process killed by the container's memory limit may not print a JavaScript exception.
- The npm `Unknown env config "python"` warning is non-fatal when Next.js starts afterward; changing the application's port or hiding that warning is not a demonstrated fix.

If the container still terminates, collect the full application/proxy logs, configured port, compute memory size, and exit reason before changing the runtime or increasing resources.

## References

- [Laravel Cloud quickstart — Next.js settings and commands](https://laravel.com/cloud/docs/quickstart)
- [Supported runtimes](https://laravel.com/cloud/docs/runtimes)
- [Deployments and push-to-deploy](https://laravel.com/cloud/docs/deployments)
- [Custom domains](https://laravel.com/cloud/docs/domains)
- [Next.js Vite migration guide](https://nextjs.org/docs/app/guides/migrating/from-vite)
