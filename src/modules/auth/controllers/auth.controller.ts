import type { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";

// Controlador para registrar usuarios.
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validamos los datos que llegan en la solicitud.
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Datos de registro inválidos",
        errors: validation.error.issues,
      });
      return;
    }

    const result = await registerUser(validation.data);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      ...result,
    });
  } catch (error) {
    // Detectamos si el correo ya existe en PostgreSQL.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        message: "El correo electrónico ya está registrado",
      });
      return;
    }

    next(error);
  }
};

// Controlador para iniciar sesión.
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validamos los datos de inicio de sesión.
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Datos de inicio de sesión inválidos",
        errors: validation.error.issues,
      });
      return;
    }

    const result = await loginUser(validation.data);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      ...result,
    });
  } catch (error) {
    // Las credenciales incorrectas generan una respuesta 401.
    if (
      error instanceof Error &&
      error.message === "Credenciales inválidas"
    ) {
      res.status(401).json({
        message: "Correo o contraseña incorrectos",
      });
      return;
    }

    next(error);
  }
};
// Controlador para consultar al usuario autenticado.
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as Request & { userId?: string }).userId;

    if (!userId) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    const user = await getCurrentUser(userId);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};