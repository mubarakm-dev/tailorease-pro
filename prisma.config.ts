import { loadEnvFile } from "process";
loadEnvFile(".env.local");

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // CLI (migrate / db push) must use the DIRECT connection (port 5432).
    // DDL cannot run through Supabase's transaction pooler (6543 / pgbouncer).
    // The app runtime keeps using DATABASE_URL (pooler) in app/libs/prisma.ts.
    url: process.env.DIRECT_URL!,
  },
});