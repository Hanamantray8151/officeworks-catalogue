import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import type { Product } from "../src/types/product";

// Mock the service before importing the Express app.
vi.mock("../src/services/product.service", () => ({
  getAllProducts: vi.fn(),
  getTopRatedProducts: vi.fn(),
  getProductsByCategory: vi.fn(),
  searchProducts: vi.fn(),
  getProductById: vi.fn(),
}));

import app from "../src/app";

import {
  getAllProducts,
  getTopRatedProducts,
  getProductsByCategory,
  searchProducts,
  getProductById,
} from "../src/services/product.service";

// Typed references to mocked service functions.
const mockGetAllProducts = vi.mocked(getAllProducts);
const mockGetTopRatedProducts = vi.mocked(getTopRatedProducts);
const mockGetProductsByCategory = vi.mocked(getProductsByCategory);
const mockSearchProducts = vi.mocked(searchProducts);
const mockGetProductById = vi.mocked(getProductById);

const products: Product[] = [
  {
    id: 1,
    title: "Classic Cotton Jacket",
    price: 49.99,
    description: "A comfortable jacket for everyday use.",
    category: "men's clothing",
    image: "https://example.com/jacket.jpg",
    rating: { rate: 4.5, count: 120 },
  },
  {
    id: 2,
    title: "Wireless Headphones",
    price: 79.99,
    description: "Bluetooth audio with clear sound.",
    category: "electronics",
    image: "https://example.com/headphones.jpg",
    rating: { rate: 4.9, count: 200 },
  },
  {
    id: 3,
    title: "Leather Backpack",
    price: 59.99,
    description: "A durable bag for travel.",
    category: "men's clothing",
    image: "https://example.com/backpack.jpg",
    rating: { rate: 4.2, count: 80 },
  },
  {
    id: 4,
    title: "Gold Necklace",
    price: 129.99,
    description: "Elegant jewelry for special occasions.",
    category: "jewelery",
    image: "https://example.com/necklace.jpg",
    rating: { rate: 4.7, count: 150 },
  },
  {
    id: 5,
    title: "Gaming Monitor",
    price: 199.99,
    description: "High refresh rate display.",
    category: "electronics",
    image: "https://example.com/monitor.jpg",
    rating: { rate: 4.8, count: 175 },
  },
  {
    id: 6,
    title: "Running Shoes",
    price: 69.99,
    description: "Lightweight footwear for running.",
    category: "women's clothing",
    image: "https://example.com/shoes.jpg",
    rating: { rate: 4.6, count: 110 },
  },
];

describe("Product API Integration Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockGetAllProducts.mockResolvedValue(products);

    mockGetTopRatedProducts.mockResolvedValue([
      products[1],
      products[4],
      products[3],
      products[5],
      products[0],
    ]);

    mockGetProductsByCategory.mockImplementation(async (category: string) =>
      products.filter((product) => product.category === category),
    );

    mockSearchProducts.mockImplementation(async (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return [];
      }

      return products.filter((product) => {
        const searchableText = [product.title, product.description]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      });
    });

    mockGetProductById.mockImplementation(
      async (id: number) =>
        products.find((product) => product.id === id) ?? null,
    );
  });

  describe("GET /api/products", () => {
    it("returns HTTP 200 and all products", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(6);

      expect(mockGetAllProducts).toHaveBeenCalledOnce();
    });
  });

  describe("GET /api/products/top-rated", () => {
    it("returns the five highest-rated products", async () => {
      const response = await request(app).get("/api/products/top-rated");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);

      expect(response.body.map((product: Product) => product.id)).toEqual([
        2, 5, 4, 6, 1,
      ]);

      expect(mockGetTopRatedProducts).toHaveBeenCalledOnce();
    });
  });

  describe("GET /api/products/category/:category", () => {
    it("returns products from the selected category", async () => {
      const response = await request(app).get(
        "/api/products/category/electronics",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      expect(
        response.body.every(
          (product: Product) => product.category === "electronics",
        ),
      ).toBe(true);

      expect(mockGetProductsByCategory).toHaveBeenCalledWith("electronics");
    });

    it("supports spaces and apostrophes in categories", async () => {
      const category = "men's clothing";

      const response = await request(app).get(
        `/api/products/category/${encodeURIComponent(category)}`,
      );

      expect(response.status).toBe(200);

      expect(response.body.map((product: Product) => product.id)).toEqual([
        1, 3,
      ]);

      expect(mockGetProductsByCategory).toHaveBeenCalledWith(category);
    });

    it("returns an empty array for unknown categories", async () => {
      const response = await request(app).get("/api/products/category/unknown");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/products/search", () => {
    it("returns products matching the title", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "jacket" });

      expect(response.status).toBe(200);

      expect(response.body.map((product: Product) => product.id)).toEqual([1]);

      expect(mockSearchProducts).toHaveBeenCalledWith("jacket");
    });

    it("returns products matching the description", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "Bluetooth" });

      expect(response.status).toBe(200);

      expect(response.body.map((product: Product) => product.id)).toEqual([2]);
    });

    it("supports case-insensitive searches", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "GAMING" });

      expect(response.status).toBe(200);

      expect(response.body.map((product: Product) => product.id)).toEqual([5]);
    });

    it("does not return category-only matches", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "electronics" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("returns only products containing the search term", async () => {
      const query = "jacket";

      const response = await request(app)
        .get("/api/products/search")
        .query({ q: query });

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);

      for (const product of response.body as Product[]) {
        const searchableText = [product.title, product.description]
          .join(" ")
          .toLowerCase();

        expect(searchableText).toContain(query);
      }
    });

    it("returns an empty array for no matches", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "xyznonexistent123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("GET /api/products/:id", () => {
    it("returns the requested product", async () => {
      const response = await request(app).get("/api/products/3");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(3);
      expect(response.body.title).toBe("Leather Backpack");

      expect(mockGetProductById).toHaveBeenCalledWith(3);
    });

    it("returns HTTP 404 for a missing product", async () => {
      const response = await request(app).get("/api/products/999");

      expect(response.status).toBe(404);
    });

    it("rejects an invalid product ID", async () => {
      const response = await request(app).get("/api/products/abc");

      expect(response.status).toBe(400);

      expect(mockGetProductById).not.toHaveBeenCalled();
    });

    it("rejects a negative product ID", async () => {
      const response = await request(app).get("/api/products/-1");

      expect(response.status).toBe(400);

      expect(mockGetProductById).not.toHaveBeenCalled();
    });
  });
});
