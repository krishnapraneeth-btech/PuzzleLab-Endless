# Puzzle Lab — Endless Puzzles (Android APK)

A self-contained, offline puzzle game with procedurally generated levels that keep scaling forever. Modern dark/neon interface, no ads, no trackers, no network access.

## Install

1. Copy `PuzzleLab-Endless-v1.0.apk` to your Android phone (Android 7.0 / API 24 or newer).
2. Open the file. Android may ask to allow installs from unknown sources — allow it for your file manager/browser, then install.
3. Open **Puzzle Lab** from the app drawer.

The APK is signed with a locally generated release key (`tools/release.jks`) using APK Signature Scheme v2 + v3. Keep that keystore if you want future updates to install over this version.

## What's inside

| Puzzle | How difficulty grows |
| --- | --- |
| Sudoku | Fewer clues (45 → 22), always generated with a unique solution |
| Flow Link | Grids grow 4×4 → 9×9 with more colour pairs; every board is generated from a randomised Hamiltonian path, so it is always solvable |
| Tile Shift | 3×3 → 8×8, longer legal-only scrambles |
| Merge | 4×4 → 5×5, higher target tiles |
| Minefield | 6×6 → 16×16 with rising mine density; first tap is always safe, 3 shields |
| Code Breaker | 3 → 6 slots, 4 → 8 colours, fewer attempts, repeats enabled later |

- **Endless Run** cycles through all six games; every cleared level generates a harder next one. There is no final level or level cap.
- **Free Play** gives each game its own endless level counter.
- Hints, undo where meaningful, restart, pause-safe timer, local stats, star ratings, WebAudio sound effects, haptics, three neon accent themes.

## Privacy / security design

- **Zero Android permissions** — no `INTERNET`, storage, camera, microphone, contacts or location.
- WebView hardened: JavaScript on, but file access, content access, network loads, geolocation, windows, downloads and mixed content off. No `addJavascriptInterface`, no third-party libraries, no analytics/ad SDKs.
- All UI/CSS/JS is one inline HTML asset loaded from an internal `https://puzzle.local/` base; URL navigation and unrelated sub-resource requests are blocked.
- `allowBackup=false`, cleartext traffic disabled, WebView metrics opted out, JS dialogs suppressed.
- Progress is stored only in the app's private WebView storage (`localStorage`), with graceful in-memory fallback if storage is unavailable.

## Build from source (optional)

Requirements: JDK 17, Android SDK platform 34 + build-tools 34.0.0, `zip`, Python 3.

```bash
cd /home/user/EndlessPuzzles
node tests/core.test.js          # puzzle-generation/unit tests
./build.sh                       # produces /home/user/PuzzleLab-Endless-v1.0.apk
```

Browser smoke tests (requires Playwright + Chromium):

```bash
PLAYWRIGHT_BROWSERS_PATH=/home/user/.testbrowser/browsers node tests/browser.test.js
```

Project layout: `assets/core.js` (pure generators/logic), `assets/app.js` (UI), `assets/app.css`, `src/` (WebView shell), `AndroidManifest.xml`, `res/` (theme + icons), `build.sh`.
