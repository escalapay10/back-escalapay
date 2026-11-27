# EscalaPay – Backend 💱

Backend de EscalaPay, una plataforma orientada a la gestión de pagos y operaciones financieras. Este repositorio contiene la aplicación Express y los servicios de consulta de tipos de cambio, con validación de datos, proveedores externos, fallback y caché en memoria.

## 🛠️ Tecnologías

- Node.js
- Express
- TypeScript
- dotenv
- Zod para validación de datos.
- Vitest para pruebas automatizadas.
- Supertest para pruebas HTTP de la aplicación.

## 📁 Estructura del proyecto

```text
src/
├── client/               # Integraciones con proveedores externos
├── errors/               # Errores del cliente HTTP y del servicio FX
├── middleware/
│   └── errorHandler.ts
├── schemas/              # Validaciones con Zod
├── services/
│   └── fxService.ts
├── types/                # Contratos y tipos compartidos
├── utils/                # Logger, cliente HTTP y caché FX
├── app.ts
└── server.ts

tests/
├── client/
├── middleware/
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
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor. El valor predeterminado es `3000`. |
| `LOG_LEVEL` | Nivel mínimo de logs: `debug`, `info`, `warn` o `error`. Admite `silent` para desactivarlos. El valor predeterminado es `info`. |
| `EXCHANGE_RATE_API_KEY` | Clave necesaria para consultar ExchangeRate-API, el proveedor secundario. |
| `FX_CACHE_TTL_MS` | Tiempo de validez de la caché en milisegundos. Si falta o no es un número positivo y finito, se utilizan `300000` ms, equivalentes a cinco minutos. |

Frankfurter no requiere API key. La clave de ExchangeRate-API se obtiene desde la cuenta del proveedor y debe configurarse en el entorno correspondiente. El servidor carga las variables del archivo `.env` mediante dotenv.

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
| `npm test` | Ejecuta la suite de tests con Vitest. |
| `npm run test:watch` | Ejecuta Vitest en modo observación durante el desarrollo. |

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
- Actualmente se realiza **un intento por proveedor**, sin reintentos automáticos. Si ambos agotan su timeout, la consulta puede tardar aproximadamente ocho segundos.

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

El servicio FX es interno. Los endpoints de tasas y el formato definitivo de las respuestas HTTP están pendientes de implementación y coordinación con el equipo.

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

Las pruebas utilizan Vitest y se encuentran en `tests/`. Incluyen la aplicación y su middleware de errores, el Logger, el cliente HTTP, los clientes de proveedores, el servicio FX y la caché.

Las consultas externas se simulan y las pruebas de timeout y vencimiento utilizan temporizadores simulados, sin esperar los tiempos reales.

Ejecutar todos los tests:

```bash
npm test
```

Comprobar los tipos del código de la aplicación:

```bash
npm run typecheck
```

Los tests tienen una configuración de TypeScript independiente porque están fuera de `src`. Para comprobar sus tipos:

```bash
npx tsc --project tests/tsconfig.json --noEmit
```

## 📍 Estado del proyecto

### Implementado

- Configuración inicial de Express, TypeScript, variables de entorno y manejo básico de errores.
- Logger centralizado con sanitización.
- Cliente HTTP reutilizable con timeout y errores identificables.
- Integración con Frankfurter y ExchangeRate-API.
- Validación de datos con Zod y normalización al contrato compartido `FxRate`.
- Servicio FX con fallback y caché en memoria.
- Pruebas automatizadas de las funcionalidades desarrolladas.

### Próximos pasos del módulo FX

- Definir e implementar la estrategia de reintentos para fallos transitorios.
- Acordar los contratos HTTP con el equipo de frontend y Backend 1.
- Exponer los endpoints de consulta de tasas.
- Coordinar la persistencia y consulta del historial en PostgreSQL con Backend 1.
