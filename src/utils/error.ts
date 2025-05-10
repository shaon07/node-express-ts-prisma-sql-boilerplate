import { z } from "zod";
import { ValidationError } from "../errors/ValidationError";

export function handleZodError(error: unknown): void {
  if (error instanceof z.ZodError) {
    throw new ValidationError(
      `Validation failed: ${error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`
    );
  }
}
