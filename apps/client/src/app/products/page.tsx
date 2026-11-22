import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { getAllProducts } from "@/lib/api";

import type { Product } from "@/types/product";

export const metadata = {
  title: "All Products",
  description:
    "Browse our complete product catalogue and explore product details.",
};

export default async function AllProductsPage() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Failed to load products:", error);

    errorMessage = "We couldn't load the products. Please try again later.";
  }

  return (
    <section className="page-section">
      <div className="container">
        {/* Page heading */}
        <div className="section-header">
          <div>
            <h1 className="section-title">All Products</h1>

            <p className="section-description">
              Explore our complete product collection.
            </p>

            {!errorMessage && (
              <p className="section-description">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"} available
              </p>
            )}
          </div>

          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>

        {/* API error state */}
        {errorMessage ? (
          <div className="error-state" role="alert">
            <p>{errorMessage}</p>

            <Link href="/products" className="btn btn-secondary">
              Try Again
            </Link>
          </div>
        ) : products.length === 0 ? (
          /* Empty catalogue state */
          <div className="empty-state">
            <p>No products are currently available.</p>
          </div>
        ) : (
          /* Product catalogue */
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
