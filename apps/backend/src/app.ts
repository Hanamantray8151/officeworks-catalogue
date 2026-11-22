import express from "express";
import cors from "cors";

import productRouter from "./routes/product.routes";
import enquiryRouter from "./routes/enquiry.routes";

import { notFoundHandler, errorHandler } from "./middleware/error.middleware";

// Create the Express application.
const app = express();

// Disable the X-Powered-By response header.
app.disable("x-powered-by");

// Allow requests from the local Next.js frontend.
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }),
);

// Parse JSON request bodies with a size limit.
app.use(
  express.json({
    limit: "10kb",
  }),
);

// Health check endpoint.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "officeworks-catalogue-api",
  });
});

// Register product endpoints.
app.use("/api/products", productRouter);

// Register customer enquiry endpoints.
app.use("/api/enquiries", enquiryRouter);

// Handle unknown routes.
app.use(notFoundHandler);

// Centralized error handler must be last.
app.use(errorHandler);

export default app;
