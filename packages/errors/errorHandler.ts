import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { logger } from "../logging/logger";
import { ZodError } from "zod";

export * from "./AppError";

export function handleApiError(error: unknown, moduleContext = "API") {
  const timestamp = new Date().toISOString();

  if (error instanceof ZodError) {
    logger.warn(`Validation failure in ${moduleContext}`, {
      module: moduleContext,
      data: error.format(),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request payload failed schema validation",
          details: error.flatten(),
        },
        meta: { timestamp },
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`Server error in ${moduleContext}: ${error.message}`, error, {
        module: moduleContext,
        data: error.details,
      });
    } else {
      logger.warn(`Operational client error in ${moduleContext}: ${error.message}`, {
        module: moduleContext,
        data: error.details,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
        meta: { timestamp },
      },
      { status: error.statusCode }
    );
  }

  // Unhandled / unexpected error
  const unhandled = error instanceof Error ? error : new Error(String(error));
  logger.error(`Unhandled exception in ${moduleContext}: ${unhandled.message}`, unhandled, {
    module: moduleContext,
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected internal server error occurred"
            : unhandled.message,
      },
      meta: { timestamp },
    },
    { status: 500 }
  );
}
