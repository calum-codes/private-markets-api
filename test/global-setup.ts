import { execSync } from "node:child_process";

export function setup() {
  execSync("POSTGRES_PORT=5433 CONTAINER_NAME=test docker compose up -d", {
    stdio: "inherit",
  });
  execSync(
    "dbmate --wait -u 'postgres://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable' up",
    {
      stdio: "inherit",
    }
  );
}
