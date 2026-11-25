import { type Request, type Response, type NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export default errorHandler;