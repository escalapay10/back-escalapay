import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQuery, mockConnect, mockClientQuery, mockRelease, mockHash, mockCompare } =
  vi.hoisted(() => ({
    mockQuery: vi.fn(),
    mockConnect: vi.fn(),
    mockClientQuery: vi.fn(),
    mockRelease: vi.fn(),
    mockHash: vi.fn(),
    mockCompare: vi.fn(),
  }));

vi.mock("../../../src/config/database.js", () => ({
  pool: {
    query: mockQuery,
    connect: mockConnect,
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: mockHash,
    compare: mockCompare,
  },
}));

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../../../src/modules/auth/services/auth.service.js";

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";

    mockConnect.mockResolvedValue({
      query: mockClientQuery,
      release: mockRelease,
    });
  });

  it("Debe registrar un usuario y crear su wallet", async () => {
    mockHash.mockResolvedValue("hashed-password");

    mockClientQuery
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-123",
            name: "Mariana",
            email: "mariana@test.com",
          },
        ],
      }) // INSERT user
      .mockResolvedValueOnce({ rows: [] }) // INSERT wallet
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    const result = await registerUser({
      name: "Mariana",
      email: "mariana@test.com",
      password: "Password123",
    });

    expect(result.user.email).toBe("mariana@test.com");
    expect(result.user.id).toBe("user-123");
    expect(result.token).toBeDefined();
    expect(mockHash).toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalled();
  });

  it("Debe iniciar sesión con credenciales válidas", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: "user-123",
          name: "Mariana",
          email: "mariana@test.com",
          password_hash: "hashed-password",
        },
      ],
    });

    mockCompare.mockResolvedValue(true);

    const result = await loginUser({
      email: "mariana@test.com",
      password: "Password123",
    });

    expect(result.user.id).toBe("user-123");
    expect(result.token).toBeDefined();
    expect(mockCompare).toHaveBeenCalled();
  });

  it("Debe rechazar un usuario que no existe", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    await expect(
      loginUser({
        email: "inexistente@test.com",
        password: "Password123",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("Debe rechazar una contraseña incorrecta", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: "user-123",
          name: "Mariana",
          email: "mariana@test.com",
          password_hash: "hashed-password",
        },
      ],
    });

    mockCompare.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "mariana@test.com",
        password: "WrongPassword",
      })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("Debe obtener el usuario autenticado", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: "user-123",
          name: "Mariana",
          email: "mariana@test.com",
        },
      ],
    });

    const result = await getCurrentUser("user-123");

    expect(result.id).toBe("user-123");
    expect(result.name).toBe("Mariana");
    expect(mockQuery).toHaveBeenCalled();
  });

  it("Debe rechazar si el usuario no existe al consultar su perfil", async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    await expect(getCurrentUser("user-inexistente")).rejects.toThrow(
      "Usuario no encontrado"
    );
  });
});