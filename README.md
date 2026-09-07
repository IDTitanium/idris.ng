# idris.ng — Idris’s little world

A bespoke, playable portfolio for Idris Lawal. A procedural Three.js island sits inside a warm editorial interface, with five explorable destinations: the studio (about), arcade (SubSync and Clippy), garden (writing), radio (BytesBurn Podcast), and portal (contact).

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. For production, run `npm run build` and serve `dist/` on any static host. `npm run preview` previews that production build locally.

## Explore

- WASD / arrow keys: walk with movement relative to the camera.
- Click / tap open ground: walk toward that point.
- Space: jump.
- On phones and tablets, hold the on-screen arrows to walk and tap Jump. Small screens use numbered island pins matching the destination cards. Swiping the island scrolls the page; tapping open ground walks there.
- E: open a nearby destination. Floating labels and destination cards open it directly.
- Collect all eight golden sparks and discover all five places.
- Select a product cartridge in the arcade. Organize sample subscriptions with SubSync or send a local demo note between Clippy’s illustrated devices.
- Tune the BytesBurn radio to 98.4, then follow the link to the real podcast on YouTube. The fictional radio frequency is a game interaction, not an actual broadcast or audio player.
- Sound is opt-in. The moon switches to night lighting.
- Read mode gives direct access to every section.

Discovery progress, sound and lighting preferences stay in local storage. Collected sparks last for the current page session. Returning to the crossroads does not erase discoveries. The site supports reduced motion, keyboard focus management, mobile layouts, and a fallback when WebGL is unavailable.

## Content and customization

`src/App.tsx` contains portfolio panels and interface copy. `src/content.ts` defines destinations and project URLs. `src/ProjectArcade.tsx` contains the two interactive product showcases; `src/PodcastRadio.tsx` contains the BytesBurn receiver. `src/World.tsx` builds and animates the island with code; no downloaded 3D models or image assets are needed. `src/styles.css` and `src/features.css` define the design and breakpoints.

The eight-year experience figure was provided by Idris. Professional details were grounded in these public profiles:

- [LinkedIn](https://www.linkedin.com/in/lawal-idris-oluwaseun/): identity, security background and mentorship.
- [The Mentoring Club](https://www.mentoring-club.com/profiles/idris-lawal): full-stack technologies and mentorship. Its older experience count is superseded by the user-provided eight years.
- [LogRocket author page](https://blog.logrocket.com/author/idrislawal/): published writing and article links.

- [SubSync website](https://web.mysubsync.com/): subscription capture, spend tracking, a central dashboard, and renewal reminders. Its separate [application](https://mysubsync.com) is linked too. Example subscriptions and prices in the portfolio are illustrative.
- [Clippy](https://useclippy.cc): sharing notes across devices in a room. Its portfolio demo stays entirely local and creates no real rooms or messages.
- [BytesBurn](https://www.youtube.com/@BytesBurn): podcast URL provided by Idris, who confirmed his role as host. No episode names, audience numbers, or live-broadcast claims are invented.

Idris confirmed that he is currently building SubSync and Clippy. No unverified employer dates, client names, results, contact email, or project metrics were invented. Fonts are loaded from Google Fonts, with system fallbacks. The page title, canonical URL, and social metadata target `https://idris.ng/`; deploying the site and configuring the domain remain separate operations.

## Verify

```sh
npx playwright install chromium
npm test
npm run build
```

Browser tests cover spark collection, five-place discovery persistence (including progress from the original four-place world), reading mode, settings, dialog keyboard focus, project links and interactions, radio tuning, layouts from 320px through tablet widths, touch movement and hit targets, landscape drawers, reduced motion, and WebGL fallback.
