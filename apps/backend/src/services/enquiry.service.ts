import { getProductById } from "./product.service";
import { sendEnquiryEmail } from "./email.service";

import type { EnquiryInput } from "../validators/enquiry.schema";

// Custom error for enquiries about unknown products.
export class ProductNotFoundError extends Error {
  constructor() {
    super("Product not found");
    this.name = "ProductNotFoundError";
  }
}

// Process a validated customer enquiry.
export async function submitEnquiry(enquiry: EnquiryInput): Promise<void> {
  // Step 1: Verify that the selected product exists.
  const product = await getProductById(enquiry.productId);

  if (!product) {
    throw new ProductNotFoundError();
  }

  // Step 2: Send the enquiry to the sales inbox.
  await sendEnquiryEmail({
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    message: enquiry.message,
    productId: product.id,
    productTitle: product.title,
  });
}
