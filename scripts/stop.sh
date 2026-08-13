#!/bin/bash

ROOT="/Users/naruki/Downloads/アプリ/speaking-practice"
PID_FILE="${ROOT}/.dev.pid"

PIDS="$(lsof -ti tcp:3000 2>/dev/null || true)"
if [ -n "${PIDS}" ]; then
  # shellcheck disable=SC2086
  kill ${PIDS} 2>/dev/null || true
  sleep 0.4
  PIDS="$(lsof -ti tcp:3000 2>/dev/null || true)"
  if [ -n "${PIDS}" ]; then
    # shellcheck disable=SC2086
    kill -9 ${PIDS} 2>/dev/null || true
  fi
fi

rm -f "${PID_FILE}"

osascript -e 'display notification "アプリを停止しました" with title "スピーキング練習"' >/dev/null
