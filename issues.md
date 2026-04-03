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
