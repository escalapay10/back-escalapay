import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

const { mockRegisterUser, mockLoginUser, mockGetCurrentUser } = vi.hoisted(() => ({
  mockRegisterUser: vi.fn(),
  mockLoginUser: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock("../../../src/modules/auth/services/auth.service.js", () => ({
  registerUser: mockRegisterUser,
  loginUser: mockLoginUser,
  getCurrentUser: mockGetCurrentUser,
}));

import {
  register,
  login,
  getMe,
} from "../../../src/modules/auth/controllers/auth.controller.js";

describe("Auth Controller", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = { body: {} } as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();
  });

  it("Debe registrar un usuario correctamente", async () => {
    mockRegisterUser.mockResolvedValue({
      user: { id: "user-123", name: "Mariana", email: "mariana@test.com" },
      token: "token-123",
    });

    req.body = {
      name: "Mariana",
      email: "mariana@test.com",
      password: "Password123",
    };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("Debe rechazar datos inválidos al registrar", async () => {
    req.body = {
      name: "M",
      email: "correo-invalido",
      password: "123",
    };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it("Debe responder 409 si el correo ya existe", async () => {
    mockRegisterUser.mockRejectedValue({ code: "23505" });

    req.body = {
      name: "Mariana",
      email: "mariana@test.com",
      password: "Password123",
    };

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("Debe iniciar sesión correctamente", async () => {
    mockLoginUser.mockResolvedValue({
      user: { id: "user-123", name: "Mariana", email: "mariana@test.com" },
      token: "token-123",
    });

    req.body = {
      email: "mariana@test.com",
      password: "Password123",
    };

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it("Debe rechazar datos inválidos en login", async () => {
    req.body = {
      email: "correo-invalido",
      password: "",
    };

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  it("Debe responder 401 ante credenciales inválidas", async () => {
    mockLoginUser.mockRejectedValue(new Error("Credenciales inválidas"));

    req.body = {
      email: "mariana@test.com",
      password: "Incorrecta123",
    };

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("Debe devolver el perfil del usuario autenticado", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user-123",
      name: "Mariana",
      email: "mariana@test.com",
    });

    req = { body: {}, userId: "user-123" } as Request & { userId: string };

    await getMe(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: "user-123",
        name: "Mariana",
        email: "mariana@test.com",
      },
    });
  });

  it("Debe rechazar la consulta del perfil si no hay userId", async () => {
    req = { body: {} } as Request;

    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});