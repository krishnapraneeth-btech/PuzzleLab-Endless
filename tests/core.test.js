const C = require('../assets/core.js');
let assertions = 0;
function ok(cond, msg) { assertions++; if (!cond) throw new Error('FAIL: ' + msg); }

function validSolution(s) {
  const g = s.slice();
  // uniqueness check on an already full grid is 1 by definition; validate rows/cols/boxes
  for (let r = 0; r < 9; r++) {
    const seen = new Set(g.slice(r * 9, r * 9 + 9));
    if (seen.size !== 9 || seen.has(0)) return false;
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Set(Array.from({ length: 9 }, (_, r) => g[r * 9 + c]));
    if (seen.size !== 9) return false;
  }
  for (let br = 0; br < 9; br += 3) for (let bc = 0; bc < 9; bc += 3) {
    const seen = new Set();
    for (let y = br; y < br + 3; y++) for (let x = bc; x < bc + 3; x++) seen.add(g[y * 9 + x]);
    if (seen.size !== 9) return false;
  }
  return true;
}

for (const level of [1, 3, 10, 25, 60]) {
  for (let trial = 0; trial < 3; trial++) {
    const rnd = C.mulberry32(C.hashSeed('sudoku' + level + trial));
    const p = C.generateSudoku(rnd, level);
    ok(validSolution(p.solution), 'sudoku solution valid L' + level);
    ok(p.puzzle.every((v, i) => v === 0 || v === p.solution[i]), 'puzzle matches solution');
    ok(C.countSudokuSolutions(p.puzzle.slice(), 2) === 1, 'sudoku unique L' + level);
    ok(p.puzzle.filter(Boolean).length >= 22, 'reasonable clue count');
  }
}

for (const level of [1, 2, 7, 15, 30, 100]) {
  for (let trial = 0; trial < 4; trial++) {
    const rnd = C.mulberry32(C.hashSeed('flow' + level + trial));
    const f = C.generateFlow(rnd, level);
    const seen = new Set();
    for (const seg of f.segments) {
      ok(seg.length >= 2, 'segment length >=2');
      ok(seg[0] !== seg[seg.length - 1], 'distinct endpoints');
      for (let i = 0; i < seg.length; i++) {
        ok(!seen.has(seg[i]), 'no cell reused');
        seen.add(seg[i]);
        if (i) {
          const a = seg[i - 1], b = seg[i];
          ok(Math.abs((a % f.w) - (b % f.w)) + Math.abs(((a / f.w) | 0) - ((b / f.w) | 0)) === 1, 'adjacent step');
        }
      }
    }
    ok(seen.size === f.w * f.h, 'all cells covered L' + level);
    ok(f.pairs.every(p => p[0] !== p[1]), 'pairs valid');
  }
}

function slideSolvable(tiles, n) {
  const invTiles = tiles.filter(v => v);
  let inv = 0;
  for (let i = 0; i < invTiles.length; i++) for (let j = i + 1; j < invTiles.length; j++) if (invTiles[i] > invTiles[j]) inv++;
  const blankRowFromBottom = n - ((tiles.indexOf(0) / n) | 0);
  return n % 2 === 1 ? inv % 2 === 0 : (inv + blankRowFromBottom) % 2 === 1;
}
for (const level of [1, 5, 12, 25, 60]) {
  for (let trial = 0; trial < 3; trial++) {
    const rnd = C.mulberry32(C.hashSeed('slide' + level + trial));
    const s = C.generateSlide(rnd, level);
    ok(s.tiles.length === s.n * s.n, 'slide size');
    ok(slideSolvable(s.tiles, s.n), 'slide solvable L' + level);
    const h = C.slideHint(s.tiles, s.n);
    ok(C.slideMove(s.tiles, s.n, h) !== null, 'hint is legal');
  }
}

{
  const rnd = C.mulberry32(42);
  const m = C.newMerge(rnd, 1);
  ok(m.target === 64, 'merge target L1');
  const b = [2, 2, 2, 2];
  const res = C.mergeMove(b, 4, 'left', () => 0.5);
  ok(res.board.slice(0, 4).join(',') === '4,4,0,0', 'merge left result, got ' + res.board.slice(0, 4));
  ok(res.score === 8, 'merge score');
  const b2 = [0, 0, 0, 2];
  ok(C.mergeMove(b2, 4, 'right', () => 0.5).board[3] === 2, 'merge right');
  ok(C.mergeMove([2, 4, 8, 16], 4, 'left', () => 0.5).moved === false, 'no move detected');
  ok(C.mergeHint([2, 2, 0, 0], 4) === 'left', 'merge hint');
}

for (const level of [1, 10, 30, 100]) {
  const cfg = C.generateMines(level);
  ok(cfg.mines < cfg.w * cfg.h, 'mines leave free cells');
  const rnd = C.mulberry32(C.hashSeed('mines' + level));
  const safe = Math.floor(cfg.w * cfg.h / 2);
  const placed = C.placeMines(cfg, safe, rnd);
  ok(placed.mines.size === cfg.mines, 'mine count');
  ok(!placed.mines.has(safe), 'first click safe');
  ok(placed.counts[safe] === 0, 'safe neighborhood zero');
  ok(Array.from(placed.mines).every(i => placed.counts[i] === -1), 'mine counts marked');
}

for (const level of [1, 7, 20, 90]) {
  const rnd = C.mulberry32(C.hashSeed('code' + level));
  const code = C.generateCode(rnd, level);
  ok(code.code.length === code.length && code.code.every(v => v < code.colors), 'code valid');
  ok(C.feedbackCode(code.code.slice(), code.code).exact === code.length, 'feedback exact');
  const g = code.code.slice(); g[0] = (g[0] + 1) % code.colors;
  const f = C.feedbackCode(g, code.code);
  ok(f.exact === code.length - 1, 'feedback partial case');
}
ok(C.gameForRun(1) === 'sudoku' && C.gameForRun(7) === 'sudoku', 'run cycles');
ok(C.tier(100) === 'LEGENDARY', 'tier never ends');

console.log('All ' + assertions + ' assertions passed.');
