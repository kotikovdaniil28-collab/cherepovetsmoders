import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true
  });
}

try {
  run("node scripts/setup.mjs");
  run("npm run dev");
} catch (error) {
  console.error(`\nLocal start failed: ${error.message}`);
  process.exit(1);
}

