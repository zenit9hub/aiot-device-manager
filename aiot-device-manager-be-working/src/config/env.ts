import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MYSQL_HOST: z.string().nonempty(),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string().nonempty(),
  MYSQL_PASSWORD: z.string().nonempty(),
  MYSQL_DATABASE: z.string().nonempty(),
  FIREBASE_PROJECT_ID: z.string().nonempty(),
  FIREBASE_CLIENT_EMAIL: z.string().nonempty(),
  FIREBASE_PRIVATE_KEY: z.string().nonempty(),
  ALLOWED_ORIGINS: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  /* eslint-disable no-console */
  console.error('Environment variable validation failed', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration. Check .env values.');
}

const {
  PORT,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  ALLOWED_ORIGINS
} = parsed.data;

export const env = {
  port: PORT,
  mysql: {
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  },
  firebase: {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  allowedOrigins: ALLOWED_ORIGINS ? ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : []
};
