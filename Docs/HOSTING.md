# Hosting FenceBound (Ship item 6)

The app is two things: `index.html` and `lib/` (bundled jsPDF). `npm run build:site` copies exactly those
into `dist/`; nothing else in the repository (Docs, archive, research, tests) is published.
Test: `tests/hosting-build.spec.js`.

## Recommended: Cloudflare Pages (free tier)
1. Sign in at dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
2. Authorize GitHub for the `fencebound` repository only (private repos work).
3. Settings: production branch `main`; build command `npm run build:site`; output directory `dist`.
4. Deploy. The site appears at `<project>.pages.dev`; every push to `main` redeploys.

Note: a `pages.dev` URL is public to anyone who has it. To limit it to invited people, add
Cloudflare Access (Zero Trust, free up to 50 users) to the project.

## Alternative: Netlify
Import from Git, same build command and publish directory (`dist`).
