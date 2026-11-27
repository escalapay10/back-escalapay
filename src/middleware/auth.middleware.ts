import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extendemos la solicitud para almacenar el ID del usuario autenticado.
interface AuthRequest extends Request {
  userId?: string;
}

// Middleware que verifica si el usuario está autenticado.
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authRequest = req as AuthRequest;

  // Obtenemos el token enviado en el encabezado Authorization.
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  if (!token) {
    res.status(401).json({ message: "Token de autenticación requerido" });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "Error de configuración del servidor" });
    return;
  }

  try {
    // Verificamos que el token sea válido.
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "object" || !decoded.sub) {
      res.status(401).json({ message: "Token inválido" });
      return;
    }

    // Guardamos el ID del usuario para los siguientes controladores.
    authRequest.userId = decoded.sub;

    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};