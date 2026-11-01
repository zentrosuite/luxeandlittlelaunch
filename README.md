# Luxe & Little — launch page

Single-page "opening soon" site for **luxeandlittle.in**, hosted on GitHub Pages until the
Laravel shop goes live on Wasmer. Plain HTML/CSS/JS: no build step, GitHub Pages serves it as is.

## What's on it
- Logo emblem unveiled under a lace veil, the name written in ink, tagline blurring in
- Countdown to the planned opening, **1 December 2026, 10:00 IST** (`assets/js/main.js`, `target`)
- Instagram **@luxeandlittle_** and WhatsApp **+91 80156 11705** buttons; footer also lists call **+91 80565 56341**
- What's coming: abayas, hijabs, Korean accessories; four store promises

## Motion (free AnimatedWebs templates, rebuilt in the brand)
| Effect | AnimatedWebs template | File |
| --- | --- | --- |
| Moving silk background (WebGL) | Domain Warped Flow Field — "Gossamer Weave" | `assets/js/silk.js` |
| Name inking in letter by letter | Ink Spread Text Reveal — "Quillforge" (rebuilt in CSS for smoothness) | `site.css` (`.name`) |
| Words drifting out of blur | Soft Blur-In Words — "Sereno" | `assets/js/main.js`, `site.css` |
| Lace veil lifting off images | Lace Veil Image Reveal — "Veil Atelier" | `site.css` |

Fonts: Cormorant Garamond and Jost (self-hosted, SIL OFL). Phones get lighter versions of every
effect; everything pauses when the tab is hidden and holds still for "reduce motion".

## Edit
- Opening date: `assets/js/main.js` → `target`, and the "Opening around…" line in `index.html`.
- Links: search `index.html` for `instagram.com`, `wa.me` and `chat.whatsapp.com` (group invite; also regenerate `assets/img/qr-group.svg` if the invite link is reset).
- Bump `?v=` on the CSS/JS links in `index.html` after editing so phones fetch the new files.

## GitHub Pages
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → `main` / `/ (root)`.

### When you buy luxeandlittle.in
1. Add a file named `CNAME` (no extension) containing just `luxeandlittle.in`, commit and push.
   *Don't add it before you own the domain: GitHub would redirect to a domain that doesn't resolve.*
2. At your domain registrar, add DNS records:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `zentrosuite.github.io`
3. Settings → Pages: enter `luxeandlittle.in`, wait for the check, then tick **Enforce HTTPS**.

When the Laravel shop launches on Wasmer, point the domain there instead (see the shop repo's
`docs/DEPLOY-WASMER.md`).
