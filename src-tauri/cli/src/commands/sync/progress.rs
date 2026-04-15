use colored::Colorize;
use indicatif::{MultiProgress, ProgressBar, ProgressStyle};
use std::time::Duration;
use tracing::Level;
use yagl_core::{
    domains::storefront::{models::Storefront, service::SyncProgressEvent},
    utils::storefront_label,
};

use crate::progress;

const SPINNER_TICK_INTERVAL: Duration = Duration::from_millis(100);
const STEP_PREFIX_WIDTH: usize = 16;
const HEADER_SEPARATOR_WIDTH: usize = 1;

pub struct SyncProgressRenderer {
    output: RenderMode,
}

enum RenderMode {
    Interactive(InteractiveRenderer),
    Plain,
}

struct InteractiveRenderer {
    progress: MultiProgress,
    rows: Vec<StorefrontRows>,
}

struct StorefrontRows {
    storefront: Storefront,
    header: ProgressBar,
    steps: Vec<ProgressBar>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SyncStep {
    Games,
    Achievements,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum StepUpdate {
    Start,
    Fetch { total: u64 },
    Advance { total: u64, processed: u64 },
    Finish { total: u64, processed: u64 },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum RenderAction {
    Skip {
        storefront: Storefront,
    },
    Step {
        storefront: Storefront,
        step: SyncStep,
        update: StepUpdate,
    },
}

impl SyncProgressRenderer {
    pub fn new() -> Self {
        let output = if tracing::enabled!(Level::INFO) {
            RenderMode::Plain
        } else {
            RenderMode::Interactive(InteractiveRenderer::new())
        };

        Self { output }
    }

    pub fn render(&mut self, event: SyncProgressEvent) {
        match &mut self.output {
            RenderMode::Interactive(renderer) => renderer.render(event),
            RenderMode::Plain => {
                if let Some(line) = plain_render_line(event) {
                    println!("{line}");
                }
            }
        }
    }
}

impl InteractiveRenderer {
    fn new() -> Self {
        let progress = MultiProgress::new();
        progress.set_move_cursor(true);
        Self {
            progress,
            rows: Vec::new(),
        }
    }

    fn render(&mut self, event: SyncProgressEvent) {
        match RenderAction::from_event(event) {
            RenderAction::Skip { storefront } => self.rows_for(storefront).mark_skipped(),
            RenderAction::Step {
                storefront,
                step,
                update,
            } => self.rows_for(storefront).update_step(step, update),
        }
    }

    fn rows_for(&mut self, storefront: Storefront) -> &StorefrontRows {
        if let Some(index) = self
            .rows
            .iter()
            .position(|rows| rows.storefront == storefront)
        {
            return &self.rows[index];
        }

        self.rows
            .push(StorefrontRows::new(&self.progress, storefront));
        self.rows
            .last()
            .expect("storefront rows should exist after insertion")
    }
}

fn plain_render_line(event: SyncProgressEvent) -> Option<String> {
    match RenderAction::from_event(event) {
        RenderAction::Skip { storefront } => Some(format!(
            "{} {}: skipped",
            "•".cyan().bold(),
            storefront_label(storefront as i64).bold()
        )),
        RenderAction::Step {
            storefront,
            step,
            update: StepUpdate::Start,
        } => Some(format!(
            "{} {} {}: started",
            "▶".cyan().bold(),
            storefront_label(storefront as i64).bold(),
            step.label()
        )),
        RenderAction::Step {
            storefront,
            step,
            update: StepUpdate::Fetch { total },
        } => Some(format!(
            "{} {} {}: found {}",
            "•".cyan().bold(),
            storefront_label(storefront as i64).bold(),
            step.label(),
            total
        )),
        RenderAction::Step {
            storefront,
            step,
            update: StepUpdate::Finish { total, processed },
        } => Some(format!(
            "{} {} {}: completed {}/{}",
            "✔".green().bold(),
            storefront_label(storefront as i64).bold(),
            step.label(),
            processed.min(total),
            total
        )),
        RenderAction::Step {
            update: StepUpdate::Advance { .. },
            ..
        } => None,
    }
}

impl StorefrontRows {
    fn new(progress: &MultiProgress, storefront: Storefront) -> Self {
        let header = progress.add(ProgressBar::new(0));
        header.set_style(header_style());
        header.set_message(storefront_header(storefront));

        let steps = SyncStep::ALL
            .into_iter()
            .map(|step| {
                let bar = progress.add(ProgressBar::new(0));
                prepare_waiting_step(&bar, step.label());
                bar
            })
            .collect();

        Self {
            storefront,
            header,
            steps,
        }
    }

    fn mark_skipped(&self) {
        self.header.finish_with_message(format!(
            "{} {}",
            storefront_header(self.storefront),
            "(skipped)".dimmed()
        ));
        for step in &self.steps {
            step.finish_and_clear();
        }
    }

    fn update_step(&self, step: SyncStep, update: StepUpdate) {
        self.header.set_message(storefront_header(self.storefront));
        let bar = self.step_bar(step);
        match update {
            StepUpdate::Start => start_step(bar),
            StepUpdate::Fetch { total } => {
                configure_step_total(bar, total);
                if total == 0 {
                    finish_step(bar, 0, 0);
                }
            }
            StepUpdate::Advance { total, processed } => {
                if total == 0 {
                    return;
                }
                update_step_position(bar, total, processed);
            }
            StepUpdate::Finish { total, processed } => {
                if step.is_terminal() {
                    self.header
                        .finish_with_message(storefront_header(self.storefront));
                }
                finish_step(bar, total, processed);
            }
        }
    }

    fn step_bar(&self, step: SyncStep) -> &ProgressBar {
        &self.steps[step.index()]
    }
}

impl SyncStep {
    const ALL: [Self; 2] = [Self::Games, Self::Achievements];

    const fn index(self) -> usize {
        match self {
            Self::Games => 0,
            Self::Achievements => 1,
        }
    }

    const fn label(self) -> &'static str {
        match self {
            Self::Games => "Games",
            Self::Achievements => "Achievements",
        }
    }

    const fn is_terminal(self) -> bool {
        self.index() + 1 == Self::ALL.len()
    }
}

impl RenderAction {
    fn from_event(event: SyncProgressEvent) -> Self {
        match event {
            SyncProgressEvent::StorefrontStarted { storefront } => Self::Step {
                storefront,
                step: SyncStep::Games,
                update: StepUpdate::Start,
            },
            SyncProgressEvent::StorefrontSkipped { storefront } => Self::Skip { storefront },
            SyncProgressEvent::StorefrontFetched { progress } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Games,
                update: StepUpdate::Fetch {
                    total: progress.total_games as u64,
                },
            },
            SyncProgressEvent::GameProcessed { progress, .. } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Games,
                update: StepUpdate::Advance {
                    total: progress.total_games as u64,
                    processed: progress.processed_games as u64,
                },
            },
            SyncProgressEvent::StorefrontCompleted { progress } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Games,
                update: StepUpdate::Finish {
                    total: progress.total_games as u64,
                    processed: progress.processed_games as u64,
                },
            },
            SyncProgressEvent::AchievementSyncStarted { storefront } => Self::Step {
                storefront,
                step: SyncStep::Achievements,
                update: StepUpdate::Start,
            },
            SyncProgressEvent::AchievementSyncFetched { progress } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Achievements,
                update: StepUpdate::Fetch {
                    total: progress.total_games as u64,
                },
            },
            SyncProgressEvent::AchievementProcessed { progress } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Achievements,
                update: StepUpdate::Advance {
                    total: progress.total_games as u64,
                    processed: progress.processed_games as u64,
                },
            },
            SyncProgressEvent::AchievementSyncCompleted { progress } => Self::Step {
                storefront: progress.storefront,
                step: SyncStep::Achievements,
                update: StepUpdate::Finish {
                    total: progress.total_games as u64,
                    processed: progress.processed_games as u64,
                },
            },
        }
    }
}

fn header_style() -> ProgressStyle {
    ProgressStyle::with_template("{msg}").expect("progress template should be valid")
}

fn waiting_step_style() -> ProgressStyle {
    progress::progress_style(&format!(
        "    {{prefix:<{STEP_PREFIX_WIDTH}}} [{{bar:30.cyan/blue}}]  "
    ))
}

fn active_step_style() -> ProgressStyle {
    progress::progress_spinner_style(&format!(
        "    {{prefix:<{STEP_PREFIX_WIDTH}}} [{{bar:30.cyan/blue}}] {{spinner:.cyan}}"
    ))
}

fn complete_step_style() -> ProgressStyle {
    progress::progress_style(&format!(
        "    {{prefix:<{STEP_PREFIX_WIDTH}}} [{{bar:30.cyan/blue}}]  "
    ))
}

fn prepare_waiting_step(bar: &ProgressBar, label: &str) {
    bar.disable_steady_tick();
    bar.set_style(waiting_step_style());
    bar.set_prefix(label.to_string());
    bar.set_length(1);
    bar.set_position(0);
}

fn start_step(bar: &ProgressBar) {
    bar.set_style(active_step_style());
    bar.set_length(1);
    bar.set_position(0);
    bar.enable_steady_tick(SPINNER_TICK_INTERVAL);
}

fn configure_step_total(bar: &ProgressBar, total: u64) {
    bar.set_style(active_step_style());
    bar.set_length(normalized_total(total));
    bar.set_position(0);
    bar.enable_steady_tick(SPINNER_TICK_INTERVAL);
    bar.tick();
}

fn finish_step(bar: &ProgressBar, total: u64, processed: u64) {
    bar.disable_steady_tick();
    bar.set_style(complete_step_style());
    bar.set_length(normalized_total(total));
    bar.set_position(normalized_position(total, processed));
    bar.finish();
}

fn update_step_position(bar: &ProgressBar, total: u64, processed: u64) {
    bar.set_position(normalized_position(total, processed));
    bar.tick();
}

fn normalized_total(total: u64) -> u64 {
    total.max(1)
}

fn normalized_position(total: u64, processed: u64) -> u64 {
    if total == 0 {
        1
    } else {
        processed.min(total)
    }
}

fn storefront_header(storefront: Storefront) -> String {
    let label = storefront_label(storefront as i64);
    format!(
        "  {} {}",
        label.bold(),
        "-".repeat(header_dash_width(label))
    )
}

fn header_dash_width(label: &str) -> usize {
    STEP_PREFIX_WIDTH
        .saturating_sub(HEADER_SEPARATOR_WIDTH + label.len())
        .max(1)
}

#[cfg(test)]
mod tests;
