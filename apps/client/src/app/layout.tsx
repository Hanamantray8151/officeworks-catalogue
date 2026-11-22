import type { Metadata } from "next";
import type { ReactNode } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Product Catalogue",
    template: "%s | Product Catalogue",
  },
  description:
    "Explore our product catalogue, discover top-rated products, browse categories, and send product enquiries.",
  applicationName: "Product Catalogue",
  keywords: [
    "product catalogue",
    "top-rated products",
    "product search",
    "product categories",
    "customer enquiries",
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />

        <main
          id="main-content"
          style={{
            flex: 1,
            width: "100%",
          }}
        >
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
