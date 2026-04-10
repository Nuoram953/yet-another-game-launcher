// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let has_args = std::env::args().nth(1).is_some();

    if has_args {
        let result = tokio::runtime::Runtime::new()
            .expect("failed to create tokio runtime")
            .block_on(cli_lib::run());

        if let Err(e) = result {
            eprintln!("error: {e:?}");
            std::process::exit(1);
        }
    } else {
        app_lib::run();
    }
}
