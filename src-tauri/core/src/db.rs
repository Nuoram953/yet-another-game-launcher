use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub type DbPool = SqlitePool;

pub async fn connect(db_path: &str) -> Result<DbPool, sqlx::Error> {
    if let Some(parent) = std::path::Path::new(db_path).parent() {
        if !parent.as_os_str().is_empty() {
            std::fs::create_dir_all(parent).map_err(sqlx::Error::Io)?;
        }
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&format!("sqlite://{db_path}?mode=rwc"))
        .await?;

    sqlx::migrate!("src/migrations").run(&pool).await?;

    Ok(pool)
}
