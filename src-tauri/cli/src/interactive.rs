use anyhow::{bail, Result};
use dialoguer::{theme::ColorfulTheme, FuzzySelect, Select};

const MAX_VISIBLE_GAMES: usize = 20;

pub fn fuzzy_select<'a, T, F>(prompt: &str, items: &'a [T], display: F) -> Result<&'a T>
where
    F: Fn(&T) -> String,
{
    if items.is_empty() {
        bail!("no items available to select");
    }

    let labels: Vec<String> = items.iter().map(&display).collect();

    let idx = FuzzySelect::with_theme(&ColorfulTheme::default())
        .with_prompt(prompt)
        .items(&labels)
        .default(0)
        .max_length(MAX_VISIBLE_GAMES)
        .interact()?;

    Ok(&items[idx])
}

pub fn select<'a, T, F>(prompt: &str, items: &'a [T], display: F) -> Result<&'a T>
where
    F: Fn(&T) -> String,
{
    if items.is_empty() {
        bail!("no items available to select");
    }

    let labels: Vec<String> = items.iter().map(&display).collect();

    let idx = Select::with_theme(&ColorfulTheme::default())
        .with_prompt(prompt)
        .items(&labels)
        .default(0)
        .max_length(MAX_VISIBLE_GAMES)
        .interact()?;

    Ok(&items[idx])
}
