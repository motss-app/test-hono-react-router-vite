use worker::*;

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
  match req.path().as_str() {
    "/healthz" => Response::ok("gateway rust ok"),
    "/healthz/json" => {
      let timestamp = js_sys::Date::new_0()
        .to_iso_string()
        .as_string()
        .unwrap_or_default();
      let body = serde_json::json!({
        "status": "ok",
        "worker": "healthz-rust",
        "runtime": "rust/wasm",
        "timestamp": timestamp
      });
      Response::from_json(&body)
    }
    _ => Response::error("Not Found", 404),
  }
}
