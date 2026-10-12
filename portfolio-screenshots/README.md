# Formtified: portfolio screenshots

73 screenshots of every Formtified screen, for use in a portfolio site.

**Formtified** is an AI onboarding-form builder for freelancers and creators. A creator describes a client's project in a sentence. The AI asks a few clarifying questions, then generates a complete onboarding form. The creator shares it as a link (for example on WhatsApp), the client fills it, and every response lands in the creator's dashboard. An admin dashboard monitors the platform: users, subscribers, forms, site visits and announcements.

- **Live:** https://formtified.vercel.app
- **Code:** https://github.com/jonascodes15/formtified
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion, Neon Postgres, JWT auth (jose + bcrypt), OpenAI-compatible AI API, Resend email, Vercel hosting.

## Folder layout

```
portfolio-screenshots/
  manifest.json   one entry per image: file, title, caption, area, route, size
  desktop/        38 images, 1440×900 viewport at 2x (2880×1800 px)
  mobile/         35 images, 390×844 viewport at 3x (1170×2532 px)
```

Files whose names end in `-full` are full-page captures. They keep the same width but are taller than the viewport.

## manifest.json

Each entry in `screens` has these fields:

| Field | Meaning |
|---|---|
| `file` | Path relative to this folder, e.g. `desktop/14-dashboard.png` |
| `device` | `desktop` or `mobile` |
| `area` | Group: Landing page, Auth, Client form, Creator app, AI generator, Admin dashboard, Other |
| `title` | Short name of the screen |
| `caption` | One sentence describing what it shows, usable as alt text or a caption |
| `route` | The app URL the screen lives at |
| `fullPage` | `true` for full-page captures |
| `width`, `height` | Size in CSS pixels. The PNG is `width × scale` by `height × scale` |
| `scale` | Pixel density (2 for desktop, 3 for mobile) |

## Using them in a Next.js portfolio

Copy this folder into the portfolio's `public/`, for example as `public/projects/formtified/`. Then:

```tsx
import Image from "next/image";
import manifest from "@/../public/projects/formtified/manifest.json";

const shots = manifest.screens.filter((s) => s.device === "desktop" && !s.fullPage);

{shots.map((s) => (
  <Image
    key={s.file}
    src={`/projects/formtified/${s.file}`}
    alt={s.caption}
    width={s.width}
    height={s.height}
    sizes="(max-width: 768px) 100vw, 1200px"
  />
))}
```

`next/image` converts and resizes the PNGs automatically, so the large originals are fine to keep.

**Good picks for a hero or cover image:**
- `desktop/01-landing-hero.png`
- `desktop/14-dashboard.png`
- `desktop/28-generate-done.png`
- `desktop/29-admin-overview.png`
- `mobile/01-landing-hero.png`

## About the data

All names, emails, businesses and numbers in these screenshots are fictional demo data, captured on a private demo copy of the app. The demo account is "Tobi Adeyemi". No real user data appears. Share links are shown with the live address, formtified.vercel.app.
