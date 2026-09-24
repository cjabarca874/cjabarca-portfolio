# Abarca CJ — Portfolio (Angular)

This is your original portfolio (`index.html` / `project.html` / `style.css` /
`script.js` / `hero-effect.js` / `project.js` / `project-data.js`) converted
into an Angular application with routed pages. It uses native browser
scrolling alongside GSAP/ScrollTrigger pinned sections, the Three.js hero
particle field, and the brands coverflow. Scroll smoothing was removed
after disabling it resolved flicker in the client work section.

## Project structure

- `src/app/shared/nav`, `src/app/shared/footer` — the header/mobile menu and
  footer, shared across both pages.
- `src/app/home` — the home page, split into `hero`, `about`, `works`, and
  `brands` section components (this is what used to be `index.html`).
- `src/app/project` — the project detail page (what used to be
  `project.html`), now at the route `/project/:slug` instead of
  `project.html?slug=...`.
- `src/app/data/project.ts` — the three projects (Huts Haven, CompTech, GPS
  Drone), ported from `project-data.js`.
- `src/app/core/scroll.service.ts` — native section navigation, header scroll
  state, and shared GSAP ScrollTrigger setup.
- `src/styles.css` — your original `style.css`, unchanged, loaded globally.
- `public/images`, `public/fonts` — your original assets.

## Running it

To run locally:

```bash
cd angular-app
npm install
npm start
```

Then open the URL it prints (usually `http://localhost:4200`).

To build a production version:

```bash
npm run build
```

The output goes to `dist/abarca-cj-portfolio/browser` — that folder is what
you'd upload to a static host (same as you would have with the original
`index.html`/`project.html`/etc., just pre-built).

## If `npm install` or the build hits an error

The production build downloads Google Fonts to inline their stylesheets.
It requires network access to Google Fonts.

## What's slightly different from the original

- Navigation is done with Angular's router instead of `<a href="#...">` /
  `project.html?slug=...`. Section links use `routerLink` + a URL fragment
  (e.g. `/#about`), and each project now lives at `/project/huts-haven`,
  `/project/comptech`, `/project/gps-drone`.
- The mobile menu, header scroll state, native scrolling, and every
  scroll-triggered animation are wired up per-component using Angular
  lifecycle hooks (`ngAfterViewInit` / `ngOnDestroy`) instead of one big
  `script.js` that ran once on page load.
