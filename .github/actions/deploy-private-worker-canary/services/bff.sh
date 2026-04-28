#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Generating frontend React Router types..."
deno task typegen

echo "🚀 Typechecking BFF..."
deno task --cwd=packages/bff typecheck

echo "🚀 Deploying private BFF worker..."
if ! deno run -A npm:wrangler deploy --config packages/bff/wrangler.jsonc --env canary > deploy-bff.log 2>&1; then
  cat deploy-bff.log

  WRANGLER_LOG_FILE=$(sed -n 's/.*Logs were written to "\([^"]*\)".*/\1/p' deploy-bff.log | tail -n 1)
  if [[ -n "${WRANGLER_LOG_FILE}" && -f "${WRANGLER_LOG_FILE}" ]]; then
    echo "🪵 Showing Wrangler log: ${WRANGLER_LOG_FILE}"
    cat "${WRANGLER_LOG_FILE}"
  fi

  exit 1
fi

cat deploy-bff.log
