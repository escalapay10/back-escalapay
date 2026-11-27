-- =====================================================
-- TABLA: users
-- Almacena la información de los usuarios de EscalaPay.
-- =====================================================

CREATE TABLE users (
    -- Identificador único del usuario.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Nombre del usuario.
    name VARCHAR(100) NOT NULL,

    -- Correo único para identificar la cuenta.
    email VARCHAR(255) NOT NULL UNIQUE,

    -- Almacenará el hash de la contraseña, nunca la contraseña en texto plano.
    password_hash TEXT NOT NULL,

    -- Fecha de creación del registro.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Fecha de la última actualización del registro.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =====================================================
-- TABLA: currencies
-- Catálogo de las monedas disponibles en EscalaPay.
-- =====================================================

CREATE TABLE currencies (
    -- Identificador único de la moneda.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Código internacional de la moneda (USD, EUR, ARS).
    code VARCHAR(3) NOT NULL UNIQUE,

    -- Nombre descriptivo de la moneda.
    name VARCHAR(50) NOT NULL,

    -- Símbolo visual de la moneda.
    symbol VARCHAR(5) NOT NULL,

    -- Fecha de creación del registro.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =====================================================
-- TABLA: wallets
-- Representa la billetera asociada a cada usuario.
-- =====================================================

CREATE TABLE wallets (
    -- Identificador único de la billetera.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Cada billetera pertenece a un único usuario.
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),

    -- Fecha de creación de la billetera.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Fecha de la última actualización de la billetera.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- =====================================================
-- TABLA: balances
-- Almacena el saldo de cada moneda en una billetera.
-- =====================================================

CREATE TABLE balances (
    -- Identificador único del balance.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Billetera a la que pertenece este balance.
    wallet_id UUID NOT NULL REFERENCES wallets(id),

    -- Moneda a la que corresponde este balance.
    currency_id UUID NOT NULL REFERENCES currencies(id),

    -- Cantidad de dinero disponible en esta moneda.
    -- NUMERIC evita los errores de precisión de los tipos float.
    amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),

    -- Fecha de creación del balance.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Fecha de la última actualización del balance.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Una billetera solo puede tener un balance por moneda.
    UNIQUE (wallet_id, currency_id)
);