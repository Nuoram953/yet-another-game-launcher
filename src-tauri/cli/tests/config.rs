use cli_lib::config::resolve_db_path;
use serial_test::serial;
use std::path::PathBuf;

#[test]
fn explicit_flag_takes_priority() {
    let result = resolve_db_path(Some(PathBuf::from("/tmp/my.db")));
    assert_eq!(result, "/tmp/my.db");
}

#[test]
#[serial]
fn explicit_flag_overrides_database_url() {
    std::env::set_var("DATABASE_URL", "sqlite:///should/not/be/used.db");
    let result = resolve_db_path(Some(PathBuf::from("/tmp/explicit.db")));
    std::env::remove_var("DATABASE_URL");
    assert_eq!(result, "/tmp/explicit.db");
}

#[test]
#[serial]
fn database_url_with_sqlite_prefix_is_stripped() {
    std::env::set_var("DATABASE_URL", "sqlite:///home/user/data.db");
    let result = resolve_db_path(None);
    std::env::remove_var("DATABASE_URL");
    assert_eq!(result, "/home/user/data.db");
}

#[test]
#[serial]
fn database_url_without_prefix_used_as_is() {
    std::env::set_var("DATABASE_URL", "/bare/path/data.db");
    let result = resolve_db_path(None);
    std::env::remove_var("DATABASE_URL");
    assert_eq!(result, "/bare/path/data.db");
}

#[test]
#[serial]
fn platform_default_contains_app_id_and_db_filename() {
    std::env::remove_var("DATABASE_URL");
    let result = resolve_db_path(None);
    assert!(
        result.contains("com.nuoram.yet-another-game-launcher"),
        "expected app ID in path, got: {result}"
    );
    assert!(
        result.ends_with("data.db"),
        "expected data.db suffix, got: {result}"
    );
}

#[test]
#[serial]
#[cfg(target_os = "linux")]
fn xdg_data_home_is_used_when_set() {
    std::env::remove_var("DATABASE_URL");
    std::env::set_var("XDG_DATA_HOME", "/custom/data");
    let result = resolve_db_path(None);
    std::env::remove_var("XDG_DATA_HOME");
    assert!(
        result.starts_with("/custom/data"),
        "expected XDG_DATA_HOME prefix, got: {result}"
    );
    assert!(
        result.ends_with("data.db"),
        "expected data.db suffix, got: {result}"
    );
}

#[test]
#[serial]
#[cfg(target_os = "linux")]
fn home_fallback_used_when_xdg_not_set() {
    std::env::remove_var("DATABASE_URL");
    std::env::remove_var("XDG_DATA_HOME");
    let home = std::env::var("HOME").unwrap_or_else(|_| "/home/testuser".to_string());
    let result = resolve_db_path(None);
    assert!(
        result.starts_with(&home),
        "expected HOME-based path, got: {result}"
    );
    assert!(
        result.contains(".local/share"),
        "expected .local/share in path, got: {result}"
    );
}
