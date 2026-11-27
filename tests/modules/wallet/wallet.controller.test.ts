import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

const { mockGetBalancesByUserId } = vi.hoisted(() => ({
  mockGetBalancesByUserId: vi.fn(),
}));

vi.mock("../../../src/modules/wallet/services/wallet.service.js", () => ({
  getBalancesByUserId: mockGetBalancesByUserId,
}));

import { getBalances } from "../../../src/modules/wallet/controllers/wallet.controller.js";

describe("Wallet Controller", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = { userId: "user-123" } as Request & { userId: string };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    next = vi.fn();
  });

  it("Debe devolver los balances del usuario correctamente", async () => {
    const walletData = {
      walletId: "wallet-123",
      balances: [
        { code: "ARS", name: "Peso argentino", symbol: "$", amount: "0.00" },
        { code: "EUR", name: "Euro", symbol: "€", amount: "0.00" },
        {
          code: "USD",
          name: "Dólar estadounidense",
          symbol: "$",
          amount: "0.00",
        },
      ],
    };

    mockGetBalancesByUserId.mockResolvedValue(walletData);

    await getBalances(req, res, next);

    expect(mockGetBalancesByUserId).toHaveBeenCalledWith("user-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(walletData);
  });

  it("Debe responder 404 si no existe la wallet", async () => {
    mockGetBalancesByUserId.mockResolvedValue(null);

    await getBalances(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Wallet not found",
    });
  });

  it("Debe enviar los errores al middleware", async () => {
    const error = new Error("Error de base de datos");

    mockGetBalancesByUserId.mockRejectedValue(error);

    await getBalances(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});