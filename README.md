# Supreme Auto — Website

Marketing site for Supreme Auto, a premium vehicle dealership in Pretoria North. Static HTML/CSS/vanilla-JS, no build step, deployed on GitHub Pages.

## Structure

```
/
├── index.html              Entry point (one-page site, anchor-linked sections)
├── 404.html                GitHub Pages 404 fallback
├── privacy.html            Privacy Policy
├── terms.html              Terms & Conditions
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── css/
│   ├── style.css            Design tokens, reset, base typography, buttons, nav, hero, ambient background, cursor-spotlight
│   ├── components.css       Page-section components (about, services, inventory, detail, finance, financing partners, testimonials, contact/location, footer)
│   ├── animations.css       Scroll-reveal transitions, keyframes, responsive breakpoints, reduced-motion
│   ├── finance-wizard.css   Finance Application modal (overlay, progress stepper, form/review/email-preview layout)
│   └── vehicle-whatsapp.css Vehicle WhatsApp Enquiry modal
├── js/
│   ├── script.js            Nav scroll state, mobile menu, fresh-load scroll-to-top, shared openInNewTab() helper
│   ├── vehicles-data.js     Single source of truth: getVehicles() fetches+caches assets/vehicles.json
│   ├── detail.js            Renders the selected vehicle into the Vehicle Preview section, exposes getCurrentVehicle()
│   ├── inventory.js         Renders cards from data, filtering, dynamic Model dropdown, empty state
│   ├── contact-form.js      Enquiry form: searchable vehicle combobox, validation, WhatsApp send
│   ├── finance-wizard.js    5-step Finance Application modal: validation, review, mailto send, draft persistence
│   ├── vehicle-whatsapp.js  Vehicle WhatsApp Enquiry modal: reads the current vehicle, builds the WhatsApp message
│   ├── counters.js          Stat number count-up on scroll-into-view
│   ├── testimonials.js      Testimonial carousel + "Read more" toggle
│   ├── animations.js        IntersectionObserver scroll-reveal, exposes window.refreshReveals()
│   ├── hero.js              Hero scroll parallax + scroll-indicator fade
│   ├── parallax.js          Ambient background glow parallax
│   └── cursor-glow.js       Cursor-aware spotlight highlight on cards
├── assets/
│   ├── vehicles.json        Vehicle inventory data (single source of truth — see js/vehicles-data.js)
│   ├── images/              Vehicle photos (assets/images/inventory/<slug>/1-5.jpg), hero/team photography
│   ├── icons/                favicon.svg
│   ├── logos/                Brand logo files
│   └── fonts/                Self-hosted fonts (currently empty — fonts loaded via Google Fonts CDN)
├── docs/                     Project documentation
└── .gitignore
```

## Notes

- Vehicle data lives in `assets/vehicles.json` and is the single source of truth — `getVehicles()` in `js/vehicles-data.js` fetches and caches it once per page load. The inventory grid, vehicle detail preview, contact form's vehicle combobox and the finance wizard's vehicle dropdown all read from this same call.
- All icons (checkmarks, nav glyphs, social icons) are inline SVG in the markup — this avoids extra HTTP requests and lets icons inherit `currentColor`. `assets/icons/` currently holds only `favicon.svg`.
- Fonts (`Space Grotesk`, `Inter`) load from Google Fonts via `<link>` tags in `<head>`. `assets/fonts/` is reserved if self-hosting becomes a requirement (e.g. for GDPR/performance reasons).
- `privacy.html` / `terms.html` are general-purpose boilerplate reflecting what this site actually does (forms hand off to WhatsApp/email, no tracking cookies, third-party embeds). They should be reviewed by a qualified attorney before being relied on for legal compliance.

## Deployment (GitHub Pages)

1. Push this repository to GitHub.
2. In **Settings → Pages**, set the source to the `main` branch, root folder. Custom domain is set to `supremeautonorth.co.za` (the `CNAME` file in the repo root must keep matching whatever's configured there, or GitHub Pages will drop the custom domain on the next deploy).
3. The site is served from `index.html` with relative paths to `css/`, `js/` and `assets/` — no build step required. `robots.txt`, `sitemap.xml` and every page's canonical/Open Graph tags use the absolute `https://supremeautonorth.co.za/` URL — all of these must stay on the same domain the site actually serves from, or Google Search Console will reject the sitemap ("not allowed for a sitemap at this location").

### Cache-busting

CSS/JS files are linked with a `?v=N` query string (e.g. `css/style.css?v=31`). GitHub Pages' CDN caches assets for 10 minutes, and some in-app browsers (WhatsApp, Instagram, etc.) cache far longer and independently of normal browser cache settings. **Bump the `v` number on every CSS/JS edit** so visitors always get the latest file instead of a stale cached copy. `index.html`, `privacy.html`, `terms.html` and `404.html` each carry their own `?v=` and should be bumped together.
