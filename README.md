# Yaman Diab — Portfolio

The portfolio of Yaman Diab, Flutter developer. A static site in Arabic and English, hosted free on GitHub Pages.

Live address after deployment: <https://yaman-diab.github.io/yaman-portfolio/>

## Technology

| Part | Choice | Why |
|---|---|---|
| Framework | [Astro 5](https://astro.build) with TypeScript | Ships plain HTML and CSS. JavaScript only where a page needs it. |
| Styling | Plain CSS with design tokens | No runtime, no build plugins. Logical properties mirror the layout for Arabic. |
| Motion | CSS animations, the View Transitions API, small TypeScript modules | No animation library. Everything respects reduced-motion settings. |
| Fonts | Bricolage Grotesque, Fustat, IBM Plex Sans, IBM Plex Sans Arabic | Self-hosted through Fontsource. Only Latin and Arabic subsets ship. |
| Images | `astro:assets` | AVIF and WebP with a JPEG fallback, in several widths. |
| Hosting | GitHub Pages, deployed by GitHub Actions | Free. No server. |

Flutter Web was considered and not used: it ships a multi-megabyte runtime, draws text to a canvas, and search engines and link previews read it poorly. A recruiter should see the page in under a second.

## Architecture

The code follows Clean Architecture, applied lightly. Dependencies point inward: pages and components know the domain, and only one file knows where the content comes from.

```
src/
├── domain/                 What the site is about. No framework, no content.
│   ├── entities/           Profile, Project, Career, Locale
│   ├── repositories/       PortfolioRepository (the contract)
│   └── usecases/           getCaseStudy: one project plus the next one
├── data/                   Where the content lives.
│   ├── content/            facts.ts (links, years, stacks), en.ts, ar.ts, screens.ts
│   ├── validation/         Schema checks, and a check that both languages match
│   └── repositories/       StaticPortfolioRepository (implements the contract)
├── app/                    Wiring.
│   ├── container.ts        The composition root: picks the repository
│   └── routes.ts           Every internal address, with the base path applied
├── presentation/           Everything visual. Reads domain types only.
│   ├── styles/             tokens.css, base.css, fonts.css
│   ├── layouts/            BaseLayout.astro (head, SEO, header, footer)
│   ├── components/         SiteHeader, SiteFooter, StatusPill, PhoneFrame, ToolList
│   ├── sections/           Hero, About, Work, Expertise, Experience, Recognition, Writing
│   ├── features/case-study CaseStudy, ScreenGallery, FlowDiagram, SyncQueueDemo, VerificationDemo
│   ├── scripts/            site.ts (scroll reveal, copy button, header, language switch)
│   └── i18n/               ui.ts (button and heading labels in both languages)
└── pages/                  Routes. Each one asks the container for data and passes it down.
    ├── [...locale]/index.astro             /  and  /ar/
    ├── [...locale]/projects/[slug].astro   /projects/wafir/  and  /ar/projects/wafir/
    └── 404.astro
```

Rules the code keeps:

- `presentation/` never imports from `data/`. Components receive entities as props.
- `domain/` imports nothing from the other layers.
- Only `app/container.ts` names `StaticPortfolioRepository`. Swapping it for a CMS or an API means writing one new class.
- Content is validated when the build starts. A missing field, a bad link or a translation that has fallen behind stops the build with a message that names the field.

There is one use case and one repository on purpose. This is a small site, and more layers would only add files.

## Commands

Requires Node 20.3 or newer.

```bash
npm install        # once
npm run dev        # http://localhost:4321/yaman-portfolio/
npm run build      # type-check, validate content, build into dist/
npm run preview    # serve dist/ locally
npm run qa         # check dist/: links, anchors, assets, metadata
npm run qa -- --external   # also request every external link
npm run og         # redraw public/og.png and the PNG icons
```

## Updating the content

Everything you would normally change is in `src/data/content/`.

| To change | Edit |
|---|---|
| Email, phone, GitHub, LinkedIn, project links | `facts.ts` → `LINKS` |
| A project's year, status, technologies or links | `facts.ts` → `PROJECT_FACTS` |
| The order of projects | The order of `PROJECT_FACTS` |
| Any English text | `en.ts` |
| Any Arabic text | `ar.ts` |
| Button and heading labels | `src/presentation/i18n/ui.ts` |
| The portrait | Replace `src/assets/yaman-diab.webp` (square, at least 900px) |
| Phone screenshots | Add `1.png`, `2.png`, `3.png` to `src/assets/screens/<project>/` (see the README there) |
| The names of the three screens | `screens` under each project in `en.ts` and `ar.ts` |
| A credit for someone else's material in a screenshot (a test video, a photo) | `credit` on that screen, in both `en.ts` and `ar.ts`. It shows under the phone on the case study. |
| Colours, type sizes, spacing | `src/presentation/styles/tokens.css` |
| The social preview image | `scripts/generate-og.mjs`, then `npm run og` |

Keep `en.ts` and `ar.ts` in step: the same number of challenges, diagrams and list items. The build fails and tells you where they differ.

### Adding a project

1. Add its slug to `PROJECT_SLUGS` in `src/domain/entities/project.ts`.
2. Add its facts to `PROJECT_FACTS` in `facts.ts`.
3. Add its text under `projects` in both `en.ts` and `ar.ts`.

The page, the list row and the links are generated from those three entries.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site, checks it and publishes it.

One-time setup on GitHub:

1. Open the repository, then **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`, or open **Actions → Deploy to GitHub Pages → Run workflow**.

The workflow reads the site address from the Pages settings, so the base path is always right. If the build, the type check, the content validation or the link check fails, nothing is published and the previous version stays online.

### Custom domain

Set the domain under **Settings → Pages → Custom domain** and add the DNS records GitHub shows. The next deploy picks up the new address by itself. No code changes are needed.

## Known limits

- Each project has three phone frames. Until screenshots are added, they show the app and screen names.
- Page transitions need a browser with cross-document view transitions (Chrome, Edge, Safari 18.2+). Other browsers navigate normally.
- `robots.txt` is not served, because a project site lives under `/yaman-portfolio/` and crawlers only read that file at the domain root. Add one if you move to a custom domain.
