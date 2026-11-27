import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../../config/database.js";
import type { RegisterDTO, LoginDTO } from "../schemas/auth.schema.js";

// Definimos los datos públicos que devolveremos del usuario.
interface UserResponse {
  id: string;
  name: string;
  email: string;
}

// Generamos un token JWT para identificar al usuario autenticado.
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }

  return jwt.sign({ sub: userId }, secret, { expiresIn: "1d" });
};

// Registramos un nuevo usuario en la base de datos.
export const registerUser = async (data: RegisterDTO) => {
  const client = await pool.connect();

  try {
    // Iniciamos una transacción para guardar los datos relacionados.
    await client.query("BEGIN");

    // Encriptamos la contraseña antes de guardarla.
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Insertamos el usuario en la base de datos.
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [data.name, data.email.toLowerCase(), passwordHash]
    );

    const user: UserResponse = userResult.rows[0];

    // Creamos una wallet asociada al usuario.
    await client.query(
      `INSERT INTO wallets (user_id)
       VALUES ($1)`,
      [user.id]
    );

    await client.query("COMMIT");

    // Generamos el token de autenticación.
    const token = generateToken(user.id);

    return { user, token };
  } catch (error) {
    // Revertimos las operaciones si ocurre un error.
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Liberamos la conexión para que pueda reutilizarse.
    client.release();
  }
};

// Validamos las credenciales de un usuario para iniciar sesión.
export const loginUser = async (data: LoginDTO) => {
  // Buscamos al usuario por su correo electrónico.
  const result = await pool.query(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1`,
    [data.email.toLowerCase()]
  );

  // Si el usuario no existe, rechazamos el acceso.
  if (result.rows.length === 0) {
    throw new Error("Credenciales inválidas");
  }

  const userData = result.rows[0];

  // Comparamos la contraseña ingresada con el hash almacenado.
  const passwordIsValid = await bcrypt.compare(
    data.password,
    userData.password_hash
  );

  if (!passwordIsValid) {
    throw new Error("Credenciales inválidas");
  }

  // Solo devolvemos los datos públicos del usuario.
  const user: UserResponse = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
  };

  // Generamos un nuevo token para la sesión.
  const token = generateToken(user.id);

  return { user, token };
};
// Consultamos los datos públicos del usuario autenticado.
export const getCurrentUser = async (userId: string) => {
  const result = await pool.query(
    `SELECT id, name, email
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  return result.rows[0] as UserResponse;
};