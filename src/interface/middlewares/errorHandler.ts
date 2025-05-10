import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import { logger } from "../../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.info(`Operational error: ${err.message}`);
    res.status(err.statusCode).json({
      status: err.statusCode >= 400 && err.statusCode < 500 ? "fail" : "error",
      message: err.message,
    });
    return;
  }

  logger.error("Unexpected error:", err);
  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
  });
};
