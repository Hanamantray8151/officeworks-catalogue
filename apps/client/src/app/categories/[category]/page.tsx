import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductCard from "@/components/products/ProductCard";
import { getProductsByCategory } from "@/lib/api";

import type { Product } from "@/types/product";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Format a category name for display.
function formatCategoryName(category: string): string {
  return category
    .split(" ")
    .map((word) => {
      if (!word) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Validate the category route parameter.
function parseCategory(value: string): string | null {
  let decodedCategory: string;

  try {
    decodedCategory = decodeURIComponent(value);
  } catch {
    return null;
  }

  const category = decodedCategory.trim();

  if (
    category.length === 0 ||
    category.length > 100 ||
    /[\/\\\x00-\x1F\x7F]/.test(category)
  ) {
    return null;
  }

  return category;
}

// Generate category-specific page metadata.
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const validCategory = parseCategory(category);

  if (!validCategory) {
    return {
      title: "Category Not Found",
    };
  }

  const displayName = formatCategoryName(validCategory);

  return {
    title: `${displayName} Products`,
    description: `Browse products in the ${displayName} category.`,
  };
}

export default async function CategoryProductsPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;
  const validCategory = parseCategory(category);

  if (!validCategory) {
    notFound();
  }

  const displayName = formatCategoryName(validCategory);

  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await getProductsByCategory(validCategory);
  } catch (error) {
    console.error("Failed to load category products:", error);

    errorMessage =
      "We couldn't load products in this category. Please try again later.";
  }

  return (
    <section className="page-section">
      <div className="container">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "28px" }}>
          <Link href="/">Home</Link>
          {" / "}
          <Link href="/categories">Categories</Link>
          {" / "}
          <span aria-current="page">{displayName}</span>
        </nav>

        {/* Page heading */}
        <div className="section-header">
          <div>
            <h1 className="section-title">{displayName}</h1>

            <p className="section-description">
              Explore products in the {displayName} category.
            </p>

            {!errorMessage && (
              <p className="section-description">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} available
              </p>
            )}
          </div>

          <Link href="/categories" className="btn btn-secondary">
            Back to Categories
          </Link>
        </div>

        {/* API error state */}
        {errorMessage ? (
          <div className="error-state" role="alert">
            <p>{errorMessage}</p>

            <Link
              href={`/categories/${encodeURIComponent(validCategory)}`}
              className="btn btn-secondary"
            >
              Try Again
            </Link>
          </div>
        ) : products.length === 0 ? (
          /* Empty category state */
          <div className="empty-state">
            <h2>No Products Found</h2>

            <p>There are currently no products available in this category.</p>

            <Link href="/categories" className="btn btn-secondary">
              Browse Other Categories
            </Link>
          </div>
        ) : (
          /* Category product grid */
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
