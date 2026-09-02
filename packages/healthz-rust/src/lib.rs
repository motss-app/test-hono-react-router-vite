use worker::*;

fn json_response(body: &serde_json::Value) -> Result<Response> {
  let resp = Response::from_json(body)?;
  resp.headers().set("cache-control", "no-store")?;
  Ok(resp)
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
  match req.path().as_str() {
    "/healthz" => Response::ok("gateway rust ok"),
    "/hello" => {
      let timestamp = js_sys::Date::new_0()
        .to_iso_string()
        .as_string()
        .unwrap_or_default();
      json_response(&serde_json::json!({
        "message": "Hello, World!",
        "server": "Rust WASM",
        "timestamp": timestamp,
      }))
    }
    // Best-effort purge endpoint. The workers-rs crate does not expose the
    // Workers Cache `ctx.cache.purge()` API, and this worker serves only
    // `no-store` responses, so there is no meaningful cache to clear here.
    // It exists so the gateway can fan out to every binding uniformly.
    "/__purge-cache" => {
      let secret = env.var("CACHE_PURGE_SECRET").ok().map(|value| value.to_string());
      let provided = req.headers().get("x-purge-secret").unwrap_or_default();

      if secret.as_deref() != provided.as_deref() {
        return Response::error("Unauthorized", 401);
      }

      json_response(&serde_json::json!({
        "purged": true,
        "worker": "healthz-rust",
      }))
    }
    _ => Response::error("Not Found", 404),
  }
}
