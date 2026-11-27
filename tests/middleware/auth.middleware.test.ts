import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../../src/middleware/auth.middleware.js";

describe("Auth Middleware", () => {
  const secret = "test-secret";

  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;

    req = {
      headers: {},
    } as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();
  });

  it("Debe permitir el acceso con un token válido", () => {
    const token = jwt.sign({ sub: "user-123" }, secret);

    req.headers.authorization = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Debe rechazar una solicitud sin token", () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token de autenticación requerido",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("Debe rechazar un token inválido", () => {
    req.headers.authorization = "Bearer token-invalido";

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token inválido o expirado",
    });
    expect(next).not.toHaveBeenCalled();
  });
});