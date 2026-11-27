import { pool } from "../config/database.js";
import fs from "node:fs/promises";
import path from "node:path";
// Crea la tabla que permitirá llevar el registro de las migraciones ejecutadas.
const createMigrationsTable = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};
// Consultamos qué migraciones ya se ejecutaron para evitar repetirlas.
const getExecutedMigrations = async (): Promise<string[]> => {
  const result = await pool.query(
    "SELECT migration_name FROM schema_migrations ORDER BY id"
  );

  // Extraemos únicamente los nombres de las migraciones registradas.
  return result.rows.map((row) => row.migration_name as string);
};
// Leemos los archivos SQL que existen en nuestra carpeta de migraciones.
const getMigrationFiles = async (): Promise<string[]> => {
  const migrationsDirectory = path.join(
    process.cwd(),
    "src",
    "database",
    "migrations"
  );

  const files = await fs.readdir(migrationsDirectory);

  // Filtramos solo los archivos SQL y los ordenamos cronológicamente.
  return files
    .filter((file) => file.endsWith(".sql"))
    .sort();
};
// Ejecutamos una migración y registramos su ejecución dentro de una transacción.
const runMigration = async (
  migrationName: string,
  migrationSql: string
): Promise<void> => {
  // Reservamos una conexión para controlar toda la transacción.
  const client = await pool.connect();

  try {
    // Iniciamos la transacción.
    await client.query("BEGIN");

    // Ejecutamos el contenido del archivo SQL.
    await client.query(migrationSql);

    // Registramos la migración como ejecutada.
    await client.query(
      "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
      [migrationName]
    );

    // Confirmamos los cambios.
    await client.query("COMMIT");

    console.log(`Migración ejecutada: ${migrationName}`);
  } catch (error) {
    // Si algo falla, revertimos los cambios de esta migración.
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Liberamos la conexión para que pueda reutilizarse.
    client.release();
  }
};
// Coordina el proceso completo de ejecución de las migraciones.
const runMigrations = async (): Promise<void> => {
  // Aseguramos que exista la tabla de control.
  await createMigrationsTable();

  // Consultamos las migraciones que ya se ejecutaron.
  const executedMigrations = await getExecutedMigrations();

  // Obtenemos todos los archivos SQL disponibles.
  const migrationFiles = await getMigrationFiles();

  // Identificamos las migraciones que aún no se han ejecutado.
  const pendingMigrations = migrationFiles.filter(
    (file) => !executedMigrations.includes(file)
  );

  if (pendingMigrations.length === 0) {
    console.log("No hay migraciones pendientes.");
    return;
  }

  // Ejecutamos cada migración pendiente en orden.
  for (const migrationFile of pendingMigrations) {
    const migrationPath = path.join(
      process.cwd(),
      "src",
      "database",
      "migrations",
      migrationFile
    );

    // Leemos el contenido del archivo SQL.
    const migrationSql = await fs.readFile(migrationPath, "utf-8");

    // Ejecutamos y registramos la migración.
    await runMigration(migrationFile, migrationSql);
  }

  console.log("Proceso de migraciones finalizado.");
};
// Ejecutamos las migraciones y gestionamos el cierre de las conexiones.
runMigrations()
  .catch((error: unknown) => {
    console.error("Error al ejecutar las migraciones:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Cerramos el pool al finalizar el proceso.
    await pool.end();
  });