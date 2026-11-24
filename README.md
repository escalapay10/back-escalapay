# Escala Pay – Backend

Backend de Escala Pay, una plataforma orientada a la gestión de pagos y operaciones financieras. Este repositorio contiene el desarrollo de la API y su estructura inicial.

## Tecnologías

- Node.js
- Express
- TypeScript
- dotenv

## Estructura del proyecto

```text
src/
├── config/
├── database/
├── middleware/
│   └── errorHandler.ts
├── modules/
├── routes/
├── utils/
├── app.ts
└── server.ts
```

## Requisitos previos

Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/escalapay10/back-escalapay.git
```

Ingresar al directorio del proyecto:

```bash
cd back-escalapay
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.

```env
PORT=3000
```

## Ejecución en desarrollo

```bash
npm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecuta el servidor en modo desarrollo utilizando tsx watch. |
| `npm run build` | Compila el código TypeScript. |
| `npm run start` | Ejecuta la versión compilada del servidor. |
| `npm run typecheck` | Verifica los tipos de TypeScript sin generar archivos. |

## Estado del proyecto

Desarrollo correspondiente al Hito 1: configuración inicial, estructura base del backend, servidor Express, variables de entorno y manejo básico de errores.
