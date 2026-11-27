import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/config/database.js", () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from "../../../src/config/database.js";
import { getBalancesByUserId } from "../../../src/modules/wallet/services/wallet.service.js";

describe("Wallet service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the user has no wallet", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [],
    } as never);

    const result = await getBalancesByUserId("user-id");

    expect(result).toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("returns the wallet and its balances", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [{ id: "wallet-id" }],
      } as never)
      .mockResolvedValueOnce({
        rows: [],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            code: "ARS",
            name: "Peso argentino",
            symbol: "$",
            amount: "0.00",
          },
          {
            code: "EUR",
            name: "Euro",
            symbol: "€",
            amount: "0.00",
          },
          {
            code: "USD",
            name: "Dólar estadounidense",
            symbol: "$",
            amount: "0.00",
          },
        ],
      } as never);

    const result = await getBalancesByUserId("user-id");

    expect(result).toEqual({
      walletId: "wallet-id",
      balances: [
        {
          code: "ARS",
          name: "Peso argentino",
          symbol: "$",
          amount: "0.00",
        },
        {
          code: "EUR",
          name: "Euro",
          symbol: "€",
          amount: "0.00",
        },
        {
          code: "USD",
          name: "Dólar estadounidense",
          symbol: "$",
          amount: "0.00",
        },
      ],
    });

    expect(pool.query).toHaveBeenCalledTimes(3);
  });
});