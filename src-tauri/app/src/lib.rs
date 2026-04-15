use std::sync::{Arc, RwLock};

use tauri::Manager;
use tauri_specta::{collect_commands, Builder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();

    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        yagl_core::domains::achievement::commands::get_game_achievement_sets,
        yagl_core::domains::game::commands::update_status,
        yagl_core::domains::game::commands::get_by_id,
        yagl_core::domains::game::commands::launch_game,
        yagl_core::domains::storefront::commands::sync_libraries,
        yagl_core::domains::media::commands::get_media_by_entity,
        yagl_core::domains::media::commands::get_media_by_entity_and_type,
        yagl_core::domains::media::commands::delete_media,
    ]);

    #[cfg(debug_assertions)]
    {
        let tmp = std::env::temp_dir().join("yagl-bindings-new.ts");
        builder
            .export(specta_typescript::Typescript::default(), &tmp)
            .expect("failed to generate TypeScript bindings");
        let new = std::fs::read(&tmp).unwrap_or_default();
        let current = std::fs::read("src/bindings.ts").unwrap_or_default();
        if new != current {
            std::fs::copy(&tmp, "src/bindings.ts").expect("failed to write src/bindings.ts");
        }
    }

    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;

            // Database
            let db_path = data_dir.join("data.db");
            let db_path_str = db_path.to_str().unwrap().to_string();
            println!("{}", db_path_str);
            let pool = tauri::async_runtime::block_on(yagl_core::db::connect(&db_path_str))?;
            app.manage(pool);

            // Config
            let config_path = data_dir.join("config.toml");
            let config = yagl_core::config::load(&config_path).expect("failed to load config");
            let shared = Arc::new(RwLock::new(config));
            let watcher = yagl_core::config::watch(config_path, Arc::clone(&shared))
                .expect("failed to start config watcher");
            app.manage(shared);
            // Keep watcher alive for the lifetime of the app.
            app.manage(watcher);

            Ok(())
        })
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
