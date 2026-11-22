import nodemailer from "nodemailer";
import { env } from "../config/env";

// Data required to send a product enquiry email.
export interface EnquiryEmailData {
  name: string;
  email: string;
  phone: string;
  message?: string;
  productId: number;
  productTitle: string;
}

// Create the SMTP transport using environment settings.
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  ...(env.SMTP_USER && env.SMTP_PASSWORD
    ? {
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      }
    : {}),
});

// Send the customer enquiry to the sales inbox.
export async function sendEnquiryEmail(
  enquiry: EnquiryEmailData,
): Promise<void> {
  const { name, email, phone, message, productId, productTitle } = enquiry;

  const emailBody = [
    "New Product Enquiry",
    "-------------------",
    "",
    `Product: ${productTitle}`,
    `Product ID: ${productId}`,
    "",
    "Customer Details",
    "----------------",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    "Customer Message",
    "----------------",
    message || "No additional message provided.",
  ].join("\n");

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: env.SALES_INBOX_EMAIL,
      replyTo: email,
      subject: `Product Enquiry - Product #${productId}`,
      text: emailBody,
    });
  } catch (error) {
    console.error("Failed to send enquiry email:", error);

    throw new Error("Unable to send enquiry email");
  }
}
