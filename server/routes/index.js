import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import clientsRouter from "./clients.js";

const router = Router();

router.get("/health", healthCheck);
router.use("/clients", clientsRouter);

export default router;