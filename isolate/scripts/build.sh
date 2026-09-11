#!/bin/sh
set -e

corepack enable || true
corepack prepare pnpm@10.33.3 --activate || true

# Generate Prisma client
pnpm prisma generate

# Build the application
pnpm build
