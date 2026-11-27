import { z } from "zod";

// Validamos los datos que recibe el backend al registrar un usuario.
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),

  email: z
    .string()
    .email("El correo electrónico no es válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Validamos los datos que recibe el backend al iniciar sesión.
export const loginSchema = z.object({
  email: z
    .string()
    .email("El correo electrónico no es válido"),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

// Inferimos los tipos de TypeScript a partir de los esquemas.
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;