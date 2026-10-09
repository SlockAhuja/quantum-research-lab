# Quantum Research Lab (QRL) — Deployment Guide

This guide details how to build, verify, and deploy Quantum Research Lab (QRL) as a static Single Page Application (SPA).

---

## 1. Prerequisites & Build Pipeline

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Build & Test Commands
```bash
# 1. Install dependencies
npm install

# 2. Run master verification tests (25/25 automated tests)
npm test

# 3. Perform TypeScript type-checking
npm run lint

# 4. Compile production assets into dist/
npm run build

# 5. Preview production build locally
npm run preview
```

The compiled output is output to `dist/`:
- `dist/index.html`: Main HTML entry point.
- `dist/assets/*.css`: Bundled CSS stylesheet.
- `dist/assets/*.js`: Production JavaScript bundle.

---

## 2. Target Hosting Platforms

QRL is a 100% client-side application requiring no server-side database or execution runtime.

### A. Vercel
1. Connect the repository to Vercel.
2. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. SPA routing is automatically handled via [`vercel.json`](./vercel.json).

### B. Netlify
1. Connect the repository to Netlify.
2. Build Settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. SPA routing redirects are configured via [`public/_redirects`](./public/_redirects).

### C. Cloudflare Pages
1. Create a new Cloudflare Pages project.
2. Build Configuration:
   - **Framework Preset**: None (or Vite)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`

### D. GitHub Pages
1. In [`vite.config.ts`](./vite.config.ts), `base: './'` is configured for relative path resolution.
2. Build assets: `npm run build`.
3. Deploy `dist/` to the `gh-pages` branch.

### E. Static Nginx / Docker
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 3. Deployment Safety & Verification Checklist

Before pointing production DNS:
1. Verify that `dist/index.html` loads cleanly without 404 asset paths.
2. Verify that no secrets or API keys are embedded in client bundles.
3. Perform the manual browser verification checklist on the staging URL.
4. Confirm that the application is labeled as a client-side analytical simulation workstation.
