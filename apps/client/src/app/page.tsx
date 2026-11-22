import Link from "next/link";

import ProductCard from "@/components/products/ProductCard";
import { getTopRatedProducts } from "@/lib/api";

import type { Product } from "@/types/product";

export const metadata = {
  title: "Home",
  description:
    "Discover our five top-rated products and explore the complete product catalogue.",
};

export default async function HomePage() {
  let products: Product[] = [];
  let errorMessage: string | null = null;

  try {
    products = await getTopRatedProducts();
  } catch (error) {
    console.error("Failed to load top-rated products:", error);

    errorMessage =
      "We couldn't load the featured products. Please try again later.";
  }

  return (
    <>
      {/* Hero section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">Discover products worth exploring.</h1>

          <p className="hero-description">
            Browse our product catalogue, discover top-rated products, and find
            something that suits your needs.
          </p>

          <Link href="/products" className="btn btn-accent">
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Featured products section */}
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top 5 Rated Products</h2>

              <p className="section-description">
                Explore the highest-rated products in our catalogue.
              </p>
            </div>

            <Link href="/products" className="btn btn-secondary">
              View All Products
            </Link>
          </div>

          {/* API error state */}
          {errorMessage ? (
            <div className="error-state" role="alert">
              <p>{errorMessage}</p>

              <Link href="/" className="btn btn-secondary">
                Try Again
              </Link>
            </div>
          ) : products.length === 0 ? (
            /* Empty products state */
            <div className="empty-state">
              <p>No featured products are available.</p>
            </div>
          ) : (
            /* Reusable product cards */
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
