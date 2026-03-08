#!/usr/bin/env node

// This script runs after npm install to verify the binary is available
const PLATFORMS = {
  "darwin-arm64": "@treble-app/cli-darwin-arm64",
  "darwin-x64": "@treble-app/cli-darwin-x64",
  "linux-x64": "@treble-app/cli-linux-x64",
  "linux-arm64": "@treble-app/cli-linux-arm64",
};

const platformKey = `${process.platform}-${process.arch}`;
const packageName = PLATFORMS[platformKey];

if (!packageName) {
  console.warn(`treble: No prebuilt binary for ${platformKey}`);
  console.warn(`You may need to build from source: cargo install treble`);
  process.exit(0);
}

// Check if the platform package was installed
try {
  require.resolve(`${packageName}/package.json`);
  console.log(`treble: Using binary from ${packageName}`);
} catch {
  console.warn(`treble: Platform package ${packageName} not found`);
  console.warn(`This may happen if optional dependencies failed to install.`);
  console.warn(`You can build from source: cargo install treble`);
}
