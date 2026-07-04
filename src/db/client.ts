import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazily-initialized DB client. Deliberately NOT connected/validated at
 * module import time — Next.js imports route modules during build-time
 * page-data collection without executing them, so throwing here on a
 * missing DATABASE_URL would break `next build` even though no query ever
 * ran. The error only surfaces when a query actually executes, which is
 * exactly when a real DATABASE_URL is actually needed.
 */
let cached: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string. " +
        "See README.md → 'Setup database' for how to get one (free tier)."
    );
  }

  cached = drizzle(neon(url), { schema });
  return cached;
}

export const db: NeonHttpDatabase<typeof schema> = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
