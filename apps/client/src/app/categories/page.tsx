import type { Metadata } from "next";
import Link from "next/link";

import { getAllProducts } from "@/lib/api";

import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse products by category and discover our product collection.",
};

interface CategorySummary {
  name: string;
  count: number;
}

// Build category summaries from the product data.
function getCategorySummaries(products: Product[]): CategorySummary[] {
  const categoryCounts = new Map<string, number>();

  for (const product of products) {
    const category = product.category;

    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  return Array.from(categoryCounts, ([name, count]) => ({
    name,
    count,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// Convert a category name into a readable label.
function formatCategoryName(category: string): string {
  return category
    .split(" ")
    .map((word) => {
      if (word.length === 0) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default async function CategoriesPage() {
  let categories: CategorySummary[] = [];
  let errorMessage: string | null = null;

  try {
    const products = await getAllProducts();

    categories = getCategorySummaries(products);
  } catch (error) {
    console.error("Failed to load product categories:", error);

    errorMessage = "We couldn't load the categories. Please try again later.";
  }

  return (
    <section className="page-section">
      <div className="container">
        {/* Page heading */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Shop by Category</h1>

            <p className="section-description">
              Explore products based on what interests you.
            </p>

            {!errorMessage && (
              <p className="section-description">
                {categories.length}{" "}
                {categories.length === 1 ? "category" : "categories"} available
              </p>
            )}
          </div>

          <Link href="/products" className="btn btn-secondary">
            View All Products
          </Link>
        </div>

        {/* API error state */}
        {errorMessage ? (
          <div className="error-state" role="alert">
            <p>{errorMessage}</p>

            <Link href="/categories" className="btn btn-secondary">
              Try Again
            </Link>
          </div>
        ) : categories.length === 0 ? (
          /* Empty category state */
          <div className="empty-state">
            <p>No product categories are currently available.</p>
          </div>
        ) : (
          /* Category grid */
          <div className="product-grid">
            {categories.map((category) => (
              <article key={category.name} className="product-card">
                <div className="product-card-body">
                  <p className="product-category">Product Category</p>

                  <h2 className="product-title">
                    {formatCategoryName(category.name)}
                  </h2>

                  <p className="product-description">
                    {category.count}{" "}
                    {category.count === 1 ? "product" : "products"} available
                  </p>

                  <Link
                    href={`/categories/${encodeURIComponent(category.name)}`}
                    className="btn btn-primary"
                    aria-label={`Explore ${category.name} category`}
                  >
                    Explore Category
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
