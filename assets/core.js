/* Pure puzzle generation / logic. No DOM. Safe to unit-test in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PuzzleCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(arr, rnd) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }
  function popcount(x) { let c = 0; while (x) { x &= x - 1; c++; } return c; }

  /* ---------------- SUDOKU ---------------- */
  function sudokuMask(grid, i) {
    let used = 0;
    const r = (i / 9) | 0, c = i % 9;
    for (let j = 0; j < 9; j++) {
      if (grid[r * 9 + j]) used |= 1 << (grid[r * 9 + j] - 1);
      if (grid[j * 9 + c]) used |= 1 << (grid[j * 9 + c] - 1);
    }
    const br = ((r / 3) | 0) * 3, bc = ((c / 3) | 0) * 3;
    for (let y = br; y < br + 3; y++) for (let x = bc; x < bc + 3; x++) {
      if (grid[y * 9 + x]) used |= 1 << (grid[y * 9 + x] - 1);
    }
    let mask = 0;
    for (let v = 1; v <= 9; v++) if (!(used & (1 << (v - 1)))) mask |= 1 << (v - 1);
    return mask;
  }
  function fillSudoku(grid, rnd) {
    let best = -1, bestMask = 0, bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (!grid[i]) {
        const m = sudokuMask(grid, i), n = popcount(m);
        if (n === 0) return false;
        if (n < bestCount) { best = i; bestMask = m; bestCount = n; if (n === 1) break; }
      }
    }
    if (best === -1) return true;
    const vals = [];
    for (let v = 1; v <= 9; v++) if (bestMask & (1 << (v - 1))) vals.push(v);
    shuffle(vals, rnd);
    for (const v of vals) {
      grid[best] = v;
      if (fillSudoku(grid, rnd)) return true;
      grid[best] = 0;
    }
    return false;
  }
  function countSudokuSolutions(grid, limit) {
    let count = 0;
    function walk() {
      if (count >= limit) return;
      let best = -1, bestMask = 0, bestCount = 10;
      for (let i = 0; i < 81; i++) {
        if (!grid[i]) {
          const m = sudokuMask(grid, i), n = popcount(m);
          if (n === 0) return;
          if (n < bestCount) { best = i; bestMask = m; bestCount = n; if (n === 1) break; }
        }
      }
      if (best === -1) { count++; return; }
      for (let v = 1; v <= 9; v++) {
        if (bestMask & (1 << (v - 1))) {
          grid[best] = v; walk(); grid[best] = 0;
          if (count >= limit) return;
        }
      }
    }
    walk();
    return count;
  }
  function generateSudoku(rnd, level) {
    const solution = new Array(81).fill(0);
    fillSudoku(solution, rnd);
    const puzzle = solution.slice();
    const clues = clamp(45 - Math.floor(level * 0.75), 22, 45);
    const cells = shuffle(Array.from({ length: 81 }, (_, i) => i), rnd);
    let removed = 0;
    for (const i of cells) {
      if (81 - removed <= clues) break;
      const v = puzzle[i]; puzzle[i] = 0;
      if (countSudokuSolutions(puzzle, 2) !== 1) puzzle[i] = v;
      else removed++;
    }
    return { puzzle: puzzle, solution: solution, clues: 81 - removed };
  }

  /* ---------------- FLOW / NUMBER LINK ---------------- */
  function gridNeighbors(idx, w, h) {
    const x = idx % w, y = (idx / w) | 0, out = [];
    if (x > 0) out.push(idx - 1);
    if (x < w - 1) out.push(idx + 1);
    if (y > 0) out.push(idx - w);
    if (y < h - 1) out.push(idx + w);
    return out;
  }
  function hamiltonianPath(w, h, rnd) {
    const path = [];
    for (let y = 0; y < h; y++) {
      if (y % 2 === 0) for (let x = 0; x < w; x++) path.push(y * w + x);
      else for (let x = w - 1; x >= 0; x--) path.push(y * w + x);
    }
    for (let step = 0; step < w * h * 10; step++) {
      const n = path.length - 1;
      const atStart = rnd() < 0.5;
      const banned = path[atStart ? 1 : n - 1];
      const options = gridNeighbors(path[atStart ? 0 : n], w, h).filter(c => c !== banned);
      if (!options.length) continue;
      const v = pick(options, rnd);
      const k = path.indexOf(v);
      if (k < 0) continue;
      if (atStart) {
        path.splice(0, path.length, ...(k === n ? [v, ...path.slice(0, n)] : path.slice(0, k).reverse().concat([v], path.slice(k + 1))));
      } else {
        path.splice(0, path.length, ...(k === 0 ? path.slice(1).concat([v]) : path.slice(0, k + 1).concat(path.slice(k + 1).reverse())));
      }
    }
    return path;
  }
  function generateFlow(rnd, level) {
    const w = clamp(4 + Math.floor((level - 1) / 4), 4, 9);
    const h = clamp(4 + Math.floor(level / 6), 4, 9);
    const cells = w * h;
    const path = hamiltonianPath(w, h, rnd);
    const parts = clamp(2 + Math.floor(level / 2), 2, Math.min(12, Math.floor(cells / 2)));
    const segments = [];
    let remaining = cells;
    for (let i = 0; i < parts - 1; i++) {
      const left = parts - 1 - i;
      const avg = Math.max(2, Math.round(remaining / (left + 1)));
      const spread = Math.max(1, Math.floor(avg / 3));
      const max = remaining - 2 * left;
      const len = clamp(avg + Math.floor(rnd() * (2 * spread + 1)) - spread, 2, Math.max(2, max));
      segments.push(path.slice(cells - remaining, cells - remaining + len));
      remaining -= len;
    }
    segments.push(path.slice(cells - remaining));
    return {
      w: w, h: h, segments: segments,
      pairs: segments.map(s => [s[0], s[s.length - 1]]),
      colors: segments.length
    };
  }

  /* ---------------- SLIDING TILE ---------------- */
  function slideNeighbors(blank, n) {
    const r = (blank / n) | 0, c = blank % n, out = [];
    if (r > 0) out.push(blank - n);
    if (r < n - 1) out.push(blank + n);
    if (c > 0) out.push(blank - 1);
    if (c < n - 1) out.push(blank + 1);
    return out;
  }
  function generateSlide(rnd, level) {
    const n = clamp(3 + Math.floor((level - 1) / 5), 3, 8);
    const tiles = [];
    for (let i = 1; i < n * n; i++) tiles.push(i);
    tiles.push(0);
    let blank = n * n - 1, prev = -1;
    const steps = Math.min(220, 18 + level * 4);
    for (let s = 0; s < steps; s++) {
      const opts = slideNeighbors(blank, n).filter(p => p !== prev);
      const next = pick(opts, rnd);
      tiles[blank] = tiles[next]; tiles[next] = 0;
      prev = blank; blank = next;
    }
    if (tiles.every((v, i) => v === (i === n * n - 1 ? 0 : i + 1))) {
      const next = slideNeighbors(blank, n)[0];
      tiles[blank] = tiles[next]; tiles[next] = 0;
    }
    return { n: n, tiles: tiles };
  }
  function slideMove(tiles, n, idx) {
    const blank = tiles.indexOf(0);
    if (blank < 0 || slideNeighbors(blank, n).indexOf(idx) < 0) return null;
    const next = tiles.slice();
    next[blank] = next[idx]; next[idx] = 0;
    return next;
  }
  function slideHint(tiles, n) {
    const blank = tiles.indexOf(0);
    let best = -1, bestDelta = Infinity;
    for (const idx of slideNeighbors(blank, n)) {
      const t = slideMove(tiles, n, idx);
      let d = 0;
      for (let i = 0; i < n * n; i++) {
        if (!t[i]) continue;
        const gr = ((t[i] - 1) / n) | 0, gc = (t[i] - 1) % n;
        d += Math.abs(gr - ((i / n) | 0)) + Math.abs(gc - (i % n));
      }
      if (d < bestDelta) { bestDelta = d; best = idx; }
    }
    return best;
  }

  /* ---------------- MERGE / 2048 ---------------- */
  function newMerge(rnd, level) {
    const size = level < 8 ? 4 : 5;
    const board = new Array(size * size).fill(0);
    const exponent = 6 + Math.floor((level - 1) / 2);
    const target = Math.pow(2, Math.min(exponent, size === 4 ? 16 : 18));
    board[Math.floor(rnd() * board.length)] = 2;
    board[Math.floor(rnd() * board.length)] = rnd() < 0.9 ? 2 : 4;
    return { size: size, board: board, score: 0, target: target };
  }
  function mergeMove(board, size, dir, rnd) {
    const next = new Array(size * size).fill(0);
    const gained = { score: 0, moved: false, merges: [] };
    for (let line = 0; line < size; line++) {
      const vals = [];
      for (let k = 0; k < size; k++) {
        let r, c;
        if (dir === 'left') { r = line; c = k; }
        else if (dir === 'right') { r = line; c = size - 1 - k; }
        else if (dir === 'up') { r = k; c = line; }
        else { r = size - 1 - k; c = line; }
        vals.push({ v: board[r * size + c], idx: r * size + c, merged: false });
      }
      const tiles = vals.filter(t => t.v);
      const out = [];
      for (let i = 0; i < tiles.length; i++) {
        if (i + 1 < tiles.length && tiles[i].v === tiles[i + 1].v && !tiles[i].merged && !tiles[i + 1].merged) {
          const v = tiles[i].v * 2;
          out.push({ v: v, idx: tiles[i + 1].idx, merged: true });
          gained.score += v;
          i++;
        } else out.push({ v: tiles[i].v, idx: tiles[i].idx, merged: false });
      }
      for (let k = 0; k < size; k++) {
        let r, c;
        if (dir === 'left') { r = line; c = k; }
        else if (dir === 'right') { r = line; c = size - 1 - k; }
        else if (dir === 'up') { r = k; c = line; }
        else { r = size - 1 - k; c = line; }
        const dest = r * size + c;
        next[dest] = k < out.length ? out[k].v : 0;
        if (out[k] && out[k].merged) gained.merges.push(dest);
        if ((board[dest] || 0) !== next[dest]) gained.moved = true;
      }
    }
    if (gained.moved) {
      const empty = [];
      for (let i = 0; i < next.length; i++) if (!next[i]) empty.push(i);
      if (empty.length) next[pick(empty, rnd)] = rnd() < 0.9 ? 2 : 4;
    }
    return { board: next, moved: gained.moved, score: gained.score, merges: gained.merges };
  }
  function mergeHint(board, size) {
    let best = null, bestScore = -1;
    for (const dir of ['left', 'up', 'right', 'down']) {
      const r = mergeMove(board, size, dir, function () { return 0.5; });
      let empties = 0, max = 0;
      for (const v of r.board) { if (!v) empties++; if (v > max) max = v; }
      const score = r.score * 3 + empties * 4 + max;
      if (r.moved && score > bestScore) { bestScore = score; best = dir; }
    }
    return best;
  }

  /* ---------------- MINESWEEPER ---------------- */
  function generateMines(level) {
    const w = clamp(6 + Math.floor((level - 1) / 3), 6, 16);
    const h = clamp(6 + Math.floor(level / 4), 6, 16);
    const density = 0.14 + Math.min(level, 30) * 0.002;
    const mines = clamp(Math.round(w * h * density), 8, w * h - 9);
    return { w: w, h: h, mines: mines };
  }
  function placeMines(cfg, safeIdx, rnd) {
    const total = cfg.w * cfg.h;
    const banned = new Set(gridNeighbors(safeIdx, cfg.w, cfg.h));
    banned.add(safeIdx);
    const pool = [];
    for (let i = 0; i < total; i++) if (!banned.has(i)) pool.push(i);
    shuffle(pool, rnd);
    const set = new Set(pool.slice(0, cfg.mines));
    const counts = new Array(total).fill(0);
    for (const i of set) for (const nb of gridNeighbors(i, cfg.w, cfg.h)) counts[nb]++;
    for (const i of set) counts[i] = -1;
    return { mines: set, counts: counts };
  }

  /* ---------------- MEMO MATCH (kids) ---------------- */
  function generateMemo(rnd, level) {
    const steps = [2, 3, 4, 6, 8, 10, 12, 15, 18];
    const layouts = { 2: [2, 2], 3: [3, 2], 4: [4, 2], 6: [4, 3], 8: [4, 4],
                      10: [5, 4], 12: [6, 4], 15: [6, 5], 18: [6, 6] };
    const pairs = steps[clamp(Math.floor((level - 1) / 3), 0, steps.length - 1)];
    const cols = layouts[pairs][0], rows = layouts[pairs][1];
    const cards = [];
    for (let i = 0; i < pairs; i++) { cards.push(i); cards.push(i); }
    shuffle(cards, rnd);
    return {
      pairs: pairs, cols: cols, rows: rows, cards: cards,
      previewMs: clamp(3300 - level * 100, 850, 3300)
    };
  }

  /* ---------------- CODE BREAKER ---------------- */
  function generateCode(rnd, level) {
    const length = clamp(3 + Math.floor((level - 1) / 5), 3, 6);
    const colors = clamp(4 + Math.floor((level - 1) / 7), 4, 8);
    const attempts = clamp(11 - Math.floor((level - 1) / 6), 6, 11);
    const allowRepeat = level >= 6;
    let code = [];
    do {
      code = [];
      for (let i = 0; i < length; i++) code.push(Math.floor(rnd() * colors));
    } while (!allowRepeat && new Set(code).size < length);
    return { length: length, colors: colors, attempts: attempts, code: code, allowRepeat: allowRepeat };
  }
  function feedbackCode(guess, code) {
    let exact = 0;
    const gRem = [], cRem = [];
    for (let i = 0; i < code.length; i++) {
      if (guess[i] === code[i]) exact++;
      else { gRem.push(guess[i]); cRem.push(code[i]); }
    }
    let partial = 0;
    for (const v of gRem) {
      const j = cRem.indexOf(v);
      if (j >= 0) { partial++; cRem.splice(j, 1); }
    }
    return { exact: exact, partial: partial };
  }

  /* ---------------- SHARED META ---------------- */
  const GAME_IDS = ['sudoku', 'flow', 'memo', 'slide', 'merge', 'mines', 'code'];
  function tier(level) {
    if (level <= 4) return 'NOVICE';
    if (level <= 9) return 'EASY';
    if (level <= 19) return 'INTERMEDIATE';
    if (level <= 34) return 'ADVANCED';
    if (level <= 49) return 'EXPERT';
    if (level <= 79) return 'MASTER';
    return 'LEGENDARY';
  }
  function gameForRun(level) { return GAME_IDS[(level - 1) % GAME_IDS.length]; }

  return {
    clamp: clamp, mulberry32: mulberry32, hashSeed: hashSeed, shuffle: shuffle, pick: pick,
    generateSudoku: generateSudoku, countSudokuSolutions: countSudokuSolutions,
    generateFlow: generateFlow, generateSlide: generateSlide, slideMove: slideMove, slideHint: slideHint,
    newMerge: newMerge, mergeMove: mergeMove, mergeHint: mergeHint,
    gridNeighbors: gridNeighbors,
    generateMines: generateMines, placeMines: placeMines,
    generateMemo: generateMemo,
    generateCode: generateCode, feedbackCode: feedbackCode,
    GAME_IDS: GAME_IDS, tier: tier, gameForRun: gameForRun
  };
});
