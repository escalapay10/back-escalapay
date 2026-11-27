import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authenticateToken } from "../../../middleware/auth.middleware.js";

const router = Router();

// Ruta para registrar un usuario.
router.post("/register", register);

// Ruta para iniciar sesión.
router.post("/login", login);

// Ruta protegida para consultar el usuario autenticado.
router.get("/me", authenticateToken, getMe);

export default router;