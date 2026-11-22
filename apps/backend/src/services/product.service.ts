import { z } from "zod";
import { env } from "../config/env";
import type { Product } from "../types/product";

const REQUEST_TIMEOUT_MS = 8000;

// Validate data received from the external product provider.
const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string(),
  image: z.string().url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
});

const productsSchema = z.array(productSchema);

// Fetch product data through the backend only.
async function fetchProducts(): Promise<Product[]> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.PRODUCT_API_BASE_URL}/products`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Product provider returned HTTP ${response.status}`);
    }

    const data: unknown = await response.json();

    const validatedData = productsSchema.safeParse(data);

    if (!validatedData.success) {
      throw new Error("Product provider returned invalid product data");
    }

    return validatedData.data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Product provider request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Sort products by rating (highest first).
function sortByRating(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      b.rating.rate - a.rating.rate ||
      b.rating.count - a.rating.count ||
      a.id - b.id,
  );
}

// Return all available products.
export async function getAllProducts(): Promise<Product[]> {
  return fetchProducts();
}

// Return exactly the top five products, when available.
export async function getTopRatedProducts(): Promise<Product[]> {
  const products = await getAllProducts();

  return sortByRating(products).slice(0, 5);
}

// Return products in a category, sorted by rating.
export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  const products = await getAllProducts();

  const normalizedCategory = category.trim().toLowerCase();

  if (!normalizedCategory) {
    return [];
  }

  const matchingProducts = products.filter(
    (product) => product.category.toLowerCase() === normalizedCategory,
  );

  return sortByRating(matchingProducts);
}

// Search products by title, description or category.
export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts();

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
}

// Find a product by its unique ID.
export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  const products = await getAllProducts();

  return products.find((product) => product.id === id) ?? null;
}
