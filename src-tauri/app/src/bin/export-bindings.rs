fn main() {
    use specta_typescript::Typescript;
    use tauri_specta::{collect_commands, Builder};

    Builder::<tauri::Wry>::new()
        .commands(collect_commands![
            yagl_core::domains::achievement::commands::get_game_achievement_sets,
            yagl_core::domains::game::commands::update_status,
            yagl_core::domains::game::commands::get_by_id,
            yagl_core::domains::game::commands::launch_game,
            yagl_core::domains::storefront::commands::sync_libraries,
            yagl_core::domains::media::commands::get_media_by_entity,
            yagl_core::domains::media::commands::get_media_by_entity_and_type,
            yagl_core::domains::media::commands::delete_media
        ])
        .export(Typescript::default(), "src/bindings.ts")
        .expect("failed to export TypeScript bindings");

    println!("src/bindings.ts updated");
}
