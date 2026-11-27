import { Pool } from "pg";
import dotenv from "dotenv";

// Cargamos las variables de entorno para no exponer
// credenciales de la base de datos directamente en el código.
dotenv.config();

// Creamos un pool de conexiones para reutilizar conexiones
// con PostgreSQL en lugar de abrir una nueva cada vez.
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Escuchamos errores inesperados en conexiones inactivas
// para evitar que pasen desapercibidos.
pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error);
});