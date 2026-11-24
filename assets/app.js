(function () {
  'use strict';
  const C = window.PuzzleCore;
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app');
  const KEY = 'neonlab.state.v1';

  const SVG = {
    infinity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 8.5c-2.3 0-3.8 1.7-3.8 3.5s1.5 3.5 3.8 3.5c3 0 5.5-3.5 5.5-3.5s2.5-3.5 5.5-3.5c2.3 0 3.8 1.7 3.8 3.5s-1.5 3.5-3.8 3.5c-3 0-5.5-3.5-5.5-3.5S9.5 8.5 6.5 8.5Z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.1 2.1-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21h-3v-.81A1.7 1.7 0 0 0 10.7 18.6a1.7 1.7 0 0 0-1.87.34l-.06.06-2.1-2.1.06-.06A1.7 1.7 0 0 0 7.1 15a1.7 1.7 0 0 0-1.56-1.03H4.7v-3h.84A1.7 1.7 0 0 0 7.1 9.94a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.1-2.1.06.06A1.7 1.7 0 0 0 10.73 6a1.7 1.7 0 0 0 1.03-1.56V4.6h3v.84A1.7 1.7 0 0 0 15.8 7a1.7 1.7 0 0 0 1.87-.34l.06-.06 2.1 2.1-.06.06A1.7 1.7 0 0 0 19.43 10c.3.64.93 1.03 1.63 1.03h.21v3h-.81A1.7 1.7 0 0 0 19.4 15Z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18 9 12l6-6"/></svg>',
    sudoku: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
    flow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 5h7a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h11"/><circle cx="5" cy="5" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="2" fill="currentColor" stroke="none"/></svg>',
    slide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/><path d="m10 11 2 2 2-2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    merge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h6l4 5h6M4 17h6l4-5"/><path d="m17 9 3 3-3 3M7 5l2 2-2 2"/></svg>',
    mines: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
    hint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.7-1.5 1.6-1.5 2.5h-4c0-.9-.6-1.8-1.5-2.5Z"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></svg>',
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 21v-7h6v7"/></svg>'
  };

  const GAMES = [
    { id: 'sudoku', name: 'SUDOKU', desc: 'Nine rows. One truth.', icon: 'sudoku', c1: '#22e6ff' },
    { id: 'flow', name: 'FLOW LINK', desc: 'Connect every pair.', icon: 'flow', c1: '#a878ff' },
    { id: 'slide', name: 'TILE SHIFT', desc: 'Slide order from chaos.', icon: 'slide', c1: '#3dffa6' },
    { id: 'merge', name: 'MERGE', desc: 'Combine to the target.', icon: 'merge', c1: '#ffc857' },
    { id: 'mines', name: 'MINEFIELD', desc: 'Clear the grid safely.', icon: 'mines', c1: '#ff5a7a' },
    { id: 'code', name: 'CODE BREAKER', desc: 'Crack the secret code.', icon: 'code', c1: '#5ec8ff' }
  ];
  const GMAP = {};
  GAMES.forEach(g => GMAP[g.id] = g);

  const FLOW_COLORS = ['#22e6ff', '#ff5ce0', '#3dffa6', '#ffc857', '#a878ff', '#ff6b6b', '#4d8dff', '#ff9f43', '#5ef2d0', '#f5f7ff', '#c77dff', '#a3ff5e'];
  const CODE_COLORS = ['#22e6ff', '#ff5ce0', '#3dffa6', '#ffc857', '#a878ff', '#ff6b6b', '#4d8dff', '#ff9f43'];

  /* ---------------- state ---------------- */
  function freshState() {
    return {
      settings: { sound: true, haptics: true, accent: 'cyan' },
      stats: { solved: 0, perfect: 0, hints: 0, run: 0, bestRun: 0, byGame: {} },
      levels: { sudoku: 1, flow: 1, slide: 1, merge: 1, mines: 1, code: 1 },
      runLevel: 1
    };
  }
  function loadState() {
    const base = freshState();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base;
      const s = JSON.parse(raw);
      return {
        settings: Object.assign(base.settings, s.settings || {}),
        stats: Object.assign(base.stats, s.stats || {}),
        levels: Object.assign(base.levels, s.levels || {}),
        runLevel: Math.max(1, Math.min(1000000, s.runLevel | 0 || 1))
      };
    } catch (e) { return base; }
  }
  function saveState() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep in memory */ } }
  let S = loadState();
  let G = null, screen = 'home', timerId = null, overlay = null, toastTimer = null;

  /* ---------------- small utilities ---------------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  let audioCtx = null;
  function tone(type) {
    if (!S.settings.sound) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const map = { tap: [520, .035], good: [780, .07], bad: [180, .10], win: [980, .22], merge: [640, .09] };
      const m = map[type] || map.tap;
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(m[0], audioCtx.currentTime);
      if (type === 'win') o.frequency.exponentialRampToValueAtTime(1560, audioCtx.currentTime + m[1]);
      g.gain.setValueAtTime(.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.07, audioCtx.currentTime + .012);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + m[1]);
      o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + m[1] + .02);
    } catch (e) { /* audio optional */ }
  }
  function buzz(ms) { if (S.settings.haptics && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} } }
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1700);
  }
  function applyAccent() { document.body.dataset.accent = S.settings.accent; }
  function elapsed(g) { return g.frozen != null ? g.frozen : Math.floor((Date.now() - g.started) / 1000); }
  function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => { const el = $('#timeVal'); if (el && G && !G.complete) el.textContent = fmt(elapsed(G)); }, 1000);
  }
  function stopTimer() { clearInterval(timerId); timerId = null; if (G && !G.complete) G.frozen = elapsed(G); }

  /* ---------------- screens ---------------- */
  function renderHome() {
    screen = 'home'; stopTimer(); G = null; closeOverlay();
    const nextGame = C.gameForRun(S.runLevel);
    const runLabel = S.runLevel > 1 ? 'CONTINUE RUN · LEVEL ' + S.runLevel : 'START ENDLESS RUN';
    const total = S.stats.solved;
    app.innerHTML = '<div class="screen">' +
      '<header class="topbar"><div class="brand"><div class="logo-mark">' + SVG.infinity + '</div><div><div class="brand-name">PUZZLE<span>//</span>LAB</div><div class="brand-sub">Endless logic engine</div></div></div>' +
      '<button class="icon-btn" data-act="settings" aria-label="Settings">' + SVG.gear + '</button></header>' +
      '<section class="hero"><div class="eyebrow">∞ No final level</div>' +
      '<h1>One more puzzle.<br><em>Forever.</em></h1>' +
      '<p>Six puzzle families, procedurally generated and endlessly scaling from gentle warm-ups to mind-bending master tiers.</p>' +
      '<button class="hero-btn" data-act="run"><span>' + runLabel + '</span><span class="arrow">→</span></button>' +
      '<div class="hero-meta"><span class="pill good">OFFLINE · NO ADS</span><span class="pill">ZERO PERMISSIONS</span><span class="pill">SAVES LOCALLY</span></div></section>' +
      '<div class="stats"><div class="stat"><b>' + total + '</b><span>Puzzles solved</span></div>' +
      '<div class="stat"><b>' + S.stats.bestRun + '</b><span>Best run</span></div>' +
      '<div class="stat"><b>' + S.stats.perfect + '</b><span>No-hint wins</span></div></div>' +
      '<div class="section-head"><h2>Free play</h2><small>pick any · levels keep climbing</small></div>' +
      '<div class="game-grid">' + GAMES.map(g => {
        const lv = S.levels[g.id] || 1;
        return '<button class="game-card" data-act="play" data-game="' + g.id + '" style="--c1:' + g.c1 + '">' +
          '<span class="lvl">LV <b>' + lv + '</b></span><span class="gi">' + SVG[g.icon] + '</span>' +
          '<h3>' + g.name + '</h3><p>' + g.desc + '</p></button>';
      }).join('') + '</div>' +
      '<div class="footnote">Next in run: ' + GMAP[nextGame].name + ' · ' + C.tier(S.runLevel) + '</div>' +
      '</div>';
  }

  function renderSettings() {
    screen = 'settings'; closeOverlay();
    app.innerHTML = '<div class="screen">' +
      '<header class="topbar"><button class="icon-btn" data-act="home" aria-label="Back">' + SVG.back + '</button><div class="brand"><div class="logo-mark">' + SVG.infinity + '</div><div class="brand-name">SETTINGS</div></div><span style="width:40px"></span></header>' +
      '<div class="card" style="overflow:hidden">' +
      setRow('Sound effects', 'Short, subtle tones', 'toggle', 'sound', S.settings.sound) +
      setRow('Haptic feedback', 'A tiny tap on supported devices', 'toggle', 'haptics', S.settings.haptics) +
      '<div class="setting"><div><strong>Accent colour</strong><small>Changes the neon theme</small></div><div class="segments">' +
      ['cyan', 'magenta', 'lime'].map(a => '<button data-act="accent" data-val="' + a + '" class="' + (S.settings.accent === a ? 'on' : '') + '" style="color:' + ({ cyan: '#22e6ff', magenta: '#ff5ce0', lime: '#5dff9b' })[a] + '"><i style="background:' + ({ cyan: '#22e6ff', magenta: '#ff5ce0', lime: '#5dff9b' })[a] + '"></i></button>').join('') + '</div></div>' +
      '</div>' +
      '<div class="card" style="overflow:hidden;margin-top:14px">' +
      setRow('Reset endless run', 'Start again at level 1', 'button', 'resetRun', false) +
      setRow('Erase all progress', 'Levels, stats and settings', 'button', 'resetAll', false) +
      '</div>' +
      '<div class="card" style="margin-top:14px;padding:16px"><div class="eyebrow">Privacy first</div>' +
      '<p class="muted" style="font-size:12px;margin:8px 0 0">No internet permission. No accounts, ads, analytics, trackers or external links. Progress stays in this app’s private storage. Uninstalling removes it.</p></div>' +
      '<div class="footnote">PUZZLE//LAB v1.0 · built for offline play</div></div>';
  }
  function setRow(title, sub, kind, key, on) {
    let control;
    if (kind === 'toggle') control = '<div class="switch ' + (on ? 'on' : '') + '" data-act="toggle" data-key="' + key + '" role="switch" aria-checked="' + !!on + '"></div>';
    else control = '<button class="action" style="min-height:36px;padding:7px 12px;color:var(--danger)" data-act="' + key + '">RESET</button>';
    return '<div class="setting"><div><strong>' + title + '</strong><small>' + sub + '</small></div>' + control + '</div>';
  }

  /* ---------------- game lifecycle ---------------- */
  function startGame(id, level, mode) {
    if (!GMAP[id]) id = 'sudoku';
    level = Math.max(1, level | 0);
    const seed = C.hashSeed(id + '|' + level + '|' + (mode === 'run' ? 'r' : 'f'));
    const rnd = C.mulberry32(seed);
    G = { id: id, level: level, mode: mode, seed: seed, rnd: rnd, data: null,
          moves: 0, hints: 0, mistakes: 0, started: Date.now(), frozen: null,
          complete: false, instance: null, undoStack: [] };
    G.data = MODULES[id].create(G);
    G.instance = MODULES[id];
    screen = 'game'; closeOverlay();
    renderGame();
  }
  function renderGame() {
    const meta = GMAP[G.id];
    const hud = G.instance.hud(G);
    app.innerHTML = '<div class="screen">' +
      '<header class="game-top"><button class="icon-btn" data-act="home" aria-label="Home">' + SVG.back + '</button>' +
      '<div class="title-wrap"><h2>' + meta.name + '</h2><span class="tier-chip">' + C.tier(G.level) + ' · ' + (G.mode === 'run' ? 'Endless run' : 'Free play') + '</span></div>' +
      '<div class="level-badge">LV <b>' + G.level + '</b></div></header>' +
      '<div class="hud">' + hud.map(h => '<div class="hud-item"><span>' + h.label + '</span><b id="hud-' + h.key + '" class="' + (h.cls || '') + '">' + h.value + '</b></div>').join('') + '</div>' +
      '<div class="board-panel ' + (G.id === 'sudoku' || G.id === 'flow' ? '' : 'tight') + '"><div class="board-host" id="boardHost"></div><div class="board-note" id="boardNote">' + (G.instance.status ? G.instance.status(G) : '') + '</div></div>' +
      '<div class="actions">' +
      '<button class="action primary" data-act="hint">' + SVG.hint + '<span>Hint</span></button>' +
      '<button class="action" data-act="undo" ' + (G.instance.undo ? '' : 'disabled') + '>' + SVG.undo + '<span>Undo</span></button>' +
      '<button class="action" data-act="restart">' + SVG.restart + '<span>Restart</span></button>' +
      '<button class="action" data-act="home">' + SVG.home + '<span>Home</span></button>' +
      '</div></div>';
    G.instance.mount($('#boardHost'), G);
    startTimer();
  }
  function updateHud() {
    if (!G || screen !== 'game') return;
    G.instance.hud(G).forEach(h => { const el = $('#hud-' + h.key); if (el) { el.textContent = h.value; el.className = h.cls || ''; } });
    const note = $('#boardNote');
    if (note && G.instance.status) { note.textContent = G.instance.status(G); note.className = 'board-note' + (G.mistakes >= 3 ? ' warn' : ''); }
  }
  function pushUndo(g) {
    if (!g.instance.snapshot) return;
    g.undoStack.push(g.instance.snapshot(g));
    if (g.undoStack.length > 120) g.undoStack.shift();
  }
  function doUndo() {
    if (!G.instance.undo || !G.undoStack.length) { toast('Nothing to undo'); return; }
    G.instance.undo(G, G.undoStack.pop()); tone('tap'); updateHud();
  }
  function doHint() {
    if (G.instance.hint(G)) { G.hints++; S.stats.hints++; saveState(); tone('good'); buzz(20); updateHud(); }
  }
  function checkWin() {
    if (G && !G.complete && G.instance.isWon(G)) winGame();
  }
  function winGame() {
    if (G.complete) return;
    G.complete = true; G.frozen = elapsed(G); stopTimer();
    const stars = Math.max(1, 3 - G.hints - (G.mistakes >= 3 ? 1 : 0));
    S.stats.solved++; S.stats.hints += 0;
    if (G.hints === 0 && G.mistakes === 0) S.stats.perfect++;
    S.stats.byGame[G.id] = Math.max(S.stats.byGame[G.id] || 0, G.level);
    let nextId = null, nextLevel = 0;
    if (G.mode === 'run') {
      S.stats.run++; S.stats.bestRun = Math.max(S.stats.bestRun, S.stats.run);
      S.runLevel++; nextLevel = S.runLevel; nextId = C.gameForRun(nextLevel);
    } else {
      S.levels[G.id] = G.level + 1; nextLevel = G.level + 1; nextId = G.id;
    }
    saveState(); tone('win'); buzz([25, 50, 35]);
    showWinOverlay(stars, nextId, nextLevel);
  }
  function loseGame(reason) {
    if (G.complete) return;
    G.complete = true; G.frozen = elapsed(G); stopTimer(); tone('bad'); buzz([60, 40, 60]);
    showOverlay('<div class="modal"><div class="big-icon">🛡️</div><div class="eyebrow">Run paused</div><h2>' + reason + '</h2>' +
      '<p>No levels lost. Take a breath and try this one again.</p>' +
      '<button class="btn" data-act="retry">TRY AGAIN</button><button class="btn ghost" data-act="home">BACK TO HOME</button></div>');
  }
  function showWinOverlay(stars, nextId, nextLevel) {
    const confetti = Array.from({ length: 26 }, (_, i) => {
      const color = [FLOW_COLORS[i % FLOW_COLORS.length]];
      return '<i class="confetti" style="left:' + (4 + Math.random() * 92) + '%;background:' + color[0] + ';animation-delay:' + (Math.random() * .5).toFixed(2) + 's;animation-duration:' + (1.1 + Math.random() * .8).toFixed(2) + 's"></i>';
    }).join('');
    const nextLabel = G.mode === 'run' ? 'NEXT: ' + GMAP[nextId].name + ' · LEVEL ' + nextLevel : 'LEVEL ' + nextLevel + ' AWAITS';
    showOverlay('<div class="modal">' + confetti + '<div class="big-icon">✦</div><div class="eyebrow">Puzzle complete</div><h2>Level ' + G.level + ' cleared</h2>' +
      '<div class="stars">' + [0, 1, 2].map(i => '<span class="' + (i < stars ? '' : 'off') + '">★</span>').join('') + '</div>' +
      '<div class="modal-stats"><div><b>' + fmt(G.frozen || 0) + '</b><span>Time</span></div><div><b>' + G.moves + '</b><span>Moves</span></div><div><b>' + G.hints + '</b><span>Hints</span></div></div>' +
      '<button class="btn" data-act="next" data-id="' + nextId + '" data-level="' + nextLevel + '">' + nextLabel + '</button>' +
      '<button class="btn ghost" data-act="home">BACK TO HOME</button></div>');
  }
  function showOverlay(html) {
    closeOverlay();
    overlay = document.createElement('div'); overlay.className = 'overlay'; overlay.innerHTML = html;
    document.body.appendChild(overlay);
  }
  function closeOverlay() { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); overlay = null; }
  function confirmOverlay(title, msg, act) {
    showOverlay('<div class="modal"><div class="eyebrow">Please confirm</div><h2>' + title + '</h2><p>' + msg + '</p>' +
      '<button class="btn danger" data-act="' + act + '">YES, RESET</button><button class="btn ghost" data-act="closeOverlay">CANCEL</button></div>');
  }

  /* ---------------- MODULES ---------------- */
  const MODULES = {};

  /* SUDOKU */
  MODULES.sudoku = {
    create(g) {
      const p = C.generateSudoku(g.rnd, g.level);
      return { puzzle: p.puzzle, solution: p.solution, entries: new Array(81).fill(0),
               notes: new Array(81).fill(0), sel: -1, noteMode: false };
    },
    mount(host, g) { host.innerHTML = '<div id="sdGrid" class="sudoku-grid"></div><div class="num-pad" id="sdPad"></div>'; this.update(g); },
    snapshot(g) { const d = g.data; return { entries: d.entries.slice(), notes: d.notes.slice(), mistakes: g.mistakes }; },
    undo(g, s) { g.data.entries = s.entries; g.data.notes = s.notes; g.mistakes = s.mistakes; this.update(g); },
    update(g) {
      const d = g.data, sel = d.sel;
      const related = (a, b) => {
        const ar = (a / 9) | 0, ac = a % 9, br = (b / 9) | 0, bc = b % 9;
        return ar === br || ac === bc || (((ar / 3) | 0) === ((br / 3) | 0) && ((ac / 3) | 0) === ((bc / 3) | 0));
      };
      $('#sdGrid').innerHTML = d.puzzle.map((given, i) => {
        const val = given || d.entries[i];
        const cls = ['sc'];
        if (((i / 9) | 0) % 3 === 2) cls.push('bx-r');
        if (i % 9 === 2) cls.push('bx-c');
        if (given) cls.push('given');
        if (d.entries[i] && d.entries[i] !== d.solution[i]) cls.push('wrong');
        if (d.hinted && d.hinted[i]) cls.push('hinted');
        if (sel === i) cls.push('selected'); else if (sel >= 0 && related(sel, i)) cls.push('peer');
        let content = val ? val : '';
        if (!val && d.notes[i]) {
          content = '<div class="notes">' + Array.from({ length: 9 }, (_, k) => '<i>' + ((d.notes[i] & (1 << k)) ? (k + 1) : '') + '</i>').join('') + '</div>';
        }
        return '<button class="' + cls.join(' ') + '" data-act="scell" data-i="' + i + '" aria-label="cell ' + (i + 1) + '">' + content + '</button>';
      }).join('');
      $('#sdPad').innerHTML = Array.from({ length: 9 }, (_, i) => '<button data-act="snum" data-v="' + (i + 1) + '">' + (i + 1) + '</button>').join('') +
        '<button class="tool ' + (d.noteMode ? 'on' : '') + '" data-act="snotes" aria-label="Notes">✎</button>' +
        '<button class="tool" data-act="serase" aria-label="Erase">⌫</button>';
    },
    click(g, ds) {
      const d = g.data;
      if (ds.act === 'scell') {
        d.sel = +ds.i; tone('tap'); this.update(g); return true;
      }
      if (ds.act === 'snotes') { d.noteMode = !d.noteMode; tone('tap'); this.update(g); return true; }
      if (ds.act === 'serase') {
        if (d.sel < 0 || d.puzzle[d.sel]) return true;
        pushUndo(g); d.entries[d.sel] = 0; d.notes[d.sel] = 0; this.update(g); tone('tap'); return true;
      }
      if (ds.act === 'snum') {
        const v = +ds.v;
        if (d.sel < 0) { toast('Select a cell first'); return true; }
        if (d.puzzle[d.sel]) { toast('Given numbers cannot change'); return true; }
        pushUndo(g);
        if (d.noteMode) { d.notes[d.sel] ^= (1 << (v - 1)); }
        else {
          d.entries[d.sel] = v;
          if (v !== d.solution[d.sel]) { g.mistakes++; tone('bad'); buzz(30); }
          else { tone('good'); buzz(12); }
        }
        this.update(g); checkWin(); updateHud(); return true;
      }
      return false;
    },
    key(g, e) {
      const d = g.data;
      if (e.key >= '1' && e.key <= '9') return this.click(g, { act: 'snum', v: e.key });
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') return this.click(g, { act: 'serase' });
      if (e.key.toLowerCase() === 'n') return this.click(g, { act: 'snotes' });
      const moves = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
      if (moves[e.key]) {
        const r = Math.floor((d.sel < 0 ? 0 : d.sel) / 9) + moves[e.key][0];
        const c = ((d.sel < 0 ? 0 : d.sel) % 9) + moves[e.key][1];
        d.sel = C.clamp(r, 0, 8) * 9 + C.clamp(c, 0, 8); this.update(g); return true;
      }
      return false;
    },
    hint(g) {
      const d = g.data;
      let idx = d.sel >= 0 && d.puzzle[d.sel] === 0 && d.entries[d.sel] !== d.solution[d.sel] ? d.sel : -1;
      if (idx < 0) for (let i = 0; i < 81; i++) if (!d.puzzle[i] && d.entries[i] !== d.solution[i]) { idx = i; break; }
      if (idx < 0) return false;
      pushUndo(g); d.entries[idx] = d.solution[idx]; d.notes[idx] = 0; d.hinted = d.hinted || []; d.hinted[idx] = 1;
      this.update(g); checkWin(); toast('Filled one correct cell'); return true;
    },
    isWon(g) { const d = g.data; return d.puzzle.every((v, i) => v || d.entries[i] === d.solution[i]); },
    hud(g) { return [
      { key: 'time', label: 'Time', value: fmt(elapsed(g)) },
      { key: 'moves', label: 'Moves', value: g.moves },
      { key: 'hints', label: 'Hints', value: g.hints },
      { key: 'miss', label: 'Errors', value: g.mistakes, cls: g.mistakes >= 3 ? 'bad' : '' }
    ]; },
    status(g) { return g.data.puzzle.filter(Boolean).length + ' given numbers · fill every square'; }
  };

  /* FLOW LINK */
  MODULES.flow = {
    create(g) { const cfg = C.generateFlow(g.rnd, g.level); return { cfg: cfg, paths: cfg.pairs.map(() => []), drawing: -1, hinted: {} }; },
    mount(host, g) {
      host.innerHTML = '<canvas class="flow-canvas"></canvas><div class="flow-legend">' +
        g.data.cfg.pairs.map((_, i) => '<i style="background:' + FLOW_COLORS[i % FLOW_COLORS.length] + '">' + (i + 1) + '</i>').join('') + '</div>';
      const canvas = $('#flowCanvas') || host.querySelector('canvas');
      let drawing = false;
      const cellAt = e => {
        const rect = canvas.getBoundingClientRect(), d = g.data;
        const c = Math.floor((e.clientX - rect.left) / d.cell), r = Math.floor((e.clientY - rect.top) / d.cell);
        if (r < 0 || c < 0 || r >= d.cfg.h || c >= d.cfg.w) return -1;
        return r * d.cfg.w + c;
      };
      const down = e => {
        e.preventDefault(); canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
        const idx = cellAt(e); if (idx < 0) return;
        const d = g.data, pairs = d.cfg.pairs;
        let color = -1, fromEnd = false;
        for (let i = 0; i < pairs.length; i++) {
          if (pairs[i][0] === idx) { color = i; break; }
          if (pairs[i][1] === idx) { color = i; fromEnd = true; break; }
        }
        if (color < 0) {
          for (let i = 0; i < d.paths.length; i++) {
            const p = d.paths[i].indexOf(idx);
            if (p >= 0) { color = i; d.paths[i] = d.paths[i].slice(0, p + 1); break; }
          }
        }
        if (color < 0) return;
        pushUndo(g);
        const at = d.paths[color].indexOf(idx);
        if (at >= 0) d.paths[color] = d.paths[color].slice(0, at + 1);
        else d.paths[color] = [fromEnd ? pairs[color][1] : pairs[color][0]];
        d.drawing = color; drawing = true; tone('tap'); this.draw(g);
      };
      const move = e => {
        if (!drawing) return;
        e.preventDefault();
        const idx = cellAt(e), d = g.data;
        if (idx < 0) return;
        const color = d.drawing, path = d.paths[color], pair = d.cfg.pairs[color];
        const existing = path.indexOf(idx);
        if (existing >= 0) { if (existing < path.length - 1) { path.length = existing + 1; this.draw(g); } return; }
        const last = path[path.length - 1];
        const adj = Math.abs((last % d.cfg.w) - (idx % d.cfg.w)) + Math.abs(((last / d.cfg.w) | 0) - ((idx / d.cfg.w) | 0)) === 1;
        if (!adj) return;
        if (pair.indexOf(idx) < 0) {
          for (let i = 0; i < d.paths.length; i++) {
            if (i !== color && d.paths[i].indexOf(idx) >= 0) return;
            if (i !== color && d.cfg.pairs[i].indexOf(idx) >= 0) return;
          }
        } else if (idx !== pair[0] && idx !== pair[1]) return;
        if (path.length > 1 && idx === path[path.length - 2]) { path.pop(); this.draw(g); return; }
        path.push(idx);
        if (idx === pair[0] || idx === pair[1]) { d.drawing = -1; drawing = false; tone('good'); buzz(12); checkWin(); }
        this.draw(g);
      };
      const up = () => { drawing = false; g.data.drawing = -1; };
      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);
      const resize = () => this.resize(g);
      if (window.ResizeObserver) { g.ro = new ResizeObserver(resize); g.ro.observe(host); }
      else window.addEventListener('resize', resize);
      resize();
    },
    resize(g) {
      const canvas = document.querySelector('.flow-canvas'), host = $('#boardHost');
      if (!canvas || !host) return;
      const d = g.data;
      d.cell = Math.max(24, Math.floor(Math.min(host.clientWidth - 6, 460) / Math.max(d.cfg.w, d.cfg.h)));
      const px = d.cell * d.cfg.w, py = d.cell * d.cfg.h, ratio = window.devicePixelRatio || 1;
      canvas.style.width = px + 'px'; canvas.style.height = py + 'px';
      canvas.width = Math.round(px * ratio); canvas.height = Math.round(py * ratio);
      const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.draw(g);
    },
    draw(g) {
      const canvas = document.querySelector('.flow-canvas'); if (!canvas || !g.data.cell) return;
      const ctx = canvas.getContext('2d'), d = g.data, n = d.cfg, cell = d.cell;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let r = 0; r < n.h; r++) for (let c = 0; c < n.w; c++) {
        ctx.fillStyle = 'rgba(255,255,255,.032)';
        ctx.strokeStyle = 'rgba(150,180,240,.10)';
        const x = c * cell + 2, y = r * cell + 2, s = cell - 4;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, s, s, Math.min(8, cell * .2));
        else ctx.rect(x, y, s, s);
        ctx.fill(); ctx.stroke();
      }
      for (let i = 0; i < d.paths.length; i++) {
        const p = d.paths[i]; if (p.length < 1) continue;
        const color = FLOW_COLORS[i % FLOW_COLORS.length];
        ctx.lineWidth = Math.max(6, cell * .28); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = cell * .18;
        ctx.beginPath();
        p.forEach((idx, k) => {
          const x = (idx % n.w) * cell + cell / 2, y = ((idx / n.w) | 0) * cell + cell / 2;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        if (p.length === 1) ctx.lineTo((p[0] % n.w) * cell + cell / 2 + .01, ((p[0] / n.w) | 0) * cell + cell / 2);
        ctx.stroke(); ctx.shadowBlur = 0;
      }
      for (let i = 0; i < n.pairs.length; i++) for (const idx of n.pairs[i]) {
        const x = (idx % n.w) * cell + cell / 2, y = ((idx / n.w) | 0) * cell + cell / 2;
        ctx.beginPath(); ctx.arc(x, y, cell * .29, 0, Math.PI * 2);
        ctx.fillStyle = FLOW_COLORS[i % FLOW_COLORS.length]; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke();
        ctx.fillStyle = '#06101e'; ctx.font = 'bold ' + Math.floor(cell * .30) + 'px system-ui';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x, y + 1);
      }
    },
    snapshot(g) { return g.data.paths.map(p => p.slice()); },
    undo(g, s) { g.data.paths = s; this.draw(g); },
    hint(g) {
      const d = g.data;
      for (let i = 0; i < d.cfg.pairs.length; i++) {
        const p = d.cfg.segments[i];
        const connected = d.paths[i].length && (d.paths[i][0] === p[0] || d.paths[i][0] === p[p.length - 1]) &&
          (d.paths[i][d.paths[i].length - 1] === p[0] || d.paths[i][d.paths[i].length - 1] === p[p.length - 1]);
        if (!connected) { pushUndo(g); d.paths[i] = p.slice(); d.hinted[i] = 1; this.draw(g); toast('One route revealed'); checkWin(); return true; }
      }
      return false;
    },
    isWon(g) {
      const d = g.data, used = new Set();
      for (let i = 0; i < d.cfg.pairs.length; i++) {
        const p = d.paths[i]; if (p.length < 2) return false;
        const e = d.cfg.pairs[i];
        if (!((p[0] === e[0] && p[p.length - 1] === e[1]) || (p[0] === e[1] && p[p.length - 1] === e[0]))) return false;
        p.forEach(x => used.add(x));
      }
      return used.size === d.cfg.w * d.cfg.h;
    },
    hud(g) {
      const d = g.data, done = d.paths.filter((p, i) => p.length > 1 && (p[p.length - 1] === d.cfg.pairs[i][0] || p[p.length - 1] === d.cfg.pairs[i][1])).length;
      return [{ key: 'time', label: 'Time', value: fmt(elapsed(g)) }, { key: 'moves', label: 'Routes', value: done + '/' + d.cfg.pairs.length },
        { key: 'hints', label: 'Hints', value: g.hints }, { key: 'size', label: 'Grid', value: d.cfg.w + '×' + d.cfg.h }];
    },
    status(g) { return g.data.cfg.pairs.length + ' colour pairs · drag from one dot to its twin · fill every square'; }
  };

  /* SLIDING TILE */
  MODULES.slide = {
    create(g) { const s = C.generateSlide(g.rnd, g.level); return { n: s.n, tiles: s.tiles, hintIdx: -1 }; },
    mount(host, g) { host.innerHTML = '<div class="slide-grid" id="slGrid"></div>'; this.update(g); },
    update(g) {
      const d = g.data;
      const grid = $('#slGrid');
      grid.style.gridTemplateColumns = 'repeat(' + d.n + ',1fr)';
      grid.innerHTML = d.tiles.map((v, i) => '<button class="tile ' + (!v ? 'blank' : '') + ' ' + (d.hintIdx === i ? 'hint' : '') + '" data-act="stile" data-i="' + i + '" ' + (!v ? 'disabled' : '') + '>' + (v || '') + '</button>').join('');
    },
    snapshot(g) { return { tiles: g.data.tiles.slice(), moves: g.moves }; },
    undo(g, s) { g.data.tiles = s.tiles; g.moves = s.moves; this.update(g); },
    click(g, ds) {
      if (ds.act !== 'stile') return false;
      const d = g.data, nt = C.slideMove(d.tiles, d.n, +ds.i);
      if (!nt) return true;
      pushUndo(g); d.tiles = nt; d.hintIdx = -1; g.moves++; tone('tap'); buzz(10);
      this.update(g); checkWin(); updateHud(); return true;
    },
    key(g, e) {
      const map = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: g.data.n, ArrowDown: -g.data.n };
      if (!(e.key in map)) return false;
      const blank = g.data.tiles.indexOf(0), idx = blank + map[e.key];
      if (idx < 0 || idx >= g.data.tiles.length) return true;
      if (Math.abs((blank % g.data.n) - (idx % g.data.n)) > 1) return true;
      return this.click(g, { act: 'stile', i: idx });
    },
    hint(g) { const idx = C.slideHint(g.data.tiles, g.data.n); if (idx < 0) return false; g.data.hintIdx = idx; this.update(g); toast('Try the glowing tile'); return true; },
    isWon(g) { const d = g.data; return d.tiles.every((v, i) => i === d.n * d.n - 1 ? v === 0 : v === i + 1); },
    hud(g) { return [
      { key: 'time', label: 'Time', value: fmt(elapsed(g)) }, { key: 'moves', label: 'Moves', value: g.moves },
      { key: 'hints', label: 'Hints', value: g.hints }, { key: 'size', label: 'Grid', value: g.data.n + '×' + g.data.n }
    ]; },
    status(g) { return 'Slide tiles into the empty slot to restore numeric order'; }
  };

  /* MERGE */
  MODULES.merge = {
    create(g) { const m = C.newMerge(g.rnd, g.level); m.hintDir = null; return m; },
    mount(host, g) {
      host.innerHTML = '<div class="merge-top"><div class="score"><small>Score</small><b id="mgScore">0</b></div>' +
        '<div class="eyebrow" style="text-align:center">Reach<br><b id="mgTarget" style="font-size:19px;color:var(--warn)"></b></div>' +
        '<div class="score"><small>Best tile</small><b id="mgBest">2</b></div></div><div class="merge-grid" id="mgGrid"></div>';
      const grid = $('#mgGrid'); let sx = 0, sy = 0, active = false;
      grid.addEventListener('pointerdown', e => { active = true; sx = e.clientX; sy = e.clientY; if (grid.setPointerCapture) grid.setPointerCapture(e.pointerId); });
      grid.addEventListener('pointerup', e => {
        if (!active) return; active = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
        this.move(g, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
      });
      grid.addEventListener('pointercancel', () => { active = false; });
      this.update(g);
    },
    update(g) {
      const d = g.data, max = Math.max.apply(null, d.board);
      $('#mgScore').textContent = d.score; $('#mgTarget').textContent = d.target; $('#mgBest').textContent = max;
      const grid = $('#mgGrid');
      grid.style.gridTemplateColumns = 'repeat(' + d.size + ',1fr)';
      grid.innerHTML = d.board.map((v, i) => {
        let bg = 'rgba(255,255,255,.035)', color = '';
        if (v) {
          const t = Math.log2(v);
          bg = 'linear-gradient(145deg,hsl(' + ((190 - t * 13 + 360) % 360) + ' 92% 62%),hsl(' + ((258 - t * 9 + 360) % 360) + ' 88% 55%))';
          color = 'filled';
        }
        return '<div class="mcell ' + color + '" style="background:' + bg + '">' + (v || '') + '</div>';
      }).join('');
    },
    move(g, dir) {
      if (g.complete) return;
      const d = g.data, r = C.mergeMove(d.board, d.size, dir, g.rnd);
      if (!r.moved) { toast('No move that way'); return; }
      pushUndo(g); d.board = r.board; d.score += r.score; g.moves++;
      tone(r.score ? 'merge' : 'tap'); buzz(10); this.update(g); updateHud();
      if (Math.max.apply(null, d.board) >= d.target) { checkWin(); return; }
      let stuck = true;
      for (const dr of ['left', 'right', 'up', 'down']) if (C.mergeMove(d.board, d.size, dr, () => .5).moved) { stuck = false; break; }
      if (stuck) loseGame('Board is full — no moves left');
    },
    key(g, e) {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
      const dir = map[e.key] || map[e.key.toLowerCase && e.key.toLowerCase()];
      if (!dir) return false;
      this.move(g, dir); return true;
    },
    hint(g) { const dir = C.mergeHint(g.data.board, g.data.size); if (!dir) return false; g.data.hintDir = dir; toast('Try swiping ' + dir); return true; },
    isWon(g) { return Math.max.apply(null, g.data.board) >= g.data.target; },
    hud(g) { return [
      { key: 'time', label: 'Time', value: fmt(elapsed(g)) }, { key: 'moves', label: 'Moves', value: g.moves },
      { key: 'hints', label: 'Hints', value: g.hints }, { key: 'size', label: 'Board', value: g.data.size + '×' + g.data.size }
    ]; },
    status(g) { return 'Swipe or use arrow keys · merge matching numbers to reach ' + g.data.target; }
  };

  /* MINESWEEPER */
  MODULES.mines = {
    create(g) { const cfg = C.generateMines(g.level); return { cfg: cfg, placed: false, mines: null, counts: null,
      revealed: new Array(cfg.w * cfg.h).fill(false), flagged: new Array(cfg.w * cfg.h).fill(false),
      exploded: new Array(cfg.w * cfg.h).fill(false), hearts: 3, flagMode: false }; },
    mount(host, g) {
      host.innerHTML = '<div class="mines-wrap"><div class="mines-grid" id="mnGrid"></div></div>' +
        '<div class="code-actions"><button data-act="mflag">' + (g.data.flagMode ? '⚑ FLAG MODE: ON' : '⚑ FLAG MODE') + '</button>' +
        '<button data-act="mheart">Shields: <span id="mnHearts">♥♥♥</span></button></div>';
      const grid = $('#mnGrid');
      grid.addEventListener('contextmenu', e => {
        const b = e.target.closest('[data-act="mcell"]'); if (!b) return;
        e.preventDefault(); this.click(g, { act: 'mcell', i: b.dataset.i, flag: '1' });
      });
      let lp = null;
      grid.addEventListener('pointerdown', e => {
        const b = e.target.closest('[data-act="mcell"]'); if (!b) return;
        lp = setTimeout(() => { g.longPressed = true; this.click(g, { act: 'mcell', i: b.dataset.i, flag: '1' }); }, 480);
      });
      const cancel = () => { clearTimeout(lp); setTimeout(() => { g.longPressed = false; }, 80); };
      grid.addEventListener('pointerup', cancel); grid.addEventListener('pointerleave', cancel);
      this.update(g);
    },
    update(g) {
      const d = g.data, grid = $('#mnGrid');
      const cw = Math.max(21, Math.min(34, Math.floor((($('#boardHost').clientWidth || 320) - 20) / d.cfg.w)));
      grid.style.gridTemplateColumns = 'repeat(' + d.cfg.w + ',' + cw + 'px)';
      grid.innerHTML = Array.from({ length: d.cfg.w * d.cfg.h }, (_, i) => {
        const open = d.revealed[i], flag = d.flagged[i], cls = ['mcell-m'];
        let txt = '';
        if (open) {
          cls.push('open');
          if (d.exploded[i]) { cls.push('boom'); txt = '✸'; }
          else if (d.counts && d.counts[i] > 0) { cls.push('n' + d.counts[i]); txt = d.counts[i]; }
        } else if (flag) { cls.push('flag'); txt = '⚑'; }
        return '<button class="' + cls.join(' ') + '" data-act="mcell" data-i="' + i + '">' + txt + '</button>';
      }).join('');
      const hearts = $('#mnHearts'); if (hearts) hearts.textContent = '♥'.repeat(d.hearts) + '♡'.repeat(3 - d.hearts);
      const fb = $('[data-act="mflag"]'); if (fb) fb.textContent = d.flagMode ? '⚑ FLAG MODE: ON' : '⚑ FLAG MODE';
    },
    click(g, ds) {
      if (ds.act === 'mflag') { g.data.flagMode = !g.data.flagMode; tone('tap'); this.update(g); return true; }
      if (ds.act === 'mheart') { toast(g.data.hearts + ' shield(s) remaining'); return true; }
      if (ds.act !== 'mcell' || g.complete) return false;
      if (g.longPressed && !ds.flag) return true;
      const d = g.data, i = +ds.i, total = d.cfg.w * d.cfg.h;
      if (d.revealed[i]) return true;
      if (ds.flag || d.flagMode) {
        if (!d.revealed[i]) { d.flagged[i] = !d.flagged[i]; tone('tap'); this.update(g); }
        return true;
      }
      if (!d.placed) {
        const placed = C.placeMines(d.cfg, i, g.rnd);
        d.mines = placed.mines; d.counts = placed.counts; d.placed = true;
      }
      if (d.mines.has(i)) {
        d.revealed[i] = true; d.exploded[i] = true; d.hearts--; g.mistakes++;
        g.moves++; tone('bad'); buzz(50);
        if (d.hearts <= 0) { this.update(g); updateHud(); loseGame('Out of shields'); return true; }
        toast('Shield absorbed the blast — ' + d.hearts + ' left');
      } else {
        const stack = [i];
        while (stack.length) {
          const k = stack.pop();
          if (d.revealed[k] || d.flagged[k] || d.mines.has(k)) continue;
          d.revealed[k] = true;
          if (d.counts[k] === 0) for (const nb of C.gridNeighbors(k, d.cfg.w, d.cfg.h)) stack.push(nb);
        }
        tone('tap');
      }
      g.moves++; this.update(g); checkWin(); updateHud(); return true;
    },
    hint(g) {
      const d = g.data;
      if (!d.placed) return false;
      for (let i = 0; i < d.cfg.w * d.cfg.h; i++) if (!d.revealed[i] && !d.mines.has(i) && !d.flagged[i]) {
        d.flagged[i] = false;
        const stack = [i];
        while (stack.length) {
          const k = stack.pop();
          if (d.revealed[k] || d.mines.has(k)) continue;
          d.revealed[k] = true;
          if (d.counts[k] === 0) {
            const w = d.cfg.w, c = k % w, r = (k / w) | 0;
            [[r > 0 ? k - w : -1], [r < d.cfg.h - 1 ? k + w : -1], [c > 0 ? k - 1 : -1], [c < w - 1 ? k + 1 : -1]]
              .forEach(x => { if (x[0] >= 0) stack.push(x[0]); });
          }
        }
        this.update(g); checkWin(); toast('A safe square was revealed'); return true;
      }
      return false;
    },
    isWon(g) {
      const d = g.data;
      return d.placed && Array.from({ length: d.cfg.w * d.cfg.h }, (_, i) => i).every(i => d.mines.has(i) || d.revealed[i]);
    },
    hud(g) { return [
      { key: 'time', label: 'Time', value: fmt(elapsed(g)) },
      { key: 'moves', label: 'Opens', value: g.moves },
      { key: 'hints', label: 'Hints', value: g.hints },
      { key: 'shields', label: 'Shields', value: '♥'.repeat(Math.max(0, g.data.hearts)), cls: g.data.hearts === 1 ? 'bad' : 'good' }
    ]; },
    status(g) { const d = g.data; return d.cfg.w + '×' + d.cfg.h + ' grid · ' + d.cfg.mines + ' mines · tap to reveal, long-press to flag'; }
  };

  /* CODE BREAKER */
  MODULES.code = {
    create(g) { const c = C.generateCode(g.rnd, g.level); return { cfg: c, input: [], guesses: [], selected: 0,
      revealed: new Array(c.length).fill(-1), feedback: [] }; },
    mount(host, g) { host.innerHTML = '<div class="code-board" id="cbBoard"></div>' +
      '<div class="palette" id="cbPal"></div><div class="code-actions"><button data-act="cdel">DELETE</button><button class="go" data-act="csubmit">SUBMIT</button></div>'; this.update(g); },
    update(g) {
      const d = g.data, c = d.cfg;
      const clue = '<div class="code-row" style="border-style:dashed"><span style="font-size:9px;color:var(--dim);letter-spacing:.12em">CLUES</span><div class="pegs">' +
        d.revealed.map(v => '<div class="peg ' + (v >= 0 ? 'filled' : '') + '" style="' + (v >= 0 ? 'background:' + CODE_COLORS[v] + ';color:' + CODE_COLORS[v] : '') + '"></div>').join('') + '</div></div>';
      const rows = [];
      for (let r = 0; r < c.attempts; r++) {
        const isGuess = r < d.guesses.length, isCurrent = r === d.guesses.length;
        const vals = isGuess ? d.guesses[r] : (isCurrent ? d.input : []);
        const fb = isGuess ? d.feedback[r] : null;
        rows.push('<div class="code-row ' + (isCurrent ? 'current' : '') + '"><div class="pegs">' +
          Array.from({ length: c.length }, (_, i) => {
            const v = vals[i];
            return '<div class="peg ' + (v != null && v >= 0 ? 'filled' : '') + '" style="' + (v >= 0 ? 'background:' + CODE_COLORS[v] + ';color:' + CODE_COLORS[v] : '') + '"></div>';
          }).join('') + '</div><div class="feedback">' +
          (fb ? [0, 1, 2, 3].map(k => '<i class="fb ' + (k < fb.exact ? 'exact' : (k < fb.exact + fb.partial ? 'partial' : '')) + '"></i>').join('')
              : Array.from({ length: 4 }, () => '<i class="fb"></i>').join('')) + '</div></div>');
      }
      $('#cbBoard').innerHTML = clue + rows.join('');
      $('#cbPal').innerHTML = CODE_COLORS.slice(0, c.colors).map((col, i) =>
        '<button class="pal ' + (d.selected === i ? 'sel' : '') + '" style="background:' + col + ';color:' + col + '" data-act="cpal" data-v="' + i + '" aria-label="Colour ' + (i + 1) + '"></button>').join('');
    },
    click(g, ds) {
      const d = g.data, c = d.cfg;
      if (ds.act === 'cpal') {
        d.selected = +ds.v;
        if (d.input.length < c.length) d.input.push(d.selected);
        tone('tap'); this.update(g); return true;
      }
      if (ds.act === 'cdel') { d.input.pop(); tone('tap'); this.update(g); return true; }
      if (ds.act === 'csubmit') {
        if (d.input.length < c.length) { toast('Fill all ' + c.length + ' slots first'); return true; }
        const fb = C.feedbackCode(d.input, c.code);
        d.guesses.push(d.input.slice()); d.feedback.push(fb); d.input = [];
        g.moves++;
        if (fb.exact === c.length) { tone('good'); this.update(g); checkWin(); return true; }
        if (d.guesses.length >= c.attempts) { this.update(g); loseGame('Code not cracked'); return true; }
        tone('tap'); this.update(g); updateHud(); return true;
      }
      return false;
    },
    key(g, e) {
      const d = g.data;
      if (e.key >= '1' && e.key <= String(Math.min(8, d.cfg.colors))) return this.click(g, { act: 'cpal', v: +e.key - 1 });
      if (e.key === 'Backspace') return this.click(g, { act: 'cdel' });
      if (e.key === 'Enter') return this.click(g, { act: 'csubmit' });
      return false;
    },
    hint(g) {
      const d = g.data, spots = d.revealed.map((v, i) => v < 0 ? i : -1).filter(i => i >= 0);
      if (!spots.length) return false;
      const i = spots[0], col = d.cfg.code[i];
      d.revealed[i] = col;
      while (d.input.length < i) d.input.push(-1);
      d.input[i] = col;
      const pos = d.input.indexOf(-1); if (pos >= 0) d.input.splice(pos, 1);
      this.update(g); toast('Position ' + (i + 1) + ' revealed'); return true;
    },
    isWon(g) { const d = g.data; return d.guesses.some(guess => C.feedbackCode(guess, d.cfg.code).exact === d.cfg.length); },
    hud(g) { return [
      { key: 'time', label: 'Time', value: fmt(elapsed(g)) },
      { key: 'tries', label: 'Tries', value: (g.data.cfg.attempts - g.data.guesses.length) },
      { key: 'hints', label: 'Hints', value: g.hints },
      { key: 'code', label: 'Code', value: g.data.cfg.length + '/' + g.data.cfg.colors }
    ]; },
    status(g) { const d = g.data; return 'Green = right colour & place · amber = right colour only · pick a colour, then fill the slots'; }
  };

  /* ---------------- global input ---------------- */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (!app.contains(el) && !(overlay && overlay.contains(el))) return;
    const a = el.dataset.act;
    switch (a) {
      case 'settings': tone('tap'); renderSettings(); break;
      case 'home': tone('tap'); renderHome(); break;
      case 'run': tone('tap'); startGame(C.gameForRun(S.runLevel), S.runLevel, 'run'); break;
      case 'play': tone('tap'); startGame(el.dataset.game, S.levels[el.dataset.game] || 1, 'free'); break;
      case 'next': tone('tap'); startGame(el.dataset.id, +el.dataset.level, G && G.mode === 'run' ? 'run' : 'free'); break;
      case 'retry': tone('tap'); startGame(G.id, G.level, G.mode); break;
      case 'hint': doHint(); break;
      case 'undo': doUndo(); break;
      case 'restart': confirmOverlay('Restart level?', 'This regenerates the same puzzle and resets your moves.', 'reallyRestart'); break;
      case 'reallyRestart': tone('tap'); startGame(G.id, G.level, G.mode); break;
      case 'toggle':
        S.settings[el.dataset.key] = !S.settings[el.dataset.key]; saveState();
        el.classList.toggle('on', S.settings[el.dataset.key]); el.setAttribute('aria-checked', String(S.settings[el.dataset.key]));
        tone('tap'); break;
      case 'accent': S.settings.accent = el.dataset.val; applyAccent(); saveState();
        document.querySelectorAll('[data-act="accent"]').forEach(b => b.classList.toggle('on', b === el)); tone('good'); break;
      case 'resetRun': confirmOverlay('Reset endless run?', 'Your run returns to level 1. Free-play levels and stats stay.', 'reallyResetRun'); break;
      case 'reallyResetRun': S.runLevel = 1; S.stats.run = 0; saveState(); closeOverlay(); renderSettings(); toast('Endless run reset'); break;
      case 'resetAll': confirmOverlay('Erase everything?', 'All levels, records and settings will be deleted.', 'reallyResetAll'); break;
      case 'reallyResetAll': S = freshState(); saveState(); applyAccent(); closeOverlay(); renderHome(); toast('All progress erased'); break;
      case 'closeOverlay': closeOverlay(); break;
      default:
        if (G && G.instance && G.instance.click(G, el.dataset)) { updateHud(); }
    }
  });

  document.addEventListener('keydown', e => {
    if (overlay && e.key === 'Escape') { closeOverlay(); return; }
    if (!G || screen !== 'game' || G.complete || overlay) return;
    if (e.key === 'Escape') { renderHome(); return; }
    if (G.instance.key && G.instance.key(G, e)) { e.preventDefault(); updateHud(); }
  });

  function exitGame() {
    if (!G) return;
    G.frozen = elapsed(G); stopTimer();
    if (!G.complete) renderHome();
  }
  window.appBack = function () {
    if (overlay) { closeOverlay(); return; }
    if (screen === 'game') { exitGame(); return; }
    if (screen === 'settings') { renderHome(); return; }
  };
  window.onAppPause = function () { if (G && !G.complete && G.frozen == null) G.frozen = elapsed(G); };
  window.onAppResume = function () { if (G && !G.complete && G.frozen != null) { G.started = Date.now() - G.frozen * 1000; G.frozen = null; } };

  applyAccent(); renderHome();
})();
