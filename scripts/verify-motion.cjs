// Run against a local or deployed site with Playwright available in NODE_PATH.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser regression harness. */
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const path = require('node:path')
const os = require('node:os')

const base = process.env.BASE_URL || 'http://localhost:3000'

async function swipe(page, x, fromY, toY) {
  const session = await page.context().newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: fromY }] })
  for (let i = 1; i <= 12; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: fromY + (toY - fromY) * i / 12 }] })
    await page.waitForTimeout(20)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
  await page.waitForTimeout(650)
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  try {
    for (const profile of [
      { name: 'phone', width: 390, height: 844, touch: true },
      { name: 'small-phone', width: 320, height: 680, touch: true },
      { name: 'tablet', width: 768, height: 1024, touch: true },
      { name: 'landscape', width: 844, height: 390, touch: true },
      { name: 'desktop', width: 1440, height: 900, touch: false },
      { name: 'reduced', width: 390, height: 844, touch: true, reduced: true },
    ].filter(profile => !process.env.PROFILES || process.env.PROFILES.split(',').includes(profile.name))) {
      const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, hasTouch: profile.touch, isMobile: profile.touch, reducedMotion: profile.reduced ? 'reduce' : 'no-preference' })
      const page = await context.newPage()
      page.setDefaultNavigationTimeout(60000)
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('response', response => { if (response.status() >= 400 && !response.url().includes('/api/')) errors.push(`${response.status()} ${response.url()}`) })
      await page.goto(`${base}/?intro=0`, { waitUntil: 'load' })
      await page.waitForTimeout(600)
      assert.equal(await page.locator('.site-intro').count(), 0, 'intro=0 must skip the intro')
      const video = page.locator('.hero-video-el')
      if (!profile.reduced) {
        await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2)
        if (profile.touch) await swipe(page, profile.width / 2, profile.height * .8, profile.height * .25)
        else { await page.mouse.wheel(0, 600); await page.waitForTimeout(1500) }
        const state = await page.locator('.hero-video-section').evaluate(el => ({
          scrollY, time: el.querySelector('video').currentTime,
          stickyTop: el.firstElementChild.getBoundingClientRect().top,
          src: el.querySelector('video').currentSrc,
        }))
        assert.ok(state.scrollY > 100, 'gesture must scroll the page')
        assert.ok(state.time > .1, 'video must advance with scroll')
        assert.ok(Math.abs(state.stickyTop) < 2, 'hero must remain sticky')
        console.log(profile.name, 'hero', JSON.stringify(state))
        const distance = await page.locator('.hero-video-section').evaluate(el => el.offsetHeight - el.firstElementChild.offsetHeight)
        await page.evaluate(y => scrollTo(0, y), distance * .95)
        await page.waitForTimeout(1400)
        assert.ok(await page.locator('[data-hero-signature]').evaluate(el => Number(getComputedStyle(el).opacity) > .95), 'story must finish before leaving the hero')
      } else {
        assert.equal(await video.getAttribute('src'), null, 'reduced motion should not load the video')
        assert.equal(await page.locator('[data-hero-signature]').evaluate(el => getComputedStyle(el).visibility), 'visible')
      }
      await page.screenshot({ path: path.join(os.tmpdir(), `ameno-audit-${profile.name}-hero.png`) })
      if (!profile.reduced) {
        await page.evaluate(() => scrollTo(0, 0))
        await page.waitForTimeout(1800)
        assert.ok(await video.evaluate(el => el.currentTime < .2), 'video must rewind when scrolling back')
      }
      await page.goto(`${base}/?intro=1`, { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: 'Entrar no ameno.studio' }).click()
      await page.waitForTimeout(800)
      assert.equal(await page.locator('#site-shell').getAttribute('inert'), null)
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden')
      if (profile.touch) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click()
        await page.locator('.site-mobile-menu').getByRole('link', { name: /portfólio/ }).click()
        await page.waitForURL('**/portfolio')
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'menu navigation must release scroll')
      } else await page.goto(`${base}/portfolio`, { waitUntil: 'load' })
      await page.waitForTimeout(700)
      if (profile.touch || profile.reduced) {
        await page.locator('.assets-section').scrollIntoViewIfNeeded()
        await page.waitForTimeout(1500)
        const sizes = await page.locator('.assets-strip-clip').evaluate(el => ({ clip: el.clientWidth, card: el.querySelector('.asset-slide').getBoundingClientRect().width }))
        assert.ok(Math.abs(sizes.clip - sizes.card) < 2, 'asset must fit its viewport')
        await page.getByRole('button', { name: 'Próximo modelo' }).click()
        await page.waitForTimeout(800)
        assert.match(await page.locator('.assets-touch-controls').innerText(), /2 \/ 4/)
        await page.getByRole('button', { name: 'Modelo anterior', exact: true }).click()
        await page.waitForTimeout(800)
        const canvas = page.locator('.asset-slide').first().locator('canvas')
        await canvas.waitFor({ state: 'visible', timeout: 30000 })
        await canvas.scrollIntoViewIfNeeded()
        await page.screenshot({ path: path.join(os.tmpdir(), `ameno-audit-${profile.name}-assets.png`) })
        const box = await canvas.boundingBox()
        const before = await page.evaluate(() => scrollY)
        await swipe(page, box.x + box.width / 2, Math.min(profile.height - 50, box.y + box.height * .8), Math.max(50, box.y + box.height * .2))
        assert.ok((await page.evaluate(() => scrollY)) > before + 20, 'swiping over 3D must scroll the page')
      }
      for (const route of ['/portfolio', '/sobre', '/plugins', '/entrar', '/conta']) {
        await page.goto(`${base}${route}`, { waitUntil: 'load' })
        await page.waitForTimeout(400)
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} horizontal overflow`)
        if (route === '/sobre') {
          await page.locator('[data-method-cards]').scrollIntoViewIfNeeded()
          await page.waitForTimeout(1600)
          assert.ok(await page.locator('[data-method-copy], [data-method-card]').evaluateAll(elements => elements.every(el => Number(getComputedStyle(el).opacity) > .95)), 'about content must reveal when scrolling')
        }
        if (route === '/sobre' || route === '/plugins') {
          await page.screenshot({ path: path.join(os.tmpdir(), `ameno-audit-${profile.name}-${route.slice(1)}.png`), fullPage: true })
        }
      }
      assert.deepEqual(errors, [], 'no browser errors or failed asset requests')
      console.log('PASS', profile.name)
      await context.close()
    }
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
