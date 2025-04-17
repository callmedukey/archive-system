// Make sure to install the 'postgres' package
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schemas from "./schemas";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL ENV MISSING");
}

const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle({ client: queryClient, schema: schemas });
