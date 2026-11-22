/**
 * Represents the rating information
 * associated with a product.
 */
export interface ProductRating {
  rate: number;
  count: number;
}

/**
 * Represents a product returned by
 * our Express backend API.
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}
