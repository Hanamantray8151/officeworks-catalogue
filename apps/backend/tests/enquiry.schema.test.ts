import { describe, expect, it } from "vitest";

import { enquirySchema } from "../src/validators/enquiry.schema";

// A valid enquiry that we can modify for each test.
const validEnquiry = {
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "9876543210",
  productId: 1,
  message: "Is this product available?",
};

describe("Customer Enquiry Validation", () => {
  describe("Valid submissions", () => {
    it("accepts a valid enquiry", () => {
      const result = enquirySchema.safeParse(validEnquiry);

      expect(result.success).toBe(true);
    });

    it("accepts an enquiry without an optional message", () => {
      const { message, ...enquiryWithoutMessage } = validEnquiry;

      const result = enquirySchema.safeParse(enquiryWithoutMessage);

      expect(result.success).toBe(true);
    });
  });

  describe("Name validation", () => {
    it("rejects a missing name", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        name: undefined,
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty name", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        name: "",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Email validation", () => {
    it("rejects a missing email", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        email: undefined,
      });

      expect(result.success).toBe(false);
    });

    it("rejects an invalid email address", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        email: "invalid-email",
      });

      expect(result.success).toBe(false);
    });

    it("accepts a correctly formatted email", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        email: "customer@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Phone validation", () => {
    it("rejects a missing phone number", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        phone: undefined,
      });

      expect(result.success).toBe(false);
    });

    it("rejects an empty phone number", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        phone: "",
      });

      expect(result.success).toBe(false);
    });

    it("rejects a clearly invalid phone number", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        phone: "abc",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Product ID validation", () => {
    it("rejects a missing product ID", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        productId: undefined,
      });

      expect(result.success).toBe(false);
    });

    it("rejects a negative product ID", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        productId: -1,
      });

      expect(result.success).toBe(false);
    });

    it("rejects a zero product ID", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        productId: 0,
      });

      expect(result.success).toBe(false);
    });

    it("rejects a decimal product ID", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        productId: 1.5,
      });

      expect(result.success).toBe(false);
    });

    it("accepts a positive integer product ID", () => {
      const result = enquirySchema.safeParse({
        ...validEnquiry,
        productId: 10,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Malformed submissions", () => {
    it("rejects a null request body", () => {
      const result = enquirySchema.safeParse(null);

      expect(result.success).toBe(false);
    });

    it("rejects an empty request body", () => {
      const result = enquirySchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
