use crate::domains::{game::models::GameStatus, storefront::models::Storefront};

pub fn normalize_name(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
}

pub fn format_playtime_seconds(seconds: i64) -> String {
    if seconds <= 0 {
        return "—".to_string();
    }

    let h = seconds / 3600;
    let m = (seconds % 3600) / 60;

    match (h, m) {
        (0, m) => format!("{m}m"),
        (h, 0) => format!("{h}h"),
        (h, m) => format!("{h}h {m}m"),
    }
}

pub fn format_playtime_minutes(minutes: i64) -> String {
    if minutes <= 0 {
        return "—".to_string();
    }

    let h = minutes / 60;
    let m = minutes % 60;

    match (h, m) {
        (0, m) => format!("{m}m"),
        (h, 0) => format!("{h}h"),
        (h, m) => format!("{h}h {m}m"),
    }
}

pub fn format_size(bytes: i64) -> String {
    const GB: f64 = 1024.0 * 1024.0 * 1024.0;
    const MB: f64 = 1024.0 * 1024.0;
    const KB: f64 = 1024.0;

    let bytes_f64 = bytes as f64;

    if bytes_f64 >= GB {
        format!("{:.2} GB", bytes_f64 / GB)
    } else if bytes_f64 >= MB {
        format!("{:.1} MB", bytes_f64 / MB)
    } else if bytes_f64 >= KB {
        format!("{:.1} KB", bytes_f64 / KB)
    } else {
        format!("{bytes} B")
    }
}

pub fn format_timestamp(ts: i64) -> String {
    let secs_of_day = ts % 86400;
    let days = ts / 86400;
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    let h = secs_of_day / 3600;
    let min = (secs_of_day % 3600) / 60;

    format!("{y:04}-{m:02}-{d:02} {h:02}:{min:02}")
}

pub fn format_timestamp_time(ts: i64) -> String {
    let secs_of_day = ts % 86400;
    let h = secs_of_day / 3600;
    let min = (secs_of_day % 3600) / 60;

    format!("{h:02}:{min:02}")
}

pub fn format_timestamp_date(ts: i64) -> String {
    format_timestamp(ts)[..10].to_string()
}

pub fn storefront_label(id: i64) -> &'static str {
    match Storefront::try_from(id) {
        Ok(Storefront::Steam) => "Steam",
        Ok(Storefront::Custom) => "Custom",
        Err(_) => "Unknown",
    }
}

pub fn game_status_label(id: i64) -> &'static str {
    match id {
        x if x == GameStatus::Wishlist as i64 => "Wishlist",
        x if x == GameStatus::Playing as i64 => "Playing",
        x if x == GameStatus::Completed as i64 => "Completed",
        x if x == GameStatus::Dropped as i64 => "Dropped",
        x if x == GameStatus::OnHold as i64 => "On Hold",
        x if x == GameStatus::ToDo as i64 => "To Do",
        _ => "Unknown",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lowercase() {
        assert_eq!(normalize_name("Team Fortress 2"), "teamfortress2");
    }

    #[test]
    fn strips_punctuation() {
        assert_eq!(normalize_name("Batman: Arkham City"), "batmanarkhamcity");
    }

    #[test]
    fn strips_trailing_spaces() {
        assert_eq!(normalize_name("Batman Arkham City "), "batmanarkhamcity");
    }

    #[test]
    fn strips_quotes() {
        assert_eq!(normalize_name("\"Batman\" Arkham City"), "batmanarkhamcity");
    }

    #[test]
    fn different_games_do_not_collide() {
        assert_ne!(normalize_name("Portal"), normalize_name("Portal 2"));
    }

    #[test]
    fn formats_playtime_seconds() {
        assert_eq!(format_playtime_seconds(90), "1m");
        assert_eq!(format_playtime_seconds(3600), "1h");
        assert_eq!(format_playtime_seconds(3660), "1h 1m");
        assert_eq!(format_playtime_seconds(0), "—");
    }

    #[test]
    fn formats_playtime_minutes() {
        assert_eq!(format_playtime_minutes(59), "59m");
        assert_eq!(format_playtime_minutes(60), "1h");
        assert_eq!(format_playtime_minutes(125), "2h 5m");
        assert_eq!(format_playtime_minutes(-1), "—");
    }

    #[test]
    fn formats_sizes() {
        assert_eq!(format_size(512), "512 B");
        assert_eq!(format_size(2 * 1024), "2.0 KB");
        assert_eq!(format_size(3 * 1024 * 1024), "3.0 MB");
    }

    #[test]
    fn formats_timestamps() {
        assert_eq!(format_timestamp(0), "1970-01-01 00:00");
        assert_eq!(format_timestamp_time(3660), "01:01");
        assert_eq!(format_timestamp_date(0), "1970-01-01");
    }

    #[test]
    fn resolves_labels() {
        assert_eq!(storefront_label(Storefront::Steam as i64), "Steam");
        assert_eq!(storefront_label(99), "Unknown");
        assert_eq!(game_status_label(GameStatus::OnHold as i64), "On Hold");
        assert_eq!(game_status_label(99), "Unknown");
    }
}
