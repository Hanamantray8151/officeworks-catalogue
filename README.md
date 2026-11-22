## Product Catalogue

A full-stack product catalogue application built with Next.js, React, TypeScript, Node.js, and Express.

The application retrieves products from Fake Store API through a backend proxy and allows customers to browse products, search the catalogue, view product details, and submit enquiries.
Features

- Display the five highest-rated products on the homepage
- Browse the complete product catalogue
- Browse products by category
- Search products by title and description
- View individual product details
- Submit enquiries about a selected product
- Display a thank-you message after successful submission
- Responsive layouts for desktop and mobile
- Loading indicators and skeleton placeholders
- Input validation and error handling
- Automated backend tests
  Technology Stack
  Layer Technologies
  Frontend Next.js 15 (App Router), React 19, TypeScript, CSS, Fetch API
  Backend Node.js, Express 4, TypeScript, Zod, Nodemailer
  Testing Vitest, Supertest
  External data Fake Store API

## Architecture

The application uses an npm-workspaces monorepo.

officeworks-catalogue/
├── apps/
│ ├── client/
│ │ ├── src/
│ │ │ ├── app/
│ │ │ ├── components/
│ │ │ ├── lib/
│ │ │ └── types/
│ │ └── package.json
│ └── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── types/
│ │ └── validators/
│ ├── tests/
│ └── package.json
├── .github/workflows/ci.yml
├── .env.example
├── README.md
├── DECISIONS.md
├── AI_USAGE.md
├── package.json
└── package-lock.json

## Request Flow

Browser
|
v
Next.js Frontend (localhost:3000)
|
v
Express Backend (localhost:4000)
| |
v v
Fake Store API SMTP Server
All product requests from the frontend go through the Express backend; the frontend does not call Fake Store API directly.

## Prerequisites

- Node.js 20 or later and npm
- Git
- Internet access to Fake Store API for product data
- An SMTP server for testing enquiry delivery (Mailpit is recommended for local testing)
  Installation

1. Clone the repository
   git clone <YOUR_REPOSITORY_URL>
   cd officeworks-catalogue
   Replace <YOUR_REPOSITORY_URL> with the actual repository clone URL. For a private repository, reviewers must have access.
2. Install dependencies
   From the project root:
   npm ci
   The root package.json uses npm workspaces, so this installs dependencies for both applications from the committed lockfile. Use npm install if you intentionally need to update dependencies or the lockfile.
   Environment Configuration
   Backend
   Create apps/backend/.env with:
   NODE_ENV=development
   API_PORT=4000
   PRODUCT_API_BASE_URL=https://fakestoreapi.com

SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=

EMAIL_FROM=noreply@example.com
SALES_INBOX_EMAIL=sales@example.com
The SMTP values above are intended for a local, unauthenticated SMTP test server such as Mailpit. The current backend's environment validation and Nodemailer transporter must permit empty SMTP credentials for this setup to work. If they do not, configure a compatible authenticated SMTP server or adjust the backend configuration before testing.

EMAIL_FROM is the message sender and SALES_INBOX_EMAIL is the recipient. For local Mailpit testing, example addresses are sufficient because messages are captured locally, not delivered to external inboxes.

Never commit real credentials or .env files.

## Frontend

Create apps/client/.env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
The frontend uses this URL to communicate with the Express backend.
Running the Application
Option 1: Start both applications
From the project root:
npm run dev
Option 2: Start applications separately
Backend terminal:
npm run dev --workspace=@catalogue/backend
Frontend terminal:
npm run dev --workspace=@catalogue/client
Local URLs
Service URL
Frontend http://localhost:3000
Backend health check http://localhost:4000/api/health
Mailpit inbox (when running) http://localhost:8025

## Application Pages

Page Route
Homepage /
All Products /products
Categories /categories
Category Products /categories/[category]
Search /search
Product Details /products/[id]
Product Enquiry /products/[id]/enquiry

## Homepage

Displays the five highest-rated products. The backend orders products by rating and uses additional deterministic tie-breaking rules.

## Category Browsing

Customers can select a category to view matching products. Category names containing spaces and apostrophes are supported through URL encoding and decoding.

## Product Search

Customers can enter a search term and select Search. Results match the product title or description, case-insensitively. Leading and trailing whitespace is ignored; category-only matches are excluded. Empty results are handled gracefully.

Example: /search?q=jacket

## Product Enquiries

Customers can submit an enquiry about a selected product. The form collects the customer's name, email address, phone number, optional message, and selected product ID.

The backend validates the request, verifies the product, and attempts SMTP email delivery. A thank-you message is shown within the enquiry form only after the backend reports success. The application does not currently redirect to a separate thank-you page.

## Email Configuration and Reviewer Testing

The application uses Nodemailer and a configurable SMTP server. Email delivery is not required to browse or search products, but an available SMTP server is required for successful enquiry submissions.

# Option A: Test with Mailpit (recommended)

Mailpit is a free local SMTP capture tool. It lets reviewers inspect outgoing messages without using a real mailbox or paid email service.

1. Start Mailpit. Download the appropriate executable from the Mailpit releases page, extract it, and run it from a terminal in the extracted directory. On Windows, the command may be:
   .\mailpit.exe
   Use the actual downloaded executable name if different. Alternatively, with Docker Desktop installed and running:
   docker run --rm -p 8025:8025 -p 1025:1025 axllent/mailpit
2. Confirm the SMTP configuration. Mailpit normally listens on 127.0.0.1:1025 for SMTP and exposes its web interface at http://localhost:8025. Use the backend .env values shown above. Mailpit normally does not require SMTP authentication; the backend must support that configuration.

3. Start the application. Run npm run dev from the project root, keeping Mailpit running in its own terminal or container.

4. Submit an enquiry. Open http://localhost:3000, choose a product, open its enquiry form, enter valid customer details, and click Send Enquiry.

5. Inspect the message. Open http://localhost:8025. If SMTP submission succeeds, the message should appear in the Mailpit inbox, and the frontend should display its thank-you confirmation. Inspect the recipient, selected product, and customer enquiry details.

This checks local SMTP submission and capture. It does not prove delivery to an external inbox.

# Option B: Test with another SMTP server

Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, and SMTP_PASSWORD to match a working SMTP server. Configure EMAIL_FROM and SALES_INBOX_EMAIL with appropriate addresses. Restart the backend after changing .env.
Test failure handling
With the application running, stop the SMTP test server and submit another valid enquiry. The frontend should display an error instead of a false success confirmation. The backend terminal may report an SMTP connection error.
Known SMTP setup limitation
During local development, an enquiry attempt failed with ECONNREFUSED ::1:1025 because no SMTP service accepted the connection. End-to-end SMTP capture has not yet been confirmed. Reviewers should start Mailpit or configure a reachable SMTP server before testing this flow. In addition, the backend's support for unauthenticated SMTP must be verified.
Backend API
Base URL: http://localhost:4000/api
Method Endpoint Purpose
GET /api/health Health check
GET /api/products Complete product catalogue
GET /api/products/top-rated Five highest-rated products
GET /api/products/category/:category Products in a category
GET /api/products/search?q=jacket Search title and description
GET /api/products/:id Product details
POST /api/enquiries Submit a product enquiry

Example Enquiry Request
POST /api/enquiries
Content-Type: application/json
{
"name": "Alex Johnson",
"email": "alex@example.com",
"phone": "9876543210",
"productId": 1,
"message": "Is this product available?"
}
Successful response after the email send operation completes:
{
"message": "Thank you for your enquiry!"
}

## Testing

Backend automated tests use Vitest and Supertest. The test suite includes product retrieval, rating-based ordering, category filtering, text search, product details, enquiry validation and HTTP responses, and environment configuration.

Run all backend tests
npm run test --workspace=@catalogue/backend

Run a specific test file
npm run test --workspace=@catalogue/backend -- tests/product.service.test.ts

TypeScript checks
npm run typecheck

Production build
npm run build

What automated tests do and do not prove
Automated tests mock relevant external/service dependencies, so they do not require a running SMTP server. Passing tests does not prove that a live SMTP server accepted a message or that a real inbox received it. Use the Mailpit steps above to test SMTP submission locally.
Suggested manual review checklist

1. Open the homepage and confirm five top-rated products appear.
2. Browse all products and open a product detail page.
3. Browse a category with spaces or an apostrophe in its name.
4. Search for text in a product title or description; confirm irrelevant results are excluded.
5. Submit an invalid enquiry and verify validation feedback.
6. With SMTP configured and running, submit a valid enquiry and inspect the captured email.
7. Stop SMTP and verify the enquiry displays an error instead of a thank-you message.
8. Check navigation and layout at desktop and mobile widths.
   Error Handling
   The application is designed to handle invalid product IDs, missing products, invalid enquiry submissions, upstream API failures, email delivery failures, and malformed JSON request bodies through backend controllers and error middleware.
   Troubleshooting
   ECONNREFUSED ::1:1025 or ECONNREFUSED 127.0.0.1:1025 — No SMTP server is accepting connections at the configured address. Start Mailpit and confirm the port. Using SMTP_HOST=127.0.0.1 avoids resolving localhost to IPv6 ::1 on some systems.

SMTP authentication error — Mailpit typically uses unauthenticated SMTP. Confirm that the environment schema and Nodemailer transporter allow blank credentials; otherwise use a compatible authenticated SMTP server.

Enquiry returns HTTP 500 — Inspect the backend terminal for the underlying error. Check SMTP connectivity, credentials, and configuration.

Mailpit inbox is empty — Confirm the enquiry request succeeded and that the backend uses Mailpit's SMTP host and port.

Product pages fail to load — Confirm the Express backend is running, the frontend API base URL is correct, and Fake Store API is reachable.
Security and Validation
The application uses Zod for server-side input validation, environment-based configuration, backend proxying of external product requests, external request timeouts, and error handling. The local development setup restricts cross-origin access to the configured frontend origin.

This is a proof-of-concept application, not a production-hardened commerce platform. Real SMTP credentials must not be committed.
Design Decisions and Assumptions
The implementation favors a maintainable, function-based backend and reusable frontend components. Next.js App Router is used for frontend routing and server-rendered product pages; Express handles product proxying and enquiries. Search uses a native GET form and substring matching.

See [DECISIONS.md](DECISIONS.md) for assumptions, simplified requirements, architecture trade-offs, scalability, and potential next steps.
AI Assistance
AI assisted with implementation guidance, code review, debugging, testing, and documentation. Suggestions were reviewed against the assessment requirements and runtime/test feedback.

See [AI_USAGE.md](AI_USAGE.md) for tools and models, agent instruction files, the development plan, key prompts and moments, and examples of AI mistakes and corrections.

## Time Spent

| Activity  | Time       |
| --------- | ---------- |
| Planning  | 0h 30m     |
| Building  | 1h 35m     |
| Testing   | 0h 35m     |
| Reviewing | 0h 20m     |
| **Total** | **3h 00m** |
