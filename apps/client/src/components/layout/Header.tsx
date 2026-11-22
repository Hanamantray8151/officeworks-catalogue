import Link from "next/link";

const navigationLinks = [
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

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href="/"
          className="site-logo"
          aria-label="Product Catalogue homepage"
        >
          Product Catalogue
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          {navigationLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
