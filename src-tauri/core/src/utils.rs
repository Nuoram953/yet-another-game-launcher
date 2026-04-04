/// Returns a normalized version of a game name for deduplication purposes.
/// Converts to lowercase and removes all non-alphanumeric ASCII characters.
///
/// Examples:
/// - `"Team Fortress 2"` → `"teamfortress2"`
/// - `"Batman: Arkham City"` → `"batmanarkhamcity"`
/// - `"Batman Arkham City "` → `"batmanarkhamcity"`
pub fn normalize_name(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
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
}
