# SmileStone landing — 2026 redesign (review build)

Static review version of the smilestone.hu landing page. `noindex` — for team feedback only.

- `index.html` — Hungarian · `en/index.html` — English · `assets/style.css` — shared styles · `assets/img/` — brand assets from the live site
- Pricing slider replicates the live site's logic (HU: 25 000 Ft base incl. 75 cases, 300 Ft 76–200, 200 Ft above · EN: €70 / €1 / €0.66).
- The contact form opens an e-mail draft in this review build; the live version posts to the smilestone.hu backend (same field names: name, email, subject, message).
- Customer logo row is a placeholder until permissions are collected.

## 2026-09-17 — second pass
- New section **Újdonságok / What's new**: left = released in 2026 (from GitLab "Released to Prod." issues: scanner PDF → ticket #1711, multi-language invoicing #1672, grouped itemised statements #1615, phase permissions #1726); right = in rollout, **no dates** (AI assistant #1685–#1687, MeditLink, Straumann AXS).
- **Ask widget** (bottom right): answers from the FAQ on the client (keyword match over the `.faq details` content), falls back to e-mail/phone. No backend, no live-chat queue. To switch to a real live chat later, drop the Crisp snippet in and remove `#askBtn/#ask`.
- New FAQ item on scanners, "Szkenner-PDF és szkenner-integrációk" feature row, hero pill linking to the news section.

## 2026-09-17 — third pass: mobile fixes + Playwright tests
- **Root cause of the "drifts on mobile" bug:** the header row needed 486 px on HU phones (logo 232 px + CTA + burger) — the burger was pushed off-screen and Android Chrome widened the layout viewport, so every `position:fixed` element (chat button, sticky CTA) drifted. `body{overflow-x:hidden}` masked it in desktop-mode measurements. Fix: ≤700 px the logo is 32 px, the nav CTA is hidden (the sticky bottom CTA covers it) and the primary CTA moved into the burger menu; 1000–1140 px drops the ghost login button.
- **Ask widget on phones:** full-height sheet, `interactive-widget=resizes-content` in the viewport meta so the keyboard shrinks the layout viewport and the input stays visible, body scroll lock, Escape closes, 16 px input (no iOS zoom). Contact-form styles no longer leak onto the widget form (`.contact form`).
- Anchor targets get `scroll-margin-top` (sticky nav), hero numbers use `&nbsp;`, phone mock-up hugs its content, price breakdown amounts never wrap.
- **Tests:** `npm i && npx playwright install chromium && npm test` — 6 viewports (360/390/412 phones, 768 tablet, 1024, 1440) × HU+EN: layout-viewport width, element overflow, nav/burger, mobile menu, hero numbers, anchors, phone mock-up, pricing formula, contact validation, ask widget (keyboard, scroll lock, FAQ answers, fallback), sticky CTA. Static server for tests: `tests/server.mjs`.
