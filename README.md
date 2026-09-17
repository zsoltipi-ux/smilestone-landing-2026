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
