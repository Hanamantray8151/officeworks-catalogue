import type { Product } from "@/types/product";

// Read the Express API URL from Next.js environment variables.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

// Prevent requests from waiting indefinitely.
const REQUEST_TIMEOUT_MS = 10000;

// Custom error for unsuccessful API responses.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Common response structure for API errors.
interface ApiErrorResponse {
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Information submitted by the customer.
export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
  productId: number;
}

// Response returned after a successful enquiry.
export interface EnquiryResponse {
  message: string;
}

// Reusable helper for communicating with our backend.
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = "Something went wrong. Please try again.";

      try {
        const errorData = (await response.json()) as ApiErrorResponse;

        if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        }
      } catch {
        // Use the fallback message if the response isn't JSON.
      }

      throw new ApiError(response.status, errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "The request timed out. Please try again.");
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(0, "Unable to connect to the server. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/products
export async function getAllProducts(): Promise<Product[]> {
  return apiRequest<Product[]>("/products");
}

// GET /api/products/top-rated
export async function getTopRatedProducts(): Promise<Product[]> {
  return apiRequest<Product[]>("/products/top-rated");
}

// GET /api/products/category/:category
export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  return apiRequest<Product[]>(
    `/products/category/${encodeURIComponent(category)}`,
  );
}

// GET /api/products/search?q=keyword
export async function searchProducts(query: string): Promise<Product[]> {
  const searchTerm = query.trim();

  if (!searchTerm) {
    return [];
  }

  return apiRequest<Product[]>(
    `/products/search?q=${encodeURIComponent(searchTerm)}`,
  );
}

// GET /api/products/:id
export async function getProductById(id: number): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`);
}

// POST /api/enquiries
export async function submitEnquiry(
  enquiry: EnquiryInput,
): Promise<EnquiryResponse> {
  return apiRequest<EnquiryResponse>("/enquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enquiry),
  });
}
