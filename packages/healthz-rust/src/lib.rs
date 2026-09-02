use worker::*;

fn json_response(body: &serde_json::Value) -> Result<Response> {
    let resp = Response::from_json(body)?;
    resp.headers().set("cache-control", "no-store")?;
    Ok(resp)
}

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    match req.path().as_str() {
        "/healthz" => Response::ok("gateway rust ok"),
        "/hello" => json_response(&serde_json::json!({
            "message": "Hello, World!",
            "server": "Rust WASM",
            "timestamp": js_sys::Date::new_0()
                .to_iso_string()
                .as_string()
                .unwrap_or_default(),
        })),
        _ => Response::error("Not Found", 404),
    }
}
