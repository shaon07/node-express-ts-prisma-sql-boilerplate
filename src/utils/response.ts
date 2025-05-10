import { Response } from "express";

export function sendSuccessResponse<T>(
  res: Response,
  statusCode: number,
  data: T | null,
  message: string,
  additionalFields: Record<string, any> = {}
): void {
  res.status(statusCode).json({
    data,
    message,
    ...additionalFields,
  });
}
