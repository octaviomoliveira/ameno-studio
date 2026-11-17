(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const film = $('film');
  const still = $('still');
  const fadeMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
  const posterCache = new Map();
  let mode = 'home', index = -1, busy = false;
  let suspended = false, retryAction = null, resumeAction = null, suspendAction = null;
  const keepOverviewPoster = generalPoster;
  let currentNode = 'G_P';
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function bounded(promise, ms = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Image loading timed out')), ms);
      Promise.resolve(promise).then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
    });
  }

  function controls() {
    const route = routes[mode] || [];
    $('stage').classList.toggle('moving', busy);
    $('stage').setAttribute('aria-busy', String(busy));
    for (const [id, category] of [['home', 'home'], ['env', 'ambientes'], ['mat', 'materiais'], ['light', 'iluminacao']]) {
      $(id).setAttribute('aria-pressed', String(mode === category));
      $(id).disabled = busy;
    }
    $('travel').hidden = index < 0 || busy;
    $('back').disabled = index <= 0;
    $('next').disabled = index >= route.length - 1;
    $('counter').textContent = index < 0 ? '' : String(index + 1).padStart(2, '0') + ' / ' + route.length;
    $('enter').hidden = true;
    $('explore').hidden = busy || mode !== 'home' || window.self !== window.top;
    $('targets').hidden = busy || index >= 0 || !cameraNodes[mode];
    $('boxTargets').hidden = mode !== 'ambientes';
    $('materialTargets').hidden = mode !== 'materiais';
    $('allMaterials').hidden = busy || mode !== 'materiais' || index >= 0;
    $('returnOverview').hidden = busy || index < 0;
    $('backText').textContent = index > 0 ? clips[route[index - 1]].label : '';
    $('nextText').textContent = index >= 0 && index < route.length - 1 ? clips[route[index + 1]].label : '';
    $('back').setAttribute('aria-label', 'Anterior · ' + $('backText').textContent);
    $('next').setAttribute('aria-label', 'Próximo · ' + $('nextText').textContent);
    // Replaying an entry would make the parked car appear again before exiting.
    $('replay').hidden = busy || mode !== 'iluminacao' || index < 0;
    $('lightPicker').hidden = mode !== 'iluminacao' || busy;
    $('effect').disabled = busy;
    $('effect').value = String(Math.max(0, index));
    parent.postMessage({ type: 'ameno:view-state', overview: mode === 'home' && !busy }, location.origin);
  }

  function preparePoster(src) {
    if (!posterCache.has(src)) {
      const image = new Image(); image.src = src;
      const ready = bounded(image.decode()).then(() => image).catch(error => { posterCache.delete(src); image.src = ''; throw error; });
      posterCache.set(src, ready);
      if (posterCache.size > 2) posterCache.delete(posterCache.keys().next().value);
    }
    return posterCache.get(src);
  }

  async function showPoster(src, label) {
    await preparePoster(src);
    const previous = still.getAttribute('src');
    try {
      if (previous !== src) {
        still.style.opacity = '0'; await sleep(fadeMs);
        if (src === generalPoster) {
          still.setAttribute('srcset', 'media/r035/General_800w.webp 800w, media/r035/General_1920w.webp 1920w, media/r035/General_4k.webp 3840w');
        } else {
          still.removeAttribute('srcset');
        }
        still.src = src;
      }
      await bounded(still.decode());
      if (film.getAttribute('src')) releaseVideo();
    } catch (error) {
      if (previous && previous !== src) still.src = previous;
      throw error;
    } finally {
      still.style.opacity = '1';
    }
    still.alt = label + ' — cabine Bom Jesus';
    $('title').textContent = label;
  }

  function releaseVideo() {
    film.pause();
    film.onplaying = film.onended = film.onerror = film.onwaiting = null;
    film.style.opacity = '0'; film.style.visibility = 'hidden';
    film.removeAttribute('src'); film.load();
    suspended = false; resumeAction = null; suspendAction = null;
    $('progress').style.width = '0%';
  }

  async function playClip(key) {
    const clip = clips[key];
    $('title').textContent = clip.label;
    $('status').textContent = 'Carregando percurso…'; $('retry').hidden = true;
    preparePoster(clip.poster).catch(() => {});
    return new Promise(resolve => {
      let finished = false, timeout;
      const fail = message => {
        if (finished) return;
        finished = true; clearTimeout(timeout); releaseVideo();
        $('status').textContent = message; resolve(false);
      };
      const armTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fail('A conexão está lenta. Toque para tentar novamente.'), 60000);
      };
      film.onplaying = () => {
        clearTimeout(timeout); film.style.visibility = 'visible'; film.style.opacity = '1';
        suspended = false; $('retry').hidden = true; $('status').textContent = '';
      };
      film.onwaiting = () => { if (!suspended) { $('status').textContent = 'Carregando percurso…'; armTimeout(); } };
      film.onerror = () => fail('Não foi possível carregar o vídeo. Tente novamente.');
      film.onended = async () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        // Keep the decoded final frame until the native 4K image is ready.
        try {
          await preparePoster(clip.poster);
          still.src = clip.poster; still.alt = clip.label + ' — cabine Bom Jesus';
          await bounded(still.decode());
          await new Promise(resolveFrame => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
          film.style.opacity = '0'; await sleep(fadeMs); releaseVideo();
          $('status').textContent = '';
        } catch { film.pause(); $('status').textContent = 'O último quadro foi mantido. A imagem em alta não carregou.'; }
        resolve(true);
      };
      resumeAction = async () => {
        $('retry').hidden = true; armTimeout();
        try { await film.play(); } catch { fail('Toque para tentar reproduzir o percurso.'); }
      };
      suspendAction = () => clearTimeout(timeout);
      film.src = clip.src; film.muted = true; armTimeout();
      film.play().catch(() => fail('Não foi possível iniciar o vídeo. Toque para tentar novamente.'));
    });
  }

  function categoryHint() {
    $('category').textContent = mode === 'home' ? 'CABINE PPF' : mode === 'materiais' ? 'MATERIAIS' : mode === 'iluminacao' ? 'ILUMINAÇÃO' : 'AMBIENTES';
    $('hint').textContent = mode === 'iluminacao' ? 'Escolha um efeito ou siga pelas setas.' : index >= 0 ? 'Use as setas para explorar os detalhes.' : mode === 'materiais' ? 'Toque em um material para chegar mais perto.' : mode === 'ambientes' ? 'Escolha um box sobre o piso.' : 'Entre. Escolha um ponto. Explore.';
  }

  async function run(action, retry) {
    if (busy) return;
    busy = true; retryAction = retry; $('retry').hidden = true; controls();
    let success = false;
    try { success = await action(); }
    catch { releaseVideo(); $('status').textContent = 'Não foi possível abrir esta vista. Tente novamente.'; }
    finally {
      busy = false;
      if (!success) { $('retry').textContent = 'Tentar novamente'; $('retry').hidden = false; }
      controls(); categoryHint();
    }
  }

  async function moveTo(target) {
    const path = cameraPath(currentNode, target);
    if (!path) throw new Error('Unavailable route');
    for (const edge of path) {
      if (!await playClip(edge.key)) return false;
      currentNode = edge.to;
    }
    return true;
  }

  function playAt(n) {
    const route = routes[mode];
    if (busy || !route || n < 0 || n >= route.length) return;
    return run(async () => {
      if (mode === 'iluminacao') {
        if (!await playClip(route[n])) return false;
      } else if (!await moveTo(cameraNodes[mode][n])) return false;
      index = n;
      return true;
    }, () => playAt(n));
  }

  async function switchMode(nextMode, force = false) {
    if (busy || (!force && nextMode === mode)) return;
    return run(async () => {
      if (!await moveTo('G_P')) return false;
      mode = nextMode; index = -1;
      await showPoster(keepOverviewPoster, 'Visão geral');
      if (mode === 'iluminacao') {
        if (!await playClip(routes.iluminacao[0])) return false;
        index = 0;
      }
      return true;
    }, () => switchMode(nextMode, true));
  }

  $('enter').onclick = () => playAt(0);
  $('explore').onclick = () => switchMode('ambientes');
  $('returnOverview').onclick = () => switchMode('home');
  $('next').onclick = () => playAt(index + 1);
  $('back').onclick = () => playAt(index - 1);
  $('home').onclick = () => switchMode('home'); $('env').onclick = () => switchMode('ambientes');
  $('mat').onclick = () => switchMode('materiais'); $('light').onclick = () => switchMode('iluminacao');
  $('replay').onclick = () => playAt(index);
  for (let n = 0; n < 3; n++) $('box' + n).onclick = () => playAt(n);
  for (const n of [0, 1, 5, 6, 9, 10]) $('material' + n).onclick = () => playAt(n);
  for (const [n, key] of routes.materiais.entries()) {
    const option = document.createElement('option'); option.value = String(n); option.textContent = clips[key].label;
    $('materialSelect').appendChild(option);
  }
  $('materialSelect').onchange = () => {
    const n = Number($('materialSelect').value);
    if ($('materialSelect').value !== '') playAt(n);
    $('materialSelect').value = '';
  };
  $('retry').onclick = () => { if (suspended && resumeAction) resumeAction(); else retryAction?.(); };
  film.ontimeupdate = () => { $('progress').style.width = (film.duration ? film.currentTime / film.duration * 100 : 0) + '%'; };
  for (const [i, key] of routes.iluminacao.entries()) {
    const option = document.createElement('option'); option.value = String(i); option.textContent = clips[key].label;
    $('effect').appendChild(option);
  }
  $('effect').onchange = () => playAt(Number($('effect').value));
  $('info').onclick = () => { const open = $('help').hidden; $('help').hidden = !open; $('info').setAttribute('aria-expanded', String(open)); };
  $('closeHelp').onclick = () => { $('help').hidden = true; $('info').setAttribute('aria-expanded', 'false'); $('info').focus(); };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { $('help').hidden = true; $('info').setAttribute('aria-expanded', 'false'); }
    if (busy || !['ArrowLeft', 'ArrowRight'].includes(event.key) || /^(SELECT|INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '')) return;
    event.preventDefault();
    if (event.key === 'ArrowRight' && !$('next').disabled) $('next').onclick();
    if (event.key === 'ArrowLeft' && !$('back').disabled) $('back').onclick();
  });
  $('full').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else $('status').textContent = 'Gire o celular na horizontal para ampliar a cabine.';
    } catch { $('status').textContent = 'Gire o celular na horizontal para ampliar a cabine.'; }
  };
  function suspendPlayback() {
    if (busy && !film.paused && resumeAction) {
      film.pause(); suspended = true; suspendAction?.();
      $('status').textContent = 'Toque para continuar.';
      $('retry').textContent = 'Continuar'; $('retry').hidden = false;
    }
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === 'ameno:experience-hidden') suspendPlayback();
    if (event.data?.type === 'ameno:explore') switchMode('ambientes');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspendPlayback(); });
  controls(); categoryHint();
})();
