#!/usr/bin/env bash
set -euo pipefail

CANARY_URL="https://hono-react-router-vite-canary.motss.fyi"

echo "🚀 Building Gateway..."
CLOUDFLARE_ENV=canary deno task --cwd=packages/gateway build

echo "🚀 Deploying public gateway worker..."
if ! (cd packages/gateway && deno run -A npm:wrangler deploy --env canary > deploy-gateway.log 2>&1); then
  cat packages/gateway/deploy-gateway.log

  WRANGLER_LOG_FILE=$(sed -n 's/.*Logs were written to "\([^"]*\)".*/\1/p' packages/gateway/deploy-gateway.log | tail -n 1)
  if [[ -n "${WRANGLER_LOG_FILE}" && -f "${WRANGLER_LOG_FILE}" ]]; then
    echo "🪵 Showing Wrangler log: ${WRANGLER_LOG_FILE}"
    cat "${WRANGLER_LOG_FILE}"
  fi

  exit 1
fi

cat packages/gateway/deploy-gateway.log

echo "🚀 Purging Cloudflare cache for Canary..."
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/cache/purge" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"hosts":["hono-react-router-vite-canary.motss.fyi"]}'
echo "✅ Canary Cloudflare cache purged"

echo "### 🚀 Canary Deployment Successful" >> "${GITHUB_STEP_SUMMARY}"
echo "🐥 **Canary**: ${CANARY_URL}" >> "${GITHUB_STEP_SUMMARY}"

echo "Warming up Canary: ${CANARY_URL}..."
all_ok=true
for route in "" "about" "ssr" "hono-rpc" "errors"; do
  TARGET="${CANARY_URL}/${route}"
  TARGET="${TARGET%/}"
  echo "Fetching ${TARGET}..."

  if curl -s -L -o /dev/null -w "%{http_code}" "${TARGET}" | grep 200; then
    echo "✅ ${TARGET} is up!"
  else
    echo "⚠️ Failed to fetch ${TARGET}"
    all_ok=false
  fi
done

if [[ "${all_ok}" != true ]]; then
  exit 1
fi
