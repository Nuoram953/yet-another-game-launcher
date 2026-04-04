#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const version = process.argv[2];
if (!version) {
  console.error('Usage: version-bump.mjs <version>');
  process.exit(1);
}

// Update tauri.conf.json
const tauriConfPath = 'src-tauri/app/tauri.conf.json';
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf8'));
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
console.log(`Updated ${tauriConfPath} → ${version}`);

// Update each Cargo.toml version field
const cargoFiles = [
  'src-tauri/app/Cargo.toml',
  'src-tauri/core/Cargo.toml',
  'src-tauri/cli/Cargo.toml',
];

for (const file of cargoFiles) {
  const content = readFileSync(file, 'utf8');
  const updated = content.replace(/^version = "[^"]*"/m, `version = "${version}"`);
  if (content !== updated) {
    writeFileSync(file, updated);
    console.log(`Updated ${file} → ${version}`);
  }
}
