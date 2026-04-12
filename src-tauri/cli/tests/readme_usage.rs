use clap::CommandFactory;
use cli_lib::cli::Cli;

const README: &str = include_str!("../../../README.md");
const README_USAGE_PREFIX: &str = "The `yagl` binary supports the following commands:\n\n```text\n";

fn normalize_lines(block: &str) -> Vec<String> {
    block
        .lines()
        .map(|line| line.split_whitespace().collect::<Vec<_>>().join(" "))
        .filter(|line| !line.is_empty())
        .collect()
}

fn extract_readme_usage_block(readme: &str) -> &str {
    readme
        .split(README_USAGE_PREFIX)
        .nth(1)
        .and_then(|section| section.split("\n```").next())
        .expect("CLI usage block should exist in README.md")
}

fn extract_help_usage_block(help: &str) -> String {
    let usage_and_after = help
        .split("Usage: ")
        .nth(1)
        .expect("Usage block should exist in `yagl --help`");
    let usage_block = usage_and_after
        .split("\n\nOptions:")
        .next()
        .expect("Usage block should end before the options section");
    format!("Usage: {usage_block}")
}

#[test]
fn readme_cli_usage_matches_help_output() {
    let documented_help = extract_readme_usage_block(README);
    let mut command = Cli::command();
    let actual_help = command.render_long_help().to_string();

    let documented_lines = normalize_lines(documented_help);
    let actual_lines = normalize_lines(&extract_help_usage_block(&actual_help));

    assert_eq!(
        documented_lines, actual_lines,
        "README CLI usage block is out of sync with `yagl --help`"
    );
}
