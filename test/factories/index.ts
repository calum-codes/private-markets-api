import { pgService } from "../../src/services/pg-service";

export const clearDb = async () => {
  const pool = await pgService.getPool();
  await Promise.all([pool.query("DELETE FROM investment;")]);
  await Promise.all([
    pool.query("DELETE FROM fund;"),
    pool.query("DELETE FROM investor;"),
  ]);
};
