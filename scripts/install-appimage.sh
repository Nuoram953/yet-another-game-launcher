#!/usr/bin/env bash

set -euo pipefail

REPO="${REPO:-Nuoram953/yet-another-game-launcher}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="${BINARY_NAME:-yagl}"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This installer only supports Linux AppImage releases." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required to download releases." >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to parse the GitHub release metadata." >&2
  exit 1
fi

mkdir -p "${INSTALL_DIR}"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

release_json="${tmp_dir}/release.json"
curl -fsSL \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "${API_URL}" \
  -o "${release_json}"

arch="$(uname -m)"

mapfile -t release_info < <(
  python3 - "${release_json}" "${arch}" <<'PY'
import json
import re
import sys

release_path, arch = sys.argv[1], sys.argv[2]

with open(release_path, "r", encoding="utf-8") as fh:
    release = json.load(fh)

assets = release.get("assets", [])
appimages = [
    asset
    for asset in assets
    if asset.get("name", "").endswith(".AppImage")
    and asset.get("browser_download_url")
]

if not appimages:
    raise SystemExit("No AppImage asset found in the latest release.")

arch_patterns = {
    "x86_64": (r"x86_64", r"amd64"),
    "amd64": (r"x86_64", r"amd64"),
    "aarch64": (r"aarch64", r"arm64"),
    "arm64": (r"aarch64", r"arm64"),
}

patterns = arch_patterns.get(arch, ())
selected = next(
    (
        asset
        for asset in appimages
        if any(re.search(pattern, asset["name"], re.IGNORECASE) for pattern in patterns)
    ),
    appimages[0],
)

print(release.get("tag_name", "latest"))
print(selected["name"])
print(selected["browser_download_url"])
PY
)

release_tag="${release_info[0]}"
asset_name="${release_info[1]}"
asset_url="${release_info[2]}"
destination="${INSTALL_DIR}/${BINARY_NAME}"

curl -fsSL "${asset_url}" -o "${tmp_dir}/${asset_name}"
install -m 0755 "${tmp_dir}/${asset_name}" "${destination}"

echo "Installed ${release_tag} to ${destination}"

if [[ ":${PATH}:" != *":${INSTALL_DIR}:"* ]]; then
  echo "${INSTALL_DIR} is not on your PATH." >&2
  echo "Add this to your shell profile:" >&2
  echo "  export PATH=\"${INSTALL_DIR}:\$PATH\"" >&2
fi

echo "Run '${BINARY_NAME}' to start the app."
