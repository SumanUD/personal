# sumanbanik.com

Personal portfolio of **Suman Banik**: Shopify expert, full-stack developer and AI/ML engineer.

Live: https://sumanbanik.com

## Stack

React 18 · TypeScript · Vite · Three.js (interactive 3D character) · GSAP · Lenis · Netlify (hosting + Forms)

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Editing content

Almost everything (name, roles, about, experience, projects, skills, contact links,
WhatsApp number) lives in [`src/config.ts`](src/config.ts). Leave a social link empty (`""`) to hide it.

## Forms

The contact form and the project planner (`/start`) submit to **Netlify Forms**.
Hidden copies of both forms live in `index.html` so Netlify detects them on deploy.
Submissions appear under *Site → Forms* in Netlify; turn on email notifications there.

© Suman Banik. All rights reserved.
