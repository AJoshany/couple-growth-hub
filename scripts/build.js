const { execSync } = require("child_process");

console.log("Enabling corepack...");
execSync("corepack enable", { stdio: "inherit" });

console.log("Preparing pnpm...");
execSync("corepack prepare pnpm@10.33.3 --activate", { stdio: "inherit" });

console.log("Building...");
execSync("pnpm build", { stdio: "inherit" });

console.log("Build complete!");
