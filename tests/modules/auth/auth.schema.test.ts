import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../../../src/modules/auth/schemas/auth.schema.js";

describe("Auth Schemas", () => {
  describe("registerSchema", () => {
    it("Debe aceptar datos válidos de registro", () => {
      const result = registerSchema.safeParse({
        name: "Mariana",
        email: "mariana@test.com",
        password: "Password123",
      });

      expect(result.success).toBe(true);
    });

    it("Debe rechazar un correo inválido", () => {
      const result = registerSchema.safeParse({
        name: "Mariana",
        email: "correo-invalido",
        password: "Password123",
      });

      expect(result.success).toBe(false);
    });

    it("Debe rechazar una contraseña menor a 8 caracteres", () => {
      const result = registerSchema.safeParse({
        name: "Mariana",
        email: "mariana@test.com",
        password: "123",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("Debe aceptar datos válidos de login", () => {
      const result = loginSchema.safeParse({
        email: "mariana@test.com",
        password: "Password123",
      });

      expect(result.success).toBe(true);
    });

    it("Debe rechazar un correo inválido", () => {
      const result = loginSchema.safeParse({
        email: "correo-invalido",
        password: "Password123",
      });

      expect(result.success).toBe(false);
    });

    it("Debe rechazar una contraseña vacía", () => {
      const result = loginSchema.safeParse({
        email: "mariana@test.com",
        password: "",
      });

      expect(result.success).toBe(false);
    });
  });
});