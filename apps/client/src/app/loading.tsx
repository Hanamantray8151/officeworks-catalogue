export default function Loading() {
  return (
    <section
      className="page-section"
      aria-label="Loading product catalogue"
      aria-busy="true"
    >
      <div className="container">
        {/* Loading heading */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div className="loading-spinner" aria-hidden="true" />

          <h1 className="section-title">Loading products...</h1>

          <p className="section-description">
            Please wait while we prepare your catalogue.
          </p>
        </div>

        {/* Skeleton product cards */}
        <div className="product-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="product-card">
              <div className="skeleton skeleton-image" />

              <div className="product-card-body">
                <div
                  className="skeleton skeleton-text"
                  style={{ width: "40%" }}
                />

                <div
                  className="skeleton skeleton-text"
                  style={{ width: "90%" }}
                />

                <div
                  className="skeleton skeleton-text"
                  style={{ width: "65%" }}
                />

                <div
                  className="skeleton skeleton-text"
                  style={{ width: "35%" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Accessible loading announcement */}
        <p role="status" aria-live="polite" className="sr-only">
          Loading product information. Please wait.
        </p>
      </div>
    </section>
  );
}
