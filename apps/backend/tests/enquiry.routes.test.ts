import { beforeEach, describe, expect, it, vi } from "vitest";

import request from "supertest";

// Mock the enquiry service before importing the app.
vi.mock("../src/services/enquiry.service", () => {
  class ProductNotFoundError extends Error {
    constructor(message = "Product not found") {
      super(message);
      this.name = "ProductNotFoundError";
    }
  }

  return {
    submitEnquiry: vi.fn(),
    ProductNotFoundError,
  };
});

import app from "../src/app";

import {
  submitEnquiry,
  ProductNotFoundError,
} from "../src/services/enquiry.service";

const mockSubmitEnquiry = vi.mocked(submitEnquiry);

const validEnquiry = {
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "9876543210",
  productId: 1,
  message: "Is this product available?",
};

describe("Customer Enquiry API", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Successful enquiry by default.
    mockSubmitEnquiry.mockResolvedValue(undefined);
  });

  describe("POST /api/enquiries", () => {
    it("accepts a valid customer enquiry", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send(validEnquiry);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        message: "Thank you for your enquiry!",
      });

      expect(mockSubmitEnquiry).toHaveBeenCalledOnce();
    });

    it("passes validated enquiry data to the service", async () => {
      await request(app).post("/api/enquiries").send(validEnquiry);

      expect(mockSubmitEnquiry).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alex Johnson",
          email: "alex@example.com",
          phone: "9876543210",
          productId: 1,
          message: "Is this product available?",
        }),
      );
    });

    it("accepts an enquiry without an optional message", async () => {
      const { message, ...enquiryWithoutMessage } = validEnquiry;

      const response = await request(app)
        .post("/api/enquiries")
        .send(enquiryWithoutMessage);

      expect(response.status).toBe(200);

      expect(mockSubmitEnquiry).toHaveBeenCalledOnce();
    });

    it("rejects a missing customer name", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          name: undefined,
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects an empty customer name", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          name: "",
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects an invalid email address", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects a missing phone number", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          phone: undefined,
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects an invalid product ID", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          productId: -1,
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects a decimal product ID", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          productId: 1.5,
        });

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("rejects an empty request body", async () => {
      const response = await request(app).post("/api/enquiries").send({});

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });

    it("returns HTTP 404 when the product does not exist", async () => {
      mockSubmitEnquiry.mockRejectedValueOnce(new ProductNotFoundError());

      const response = await request(app)
        .post("/api/enquiries")
        .send({
          ...validEnquiry,
          productId: 999,
        });

      expect(response.status).toBe(404);

      expect(mockSubmitEnquiry).toHaveBeenCalledOnce();
    });

    it("handles email delivery failures", async () => {
      mockSubmitEnquiry.mockRejectedValueOnce(
        new Error("SMTP connection failed"),
      );

      const response = await request(app)
        .post("/api/enquiries")
        .send(validEnquiry);

      expect(response.status).toBe(500);

      expect(mockSubmitEnquiry).toHaveBeenCalledOnce();
    });

    it("rejects malformed JSON", async () => {
      const response = await request(app)
        .post("/api/enquiries")
        .set("Content-Type", "application/json")
        .send('{"name": "Alex", invalid-json}');

      expect(response.status).toBe(400);

      expect(mockSubmitEnquiry).not.toHaveBeenCalled();
    });
  });
});
