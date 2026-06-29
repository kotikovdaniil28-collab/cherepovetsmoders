import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = "true";
}

const steps = [
  ["npx", ["prisma", "generate"]],
  ["npx", ["next", "build"]]
];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
