import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

const envResult = dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbUrl = process.env.DATABASE_URL || '';

export default defineConfig({
	schema: path.join(__dirname, 'schema.prisma'),
	datasource: {
		url: dbUrl,
	},
	migrations: {
		seed: 'npx tsx prisma/seed.ts',
	},
});
