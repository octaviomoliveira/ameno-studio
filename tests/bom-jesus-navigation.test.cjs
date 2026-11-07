/* eslint-disable @typescript-eslint/no-require-imports -- Node's CJS test runner loads browser script fixtures. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const experience = path.join(__dirname, '..', 'public', 'experiences', 'bom-jesus');
const root = 'media/r035/';
const video = key => root + key + '_4k60.mp4';
const poster = key => root + key + '_4k.jpg';

// Execute the shipped scripts against browser boundary doubles. Navigation is
// exercised only through actual DOM handlers, video events and host messages.
function browser() {
  const elements = new Map();
  const windowListeners = new Map();
  const documentListeners = new Map();
  const history = [];
  const messages = [];
  const timers = new Map();
  const imageBehavior = new Map();
  const stillBehavior = new Map();
  const stillDecodes = new Map();
  let timerId = 0;
  let now = 0;

  function decode(behavior, src) {
    let outcome = behavior.get(src);
    if (Array.isArray(outcome)) {
      const list = outcome;
      outcome = list.shift();
      if (!list.length) behavior.delete(src);
    }
    if (outcome === 'reject') return Promise.reject(new Error('Image decode failed'));
    if (outcome === 'hang') return new Promise(() => {});
    return Promise.resolve();
  }

  function element(id) {
    if (elements.has(id)) return elements.get(id);
    const attributes = new Map();
    const classes = new Set();
    const node = {
      id, style: {}, hidden: false, disabled: false, textContent: '', value: '',
      tagName: id === 'effect' ? 'SELECT' : 'BUTTON', children: [],
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.has(name) ? attributes.get(name) : null; },
      removeAttribute(name) { attributes.delete(name); },
      appendChild(child) { this.children.push(child); },
      querySelector() { return element(id + '-label'); },
      focus() { document.activeElement = this; },
      classList: { toggle(name, force) { if (force) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); } },
      decode() {
        stillDecodes.set(this.src, (stillDecodes.get(this.src) || 0) + 1);
        return decode(stillBehavior, this.src);
      },
    };
    Object.defineProperty(node, 'src', {
      get() { return attributes.get('src') || ''; },
      set(value) { attributes.set('src', value); },
    });
    elements.set(id, node);
    return node;
  }

  const film = element('film');
  Object.assign(film, {
    paused: true, duration: 4, currentTime: 0,
    play() { this.paused = false; history.push(this.src); this.onplaying?.(); return Promise.resolve(); },
    pause() { this.paused = true; },
    load() {},
  });
  element('still').src = root + 'General_4k.jpg';
  element('retry').hidden = true;
  const parent = { postMessage(message, origin) { messages.push({ ...message, origin }); } };
  const document = {
    hidden: false, activeElement: null, fullscreenElement: null,
    getElementById: element,
    createElement: () => ({ value: '', textContent: '' }),
    addEventListener(name, callback) {
      if (!documentListeners.has(name)) documentListeners.set(name, []);
      documentListeners.get(name).push(callback);
    },
  };
  const window = {
    matchMedia: () => ({ matches: true }),
    addEventListener(name, callback) {
      if (!windowListeners.has(name)) windowListeners.set(name, []);
      windowListeners.get(name).push(callback);
    },
  };
  const context = vm.createContext({
    document, window, parent, location: { origin: 'https://ameno.studio' },
    Image: class {
      src = '';
      decode() { return decode(imageBehavior, this.src); }
    },
    setTimeout(callback, delay) {
      const id = ++timerId;
      if (!delay) queueMicrotask(callback);
      else timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { queueMicrotask(callback); return 1; },
    console,
  });
  for (const file of ['data.js', 'lights.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(experience, file), 'utf8'), context, { filename: file });
  }

  async function flush() { for (let i = 0; i < 40; i++) await Promise.resolve(); }
  return {
    element, film, history, messages, imageBehavior, stillBehavior, stillDecodes,
    async click(id, force = false) {
      const node = element(id);
      if (force || !node.disabled) node.onclick?.();
      await flush();
    },
    async end() {
      film.paused = true;
      film.currentTime = film.duration;
      film.onended?.();
      await flush();
    },
    async advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) { timers.delete(id); timer.callback(); }
      }
      await flush();
    },
    async hostHidden(origin = 'https://ameno.studio') {
      for (const listener of windowListeners.get('message') || []) {
        listener({ origin, source: parent, data: { type: 'ameno:experience-hidden' } });
      }
      await flush();
    },
    async tabHidden() {
      document.hidden = true;
      for (const listener of documentListeners.get('visibilitychange') || []) listener();
      await flush();
    },
  };
}

async function enterMaterials(ui) {
  await ui.click('mat');
  await ui.click('enter');
  assert.equal(ui.film.src, video('HOME_P_Mirror'));
  await ui.end();
  assert.equal(ui.element('still').src, poster('HOME_P_Mirror'));
}

test('materials keep the Porsche outside across lateral views without replaying its exit', async () => {
  const ui = browser();
  await enterMaterials(ui);
  assert.equal(ui.element('replay').hidden, true);
  await ui.click('next');
  assert.equal(ui.film.src, video('ARROW_M01_P_Mirror_Glass'));
  assert.equal(ui.element('env').disabled, true);
  const active = ui.film.src;
  // Even a programmatic event bypassing a disabled button cannot switch modes.
  await ui.click('env', true);
  assert.equal(ui.film.src, active);
  await ui.end();
  await ui.click('next');
  await ui.end();
  const count = ui.history.length;
  await ui.click('back');
  assert.equal(ui.element('still').src, poster('ARROW_M01_P_Mirror_Glass'));
  assert.equal(ui.history.length, count, 'compact Back is a still-only transition');
  assert.equal(ui.history.filter(src => src === video('HOME_P_Mirror')).length, 1);
  assert.equal(ui.history.filter(src => src === video('MATERIALS_RETURN_HOME')).length, 0);
});

for (const destination of ['home', 'env', 'light']) {
  test(`leaving materials for ${destination} returns the Porsche exactly once`, async () => {
    const ui = browser();
    await enterMaterials(ui);
    await ui.click('next');
    await ui.end();
    await ui.click(destination);
    assert.equal(ui.element('still').src, poster('HOME_P_Mirror'), 'return is aligned to its Mirror_O start');
    assert.equal(ui.film.src, video('MATERIALS_RETURN_HOME'));
    assert.equal(ui.messages.at(-1).overview, false, 'home overlay stays hidden during the return');
    await ui.end();
    if (destination === 'light') {
      assert.equal(ui.film.src, video('LIGHT_DEMO_welcome'));
      await ui.end();
    } else {
      assert.equal(ui.element('still').src, poster('MATERIALS_RETURN_HOME'));
    }
    assert.equal(ui.history.filter(src => src === video('MATERIALS_RETURN_HOME')).length, 1);
    assert.equal(ui.element(destination).getAttribute('aria-pressed'), 'true');
    assert.equal(ui.element('env').disabled, false);
    assert.equal(ui.messages.at(-1).overview, destination === 'home');
    if (destination !== 'home') await ui.click('home');
    assert.equal(ui.history.filter(src => src === video('MATERIALS_RETURN_HOME')).length, 1);
  });
}

test('a failed overview decode preserves the previous image and can retry the same home destination', async () => {
  const ui = browser();
  await ui.click('env');
  await ui.click('enter');
  await ui.end();
  const previous = ui.element('still').src;
  const general = root + 'General_4k.jpg';
  ui.stillBehavior.set(general, ['reject']);
  await ui.click('home');
  assert.equal(ui.element('retry').hidden, false);
  assert.equal(ui.element('still').src, previous);
  assert.equal(ui.element('still').style.opacity, '1');
  await ui.click('retry');
  assert.equal(ui.element('retry').hidden, true);
  assert.equal(ui.element('still').src, general);
  assert.equal(ui.element('still').style.opacity, '1');
  assert.ok(ui.stillDecodes.get(general) >= 2, 'Retry performs a new decode despite already being in home mode');
  assert.equal(ui.messages.at(-1).overview, true);
});

test('a failed endpoint image keeps the final video frame and restores navigation', async () => {
  const ui = browser();
  ui.imageBehavior.set(poster('HOME_P_Mirror'), 'reject');
  await ui.click('mat');
  await ui.click('enter');
  await ui.end();
  assert.equal(ui.film.src, video('HOME_P_Mirror'));
  assert.equal(ui.film.paused, true);
  assert.equal(ui.film.style.visibility, 'visible');
  assert.match(ui.element('status').textContent, /último quadro/);
  assert.equal(ui.element('env').disabled, false);
  assert.equal(ui.element('next').disabled, false);
  assert.equal(ui.element('counter').textContent, '01 / 15');
  ui.imageBehavior.delete(poster('HOME_P_Mirror'));
  await ui.click('home');
  assert.equal(ui.film.src, video('MATERIALS_RETURN_HOME'), 'car state follows the completed video even when its still fails');
});

test('a stalled 4K image times out without trapping the mobile navigation', async () => {
  const ui = browser();
  ui.imageBehavior.set(poster('HOME_P_Mirror'), 'hang');
  await ui.click('mat');
  await ui.click('enter');
  await ui.end();
  assert.equal(ui.element('env').disabled, true, 'handoff temporarily owns the controls');
  await ui.advance(20000);
  assert.equal(ui.element('env').disabled, false);
  assert.equal(ui.film.src, video('HOME_P_Mirror'));
  assert.equal(ui.film.style.visibility, 'visible');
  assert.match(ui.element('status').textContent, /último quadro/);
});

test('a same-origin host hide pauses playback and Continue resumes the same take', async () => {
  const ui = browser();
  await ui.click('env');
  await ui.click('enter');
  const active = ui.film.src;
  await ui.hostHidden('https://unrelated.example');
  assert.equal(ui.film.paused, false);
  await ui.hostHidden();
  assert.equal(ui.film.paused, true);
  assert.equal(ui.element('retry').hidden, false);
  assert.equal(ui.element('retry').textContent, 'Continuar');
  await ui.advance(60000);
  assert.equal(ui.film.src, active, 'suspended playback does not hit the network timeout');
  await ui.click('retry');
  assert.equal(ui.film.paused, false);
  assert.equal(ui.film.src, active);
  assert.equal(ui.element('retry').hidden, true);
  await ui.end();
  assert.equal(ui.element('still').src, poster('HOME_P_Box1'));
  assert.equal(ui.element('env').disabled, false);
});
