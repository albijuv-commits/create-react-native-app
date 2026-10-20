#!/usr/bin/env bash
# Costruisce l'APK di Orienta per Android. Lo usa il workflow di GitHub
# (.github/workflows/orienta-android.yml) e funziona uguale sul proprio computer,
# con il JDK 17 o successivo e l'Android SDK (ANDROID_HOME).
#
# Variabili, tutte facoltative:
#   ORIENTA_VERSION_CODE        numero di versione per Android (su GitHub: il numero del run)
#   ORIENTA_ABIS                architetture (predefinite: arm64-v8a,armeabi-v7a, cioè tutti i telefoni)
#   ORIENTA_KEYSTORE            keystore PKCS12 della chiave di rilascio, con l'alias «orienta»
#   ORIENTA_KEYSTORE_PASSWORD   la sua password
#   EXPO_PUBLIC_API_URL, EXPO_PUBLIC_PRIVACY_CONTROLLER, EXPO_PUBLIC_PRIVACY_CONTACT
#                               finiscono nell'app: non sono segreti
#
# Senza keystore l'APK resta firmato con la chiave di prova del progetto generato.
# Il risultato è android/app/build/outputs/apk/release/Orienta.apk.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -z "${ANDROID_HOME:-}" ]; then
  echo "Imposta ANDROID_HOME con la cartella dell'Android SDK" >&2
  exit 1
fi
BUILD_TOOLS="$ANDROID_HOME/build-tools/36.0.0"
ABIS="${ORIENTA_ABIS:-arm64-v8a,armeabi-v7a}"
OUT_DIR="android/app/build/outputs/apk/release"

if [ -n "${ORIENTA_KEYSTORE:-}" ] && [ -z "${ORIENTA_KEYSTORE_PASSWORD:-}" ]; then
  echo "Con ORIENTA_KEYSTORE serve anche ORIENTA_KEYSTORE_PASSWORD" >&2
  exit 1
fi
# Un a capo finito nella password copiandola (per esempio in un secret di GitHub) non ne fa parte
export ORIENTA_KEYSTORE_PASSWORD="${ORIENTA_KEYSTORE_PASSWORD//[$'\r\n']/}"

# prebuild riscrive gli script di package.json e il numero di versione va in app.json:
# alla fine i due file tornano com'erano
backup="$(mktemp -d)"
cp app.json package.json "$backup/"
restore() {
  cp "$backup/app.json" "$backup/package.json" .
  rm -r "$backup"
}
trap restore EXIT

if [ -n "${ORIENTA_VERSION_CODE:-}" ]; then
  node -e '
    const fs = require("node:fs");
    const config = JSON.parse(fs.readFileSync("app.json", "utf8"));
    config.expo.android.versionCode = Number(process.env.ORIENTA_VERSION_CODE);
    fs.writeFileSync("app.json", JSON.stringify(config, null, 2) + "\n");
  '
fi

CI=1 npx expo prebuild --platform android --no-install

(
  cd android
  NODE_ENV=production ./gradlew assembleRelease \
    -PreactNativeArchitectures="$ABIS" \
    -Pexpo.useLegacyPackaging=true \
    -Pandroid.enableMinifyInReleaseBuilds=true \
    -Pandroid.enableShrinkResourcesInReleaseBuilds=true \
    -Dorg.gradle.jvmargs="-Xmx6g -XX:MaxMetaspaceSize=1g" \
    --no-daemon --console=plain
)

if [ -n "${ORIENTA_KEYSTORE:-}" ]; then
  # Gradle firma con la chiave di prova: apksigner la sostituisce con quella di rilascio
  "$BUILD_TOOLS/apksigner" sign \
    --ks "$ORIENTA_KEYSTORE" --ks-key-alias orienta \
    --ks-pass env:ORIENTA_KEYSTORE_PASSWORD --key-pass env:ORIENTA_KEYSTORE_PASSWORD \
    --out "$OUT_DIR/Orienta.apk" "$OUT_DIR/app-release.apk"
else
  echo "Nessuna chiave di rilascio: l'APK resta firmato con la chiave di prova"
  cp "$OUT_DIR/app-release.apk" "$OUT_DIR/Orienta.apk"
fi

"$BUILD_TOOLS/zipalign" -c -P 16 4 "$OUT_DIR/Orienta.apk"
"$BUILD_TOOLS/apksigner" verify --print-certs "$OUT_DIR/Orienta.apk" | grep "SHA-256"
echo "APK pronto: orienta-app/$OUT_DIR/Orienta.apk ($(du -h "$OUT_DIR/Orienta.apk" | cut -f1))"
