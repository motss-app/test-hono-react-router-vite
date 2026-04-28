#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Building private frontend..."
deno task --cwd=packages/frontend build:canary

echo "🚀 Deploying private frontend worker..."
if ! deno run -A npm:wrangler deploy --config packages/frontend/wrangler.jsonc --env canary > deploy-frontend.log 2>&1; then
  cat deploy-frontend.log

  WRANGLER_LOG_FILE=$(sed -n 's/.*Logs were written to "\([^"]*\)".*/\1/p' deploy-frontend.log | tail -n 1)
  if [[ -n "${WRANGLER_LOG_FILE}" && -f "${WRANGLER_LOG_FILE}" ]]; then
    echo "🪵 Showing Wrangler log: ${WRANGLER_LOG_FILE}"
    cat "${WRANGLER_LOG_FILE}"
  fi

  exit 1
fi

cat deploy-frontend.log
