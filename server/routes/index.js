import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import clientsRouter from "./clients.js";
import invoicesRouter from "./invoices.js";

const router = Router();

router.get("/health", healthCheck);
router.use("/clients", clientsRouter);
router.use("/invoices", invoicesRouter);

export default router;