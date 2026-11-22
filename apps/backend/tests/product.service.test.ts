import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAllProducts,
  getTopRatedProducts,
  getProductsByCategory,
  searchProducts,
  getProductById,
} from "../src/services/product.service";

import type { Product } from "../src/types/product";

// Controlled product data for repeatable tests.
const mockProducts: Product[] = [
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

// Mock successful Fake Store API responses.
function mockFetchProducts(products: Product[] = mockProducts) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => products,
    }),
  );
}

describe("Product Service", () => {
  beforeEach(() => {
    mockFetchProducts();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("getAllProducts", () => {
    it("returns all products", async () => {
      const products = await getAllProducts();

      expect(products).toHaveLength(6);
      expect(products[0].title).toBe("Classic Cotton Jacket");
    });

    it("returns an empty array when no products exist", async () => {
      mockFetchProducts([]);

      const products = await getAllProducts();

      expect(products).toEqual([]);
    });
  });

  describe("getTopRatedProducts", () => {
    it("returns exactly five products", async () => {
      const products = await getTopRatedProducts();

      expect(products).toHaveLength(5);
    });

    it("sorts products by rating in descending order", async () => {
      const products = await getTopRatedProducts();

      expect(products.map((product) => product.id)).toEqual([2, 5, 4, 6, 1]);
    });

    it("does not modify the original product order", async () => {
      await getTopRatedProducts();

      expect(mockProducts.map((product) => product.id)).toEqual([
        1, 2, 3, 4, 5, 6,
      ]);
    });

    it("returns fewer than five if fewer products exist", async () => {
      mockFetchProducts(mockProducts.slice(0, 3));

      const products = await getTopRatedProducts();

      expect(products).toHaveLength(3);
    });
  });

  describe("getProductsByCategory", () => {
    it("returns products in the selected category", async () => {
      const products = await getProductsByCategory("electronics");

      expect(products).toHaveLength(2);

      expect(
        products.every((product) => product.category === "electronics"),
      ).toBe(true);
    });

    it("supports categories containing spaces and apostrophes", async () => {
      const products = await getProductsByCategory("men's clothing");

      expect(products.map((product) => product.id)).toEqual([1, 3]);
    });

    it("returns an empty array for an unknown category", async () => {
      const products = await getProductsByCategory("unknown category");

      expect(products).toEqual([]);
    });
  });

  describe("searchProducts", () => {
    it("matches product titles", async () => {
      const products = await searchProducts("jacket");

      expect(products.map((product) => product.id)).toEqual([1]);
    });

    it("matches product descriptions", async () => {
      const products = await searchProducts("Bluetooth");

      expect(products.map((product) => product.id)).toEqual([2]);
    });

    it("performs case-insensitive matching", async () => {
      const products = await searchProducts("GAMING");

      expect(products.map((product) => product.id)).toEqual([5]);
    });

    it("does not match category names alone", async () => {
      const products = await searchProducts("electronics");

      // Products 2 and 5 belong to electronics,
      // but their titles and descriptions do not
      // contain the word "electronics".
      expect(products).toEqual([]);
    });

    it("returns only products containing the search term", async () => {
      const query = "jacket";

      const products = await searchProducts(query);

      expect(products.length).toBeGreaterThan(0);

      for (const product of products) {
        const searchableText = [product.title, product.description]
          .join(" ")
          .toLowerCase();

        expect(searchableText).toContain(query.toLowerCase());
      }
    });

    it("returns an empty array when nothing matches", async () => {
      const products = await searchProducts("xyznonexistent123");

      expect(products).toEqual([]);
    });

    it("handles surrounding whitespace", async () => {
      const products = await searchProducts("  jacket  ");

      expect(products.map((product) => product.id)).toEqual([1]);
    });
  });

  describe("getProductById", () => {
    it("returns the requested product", async () => {
      const product = await getProductById(3);

      expect(product).not.toBeNull();
      expect(product?.id).toBe(3);
      expect(product?.title).toBe("Leather Backpack");
    });

    it("returns null when the product does not exist", async () => {
      const product = await getProductById(999);

      expect(product).toBeNull();
    });
  });
});
