import { z } from "zod";

// Validate the information submitted by a customer.
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[0-9\s()-]+$/, "Please enter a valid phone number"),

  message: z
    .string()
    .trim()
    .max(2000, "Message cannot exceed 2000 characters")
    .optional(),

  productId: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be positive")
    .safe("Product ID is outside the supported range"),
});

// Infer the TypeScript type directly from the schema.
export type EnquiryInput = z.infer<typeof enquirySchema>;
