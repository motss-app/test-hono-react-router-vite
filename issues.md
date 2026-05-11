## ssr pages broken

/ssr and /hono-rpc routes are completely broken in the canary build, returning 500 errors with no additional details in the response body. The Sentry event for the 500 error also contains no stack trace or exception information, just the request details and a generic error message.

```json
{
  "level": "error",
  "message": "GET https://hono-react-router-vite-canary.motss.fyi/ssr",
  "$workers": {
    "event": {
      "request": {
        "cf": {
          "requestHeaderNames": {},
          "botManagement": {
            "detectionIds": {},
            "corporateProxy": false,
            "verifiedBot": false,
            "jsDetection": {
              "passed": false
            },
            "staticResource": false,
            "score": 99
          },
          "isEUCountry": false,
          "tlsClientAuth": {
            "certRFC9440TooLarge": false,
            "certChainRFC9440TooLarge": false,
            "certPresented": "0",
            "certVerified": "NONE",
            "certRevoked": "0",
            "certIssuerDN": "",
            "certSubjectDN": "",
            "certIssuerDNRFC2253": "",
            "certSubjectDNRFC2253": "",
            "certIssuerDNLegacy": "",
            "certSubjectDNLegacy": "",
            "certSerial": "",
            "certIssuerSerial": "",
            "certSKI": "",
            "certIssuerSKI": "",
            "certFingerprintSHA1": "",
            "certFingerprintSHA256": "",
            "certNotBefore": "",
            "certNotAfter": "",
            "certRFC9440": "",
            "certChainRFC9440": ""
          },
          "httpProtocol": "HTTP/2",
          "clientAcceptEncoding": "gzip, deflate, br",
          "requestPriority": "weight=256;exclusive=1",
          "colo": "SIN",
          "asOrganization": "Datacamp Limited",
          "country": "SG",
          "city": "Singapore",
          "continent": "AS",
          "timezone": "Asia/Singapore",
          "longitude": "103.85007",
          "latitude": "1.28967",
          "postalCode": "018989",
          "tlsVersion": "TLSv1.3",
          "tlsCipher": "AEAD-AES128-GCM-SHA256",
          "tlsClientRandom": "QmWqLM7U1Vzo+9Rds0AQODSZNqzY68q7FuWpcrqjs/g=",
          "tlsClientCiphersSha1": "cG3ksVXz5z5aMztJKpmN9By5SR8=",
          "tlsClientExtensionsSha1": "HB97q1Lt5vOUctQdA2ntPDIUM/4=",
          "tlsClientExtensionsSha1Le": "Bbu/jHP/xOPu82+zIED0XYFmFpg=",
          "tlsExportedAuthenticator": {
            "clientHandshake": "6337266e746616fbb9d4d934aa44ef6fdfdc53620a4c5cff54aae8f9002f1795",
            "serverHandshake": "61b763b6de83501891dc87cd8b17d65090aefa3051175f0117bcf49617c4ec7d",
            "clientFinished": "9b587a6e593d4644e4411ad26448d78d5107bebdae6170bacd8297ee50873db0",
            "serverFinished": "89b3a40e2b5d3acbba9d2fb990c385e1a1bbd2cb84851b69c09abdb79fbec4d5"
          },
          "tlsClientHelloLength": "2075",
          "verifiedBotCategory": "",
          "edgeRequestKeepAliveStatus": 1,
          "clientTcpRtt": 3,
          "clientQuicRtt": 0,
          "asn": 212238,
          "edgeL4": {
            "deliveryRate": 22778307
          }
        },
        "url": "https://hono-react-router-vite-canary.motss.fyi/ssr",
        "method": "GET",
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-encoding": "gzip, br",
          "accept-language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
          "cache-control": "no-cache",
          "cf-cert-presented": "false",
          "cf-cert-revoked": "false",
          "cf-cert-verified": "false",
          "cf-connecting-ip": "149.34.253.147",
          "cf-ipcity": "Singapore",
          "cf-ipcontinent": "AS",
          "cf-ipcountry": "SG",
          "cf-iplatitude": "1.28967",
          "cf-iplongitude": "103.85007",
          "cf-postal-code": "018989",
          "cf-ray": "9e665d472c4f266d",
          "cf-timezone": "Asia/Singapore",
          "cf-visitor": "{\"scheme\":\"https\"}",
          "connection": "Keep-Alive",
          "cookie": "REDACTED",
          "dnt": "1",
          "host": "hono-react-router-vite-canary.motss.fyi",
          "pragma": "no-cache",
          "priority": "u=0, i",
          "sec-ch-ua": "\"Chromium\";v=\"146\", \"Not-A.Brand\";v=\"24\", \"Microsoft Edge\";v=\"146\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
          "x-forwarded-proto": "https",
          "x-real-ip": "149.34.253.147"
        },
        "path": "/ssr"
      },
      "rayId": "9e665d472c4f266d",
      "response": {
        "status": 500
      }
    },
    "truncated": false,
    "scriptName": "test-hono-react-router-vite-canary",
    "outcome": "ok",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "8f862de7-84fc-4ec3-8e00-3faa8a77a61c"
    },
    "requestId": "9e665d472c4f266d",
    "cpuTimeMs": 4,
    "wallTimeMs": 14
  },
  "$metadata": {
    "id": "01KN93Z23VTDKWKC7HTGPM0J26",
    "requestId": "9e665d472c4f266d",
    "trigger": "GET /ssr",
    "service": "test-hono-react-router-vite-canary",
    "level": "error",
    "error": "GET https://hono-react-router-vite-canary.motss.fyi/ssr",
    "message": "GET https://hono-react-router-vite-canary.motss.fyi/ssr",
    "account": "7597e72b9a5347db09ec37e501eb675a",
    "type": "cf-worker-event",
    "fingerprint": "2f61434ae644135fef5ff8254ba4c75b",
    "origin": "fetch",
    "messageTemplate": "GET https://hono-react-router-vite-canary.motss.fyi/ssr"
  }
}
```

## manifest fail to load with error in all pages being SSR-ed

```sh
installHook.js:1 Failed to fetch manifest patches Error: 500 
    at ua (jsx-runtime-BtOxbToQ.js:12:7239)
    at async s (jsx-runtime-BtOxbToQ.js:12:6465)
overrideMethod	@	installHook.js:1
(anonymous)	@	sentry-CWLY89RK.js:4
s	@	jsx-runtime-BtOxbToQ.js:12
await in s		
(anonymous)	@	jsx-runtime-BtOxbToQ.js:12
Gc	@	entry.client-DIMETfXL.js:9
Ol	@	entry.client-DIMETfXL.js:9
Dl	@	entry.client-DIMETfXL.js:9
Ol	@	entry.client-DIMETfXL.js:9
Dl	@	entry.client-DIMETfXL.js:9
Ol	@	entry.client-DIMETfXL.js:9
Uu	@	entry.client-DIMETfXL.js:9
(anonymous)	@	entry.client-DIMETfXL.js:9
ae	@	entry.client-DIMETfXL.js:2
```

### errors in Sentry

```json
{

arguments: [

{
code: ERR_INVALID_ARG_VALUE,
message: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined',
name: TypeError,
stack:
TypeError: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'
    at createRequire (node:module:34:15)
    at build/assets/rolldown-runtime-UXURtaUH.js (worker.js:10459:33)
    at __init (worker.js:9:56)
    at build/assets/sentry-DExeKB6Y.js (worker.js:12760:5)
    at __init (worker.js:9:56)
    at build/assets/server-ZVAD7kzc.js (worker.js:34035:5)
    at __init (worker.js:9:56)
    at worker.js:47648:40
    at async requestHandler (worker.js:10353:48)
    at async handleSsrRequest (worker.js:47698:20)
,
toString: [Function: <anonymous>]
}
],
logger: console
}
```

```json
{

arguments: [

{
message: Cannot convert undefined or null to object,
name: TypeError,
stack:
TypeError: Cannot convert undefined or null to object
    at Object.values (<anonymous>)
    at groupRoutesByParentId (worker.js:9202:10)
    at createRoutes (worker.js:9213:67)
    at derive (worker.js:9735:17)
    at requestHandler (worker.js:10355:25)
    at async handleSsrRequest (worker.js:47698:20)
    at async dispatch (worker.js:45451:17)
    at async timing2 (worker.js:47357:5)
    at async dispatch (worker.js:45451:17)
    at async worker.js:46589:26
}
],
logger: console
}
```

## Build issue in Github Actions

```sh
Run echo "🚀 Building Canary..."
🚀 Building Canary...
Task build:worker:canary deno run -P npm:@react-router/dev build --config ./vite.react-router.config.ts --mode canary && deno run -P npm:vite build --config ./vite.worker.config.ts --mode canary
Warning Permissions in the config file is an experimental feature and may change in the future.
11:30:33 AM [vite] warning: `esbuild` option was specified by "react-router" plugin. This option is deprecated, please use `oxc` instead.
[sentry-vite-plugin] Info: Sending telemetry data on issues and performance to Sentry. To disable telemetry, set `options.telemetry` to `false`.
Using Vite Environment API (experimental)
vite v8.0.3 building client environment for canary...
[sentry-vite-plugin] Info: Sending telemetry data on issues and performance to Sentry. To disable telemetry, set `options.telemetry` to `false`.

transforming...✓ 319 modules transformed.
[plugin vite:copy-headers] Generated static CSP headers for 0 prerendered route(s) at /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/build/client/_headers
✗ Build failed in 3.24s
[plugin vite:copy-headers] Generated static CSP headers for 0 prerendered route(s) at /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/build/client/_headers
Build failed with 8 errors:

[plugin react-router:build-client-route] /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/app/routes/$.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/resolve-tsconfig-DJjTYbYr.mjs:83:58)
    at transformWithOxc (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3703:17)
    at TransformPluginContext.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:30048:51)
    at compileRouteFile (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2972:21)
    at getRouteModuleExports (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2979:14)
    at TransformPluginContextImpl.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:4040:29)
    at plugin (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1129:16)
    at plugin.<computed> (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1593:12)
[plugin react-router:build-client-route] /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/app/root.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/resolve-tsconfig-DJjTYbYr.mjs:83:58)
    at transformWithOxc (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3703:17)
    at TransformPluginContext.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:30048:51)
    at compileRouteFile (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2972:21)
    at getRouteModuleExports (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2979:14)
    at TransformPluginContextImpl.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:4040:29)
    at plugin (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1129:16)
    at plugin.<computed> (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1593:12)
[plugin react-router:build-client-route] /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/app/routes/about.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/resolve-tsconfig-DJjTYbYr.mjs:83:58)
    at transformWithOxc (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3703:17)
    at TransformPluginContext.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:30048:51)
    at compileRouteFile (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2972:21)
    at getRouteModuleExports (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2979:14)
    at TransformPluginContextImpl.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:4040:29)
    at plugin (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1129:16)
    at plugin.<computed> (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1593:12)
[plugin react-router:build-client-route] /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/app/routes/hono-rpc.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/resolve-tsconfig-DJjTYbYr.mjs:83:58)
    at transformWithOxc (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3703:17)
    at TransformPluginContext.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:30048:51)
    at compileRouteFile (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2972:21)
    at getRouteModuleExports (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2979:14)
    at TransformPluginContextImpl.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:4040:29)
    at plugin (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1129:16)
    at plugin.<computed> (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1593:12)
[plugin react-router:build-client-route] /home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/app/routes/errors.tsx?__react-router-build-client-route
Error: Failed to recover `TsconfigCache` type from napi value
    at transformSync (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/resolve-tsconfig-DJjTYbYr.mjs:83:58)
    at transformWithOxc (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3703:17)
    at TransformPluginContext.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:3788:26)
    at EnvironmentPluginContainer.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:30048:51)
    at compileRouteFile (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2972:21)
    at getRouteModuleExports (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:2979:14)
    at TransformPluginContextImpl.transform (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:4040:29)
    at plugin (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1129:16)
    at plugin.<computed> (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/bindingify-input-options-e7ze4hPR.mjs:1593:12)
...
    at aggregateBindingErrorsIntoJsError (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/error-BLhcSyeg.mjs:48:18)
    at unwrapBindingResult (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/error-BLhcSyeg.mjs:18:128)
    at RolldownBuild.#build (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/rolldown@1.0.0-rc.12/node_modules/rolldown/dist/shared/rolldown-build-CPrIX9V6.mjs:3313:34)
    at buildEnvironment (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:32849:64)
    at Object.build (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:33271:19)
    at Object.buildApp (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/vite.js:3569:17)
    at Object.buildApp (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/vite@8.0.3/node_modules/vite/dist/node/chunks/node.js:33267:38)
    at viteAppBuild (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/cli/index.js:2011:3)
    at build (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/cli/index.js:1952:10)
    at build2 (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/cli/index.js:2290:5)
    at run2 (/home/runner/work/test-hono-react-router-vite/test-hono-react-router-vite/node_modules/.deno/@react-router+dev@7.13.2/node_modules/@react-router/dev/dist/cli/index.js:2595:7) {
  errors: [Getter/Setter]
}
Error: Process completed with exit code 1.
```

---

## TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'

### Log from CF Worker

```json
{
  "level": "error",
  "message": "TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://test-hono-react-router-vite-canary.motss.workers.dev/ssr",
        "method": "GET",
        "path": "/ssr"
      }
    },
    "outcome": "ok",
    "scriptName": "test-hono-react-router-vite-canary",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "efab5b67-8119-4fa8-b7c9-a4e573e3f5b0"
    },
    "requestId": "9e696aa16b816f98"
  },
  "$metadata": {
    "id": "01KNA2FRA1G9M6BDNWT7J11PVZ",
    "requestId": "9e696aa16b816f98",
    "trigger": "GET /ssr",
    "service": "test-hono-react-router-vite-canary",
    "level": "error",
    "error": "TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'",
    "message": "TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'",
    "account": "7597e72b9a5347db09ec37e501eb675a",
    "type": "cf-worker",
    "fingerprint": "e93aa1387327ee0df0f3de90bfe621ac",
    "origin": "fetch",
    "messageTemplate": "TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' The argument must be a file URL object, a file URL string, or an absolute path string.. Received 'undefined'"
  }
}
```

### Sentry env snapshot

```json
{
  "deploymentBuild": true,
  "values": {
    "SENTRY_DSN": {
      "present": true,
      "origin": "https://o237444.ingest.us.sentry.io",
      "pathname": "/4511078663782400"
    },
    "VITE_SENTRY_DSN": {
      "present": false
    },
    "PORT": "[missing]",
    "SENTRY_AUTH_TOKEN": "[missing]",
    "SENTRY_RELEASE": "7c5535d6e9e28ffeede1c62e4c0d6f3be3d864b3",
  },
  "level": "info",
  "message": "[packages/frontend/worker.ts] Sentry env snapshot",
  "mode": "canary",
  "phase": "worker",
  "$workers": {
    "truncated": false,
    "event": {
      "request": {
        "url": "https://test-hono-react-router-vite-canary.motss.workers.dev/ssr",
        "method": "GET",
        "path": "/ssr"
      }
    },
    "outcome": "ok",
    "scriptName": "test-hono-react-router-vite-canary",
    "eventType": "fetch",
    "executionModel": "stateless",
    "scriptVersion": {
      "id": "efab5b67-8119-4fa8-b7c9-a4e573e3f5b0"
    },
    "requestId": "9e696aa16b816f98"
  },
  "$metadata": {
    "id": "01KNA2FRA1G9M6BDNWT7J11PVY",
    "requestId": "9e696aa16b816f98",
    "trigger": "GET /ssr",
    "service": "test-hono-react-router-vite-canary",
    "level": "info",
    "message": "[packages/frontend/worker.ts] Sentry env snapshot",
    "account": "7597e72b9a5347db09ec37e501eb675a",
    "type": "cf-worker",
    "fingerprint": "0eb0f059aca1b239c47753a5f49e6c7d",
    "origin": "fetch",
    "messageTemplate": "[app/<DOMAIN>] Sentry env snapshot"
  }
}
```


---

# Fix suggested by OpenAI Codex using GPT5.4 xhigh

## Summary
- Append one new final section to [`issues.md`](/Users/rongsen/motss/test-hono-react-router-vite/issues.md) only.
- Do not edit or restructure any existing sections above it.
- The new section should be titled `## fix plan` to match the document’s current incident-note style.

## Content to Append
- Add `### 1. fix the worker SSR sentry runtime boundary`
  - State that the Worker SSR failure is caused by the server-side import path in `app/entry.server.tsx` pulling the bare `@sentry/react-router` server entry into the Worker bundle.
  - State that this causes Worker-incompatible runtime code to be bundled, including `@sentry/vite-plugin`, Rolldown CommonJS helpers, and `createRequire(...)`.
  - State that the fix is to move Worker SSR server-side Sentry usage behind a Worker-safe import path/helper layer so the Worker bundle no longer includes Node-only build-time code.
- Add `### 2. restore SSR pages and manifest patch loading`
  - State that `/ssr` and `/__manifest` are the confirmed failing paths in the Worker runtime.
  - State that `/hono-rpc` should be described as indirectly affected by manifest patch failures, not as the primary reproduced SSR 500.
  - State that once the Sentry import boundary is fixed, React Router server-build loading should succeed again and manifest patch requests should stop returning 500.
- Add `### 3. improve sentry visibility for SSR failures`
  - State that current Worker-level Sentry capture only records a generic failed request for these SSR crashes.
  - State that the follow-up fix should ensure SSR initialization/render failures are captured with exception details and stack traces before they collapse into a generic 500 event.
- Add `### 4. treat the GitHub Actions failure as a separate tooling regression`
  - State that the `TsconfigCache` / Rolldown N-API crash in Ubuntu CI is separate from the Worker SSR runtime issue.
  - State that the plan is to address it independently by pinning or rolling back the React Router/Vite/Rolldown toolchain to a Linux-stable combination first.
  - State that only if pinning is blocked should the repo use a narrower fallback such as disabling the Oxc/Rolldown path for the React Router build.

## Wording Requirements
- Use future-looking planning language, not implementation-complete language.
- Keep the section concise and actionable: short paragraphs or flat bullets only.
- Include the concrete runtime evidence already established:
  - `createRequire(... Received 'undefined')`
  - `Cannot convert undefined or null to object`
  - `/ssr` and `/__manifest` failing in Worker runtime
- Do not mention or reference any new file besides `issues.md`.
- Do not refer to `20260404-issues-fix.md`.

## Acceptance Criteria
- [`issues.md`](/Users/rongsen/motss/test-hono-react-router-vite/issues.md) ends with a new `## fix plan` section.
- Existing incident logs and error excerpts remain unchanged.
- The appended section clearly separates:
  - Worker SSR runtime/Sentry bundling fixes
  - manifest/SSR recovery
  - Sentry observability improvements
  - the separate CI build regression

---

## fix plan

### 1. fix the worker SSR sentry runtime boundary

The Worker SSR failure should be treated as an import-boundary problem first. The current Worker-side
stack shows `createRequire(... Received 'undefined')`, which points to Node-only runtime code still
being pulled into the Worker bundle.

The next step should be to keep Worker SSR Sentry usage behind a Worker-safe helper path so the Worker
bundle no longer includes Node-only build-time code such as Rolldown CommonJS helpers or related
`@sentry/vite-plugin` runtime paths.

### 2. restore SSR pages and manifest patch loading

We should treat `/ssr` and `/__manifest` as the confirmed failing Worker runtime paths, with
`/hono-rpc` considered indirectly affected because manifest patch loading is breaking first. Once the
Sentry import boundary is fixed, React Router server-build loading should succeed again and manifest
patch requests should stop returning 500.

### 3. improve sentry visibility for SSR failures

Current Worker-level Sentry capture only records a generic failed request when these SSR crashes happen.
The follow-up fix should ensure SSR initialization/render failures are captured with exception details
and stack traces before they collapse into an opaque 500 event.

### 4. treat the GitHub Actions failure as a separate tooling regression

The Ubuntu CI crash involving `TsconfigCache` / Rolldown N-API is separate from the Worker SSR runtime
issue. The plan should be to address it independently by pinning or rolling back the React Router/Vite/
Rolldown toolchain to a Linux-stable combination first.

Only if pinning is blocked should the repo use a narrower fallback such as disabling the Oxc/Rolldown
path for the React Router build.
