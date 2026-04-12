use cli_lib::commands::sync;
use yagl_core::{config::Config, testing::db::test_db};

#[tokio::test]
async fn unknown_storefront_returns_error() {
    let pool = test_db().await;
    let config = Config::default();

    let result = sync::handle(&pool, Some("gog".to_string()), &config).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("unknown storefront"),
        "expected 'unknown storefront' in error, got: {msg}"
    );
    assert!(
        msg.contains("gog"),
        "expected storefront name in error, got: {msg}"
    );
}

#[tokio::test]
async fn steam_without_user_id_returns_error() {
    let pool = test_db().await;
    let config = Config::default();
    std::env::remove_var("STEAM_USER_ID");

    let result = sync::handle(&pool, Some("steam".to_string()), &config).await;

    assert!(result.is_err());
    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("STEAM_USER_ID"),
        "expected STEAM_USER_ID mention in error, got: {msg}"
    );
}

#[tokio::test]
async fn storefront_name_is_case_insensitive() {
    let pool = test_db().await;
    let config = Config::default();
    // "STEAM" without STEAM_USER_ID should fail on missing env var,
    // not on unknown storefront — proving the name matched
    std::env::remove_var("STEAM_USER_ID");

    let result = sync::handle(&pool, Some("STEAM".to_string()), &config).await;

    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("STEAM_USER_ID"),
        "expected env var error (not unknown storefront), got: {msg}"
    );
}

#[tokio::test]
async fn omitted_storefront_syncs_all_storefronts() {
    let pool = test_db().await;
    let config = Config::default();
    std::env::remove_var("STEAM_USER_ID");

    let result = sync::handle(&pool, None, &config).await;

    let msg = result.unwrap_err().to_string();
    assert!(
        msg.contains("STEAM_USER_ID"),
        "expected sync-all path to resolve supported storefronts, got: {msg}"
    );
}
