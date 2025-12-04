import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export const databaseUrl = process.env.DATABASE_URL;
export const dbAvailable = Boolean(databaseUrl);

export const pool = dbAvailable
  ? new Pool({ connectionString: databaseUrl })
  : null;

export const db = pool ? drizzle({ client: pool, schema }) : null;
