const { execSync } = require("child_process");

console.log("Enabling corepack...");
execSync("corepack enable", { stdio: "inherit" });

console.log("Preparing pnpm...");
execSync("corepack prepare pnpm@10.33.3 --activate", { stdio: "inherit" });

console.log("Installing dependencies...");
execSync("pnpm install", { stdio: "inherit" });

console.log("Install complete!");
