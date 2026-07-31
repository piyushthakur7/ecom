# Saanshika Ethnics

Next.js (App Router + TypeScript) port of the `Saanshika Ethnics.dc.html` Claude Design page,
built on the **Modernist** design system.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Layout

```
app/
  layout.tsx        root layout — Archivo via next/font, metadata
  page.tsx          homepage — composes the sections in order
  globals.css       Modernist tokens + component classes, then page-level pieces
components/
  cart-context.tsx  client cart state shared by <Nav> and <Featured>
  image-slot.tsx    the port of the design's <image-slot>
  marquee.tsx nav.tsx hero.tsx categories.tsx featured.tsx
  features.tsx testimonials.tsx newsletter.tsx footer.tsx
lib/
  site.ts           site config + the design's editor props as constants
  data.ts           products, categories, testimonials, photo credits
```

### Design system

`app/globals.css` is the Modernist stylesheet copied verbatim from
`_ds/modernist-.../styles.css` — same tokens (`--color-*`, `--space-*`, `--radius-*`,
`--shadow-*`) and same component classes (`.btn`, `.tag`, `.nav`, `.card`, `.input`, …).
Retune the look there.

Two deliberate changes to that file:

- The Google Fonts `@import` is replaced by `next/font/google` (`Archivo`, loaded in
  `app/layout.tsx`), so the font is self-hosted and there is no render-blocking request.
  `--font-heading` / `--font-body` now point at the `--font-archivo` variable next/font injects.
- Page-level pieces the original page declared inline — the marquee keyframes, the media
  frames that scale on hover, the newsletter input on the accent background — live in a
  clearly marked block at the bottom rather than as inline styles, so they can respect
  `prefers-reduced-motion`.

### Design switches

The canvas editor props are constants in `lib/site.ts`:

| Constant           | Effect                                            |
| ------------------ | ------------------------------------------------- |
| `showSaleBadges`   | "20% off" badges on discounted product cards      |
| `showTestimonials` | renders the testimonials section                  |
| `colourPhotos`     | `false` applies the DS `.grayscale` utility        |

### Images

Photos are remote Unsplash URLs served through `next/image`; `images.unsplash.com` is
allow-listed in `next.config.mjs`. Photographer credit is carried on each image's `title`.

## Deploying

**Vercel** — push the repo and import it. Zero config; `next build` is detected automatically.

**Any Node host** (Render, Railway, Fly, a VPS) — build command `npm run build`,
start command `npm run start`, and set `PORT` if the host expects it.

**Docker / self-host** — the standard Next.js Node runtime works as-is. Add
`output: 'standalone'` to `next.config.mjs` for a slimmer image.

**Static export** (Netlify, GitHub Pages, S3) — the page is already fully static
(`○ (Static)` in the build output), so add to `next.config.mjs`:

```js
output: 'export',
images: { unoptimized: true },
```

`unoptimized` is required because static export has no server to run the image
optimizer; the Unsplash URLs are then loaded directly.

## Notes

- The cart is client-side only — `Add to cart` increments the counter in the nav and
  nothing is persisted. Wire `components/cart-context.tsx` to a real backend when you need one.
- The newsletter form validates the email and swaps to the confirmation state, but does
  not submit anywhere. Point the `onSubmit` in `components/newsletter.tsx` at your list provider.
- `npm audit` reports advisories in `postcss` and `sharp`. Both are transitive dependencies
  pinned by Next.js itself — `npm audit fix --force` "resolves" them by downgrading to
  `next@9`, so they are left in place until Next ships updated ranges.
