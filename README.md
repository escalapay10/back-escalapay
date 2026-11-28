# EscalaPay – Backend 💱

Backend de EscalaPay, una plataforma orientada a la gestión de pagos y operaciones financieras. Este repositorio contiene la aplicación Express, la autenticación de usuarios, la gestión inicial de wallets y balances, y los servicios de consulta de tipos de cambio, con validación de datos, proveedores externos, fallback y caché en memoria.

## 🛠️ Tecnologías

- Node.js
- Express
- TypeScript
- PostgreSQL
- dotenv
- Zod para validación de datos.
- Vitest para pruebas automatizadas.
- Supertest para pruebas HTTP de la aplicación.
- JWT para autenticación.
- bcrypt para el manejo seguro de contraseñas.

## 📁 Estructura del proyecto

```text
src/
├── client/                   # Integraciones con proveedores externos
├── config/                   # Configuración de conexión a PostgreSQL
├── database/
│   ├── migrations/            # Migraciones SQL
│   ├── migrate.ts             # Ejecutor de migraciones
│   └── testConnection.ts      # Verificación de conexión a DB
├── errors/                   # Errores del cliente HTTP y del servicio FX
├── middleware/
│   ├── auth.middleware.ts     # Autenticación mediante JWT
│   └── errorHandler.ts       # Manejo centralizado de errores
├── modules/
│   ├── auth/
│   │   ├── controllers/       # Controladores de autenticación
│   │   ├── routes/            # Rutas de autenticación
│   │   ├── schemas/            # Validaciones de autenticación
│   │   └── services/           # Lógica de autenticación
│   └── wallet/
│       ├── controllers/       # Controladores de Wallet
│       ├── routes/            # Rutas de Wallet
│       └── services/           # Lógica de balances
├── schemas/                  # Validaciones compartidas
├── services/
│   └── fxService.ts           # Servicio de tipos de cambio
├── types/                    # Contratos y tipos compartidos
├── utils/                    # Logger, cliente HTTP y caché FX
├── app.ts
└── server.ts

tests/
├── client/
├── middleware/
├── modules/
│   ├── auth/
│   └── wallet/
├── services/
├── utils/
├── app.test.ts
└── tsconfig.json
```

## 📋 Requisitos previos

Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js 20 o superior, utilizando una versión compatible con las dependencias instaladas.
- npm
- Git
- PostgreSQL

## 📦 Instalación

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

## ⚙️ Variables de entorno

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.

```env
PORT=3000
LOG_LEVEL=info
EXCHANGE_RATE_API_KEY=
FX_CACHE_TTL_MS=300000

DATABASE_URL=
JWT_SECRET=
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor. El valor predeterminado es `3000`. |
| `LOG_LEVEL` | Nivel mínimo de logs: `debug`, `info`, `warn` o `error`. Admite `silent` para desactivarlos. El valor predeterminado es `info`. |
| `EXCHANGE_RATE_API_KEY` | Clave necesaria para consultar ExchangeRate-API, el proveedor secundario. |
| `FX_CACHE_TTL_MS` | Tiempo de validez de la caché en milisegundos. Si falta o no es un número positivo y finito, se utilizan `300000` ms, equivalentes a cinco minutos. |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. |
| `JWT_SECRET` | Clave secreta utilizada para firmar y verificar los JWT. |

Frankfurter no requiere API key. La clave de ExchangeRate-API se obtiene desde la cuenta del proveedor y debe configurarse en el entorno correspondiente.

El servidor carga las variables del archivo `.env` mediante dotenv.

No subir archivos `.env` ni credenciales reales al repositorio. `.env.example` documenta la configuración sin incluir secretos.

## 🚀 Ejecución

En desarrollo:

```bash
npm run dev
```

Para compilar y ejecutar la aplicación:

```bash
npm run build
npm run start
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecuta el servidor en modo desarrollo utilizando tsx watch. |
| `npm run build` | Compila el código TypeScript. |
| `npm run start` | Ejecuta la versión compilada del servidor. |
| `npm run typecheck` | Verifica los tipos de TypeScript sin generar archivos. |
| `npm run migrate` | Ejecuta las migraciones pendientes de la base de datos. |
| `npm test` | Ejecuta la suite de tests con Vitest. |
| `npm run test:watch` | Ejecuta Vitest en modo observación durante el desarrollo. |

## 🗄️ Base de datos y migraciones

EscalaPay utiliza PostgreSQL para almacenar la información persistente de la aplicación.

La conexión se centraliza en `src/config/database.ts`, utilizando un pool de conexiones de PostgreSQL.

Las migraciones se encuentran en:

```text
src/database/migrations/
```

El sistema de migraciones permite aplicar cambios estructurales y registrar las migraciones ejecutadas para evitar repetirlas.

### Migraciones implementadas

- `001_create_initial_schema.sql`: creación de la estructura inicial de la base de datos.
- `002_seed_currencies.sql`: inserción de las monedas iniciales.
- `003_seed_initial_balances.sql`: creación de balances iniciales en cero para las wallets existentes.

Las monedas contempladas inicialmente son:

| Código | Moneda |
|---|---|
| USD | Dólar estadounidense |
| EUR | Euro |
| ARS | Peso argentino |

### Ejecutar migraciones

Una vez configurada la conexión a PostgreSQL:

```bash
npm run migrate
```

El ejecutor de migraciones identifica los archivos pendientes, los ejecuta y registra su aplicación en la base de datos.

La migración de balances iniciales es idempotente, por lo que no duplica balances existentes.

## 🔐 Módulo de autenticación

El módulo de autenticación permite registrar usuarios, iniciar sesión y consultar el perfil del usuario autenticado.

### Endpoints

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Inicio de sesión | No |
| GET | `/api/auth/me` | Consulta del perfil autenticado | Sí |

### Registro

**Endpoint:**

```http
POST /api/auth/register
```

Ejemplo de solicitud:

```json
{
  "name": "Usuario Prueba",
  "email": "wallet.test@example.com",
  "password": "WalletTest123"
}
```

Respuesta exitosa:

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "name": "Usuario Prueba",
    "email": "wallet.test@example.com"
  },
  "token": "jwt"
}
```

El registro crea el usuario y su wallet asociada.

### Inicio de sesión

**Endpoint:**

```http
POST /api/auth/login
```

Ejemplo de solicitud:

```json
{
  "email": "wallet.test@example.com",
  "password": "WalletTest123"
}
```

Respuesta exitosa:

```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "uuid",
    "name": "Usuario Prueba",
    "email": "wallet.test@example.com"
  },
  "token": "jwt"
}
```

### Consulta del perfil

**Endpoint:**

```http
GET /api/auth/me
```

Requiere un token JWT válido.

### Autenticación mediante JWT

Las rutas protegidas utilizan JWT enviado mediante el header:

```http
Authorization: Bearer <token>
```

El token tiene una duración de un día.

Actualmente no se implementa refresh token.

Las contraseñas no se exponen en las respuestas de la API.

## 💰 Módulo Wallet

El módulo Wallet permite consultar los balances asociados a la wallet del usuario autenticado.

Cada usuario tiene una wallet asociada, y esta puede tener balances correspondientes a diferentes monedas.

### Endpoint de consulta de balances

```http
GET /api/wallet/balances
```

<text color="success" weight="medium">Requiere autenticación mediante JWT.</text>

El usuario se identifica a partir del token de autenticación. El Frontend no necesita enviar el `walletId`, evitando que un usuario pueda consultar la wallet de otro usuario mediante el envío de identificadores externos.

### Ejemplo de solicitud

```http
GET http://localhost:3000/api/wallet/balances
```

Header:

```http
Authorization: Bearer <token>
```

### Respuesta exitosa

```json
{
  "walletId": "uuid",
  "balances": [
    {
      "code": "ARS",
      "name": "Peso argentino",
      "symbol": "$",
      "amount": "0.00"
    },
    {
      "code": "EUR",
      "name": "Euro",
      "symbol": "€",
      "amount": "0.00"
    },
    {
      "code": "USD",
      "name": "Dólar estadounidense",
      "symbol": "$",
      "amount": "0.00"
    }
  ]
}
```

### Funcionamiento

- La ruta está protegida mediante middleware de autenticación JWT.
- El usuario se identifica mediante el token.
- Se consulta la wallet asociada al usuario autenticado.
- Se consultan los balances relacionados con la wallet.
- Se contemplan las monedas USD, EUR y ARS.
- Si falta alguno de los balances iniciales, el servicio lo crea con valor cero.
- La creación de balances utiliza una operación idempotente para evitar duplicados.
- Los balances se devuelven junto con la información de la moneda.
- Los montos se manejan como strings en las respuestas para conservar la representación decimal.

### Balances iniciales

Los balances iniciales se crean en cero.

Actualmente no se registra una operación financiera DEPOSIT para inicializar los fondos. El módulo implementa la creación y consulta de balances, mientras que el registro de depósitos y las operaciones financieras pertenecen al alcance de los siguientes hitos.

## 💱 Servicio de tipos de cambio

El servicio `getFxRates(base, targets)` coordina dos proveedores y devuelve las tasas con un formato compartido:

- **[Frankfurter v2](https://frankfurter.dev/):** proveedor principal.
- **[ExchangeRate-API v6](https://www.exchangerate-api.com/docs/standard-requests):** proveedor secundario.

### Flujo de consulta

1. Valida y normaliza la moneda base y las monedas de destino.
2. Elimina destinos duplicados y busca una respuesta vigente en la caché.
3. Si no encuentra una respuesta vigente, consulta Frankfurter.
4. Ante errores HTTP, de red, de timeout o de validación de la respuesta principal, intenta con ExchangeRate-API.
5. Guarda los resultados exitosos en la caché y los devuelve.
6. Si también falla el respaldo, registra el fallo y lanza `FxServiceError`.

La moneda base no puede aparecer entre los destinos. Las solicitudes inválidas se rechazan antes de consultar la caché o los proveedores. Los errores inesperados del código principal se propagan sin activar el fallback.

Las respuestas externas se validan con Zod. Cada cliente comprueba que la moneda base y los destinos recibidos correspondan a la solicitud.

### Cliente HTTP

El cliente reutilizable `httpGet()` utiliza fetch nativo y permite peticiones GET con encabezados adicionales y timeout configurable.

- El timeout predeterminado es de **cuatro segundos por petición**, incluida la lectura de la respuesta.
- Distingue errores HTTP, de red o transferencia, de timeout y de JSON inválido mediante `HttpClientError`.
- Devuelve `unknown` para que cada integración valide la estructura recibida.
- Se permite **un reintento por proveedor**, después de esperar 500 ms, ante errores de red, timeout o estados HTTP `408`, `500`, `502`, `503` y `504`. Si los dos intentos de ambos proveedores agotan su timeout, la consulta puede tardar aproximadamente 17 segundos.

### Caché en memoria

La caché utiliza un `Map` dentro del proceso de Node.js. No requiere PostgreSQL ni servicios adicionales.

- Su duración predeterminada es de **cinco minutos**, configurable mediante `FX_CACHE_TTL_MS`.
- Identifica cada consulta por la moneda base y la combinación completa de destinos, independientemente del orden de estos.
- Guarda resultados exitosos de cualquiera de los proveedores, conservando su origen y fecha.
- No devuelve entradas vencidas: las elimina al consultarlas y limpia las vencidas al guardar nuevos resultados.
- El vencimiento no genera consultas automáticas; la siguiente solicitud obtiene los datos nuevos.
- Se vacía al reiniciar el servidor. Cada instancia del backend mantiene su propia caché.

Una entrada para `EUR → USD, ARS` no se reutiliza para una consulta de `EUR → USD`. La caché es temporal y no reemplaza el historial persistente de tasas.

### Contrato interno

Cada tasa utiliza el contrato `FxRate`:

```typescript
interface FxRate {
    base: string
    quote: string
    rate: number
    date: string
    provider: "frankfurter" | "exchange-rate-api"
}
```

`date` representa la fecha de referencia o actualización informada por el proveedor, no el momento en que nuestro backend realizó la consulta.

Estos proveedores ofrecen tasas de referencia. Realizar una petición nueva no garantiza una cotización de mercado en tiempo real ni fija las condiciones de una operación financiera.

### Endpoint de consulta de tasas

```http
GET /api/rates?from=USD&to=ARS
```

El endpoint consulta un par de monedas mediante el servicio FX, reutilizando la caché y el fallback entre proveedores.

La consulta requiere autenticación mediante JWT. Enviar el encabezado:

```http
Authorization: Bearer <token>
```

Si el token falta, es inválido o venció, el middleware de autenticación responde con HTTP 401.

#### Parámetros de consulta

| Parámetro | Tipo | Descripción |
|---|---|---|
| `from` | string | Moneda de origen. Obligatoria. |
| `to` | string | Moneda de destino. Obligatoria y distinta de la moneda de origen. |

Los códigos deben tener tres letras. Se eliminan los espacios al inicio y al final y se convierten a mayúsculas antes de consultar el servicio.

#### Respuesta exitosa — HTTP 200

Ejemplo ilustrativo:

```json
{
  "from": "USD",
  "to": "ARS",
  "rate": 1050.25,
  "provider": "frankfurter",
  "respondedAt": "2026-11-26T16:30:00.000Z"
}
```

- La respuesta es un objeto directo, sin una propiedad contenedora `data`.
- `rate` es un número e indica cuántas unidades de `to` equivalen a una unidad de `from`. Se conserva el valor numérico recibido del proveedor, sin redondearlo para la presentación.
- `provider` puede ser `frankfurter` o `exchange-rate-api`.
- `respondedAt` es una fecha ISO generada cuando el controlador prepara la respuesta. Indica cuándo respondió EscalaPay, incluso si las tasas provienen de la caché; no representa la fecha de publicación de la tasa ni una nueva consulta al proveedor.

#### Errores del endpoint

| Estado HTTP | `code` | Situación |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Faltan parámetros, su formato es inválido o las monedas de origen y destino son iguales. |
| 503 | `FX_PROVIDERS_UNAVAILABLE` | El servicio no pudo obtener las tasas de ninguno de los proveedores. |

Los errores conocidos de Rates utilizan el formato `{ message, code }`. Por ejemplo:

```json
{
  "message": "Indicá monedas de origen y destino válidas y distintas",
  "code": "VALIDATION_ERROR"
}
```

Los errores inesperados se derivan al middleware general de errores de la aplicación.

## 📝 Logger

El Logger centralizado genera registros JSON con fecha ISO, nivel, mensaje y contexto adicional. El servicio FX lo utiliza para registrar fallos y el uso del proveedor de respaldo.

- `debug` e `info` escriben en stdout.
- `warn` y `error` escriben en stderr.
- El nivel mínimo se configura mediante `LOG_LEVEL`.
- Oculta valores de propiedades sensibles, como `password`, `token` y `apiKey`.
- Oculta la clave incluida en el formato de URL de ExchangeRate-API utilizado por la integración.
- Contempla la serialización de errores, valores BigInt y referencias circulares o repetidas.

La sanitización es una protección adicional: no se deben registrar credenciales, datos bancarios, información completa de tarjetas ni respuestas externas completas. No detecta cualquier secreto incluido en un texto arbitrario.

## 🧪 Testing

Las pruebas utilizan Vitest y se encuentran en `tests/`.

Incluyen:

- Aplicación y middleware de errores.
- Logger.
- Cliente HTTP.
- Clientes de proveedores.
- Servicio FX.
- Caché.
- Autenticación.
- Middleware de autenticación JWT.
- Servicio Wallet.
- Controlador Wallet.
- Endpoint de Rates: respuesta exitosa, rechazo de monedas iguales y fallo de proveedores, con el servicio FX simulado.

Las consultas externas se simulan y las pruebas de timeout y vencimiento utilizan temporizadores simulados, sin esperar los tiempos reales.

### Ejecutar todos los tests

```bash
npm test
```

### Comprobar los tipos

```bash
npm run typecheck
```

Los tests tienen una configuración de TypeScript independiente porque están fuera de `src`. Para comprobar sus tipos:

```bash
npx tsc --project tests/tsconfig.json --noEmit
```

## 📍 Estado del proyecto

### Implementado

- Configuración inicial de Express y TypeScript.
- Configuración de variables de entorno.
- Manejo centralizado de errores.
- Logger centralizado con sanitización.
- Cliente HTTP reutilizable con timeout y errores identificables.
- Integración con Frankfurter y ExchangeRate-API.
- Validación de datos con Zod y normalización al contrato compartido `FxRate`.
- Servicio FX con fallback y caché en memoria.
- Consulta de tasas mediante `GET /api/rates`, con validación de parámetros y respuesta acordada para el Frontend.
- Configuración de PostgreSQL.
- Sistema de migraciones de base de datos.
- Creación y persistencia de usuarios.
- Registro e inicio de sesión.
- Autenticación mediante JWT.
- Middleware de autenticación para rutas protegidas.
- Creación de wallet asociada al usuario.
- Creación de balances iniciales en USD, EUR y ARS.
- Consulta autenticada de balances mediante `GET /api/wallet/balances`.
- Pruebas automatizadas de los módulos implementados.

### Pendientes

- Estandarización de los códigos de error de API.
- Configuración de CORS para la integración con Frontend.
- Despliegue del Backend.
- Implementación de operaciones financieras.
- Registro de transacciones y ledger.
- Depósitos, compras, ventas y operaciones de cambio.
- Reglas de cálculo, comisiones, precisión y atomicidad de operaciones.
- Persistencia y consulta del historial de tasas según la coordinación del equipo.
