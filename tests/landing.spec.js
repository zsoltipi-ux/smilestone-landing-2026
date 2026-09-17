// @ts-check
// Layout + behaviour tests for the SmileStone landing (HU + EN).
// Run: npm test          (all viewports)   ·   npx playwright test --project=phone-390
const { test, expect } = require('@playwright/test');

const PAGES = [
  { lang: 'hu', path: './', urlEnd: '/', pricing: '#arak', priceAt: { 75: '25 000 Ft', 150: '47 500 Ft', 300: '82 500 Ft' }, ask: 'mennyibe kerül', askHit: '25 000 Ft', askEn: false },
  { lang: 'en', path: 'en/', urlEnd: '/en/', pricing: '#pricing', priceAt: { 75: '€ 70', 150: '€ 145', 300: '€ 261' }, ask: 'how much does it cost', askHit: '€ 70', askEn: true },
];

const cssReady = (page) => page.waitForFunction(() => [...document.styleSheets].some(s => s.href && s.href.includes('style.css') && s.cssRules.length > 50) && document.fonts.status === 'loaded');
const freeze = (page) => page.addStyleTag({ content: '*{animation:none!important;transition:none!important;scroll-behavior:auto!important}.io,.reveal{opacity:1!important;transform:none!important}' });
const isPhone = (vw) => vw <= 700;

for (const P of PAGES) {
  test.describe(`${P.lang}`, () => {
    test.beforeEach(async ({ page }) => { await page.goto(P.path, { waitUntil: 'networkidle' }); await cssReady(page); await freeze(page); });

    test('layout viewport equals device width (no horizontal drift)', async ({ page, viewport }) => {
      // On Android Chrome an over-wide element widens the layout viewport -> fixed CTAs/chat drift. This is the real-world symptom.
      const w = await page.evaluate(() => ({ inner: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(w.inner, 'innerWidth').toBe(viewport.width);
      expect(w.scroll, 'scrollWidth').toBeLessThanOrEqual(viewport.width);
    });

    test('no element sticks out of the viewport (masked by body overflow-x:hidden otherwise)', async ({ page }) => {
      const over = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth; const out = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('.mobile-menu,.ask')) continue;
          const cs = getComputedStyle(el); if (cs.display === 'none' || cs.position === 'fixed') continue;
          const r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > cw + 0.5 || r.left < -0.5)) out.push(el.tagName + '.' + [...el.classList].join('.') + ' L' + Math.round(r.left) + ' R' + Math.round(r.right));
        }
        return out;
      });
      expect(over).toEqual([]);
    });

    test('nav: logo keeps aspect ratio, burger/CTA inside the row, row does not overflow', async ({ page, viewport }) => {
      await page.waitForFunction(() => { const i = document.querySelector('.nav .logo img'); return i.complete && i.naturalWidth > 0; });
      const nav = await page.evaluate(() => {
        const wrap = document.querySelector('.nav .wrap'); const img = document.querySelector('.nav .logo img'); const r = img.getBoundingClientRect();
        const burger = document.querySelector('#burger'); const b = burger.getBoundingClientRect();
        return { sw: wrap.scrollWidth, cw: wrap.clientWidth, ratio: r.width / r.height, natural: img.naturalWidth / img.naturalHeight, burger: getComputedStyle(burger).display, burgerRight: b.right, links: getComputedStyle(document.querySelector('.nav-links')).display };
      });
      expect(nav.sw).toBeLessThanOrEqual(nav.cw + 1);
      expect(Math.abs(nav.ratio - nav.natural)).toBeLessThan(0.05);
      if (viewport.width <= 1000) { expect(nav.burger).not.toBe('none'); expect(nav.burgerRight).toBeLessThanOrEqual(viewport.width); expect(nav.links).toBe('none'); }
      else { expect(nav.burger).toBe('none'); expect(nav.links).not.toBe('none'); }
    });

    test('mobile menu: opens under the nav, has the primary CTA, closes on link / outside tap / Escape', async ({ page, viewport }) => {
      test.skip(viewport.width > 1000, 'desktop nav');
      await page.click('#burger');
      const m = await page.evaluate(() => { const r = document.querySelector('.mobile-menu').getBoundingClientRect(); const n = document.querySelector('.nav .wrap').getBoundingClientRect(); return { top: r.top, navBottom: n.bottom, bottom: r.bottom, vh: innerHeight, open: document.querySelector('.mobile-menu').classList.contains('open') }; });
      expect(m.open).toBe(true);
      expect(Math.abs(m.top - m.navBottom)).toBeLessThanOrEqual(1);
      expect(m.bottom).toBeLessThanOrEqual(m.vh);
      await expect(page.locator('.mobile-menu .btn-primary')).toBeVisible();
      expect(await page.getAttribute('#burger', 'aria-expanded')).toBe('true');
      await page.keyboard.press('Escape');
      await expect(page.locator('.mobile-menu')).toBeHidden();
      expect(await page.getAttribute('#burger', 'aria-expanded')).toBe('false');
      await page.click('#burger'); await page.mouse.click(viewport.width / 2, viewport.height - 5);
      await expect(page.locator('.mobile-menu')).toBeHidden();
      await page.click('#burger'); await page.locator('.mobile-menu a[href^="#"]').first().click();
      await expect(page.locator('.mobile-menu')).toBeHidden();
    });

    test('hero proof numbers stay on one line and inside their column', async ({ page }) => {
      const p = await page.evaluate(() => [...document.querySelectorAll('.proof b')].map(b => { const rng = document.createRange(); rng.selectNodeContents(b); const t = rng.getBoundingClientRect(); const box = b.getBoundingClientRect(); return { txt: b.textContent, lines: Math.round(t.height / parseFloat(getComputedStyle(b).fontSize)), fits: t.width <= box.width + 0.5 }; }));
      for (const x of p) { expect(x.lines, x.txt).toBe(1); expect(x.fits, x.txt + ' fits column').toBe(true); }
    });

    test('anchor navigation lands below the sticky nav', async ({ page }) => {
      await page.evaluate((h) => { location.hash = h; }, P.pricing);
      await page.waitForTimeout(100);
      const a = await page.evaluate((h) => { const s = document.querySelector(h); const eb = s.querySelector('.eyebrow').getBoundingClientRect(); const nav = document.querySelector('.nav').getBoundingClientRect(); return { eyebrowTop: eb.top, navBottom: nav.bottom }; }, P.pricing);
      expect(a.eyebrowTop).toBeGreaterThan(a.navBottom);
    });

    test('phone mock-up does not clip its content', async ({ page }) => {
      const s = await page.evaluate(() => { const e = document.querySelector('.phone .scr'); return { sh: e.scrollHeight, ch: e.clientHeight }; });
      expect(s.sh).toBeLessThanOrEqual(s.ch + 1);
    });

    test('pricing slider replicates the live formula', async ({ page }) => {
      for (const [v, expected] of Object.entries(P.priceAt)) {
        await page.locator('#range').evaluate((el, val) => { el.value = String(val); el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
        await expect(page.locator('#total')).toHaveText(expected);
      }
      expect(await page.locator('#cnt').textContent()).toBe('300+');
    });

    test('contact form: client validation, no navigation on empty submit', async ({ page }) => {
      let dialog = null; page.on('dialog', d => { dialog = d.message(); d.dismiss(); });
      await page.locator('#form button[type=submit]').click();
      expect(dialog).toBeTruthy();
      expect(new URL(page.url()).pathname.endsWith(P.urlEnd)).toBe(true);
    });

    test.describe('ask widget', () => {
      test('opens, keeps the input on screen (also with the keyboard up), scroll-locks on phones, Escape closes', async ({ page, viewport }) => {
        await page.locator('#askBtn').click();
        await expect(page.locator('#ask')).toBeVisible();
        expect(await page.getAttribute('#askBtn', 'aria-expanded')).toBe('true');
        const geo = async () => page.evaluate(() => { const a = document.querySelector('.ask').getBoundingClientRect(); const f = document.querySelector('.ask-form').getBoundingClientRect(); const h = document.querySelector('.ask-head').getBoundingClientRect(); return { top: a.top, bottom: a.bottom, left: a.left, right: a.right, formTop: f.top, formBottom: f.bottom, headTop: h.top, vh: innerHeight, vw: innerWidth, lock: getComputedStyle(document.body).overflow, sticky: getComputedStyle(document.querySelector('.sticky-cta')).display, form: getComputedStyle(document.querySelector('.ask-form')) .borderLeftWidth }; });
        let g = await geo();
        expect(g.left).toBeGreaterThanOrEqual(0); expect(g.right).toBeLessThanOrEqual(g.vw + 0.5);
        expect(g.top).toBeGreaterThanOrEqual(0); expect(g.formBottom).toBeLessThanOrEqual(g.vh + 0.5);
        expect(g.form, 'contact-form border must not leak onto the ask form').toBe('0px');
        if (isPhone(viewport.width)) { expect(g.lock).toBe('hidden'); expect(g.sticky).toBe('none'); expect(g.top).toBe(0); expect(g.bottom).toBeCloseTo(g.vh, 0); }
        // keyboard: interactive-widget=resizes-content shrinks the layout viewport by the keyboard height
        await page.setViewportSize({ width: viewport.width, height: Math.max(320, viewport.height - 320) });
        g = await geo();
        expect(g.headTop).toBeGreaterThanOrEqual(0);
        expect(g.formBottom, 'input hidden behind the keyboard').toBeLessThanOrEqual(g.vh + 0.5);
        expect(g.formTop).toBeGreaterThan(g.headTop + 40);
        await page.setViewportSize(viewport);
        await page.keyboard.press('Escape');
        await expect(page.locator('#ask')).toBeHidden();
        expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
      });

      test('answers from the FAQ, offers related chips, falls back to e-mail/phone', async ({ page }) => {
        await page.locator('#askBtn').click();
        await expect(page.locator('.chips button')).toHaveCount(4);
        await page.fill('#askInput', P.ask); await page.locator('#askForm button').click();
        const bots = page.locator('.bub.bot');
        await expect(bots.nth(1)).toContainText(P.askHit);
        await expect(page.locator('.bub.bot a[href^="mailto:"]').first()).toBeVisible();
        await page.fill('#askInput', 'xyzzy qwertz'); await page.locator('#askForm button').click();
        await expect(bots.last()).toContainText(P.askEn ? 'one working day' : 'egy munkanapon belül');
        await expect(bots.last().locator('a[href^="tel:"]')).toBeVisible();
        // chip click asks again
        await page.locator('.chips button').first().click();
        await expect(page.locator('.bub.me')).toHaveCount(3);
        // long unbroken input must not overflow its bubble
        await page.fill('#askInput', 'a'.repeat(120)); await page.locator('#askForm button').click();
        const ok = await page.evaluate(() => { const b = [...document.querySelectorAll('.bub.me')].pop(); const body = document.querySelector('.ask-body'); return b.getBoundingClientRect().right <= body.getBoundingClientRect().right + 0.5; });
        expect(ok).toBe(true);
        // input font >= 16px (iOS focus zoom)
        expect(parseFloat(await page.locator('#askInput').evaluate(e => getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
      });
    });

    test('sticky bottom CTA only on phones and does not cover the chat button', async ({ page, viewport }) => {
      const s = await page.evaluate(() => { const st = document.querySelector('.sticky-cta'); const ab = document.querySelector('.ask-btn').getBoundingClientRect(); const sr = st.getBoundingClientRect(); return { display: getComputedStyle(st).display, askBottom: ab.bottom, stickyTop: sr.top, askRight: ab.right, vw: innerWidth }; });
      if (isPhone(viewport.width)) { expect(s.display).toBe('flex'); expect(s.askBottom).toBeLessThanOrEqual(s.stickyTop + 0.5); }
      else expect(s.display).toBe('none');
      expect(s.askRight).toBeLessThanOrEqual(s.vw);
    });
  });
}
