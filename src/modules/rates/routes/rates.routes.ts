import { Router } from "express"
import { getRates } from "../controllers/rates.controllers.js"
import { authenticateToken } from "../../../middleware/auth.middleware.js"

const router = Router()

router.get("/", authenticateToken, getRates)

export default router