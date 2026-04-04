fn main() {
    use specta_typescript::Typescript;
    use tauri_specta::{collect_commands, Builder};

    Builder::<tauri::Wry>::new()
        .commands(collect_commands![
            yagl_core::domains::game::commands::update_status,
            yagl_core::domains::game::commands::get_by_id
        ])
        .export(Typescript::default(), "../src/bindings.ts")
        .expect("failed to export TypeScript bindings");

    println!("src/bindings.ts updated");
}
