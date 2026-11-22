import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getProductById } from "@/lib/api";

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Validate the route parameter before requesting the API.
function parseProductId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
}

// Generate a product-specific browser title.
export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseProductId(id);

  if (productId === null) {
    return {
      title: "Product Not Found",
    };
  }

  try {
    const product = await getProductById(productId);

    return {
      title: product.title,
      description: product.description.slice(0, 160),
    };
  } catch {
    return {
      title: "Product Details",
    };
  }
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  const productId = parseProductId(id);

  if (productId === null) {
    notFound();
  }

  let product;

  try {
    product = await getProductById(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    console.error("Failed to load product details:", error);

    return (
      <section className="page-section">
        <div className="container">
          <div className="error-state" role="alert">
            <h1>Unable to load product</h1>

            <p>
              We couldn't retrieve this product right now. Please try again
              later.
            </p>

            <Link href="/products" className="btn btn-secondary">
              Back to Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "28px" }}>
          <Link href="/">Home</Link>
          {" / "}
          <Link href="/products">All Products</Link>
          {" / "}
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="product-detail">
          {/* Product image */}
          <div className="product-detail-image">
            <img src={product.image} alt={product.title} />
          </div>

          {/* Product information */}
          <div className="product-detail-info">
            <p className="product-category">{product.category}</p>

            <h1>{product.title}</h1>

            <div
              className="product-rating"
              aria-label={`Rated ${product.rating.rate.toFixed(1)} out of 5 based on ${product.rating.count} ratings`}
            >
              <span className="rating-star" aria-hidden="true">
                ★
              </span>

              <span>{product.rating.rate.toFixed(1)} / 5</span>

              <span className="rating-count">
                ({product.rating.count} reviews)
              </span>
            </div>

            <p className="product-price">${product.price.toFixed(2)}</p>

            <h2>Product Description</h2>

            <p className="product-description">{product.description}</p>

            <Link
              href={`/products/${product.id}/enquiry`}
              className="btn btn-primary"
            >
              Send Enquiry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
