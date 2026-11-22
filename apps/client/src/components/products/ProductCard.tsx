import Link from "next/link";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = `$${product.price.toFixed(2)}`;

  const formattedRating = product.rating.rate.toFixed(1);

  return (
    <article className="product-card">
      {/* Product image */}
      <Link
        href={`/products/${product.id}`}
        className="product-image-wrapper"
        aria-label={`View details for ${product.title}`}
      >
        <img
          src={product.image}
          alt={product.title}
          className="product-image"
          loading="lazy"
        />
      </Link>

      {/* Product information */}
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>

        <h3 className="product-title">
          <Link href={`/products/${product.id}`}>{product.title}</Link>
        </h3>

        {/* Customer rating */}
        <div
          className="product-rating"
          aria-label={`Rated ${formattedRating} out of 5 based on ${product.rating.count} ratings`}
        >
          <span className="rating-star" aria-hidden="true">
            ★
          </span>

          <span>{formattedRating} / 5</span>

          <span className="rating-count">({product.rating.count} reviews)</span>
        </div>

        {/* Product price */}
        <p className="product-price">{formattedPrice}</p>

        {/* Product details navigation */}
        <Link href={`/products/${product.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </article>
  );
}
