import { Router } from "express";
import { authenticateToken } from "../../../middleware/auth.middleware.js";
import { getBalances } from "../controllers/wallet.controller.js";

const router = Router();

router.get("/balances", authenticateToken, getBalances);

export default router;