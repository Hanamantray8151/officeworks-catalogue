import type { Request, Response, NextFunction } from "express";

import {
  getAllProducts,
  getTopRatedProducts,
  getProductsByCategory,
  searchProducts,
  getProductById,
} from "../services/product.service";

// GET /api/products
export async function getAllProductsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await getAllProducts();

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

// GET /api/products/top-rated
export async function getTopRatedProductsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await getTopRatedProducts();

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

// GET /api/products/category/:category
export async function getProductsByCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = req.params.category?.trim();

    if (!category) {
      res.status(400).json({
        error: "Category is required",
      });
      return;
    }

    const products = await getProductsByCategory(category);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

// GET /api/products/search?q=keyword
export async function searchProductsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = req.query.q;

    if (typeof query !== "string" || !query.trim()) {
      res.status(400).json({
        error: "A non-empty search query is required",
      });
      return;
    }

    const products = await searchProducts(query);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:id
export async function getProductByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rawId = req.params.id;

    if (!/^[1-9]\d*$/.test(rawId)) {
      res.status(400).json({
        error: "Product ID must be a positive integer",
      });
      return;
    }

    const productId = Number(rawId);

    if (!Number.isSafeInteger(productId)) {
      res.status(400).json({
        error: "Product ID is outside the supported range",
      });
      return;
    }

    const product = await getProductById(productId);

    if (!product) {
      res.status(404).json({
        error: "Product not found",
      });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}
