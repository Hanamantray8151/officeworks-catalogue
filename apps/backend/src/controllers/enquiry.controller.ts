import type { Request, Response, NextFunction } from "express";

import { enquirySchema } from "../validators/enquiry.schema";

import {
  submitEnquiry,
  ProductNotFoundError,
} from "../services/enquiry.service";

// POST /api/enquiries
export async function submitEnquiryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Step 1: Validate the incoming request body.
    const validationResult = enquirySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        error: "Invalid enquiry details",
        details: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });

      return;
    }

    // Step 2: Process the validated enquiry.
    await submitEnquiry(validationResult.data);

    // Step 3: Respond only after successful processing.
    res.status(200).json({
      message: "Thank you for your enquiry!",
    });
  } catch (error) {
    // Step 4: Handle enquiries for nonexistent products.
    if (error instanceof ProductNotFoundError) {
      res.status(404).json({
        error: "Product not found",
      });

      return;
    }

    // Forward unexpected failures to error middleware.
    next(error);
  }
}
