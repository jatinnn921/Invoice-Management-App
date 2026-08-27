import express from "express";
import { env } from "./config/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use("/api", routes);

app.get("/", (_request, response) => {
  response.json({
    name: "Invoice Management API",
    status: "running",
  });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  process.stdout.write(
    `Invoice Management API listening on port ${env.PORT}\n`,
  );
});

function shutdown() {
  server.close(async () => {
    const { prisma } = await import("./config/prisma.js");
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);