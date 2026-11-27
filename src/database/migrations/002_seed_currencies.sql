-- =====================================================
-- MIGRACIÓN: insertar monedas iniciales de EscalaPay.
-- =====================================================

INSERT INTO currencies (code, name, symbol)
VALUES
    ('USD', 'Dólar estadounidense', '$'),
    ('EUR', 'Euro', '€'),
    ('ARS', 'Peso argentino', '$')
ON CONFLICT (code) DO NOTHING;