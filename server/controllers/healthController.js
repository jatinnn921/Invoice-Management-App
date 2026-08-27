import { prisma } from "../config/prisma.js";

export async function healthCheck(_request, response, next) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    next(error);
  }
}