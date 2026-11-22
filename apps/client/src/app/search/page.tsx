import type { Metadata } from "next";
import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { searchProducts } from "@/lib/api";

import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search the product catalogue by product name or description.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

const MAX_SEARCH_LENGTH = 100;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Read the query parameter safely.
  const rawQuery = typeof params.q === "string" ? params.q : "";

  const query = rawQuery.trim();

  const hasQuery = query.length > 0;
  const isQueryTooLong = query.length > MAX_SEARCH_LENGTH;

  let products: Product[] = [];
  let errorMessage: string | null = null;

  // Search only when a valid query is provided.
  if (hasQuery && !isQueryTooLong) {
    try {
      products = await searchProducts(query);
    } catch (error) {
      console.error("Product search failed:", error);

      errorMessage =
        "We couldn't complete your search. Please try again later.";
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        {/* Page heading */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Search Products</h1>

            <p className="section-description">
              Find products by name or description.
            </p>
          </div>

          <Link href="/products" className="btn btn-secondary">
            Browse All Products
          </Link>
        </div>

        {/* Search form */}
        <form
          action="/search"
          method="GET"
          className="search-form"
          role="search"
        >
          <input
            type="search"
            name="q"
            className="search-input"
            placeholder="Search for products..."
            aria-label="Search products"
            defaultValue={query}
            maxLength={MAX_SEARCH_LENGTH}
            required
          />

          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Search query validation */}
        {isQueryTooLong ? (
          <div className="error-state" role="alert">
            <p>Your search must not exceed {MAX_SEARCH_LENGTH} characters.</p>
          </div>
        ) : !hasQuery ? (
          /* Initial search state */
          <div className="empty-state">
            <h2>What are you looking for?</h2>

            <p>
              Enter a product name or keyword above to search our catalogue.
            </p>
          </div>
        ) : errorMessage ? (
          /* API error state */
          <div className="error-state" role="alert">
            <h2>Search Unavailable</h2>

            <p>{errorMessage}</p>

            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="btn btn-secondary"
            >
              Try Again
            </Link>
          </div>
        ) : (
          /* Search results */
          <>
            <div className="section-header" style={{ marginTop: "32px" }}>
              <div>
                <h2 className="section-title">Search Results</h2>

                <p className="section-description">
                  Results for <strong>{query}</strong>
                </p>

                <p className="section-description">
                  {products.length}{" "}
                  {products.length === 1
                    ? "matching product"
                    : "matching products"}
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <h3>No Products Found</h3>

                <p>
                  No products matched your search for <strong>{query}</strong>.
                </p>

                <p>Try a different keyword or browse the complete catalogue.</p>

                <Link href="/products" className="btn btn-secondary">
                  Browse All Products
                </Link>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
