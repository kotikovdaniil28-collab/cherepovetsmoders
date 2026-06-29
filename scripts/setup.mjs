import { existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command, options = {}) {
  console.log(`\n> ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true,
    ...options
  });
}

function canRun(command) {
  try {
    execSync(command, {
      stdio: "ignore",
      shell: true
    });
    return true;
  } catch {
    return false;
  }
}

function ensureEnvFile() {
  if (existsSync(".env")) {
    console.log("✓ .env already exists");
    return;
  }

  if (!existsSync(".env.example")) {
    throw new Error(".env.example is missing");
  }

  copyFileSync(".env.example", ".env");
  console.log("✓ Created .env from .env.example");
}

function ensureDependencies() {
  if (existsSync("node_modules")) {
    console.log("✓ node_modules already exists");
    return;
  }

  run("npm install");
}

function ensureDocker() {
  if (!canRun("docker --version")) {
    throw new Error(
      "Docker is not available. Install Docker Desktop or start Docker, then run npm run setup again."
    );
  }

  if (!canRun("docker compose version")) {
    throw new Error(
      "Docker Compose is not available. Install Docker Compose, then run npm run setup again."
    );
  }
}

function waitForPostgres() {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      execSync(
        "docker compose exec -T postgres pg_isready -U webdev -d webdev_path",
        {
          stdio: "ignore",
          shell: true
        }
      );
      console.log("✓ PostgreSQL is ready");
      return;
    } catch {
      process.stdout.write(".");
      execSync("node -e \"setTimeout(() => {}, 1000)\"", {
        stdio: "ignore",
        shell: true
      });
    }
  }

  throw new Error("PostgreSQL did not become ready in time.");
}

function main() {
  console.log("Setting up WebDev Path locally...");

  ensureEnvFile();
  ensureDependencies();
  ensureDocker();

  run("docker compose up -d postgres");
  waitForPostgres();

  run("npm run db:generate");
  run("npm run db:push");
  run("npm run db:seed");

  console.log("\n✓ Setup complete");
  console.log("Run npm run dev or npm run start:local to open the app.");
}

try {
  main();
} catch (error) {
  console.error(`\nSetup failed: ${error.message}`);
  process.exit(1);
}

