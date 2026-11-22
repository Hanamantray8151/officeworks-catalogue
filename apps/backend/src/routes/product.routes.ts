import { Router } from "express";

import {
  getAllProductsController,
  getTopRatedProductsController,
  getProductsByCategoryController,
  searchProductsController,
  getProductByIdController,
} from "../controllers/product.controller";

// Create a dedicated router for product endpoints.
const productRouter = Router();

// GET /api/products
productRouter.get("/", getAllProductsController);

// GET /api/products/top-rated
productRouter.get("/top-rated", getTopRatedProductsController);

// GET /api/products/search?q=keyword
productRouter.get("/search", searchProductsController);

// GET /api/products/category/:category
productRouter.get("/category/:category", getProductsByCategoryController);

// GET /api/products/:id
// Keep this dynamic route after the specific routes.
productRouter.get("/:id", getProductByIdController);

export default productRouter;
