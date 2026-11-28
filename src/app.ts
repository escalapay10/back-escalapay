import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import walletRoutes from "./modules/wallet/routes/wallet.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Escala Pay API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);

app.use(errorHandler);

export default app;