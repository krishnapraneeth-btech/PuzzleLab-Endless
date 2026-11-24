#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SDK="${ANDROID_HOME:-/home/user/.sdk}"
BT="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
JDK="$(find /home/user/.jdk -maxdepth 1 -type d -name 'jdk-*' | head -1)"
export JAVA_HOME="$JDK"
export PATH="$JDK/bin:$BT:$PATH"

for f in "$BT/aapt2" "$BT/d8" "$BT/apksigner" "$BT/zipalign" "$PLATFORM"; do
  [ -e "$f" ] || { echo "Missing build dependency: $f"; exit 1; }
done

BUILD="$ROOT/build"
rm -rf "$BUILD"
mkdir -p "$BUILD/classes" "$BUILD/gen" "$BUILD/dex" "$BUILD/apkassets"

# 1. Inline CSS + JS into a single self-contained HTML file.
python3 - "$ROOT" <<'PY'
import sys, pathlib
root = pathlib.Path(sys.argv[1])
a = root / 'assets'
tpl = (a / 'template.html').read_text(encoding='utf-8')
html = (tpl.replace('/*__CSS__*/', (a / 'app.css').read_text(encoding='utf-8'))
           .replace('/*__CORE__*/', (a / 'core.js').read_text(encoding='utf-8'))
           .replace('/*__APP__*/', (a / 'app.js').read_text(encoding='utf-8')))
for name in ('core.js', 'app.js'):
    assert '</script' not in (a / name).read_text(encoding='utf-8').lower(), name
out = root / 'build' / 'apkassets' / 'index.html'
out.write_text(html, encoding='utf-8')
print('HTML bundle:', len(html), 'bytes')
PY

# 2. Resources + manifest -> base APK.
"$BT/aapt2" compile --dir "$ROOT/res" -o "$BUILD/compiled.flata"
"$BT/aapt2" link \
  -o "$BUILD/base.apk" \
  -I "$PLATFORM" \
  --manifest "$ROOT/AndroidManifest.xml" \
  --java "$BUILD/gen" \
  -A "$BUILD/apkassets" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code 1 \
  --version-name 1.0 \
  "$BUILD/compiled.flata"

# 3. Java -> DEX.
javac -source 8 -target 8 -bootclasspath "$PLATFORM" -d "$BUILD/classes" \
  $(find "$ROOT/src" -name '*.java')
find "$BUILD/classes" -name '*.class' > "$BUILD/classes.list"
"$BT/d8" --min-api 24 --lib "$PLATFORM" --output "$BUILD/dex" @"$BUILD/classes.list"

(cd "$BUILD/dex" && zip -q -X "$BUILD/base.apk" classes.dex)

# 4. Align and sign with a locally generated release key.
"$BT/zipalign" -f 4 "$BUILD/base.apk" "$BUILD/aligned.apk"

KS="$ROOT/tools/release.jks"
if [ ! -f "$KS" ]; then
  mkdir -p "$ROOT/tools"
  keytool -genkeypair -keystore "$KS" -storetype JKS -alias puzzlelab \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -storepass puzzlelab123 -keypass puzzlelab123 \
    -dname "CN=Puzzle Lab, OU=Offline Games, O=Puzzle Lab, C=IN" >/dev/null 2>&1
fi

FINAL="/home/user/PuzzleLab-Endless-v1.0.apk"
"$BT/apksigner" sign \
  --ks "$KS" --ks-key-alias puzzlelab \
  --ks-pass pass:puzzlelab123 --key-pass pass:puzzlelab123 \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --out "$FINAL" "$BUILD/aligned.apk"

"$BT/apksigner" verify --verbose --print-certs "$FINAL"
ls -lh "$FINAL"
echo "BUILD_OK $FINAL"
