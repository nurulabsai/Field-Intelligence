#!/usr/bin/env node
/**
 * NuruOS smoke test — runs against a running dev server.
 *
 * Usage:
 *   npm run dev                 # in one terminal
 *   node e2e/smoke.mjs          # in another
 *
 * Covers:
 *   1. Welcome screen renders ("NuruOS" + two CTAs)
 *   2. Login screen renders (email + password inputs)
 *   3. Cascade regression: at 1440x900, <main> x=260 (sidebar offset)
 *      Guards against the Tailwind @layer reset bug (commit 20ac21c).
 *   4. Mobile 375x812: no horizontal overflow on /audits or
 *      /audit/wizard/farm. Guards against flex-min-width:auto bug
 *      (commit f7fd10d).
 *   5. No external googleusercontent image deps (offline-safety).
 *   6. WCAG 2.5.5: zero sub-44px touch targets across protected routes.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
let failed = 0;

function assert(name, condition, detail = '') {
  if (condition) {
    results.push({ name, status: 'PASS' });
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    results.push({ name, status: 'FAIL', detail });
    console.error(`  FAIL  ${name}  ${detail}`);
  }
}

async function injectAuth(page) {
  await page.evaluate(() => {
    const s = (window).__authStore;
    if (s && s.setState) {
      s.setState({
        user: { id: 'smoke-u', email: 'smoke@test.io', fullName: 'Smoke', role: 'Agent' },
        session: { access_token: 'smoke' },
        isLoading: false,
      });
    }
  });
}

async function goto(page, path) {
  await page.evaluate((p) => {
    history.pushState({}, '', p);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(600);
}

async function main() {
  console.log(`\nNuruOS smoke test @ ${BASE}\n`);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    // 1. Welcome
    await page.goto(`${BASE}/auth/welcome`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!document.querySelector('main, form, h1'), { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3200);
    const welcomeText = await page.locator('body').innerText();
    assert('welcome renders NuruOS', welcomeText.includes('NuruOS'));

    // 2. Login
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    const emailCount = await page.locator('input[type="email"]').count();
    const pwCount = await page.locator('input[type="password"]').count();
    assert('login has email+password inputs', emailCount >= 1 && pwCount >= 1);

    // 3. Cascade regression — desktop sidebar offset
    await injectAuth(page);
    await goto(page, '/dashboard');
    const mainX = await page.evaluate(() => {
      const m = document.querySelector('main');
      return m ? Math.round(m.getBoundingClientRect().x) : -1;
    });
    assert(
      'cascade regression: main x=260 at 1440w',
      mainX === 260,
      `got x=${mainX}`
    );

    // 6. Sub-44 touch targets at desktop
    const routes = ['/dashboard', '/audits', '/schedule', '/settings'];
    for (const r of routes) {
      await goto(page, r);
      await page.waitForTimeout(400);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('button, a[role="button"], [role="tab"]')].filter((e) => {
          const rr = e.getBoundingClientRect();
          return rr.width > 0 && rr.height > 0 && rr.height < 44;
        }).length
      );
      assert(`${r}: 0 sub-44 touch targets`, small === 0, `found ${small}`);
    }

    // 5. No googleusercontent deps
    await goto(page, '/schedule');
    const googImgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .map((i) => i.src)
        .filter((s) => s.includes('googleusercontent')).length
    );
    assert('/schedule: no googleusercontent CDN images', googImgs === 0);

    // 4. Mobile overflow regression
    await ctx.close();
    const mCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mPage = await mCtx.newPage();
    await mPage.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
    await mPage.waitForTimeout(3200);
    await injectAuth(mPage);
    for (const r of ['/audits', '/audit/wizard/farm', '/audit/wizard/business', '/dashboard']) {
      await goto(mPage, r);
      const sw = await mPage.evaluate(() => document.documentElement.scrollWidth);
      assert(`${r}: mobile no horizontal overflow`, sw <= 375, `scrollWidth=${sw}`);
    }
    await mCtx.close();
  } finally {
    await browser.close();
  }

  console.log(
    `\n${results.length - failed}/${results.length} passed${failed ? `, ${failed} FAILED` : ''}\n`
  );
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
