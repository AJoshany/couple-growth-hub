#!/bin/sh
set -e

# Enable corepack and activate the pnpm version pinned in package.json
corepack enable || true
corepack prepare pnpm@10.33.3 --activate || true

pnpm install
