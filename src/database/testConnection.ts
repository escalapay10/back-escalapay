import { pool } from "../config/database.js";

// Verificamos que el backend pueda comunicarse con PostgreSQL.
const testConnection = async (): Promise<void> => {
  try {
    const result = await pool.query("SELECT NOW()");

    // PostgreSQL devuelve la fecha y hora de su servidor.
    console.log("Conexión exitosa a PostgreSQL:", result.rows[0]);

  } catch (error) {
    console.error("No fue posible conectar con PostgreSQL:", error);

  } finally {
    // Cerramos el pool porque este archivo solo es una prueba.
    await pool.end();
  }
};

testConnection();