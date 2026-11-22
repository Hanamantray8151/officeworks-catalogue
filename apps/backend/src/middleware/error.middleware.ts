import type { ErrorRequestHandler, RequestHandler } from "express";

import { env } from "../config/env";

// Handle requests that do not match any API route.
export const notFoundHandler: RequestHandler = (req, res): void => {
  res.status(404).json({
    error: "Route not found",
  });
};

// Handle unexpected application errors.
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
): void => {
  // Log the original error on the backend only.
  console.error("API error:", {
    method: req.method,
    path: req.originalUrl,
    error,
  });

  // Avoid sending another response if headers were sent.
  if (res.headersSent) {
    _next(error);
    return;
  }

  // Identify known upstream provider failures.
  if (
    error instanceof Error &&
    (error.message.startsWith("Product provider") ||
      error.message === "fetch failed")
  ) {
    res.status(502).json({
      error: "Product information is temporarily unavailable",
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  ) {
    res.status(400).json({
      message: "Invalid JSON request body.",
    });
    return;
  }

  // Return a safe message for all other unexpected errors.
  res.status(500).json({
    error: "An unexpected server error occurred",
    ...(env.NODE_ENV === "development" && {
      details: error instanceof Error ? error.message : "Unknown error",
    }),
  });
};
