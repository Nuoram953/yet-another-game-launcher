use indicatif::{ProgressBar, ProgressStyle};
use std::time::Duration;

const TICK_INTERVAL: Duration = Duration::from_millis(100);
const TICK_STRINGS: &[&str] = &["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const PROGRESS_CHARS: &str = "=> ";

pub fn build_spinner(template: &str) -> ProgressBar {
    let bar = ProgressBar::new_spinner();
    bar.enable_steady_tick(TICK_INTERVAL);
    bar.set_style(spinner_style(template));
    bar
}

pub fn spinner_style(template: &str) -> ProgressStyle {
    ProgressStyle::with_template(template)
        .expect("progress template should be valid")
        .tick_strings(TICK_STRINGS)
}

pub fn progress_spinner_style(template: &str) -> ProgressStyle {
    ProgressStyle::with_template(template)
        .expect("progress template should be valid")
        .tick_strings(TICK_STRINGS)
        .progress_chars(PROGRESS_CHARS)
}

pub fn progress_style(template: &str) -> ProgressStyle {
    ProgressStyle::with_template(template)
        .expect("progress template should be valid")
        .progress_chars(PROGRESS_CHARS)
}
