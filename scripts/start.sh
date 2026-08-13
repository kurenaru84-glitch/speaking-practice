#!/bin/bash

ROOT="/Users/naruki/Downloads/アプリ/speaking-practice"
PORT=3000
URL="http://localhost:${PORT}"
LOG="${ROOT}/.dev.log"
PID_FILE="${ROOT}/.dev.pid"

export HOME="${HOME:-/Users/naruki}"
export NVM_DIR="${HOME}/.nvm"
if [ -s "${NVM_DIR}/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "${NVM_DIR}/nvm.sh" >/dev/null 2>&1
fi
export PATH="${HOME}/.nvm/versions/node/v24.19.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

if [ ! -d "${ROOT}" ]; then
  echo "アプリのフォルダが見つかりません。" >&2
  exit 1
fi

cd "${ROOT}" || exit 1

if curl -sf "${URL}" >/dev/null 2>&1; then
  open "${URL}"
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm が見つかりません。Node.js をインストールしてください。" >&2
  exit 1
fi

# Finder の .app から起動してもプロセスが消えないように、ログインセッションで切り離す
/bin/bash -lc "cd \"${ROOT}\" && npm run dev" > "${LOG}" 2>&1 &
echo $! > "${PID_FILE}"
disown $! 2>/dev/null || true

for _ in $(seq 1 60); do
  if curl -sf "${URL}" >/dev/null 2>&1; then
    open "${URL}"
    exit 0
  fi
  sleep 0.3
done

echo "起動に失敗しました。フォルダ内の .dev.log を確認してください。" >&2
exit 1
