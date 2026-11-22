import Link from "next/link";

const footerLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "All Products",
    href: "/products",
  },
  {
    label: "Categories",
    href: "/categories",
  },
  {
    label: "Search",
    href: "/search",
  },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p style={{ margin: 0, fontWeight: 700 }}>Product Catalogue</p>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "0.8rem",
            }}
          >
            Demo application built for a technical assessment.
          </p>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "0.8rem",
            }}
          >
            © {currentYear} Product Catalogue.
          </p>
        </div>

        <nav className="site-nav" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{ color: "#e2e8f0" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
