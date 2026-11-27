import { pool } from "../../../config/database.js";

export const getBalancesByUserId = async (userId: string) => {
  const walletResult = await pool.query(
    "SELECT id FROM wallets WHERE user_id = $1",
    [userId]
  );

  if (walletResult.rows.length === 0) {
    return null;
  }

  const walletId = walletResult.rows[0].id;

  await pool.query(
    `INSERT INTO balances (wallet_id, currency_id, amount)
     SELECT $1, c.id, 0.00
     FROM currencies c
     WHERE c.code IN ('USD', 'EUR', 'ARS')
     ON CONFLICT (wallet_id, currency_id) DO NOTHING`,
    [walletId]
  );

  const balancesResult = await pool.query(
    `SELECT
       c.code,
       c.name,
       c.symbol,
       b.amount
     FROM balances b
     INNER JOIN currencies c ON c.id = b.currency_id
     WHERE b.wallet_id = $1
     ORDER BY c.code`,
    [walletId]
  );

  return {
    walletId,
    balances: balancesResult.rows,
  };
};