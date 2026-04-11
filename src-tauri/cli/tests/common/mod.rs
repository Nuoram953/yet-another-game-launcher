#![allow(dead_code)]

use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

pub fn unique_path(prefix: &str) -> PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("{prefix}-{unique}"))
}

pub fn strip_ansi(value: &str) -> String {
    let mut cleaned = String::new();
    let mut chars = value.chars().peekable();

    while let Some(ch) = chars.next() {
        if ch == '\u{1b}' {
            if chars.next_if_eq(&'[').is_some() {
                for next in chars.by_ref() {
                    if ('@'..='~').contains(&next) {
                        break;
                    }
                }
            }
            continue;
        }

        cleaned.push(ch);
    }

    cleaned
}

pub fn write_xdg_open_script<F>(bin_dir: &Path, build_body: F) -> PathBuf
where
    F: FnOnce(&Path) -> String,
{
    fs::create_dir_all(bin_dir).unwrap();
    let log_path = bin_dir.join("xdg-open.log");
    let script_path = bin_dir.join("xdg-open");
    let body = build_body(&log_path);
    fs::write(&script_path, body).unwrap();

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(&script_path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms).unwrap();
    }

    log_path
}
