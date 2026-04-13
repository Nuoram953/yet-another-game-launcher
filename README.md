# Yet Another Game Launcher (yagl)

A desktop game launcher and library manager built with Tauri, React, and Rust. It comes with a companion CLI (`yagl`) for launching, syncing, and searching games from the terminal.

## Features

- **Game library** — manage your games in a local SQLite database
- **Steam integration** — sync your Steam library automatically
- **Game launching** — launch games with configurable launch options, including Proton support
- **Session tracking** — track play time per session
- **Metadata enrichment** — fetch game metadata from IGDB, HowLongToBeat, and YouTube
- **CLI companion** — full terminal workflow via the `yagl` binary

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Rust, Tauri 2
- **Database:** SQLite via SQLx
- **CLI:** Clap

## Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

## Development

```bash
# Install frontend dependencies
pnpm install

# Run the desktop app in development mode
pnpm tauri

# Run the CLI
cargo run -p cli --manifest-path src-tauri/Cargo.toml -- <command>

# Run tests
pnpm test
```

## Database Migrations

```bash
pnpm migrate
```

## CLI Usage

The `yagl` binary supports the following commands:

```text
Usage: yagl [OPTIONS] <COMMAND>

Commands:
  launch   Launch game
  sync     Sync games from a storefront into the database
  search   Search for games
  view     View details for a game
  install  Install a game from a storefront
  uninstall  Uninstall a game from a storefront
  help     Print this message or the help of the given subcommand(s)
```

### Examples

```bash
# Interactive game launch
yagl launch

# Launch a specific game
yagl launch <game_id>

# Launch with a specific launch configuration
yagl launch <game_id> --launch-id <launch_id>

# Sync your Steam library
yagl sync --storefront steam

# Search by name
yagl search --name "Half-Life"

# Search and show available launch options
yagl search --launches

# View game details
yagl view <game_id>

# Install a game
yagl install <game_id>

# Uninstall a game
yagl uninstall <game_id>
```

## Configuration

The database is resolved in this order:

1. `--db` flag
2. `DATABASE_URL` environment variable (`sqlite://` prefix is stripped)
3. Platform default:
   - **Linux:** `~/.local/share/yet-another-game-launcher/`
   - **macOS:** `~/Library/Application Support/yet-another-game-launcher/`
   - **Windows:** `%APPDATA%\yet-another-game-launcher\`

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## CI / CD

Three GitHub Actions workflows are included:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push / PR to `main` | Rust fmt, Clippy, tests + TypeScript type check |
| `release.yml` | Push to `main` | Runs semantic-release, bumps versions, creates GitHub release |
| `build.yml` | GitHub release published | Builds Tauri app and CLI binaries for Linux, macOS, and Windows |

### Releases

Releases are fully automated using [semantic-release](https://semantic-release.github.io/semantic-release/) and [Conventional Commits](https://www.conventionalcommits.org/). Merging to `main` will:

1. Analyze commits to determine the next version (`fix:` → patch, `feat:` → minor, `feat!:` / `BREAKING CHANGE` → major)
2. Update the version in `tauri.conf.json` and all `Cargo.toml` files
3. Generate / update `CHANGELOG.md`
4. Create a `vX.Y.Z` git tag and GitHub release
5. Build and attach binaries for all platforms

#### Commit format

```text
<type>(<scope>): <description>

feat: add HowLongToBeat lookup
fix(cli): handle missing database gracefully
feat!: redesign launch configuration schema
```
