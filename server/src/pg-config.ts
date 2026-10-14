import type pg from "pg";

export function getPgPoolConfig(): pg.PoolConfig {
  const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://startpage:startpage@localhost:5432/startpage";
  const isRemote =
    connectionString.includes("supabase.co") ||
    connectionString.includes("supabase.com");

  return {
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
  };
}
