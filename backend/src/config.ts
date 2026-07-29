import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL", "postgresql://petcare:petcare@localhost:5432/petcare_cms"),
  jwtSecret: required("JWT_SECRET", "petcare-dev-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  appTitle: process.env.APP_TITLE ?? "PetCare CMS",
  appUrl: process.env.APP_URL ?? "http://localhost"
};
