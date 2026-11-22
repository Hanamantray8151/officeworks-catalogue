import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EnquiryForm from "@/components/enquiry/EnquiryForm";
import { ApiError, getProductById } from "@/lib/api";

interface ProductEnquiryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Product Enquiry",
  description: "Contact our team with an enquiry about a product.",
};

// Accept only positive, safe integer product IDs.
function parseProductId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
}

export default async function ProductEnquiryPage({
  params,
}: ProductEnquiryPageProps) {
  const { id } = await params;
  const productId = parseProductId(id);

  // Invalid route parameter.
  if (productId === null) {
    notFound();
  }

  let product;

  try {
    // Fetch the selected product through our backend.
    product = await getProductById(productId);
  } catch (error) {
    // Product does not exist.
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    // Other failures should not be mistaken for a 404.
    console.error("Failed to load enquiry product:", error);

    return (
      <section className="page-section">
        <div className="container">
          <div className="error-state" role="alert">
            <h1>Unable to Load Product</h1>

            <p>
              We couldn't load this product right now. Please try again later.
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
          <Link href={`/products/${product.id}`}>Product Details</Link>
          {" / "}
          <span aria-current="page">Enquiry</span>
        </nav>

        {/* Page heading */}
        <div className="section-header">
          <div>
            <h1 className="section-title">Product Enquiry</h1>

            <p className="section-description">
              Have a question about this product? Send us an enquiry using the
              form below.
            </p>
          </div>

          <Link href={`/products/${product.id}`} className="btn btn-secondary">
            Back to Product
          </Link>
        </div>

        {/* Selected product summary */}
        <div
          className="product-card"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          <div>
            <p className="product-category">{product.category}</p>

            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "8px",
              }}
            >
              {product.title}
            </h2>

            <p className="product-price">${product.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Interactive enquiry form */}
        <EnquiryForm productId={product.id} productTitle={product.title} />
      </div>
    </section>
  );
}
