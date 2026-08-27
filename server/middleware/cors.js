import cors from "cors";
import { env } from "../config/env.js";

const configuredOrigins = [
  ...env.FRONTEND_URL.split(",").map((origin) => origin.trim()),
  env.REPLIT_DEV_DOMAIN ? `https://${env.REPLIT_DEV_DOMAIN}` : undefined,
  ...(env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean)
    .map((domain) => (domain.startsWith("http") ? domain : `https://${domain}`)),
].filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

export const corsMiddleware = cors({
  credentials: true,
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.has(origin) ||
      env.NODE_ENV === "development"
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
});