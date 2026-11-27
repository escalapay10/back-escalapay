import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;