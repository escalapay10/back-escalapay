import type { Request, Response, NextFunction } from "express";
import { getBalancesByUserId } from "../services/wallet.service.js";

export const getBalances = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as Request & { userId: string }).userId;

    const walletData = await getBalancesByUserId(userId);

    if (!walletData) {
      return res.status(404).json({
        message: "Wallet not found",
      });
    }

    return res.status(200).json(walletData);
  } catch (error) {
    next(error);
  }
};