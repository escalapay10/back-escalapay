 INSERT INTO balances (wallet_id, currency_id, amount)
SELECT
    w.id,
    c.id,
    0.00
FROM wallets w
CROSS JOIN currencies c
WHERE c.code IN ('USD', 'EUR', 'ARS')
ON CONFLICT (wallet_id, currency_id) DO NOTHING;