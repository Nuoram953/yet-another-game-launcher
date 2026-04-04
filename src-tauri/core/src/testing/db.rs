use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

/// Returns an in-memory SQLite pool with all migrations applied.
/// Every call produces a fully isolated database — safe to use in parallel tests.
pub async fn test_db() -> SqlitePool {
    let pool = SqlitePoolOptions::new()
        .connect("sqlite::memory:")
        .await
        .expect("failed to open in-memory SQLite");

    sqlx::migrate!("src/migrations")
        .run(&pool)
        .await
        .expect("migrations failed");

    pool
}
