import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

const envResult = dotenv.config({ path: path.join(__dirname, "..", ".env") });

const dbUrl = process.env.DATABASE_URL || "";

export default defineConfig({
  schema: path.join(__dirname, "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
