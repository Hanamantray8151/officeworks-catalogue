# Architecture and Technical Decisions

## Project Overview

The Product Catalogue is a full-stack application
developed for the Officeworks technical assessment.

The application allows customers to:

- View the five highest-rated products
- Browse all available products
- Browse products by category
- Search for specific products
- View individual product details
- Submit product enquiries
- Receive confirmation after successful enquiry submission

The implementation prioritizes:

1. Correctness against the acceptance criteria
2. Clear separation of responsibilities
3. Maintainability
4. Testability
5. Simplicity
6. Reproducible local development

---

## Decision 1: Use a Monorepo with npm Workspaces

### Decision

Use a single repository containing the frontend
and backend applications.

Structure:

    apps/
      client/
      backend/

### Rationale

The frontend and backend are closely related and
developed together.

npm workspaces provide a straightforward way to
manage both applications without introducing
additional monorepo tooling.

### Advantages

- Single repository for the complete application
- Shared root-level development commands
- Simplified dependency installation
- Easier review of frontend and backend changes
- Consistent version control

### Trade-offs

- Both applications share a repository lifecycle.
- Workspace configuration requires some initial setup.

### Alternatives Considered

Separate frontend and backend repositories.

This would provide independent repository management
but add unnecessary complexity for this assessment.

---

## Decision 2: Next.js with React and TypeScript

### Decision

Use Next.js 15 with React 19 and TypeScript
for the frontend.

### Rationale

Next.js App Router provides file-based routing,
server-rendered pages, loading states, and
built-in support for asynchronous data fetching.

TypeScript provides compile-time checks for
product data, API responses, and component props.

### Advantages

- File-based routing
- Server Components
- TypeScript support
- Built-in loading conventions
- Reusable React components
- Straightforward page organization

### Trade-offs

- Next.js introduces framework-specific conventions.
- Server and Client Components require clear boundaries.
- Next.js 15 uses asynchronous route parameters.

### Alternatives Considered

React with Vite.

Vite would provide a lightweight frontend setup,
but Next.js offers routing and server-rendering
features without additional routing libraries.

---

## Decision 3: Express Backend API

### Decision

Use Node.js, Express, and TypeScript for
the backend.

### Rationale

The backend acts as the application's API layer.

It handles:

- Product retrieval
- Product filtering
- Product search
- Product details
- Enquiry validation
- Email delivery
- Error handling

### Advantages

- Clear HTTP routing
- Middleware-based architecture
- Simple integration with external APIs
- Familiar TypeScript development experience
- Straightforward automated testing

### Trade-offs

- Requires running a separate backend service.
- Introduces an additional network request between
  the frontend and the external product API.

### Alternatives Considered

Next.js API routes.

They could reduce the number of applications,
but a dedicated Express backend provides
a clearer separation between the frontend
and API responsibilities.

---

## Decision 4: Proxy Fake Store API Through the Backend

### Decision

All frontend product requests go through
the Express backend.

Request flow:

    Browser
       |
       v
    Next.js Frontend
       |
       v
    Express Backend
       |
       v
    Fake Store API

### Rationale

The frontend should not depend directly
on the external product API.

The backend provides a consistent interface
for product retrieval and business logic.

### Advantages

- Centralized external API access
- Consistent error handling
- Request timeout management
- Centralized product validation
- Easier API mocking during tests
- Reduced coupling between frontend and
  external API response details

### Trade-offs

- Additional network hop
- Backend availability becomes necessary
  for product-related functionality

### Alternatives Considered

Calling Fake Store API directly from
frontend components.

This would be simpler initially but would
distribute external API handling across
the frontend.

---

## Decision 5: Function-Based Services

### Decision

Use exported functions instead of service classes.

Example:

    getAllProducts()
    getTopRatedProducts()
    getProductsByCategory()
    searchProducts()
    getProductById()

### Rationale

The product catalogue does not require complex
service state or inheritance.

Functions provide a simple, readable interface
for controllers.

### Advantages

- Minimal boilerplate
- Easy to understand
- Easy to test
- Clear separation of business logic
- No unnecessary object lifecycle management

### Trade-offs

- Larger services may eventually require
  additional modularization.
- Dependency injection requires explicit
  function parameters or module mocking.

### Alternatives Considered

Class-based services with constructors
and dependency injection.

That approach can be useful in larger systems
but was unnecessary for this application's scope.

---

## Decision 6: Server Components for Product Pages

### Decision

Use Next.js Server Components for product
listing, category, search, and detail pages.

### Rationale

These pages primarily retrieve data
and render content.

They do not require complex browser-side state.

### Advantages

- Less client-side JavaScript
- Server-side data retrieval
- Simpler page components
- Appropriate separation of server
  and browser responsibilities

### Trade-offs

- Interactive functionality requires
  Client Components.
- Developers must understand server/client
  component boundaries.

### Alternatives Considered

Client-side data fetching with useEffect.

This would require additional loading,
error, and state management in the browser.

---

## Decision 7: Reusable ProductCard Component

### Decision

Create a shared ProductCard component.

### Rationale

Products appear on multiple pages:

- Homepage
- All Products
- Category Listings
- Search Results

### Advantages

- Consistent product presentation
- Reduced code duplication
- Easier styling changes
- Easier maintenance

### Trade-offs

- Shared components require careful design
  to avoid unnecessary configuration.

---

## Decision 8: Top-Five Product Ranking

### Decision

Rank products by customer rating
in descending order.

Return a maximum of five products.

### Rationale

The homepage must display the five
highest-rated products.

### Implementation

The backend retrieves the product collection,
sorts products by rating, and selects the
first five results.

Rating count and product ID are used
as deterministic tie-breakers.

### Trade-offs

A simple rating-based ranking does not
account for statistical confidence.

For example, a product with one five-star
rating may outrank a product with hundreds
of slightly lower ratings.

### Future Improvement

Consider a weighted rating formula
when working with a larger catalogue.

---

## Decision 9: Product Search by Text

### Decision

Implement case-insensitive substring matching
against product titles and descriptions.

### Acceptance Criterion

GIVEN a customer is looking for a specific product

AND the customer enters a search term

WHEN the customer clicks Search

THEN only products containing matching
searchable text are displayed.

### Implementation

Searchable fields:

- Product title
- Product description

Category membership alone does not
qualify a product as a search match.

### Advantages

- Straightforward behavior
- Predictable results
- No additional search infrastructure
- Easy to test

### Trade-offs

- No typo tolerance
- No relevance ranking
- No stemming
- No autocomplete
- Limited suitability for large catalogues

### Alternatives Considered

Dedicated search engines or full-text indexing.

These were unnecessary for the small
external product catalogue.

---

## Decision 10: Native GET Form for Search

### Decision

Use an HTML GET form for product search.

Example:

    /search?q=jacket

### Rationale

Search is a read-only operation.

A GET form makes searches shareable
and compatible with browser navigation.

### Advantages

- Bookmarkable search results
- No additional client-side state
- Simple implementation
- Accessible native form behavior

### Trade-offs

- Each submission triggers navigation.
- Does not provide live autocomplete.

### Alternatives Considered

Client-side search with React state
and debounced requests.

That approach would be useful for
interactive search suggestions but
was not required for the assessment.

---

## Decision 11: Zod for Input Validation

### Decision

Use Zod for runtime validation.

### Rationale

TypeScript types do not validate
incoming HTTP request bodies at runtime.

Zod verifies submitted values before
they reach business logic.

### Validation Areas

- Environment configuration
- Customer enquiry details
- Product identifiers
- External product API responses

### Advantages

- Declarative validation rules
- TypeScript integration
- Consistent error handling
- Easy unit testing

### Trade-offs

- Additional runtime dependency
- Validation rules require maintenance

---

## Decision 12: Nodemailer for Customer Enquiries

### Decision

Use Nodemailer to deliver product enquiries
through SMTP.

### Rationale

The assessment requires customers to submit
enquiries that can be delivered by email.

Nodemailer supports standard SMTP servers
without requiring a paid email API.

### Workflow

1. Customer submits the enquiry form.
2. Backend validates the submitted data.
3. Backend verifies the selected product.
4. Backend constructs the enquiry email.
5. Nodemailer attempts SMTP delivery.
6. Backend returns a success response
   after the email operation succeeds.

### Advantages

- Standard SMTP compatibility
- No mandatory paid email service
- Configurable through environment variables
- Easy to replace with another email provider

### Trade-offs

- Requires valid SMTP configuration
- Delivery depends on SMTP availability
- Successful SMTP acceptance does not
  guarantee final inbox delivery

### Future Improvements

- Rate limiting
- Spam prevention
- Delivery monitoring
- Retry mechanisms

---

## Decision 13: Vitest and Supertest

### Decision

Use Vitest for automated testing and
Supertest for Express API testing.

### Rationale

The application requires confidence in
business logic, input validation,
and HTTP endpoint behavior.

### Test Categories

Product service tests:

- Product retrieval
- Top-rated ordering
- Category filtering
- Search matching
- Product lookup

Enquiry validation tests:

- Required fields
- Email validation
- Phone validation
- Product ID validation

API integration tests:

- HTTP status codes
- Request validation
- Controller behavior
- Service interactions

Environment tests:

- Valid configuration
- Invalid ports
- Invalid URLs
- Invalid email addresses

### Advantages

- Fast feedback
- Repeatable tests
- Controlled mock data
- No dependency on live external APIs
- Easier regression detection

### Trade-offs

- Mocked dependencies do not prove
  complete production integration.
- Additional end-to-end testing would
  provide broader confidence.

---

## Decision 14: CSS Without a UI Framework

### Decision

Use standard CSS for application styling.

### Rationale

The interface is relatively small
and does not require a comprehensive
component library.

### Advantages

- No additional styling framework
- Full control over presentation
- Lightweight dependency footprint
- Straightforward responsive styling

### Trade-offs

- More custom CSS must be maintained.
- Shared styling conventions must be
  managed manually.

### Alternatives Considered

Tailwind CSS or a UI component library.

These could accelerate development in
larger projects but were not essential here.

---

## Decision 15: Error Handling and Loading States

### Decision

Provide loading indicators and meaningful
error states throughout the application.

### Rationale

External API calls and SMTP operations
may fail or take time to complete.

Customers should receive clear feedback
rather than a blank page or misleading
success message.

### Implementation

- Next.js loading.tsx
- Skeleton placeholders
- API request timeouts
- Express error middleware
- Form validation feedback
- Empty search results
- Missing-product handling

### Accessibility

- Semantic HTML
- Form labels
- Keyboard focus indicators
- Screen-reader status messages
- Reduced-motion support

---

## Known Limitations

The current application has the following
limitations:

1. Product availability depends on Fake Store API.
2. Search uses basic substring matching.
3. Product data is not persisted locally.
4. Email delivery requires SMTP configuration.
5. No authentication or user accounts.
6. No checkout or payment processing.
7. No server-side search pagination.
8. No advanced caching strategy.
9. No dedicated end-to-end browser test suite.

These limitations are outside the primary
functional scope of the assessment.

---

## Potential Future Improvements

If the application were expanded, the next
priorities would be:

1. Product caching and resilience
2. Pagination for larger catalogues
3. Search ranking and autocomplete
4. Enquiry rate limiting
5. Email retry and monitoring
6. Browser-based end-to-end tests
7. Production logging and monitoring
8. Automated CI checks

---

## Conclusion

The architecture intentionally balances
correctness, maintainability, and simplicity.

The frontend focuses on customer experience,
the backend owns business logic and external
integrations, and automated tests verify
important application behaviors.

The implementation avoids unnecessary
infrastructure while providing a foundation
that can be extended as requirements grow.
