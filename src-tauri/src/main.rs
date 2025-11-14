// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const BACKEND_PORT: u16 = 51823;
const OLLAMA_PORT: u16 = 51824;

struct AppState {
    backend_process: Arc<Mutex<Option<CommandChild>>>,
    ollama_process: Arc<Mutex<Option<CommandChild>>>,
}

async fn start_services(app_handle: tauri::AppHandle) -> Result<(), String> {
    let ollama_host = format!("http://127.0.0.1:{OLLAMA_PORT}");

    // Start Ollama
    let ollama_command = app_handle.shell().sidecar("ollama").unwrap();
    let (_, ollama) = ollama_command
        .arg("serve")
        .env("OLLAMA_HOST", &ollama_host)
        .spawn()
        .expect("Failed to spawn ollama");

    // Start Python backend
    let backend_command = app_handle.shell().sidecar("backend").unwrap();
    let (_, backend) = backend_command
        .env("PORT", BACKEND_PORT.to_string())
        .env("OLLAMA_HOST", ollama_host)
        .spawn()
        .expect("Failed to spawn backend");

    let state = app_handle.state::<AppState>();
    *state.ollama_process.lock().unwrap() = Some(ollama);
    *state.backend_process.lock().unwrap() = Some(backend);

    Ok(())
}

#[tauri::command]
async fn suggest_synonyms(
    state: tauri::State<'_, AppState>,
    term: String,
    definition: Option<String>,
    synonyms: Vec<String>,
    context: Vec<String>,
) -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    let url = format!("http://127.0.0.1:{}/api/suggest", BACKEND_PORT);

    let payload = serde_json::json!({
        "term": term,
        "definition": definition,
        "synonyms": synonyms,
        "context": context
    });

    let res = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Failed to send request to backend: {}", e))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!("Backend error ({}): {}", status, body));
    }

    let response: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("Failed to parse backend response: {}", e))?;

    let synonyms = response["synonyms"]
        .as_array()
        .ok_or("Invalid response: 'synonyms' not an array")?
        .iter()
        .filter_map(|v| v.as_str().map(|s| s.to_string()))
        .collect();

    Ok(synonyms)
}

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            ollama_process: Arc::new(Mutex::new(None)),
            backend_process: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![suggest_synonyms])
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = start_services(app_handle).await {
                    eprintln!("Service startup failed: {}", e);
                    #[cfg(debug_assertions)]
                    panic!("Startup failed: {}", e);
                }
            });
            Ok(())
        })
        .build(context)
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                let state = app.state::<AppState>();
                if let Some(child) = state.ollama_process.lock().unwrap().take() {
                    let _ = child.kill();
                }
                if let Some(child) = state.backend_process.lock().unwrap().take() {
                    let _ = child.kill();
                };
            }
        });
}
