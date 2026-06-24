# Supreme Auto — Website

Marketing site for Supreme Auto, a premium vehicle dealership in Pretoria North.

## Structure

```
/
├── index.html              Entry point
├── css/
│   ├── style.css           Design tokens, reset, base typography, buttons, nav, hero
│   ├── components.css      Page-section components (about, services, inventory, detail, finance, testimonials, contact, footer)
│   └── animations.css      Scroll-reveal transitions, keyframes, responsive breakpoints, reduced-motion
├── js/
│   ├── script.js           Nav scroll state, mobile menu, enquiry form
│   ├── ui.js                Gallery thumbnail interaction
│   └── animations.js       IntersectionObserver scroll-reveal
├── assets/
│   ├── images/              Local imagery (currently empty — see Notes)
│   ├── icons/                Local icon assets (currently empty — icons are inline SVG)
│   ├── logos/                Brand logo files
│   └── fonts/                Self-hosted fonts (currently empty — fonts loaded via Google Fonts CDN)
├── docs/                     Project documentation
└── .gitignore
```

## Notes

- All vehicle/dealership imagery is currently hosted remotely at `siriusascent.co.za` and referenced by absolute URL. No local copies exist yet, so `assets/images/` is a placeholder for when photography is brought on-site.
- All icons (checkmarks, nav glyphs, social icons) are inline SVG in the markup — this avoids extra HTTP requests and lets icons inherit `currentColor`. `assets/icons/` is reserved for any future raster/icon-font assets.
- Fonts (`Space Grotesk`, `Inter`) load from Google Fonts via `<link>` tags in `<head>`. `assets/fonts/` is reserved if self-hosting becomes a requirement (e.g. for GDPR/performance reasons).
- The original file was named `index.html.html`; this has been corrected to `index.html`.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root folder.
3. The site will be served from `index.html` with relative paths to `css/` and `js/` — no build step required.
