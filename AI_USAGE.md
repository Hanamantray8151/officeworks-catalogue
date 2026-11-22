# AI Usage Notes

## 1. AI Tools and Models Used

**Primary AI tool:** OpenAI ChatGPT

**Model:** GPT-6

ChatGPT was used as a development assistant throughout the Product Catalogue technical assessment.

AI assistance included:

- Breaking down requirements into implementation tasks.
- Generating React, Next.js, TypeScript, Node.js, and Express code.
- Designing API routes and function-based services.
- Generating unit and API integration tests.
- Debugging TypeScript, routing, validation, and testing errors.
- Explaining architecture decisions and implementation trade-offs.
- Preparing project documentation.

**Development environment:** Visual Studio Code, Node.js, npm, Git, and GitHub.

These development tools were used alongside AI assistance; they are not being represented as AI models.

## 2. Agent Instruction Files

No dedicated AI agent instruction files were created or used during the development workflow documented here.

Examples of such files include:

- `CLAUDE.md`
- `AGENTS.md`
- `.cursor/rules`

Instead, development instructions were provided directly through ChatGPT conversations.

The main instructions were to:

- Follow the assessment requirements and acceptance criteria.
- Implement the solution incrementally, one file at a time.
- Use TypeScript for the frontend and backend.
- Prefer function-based backend services over unnecessary classes.
- Keep external product API requests behind the Express backend.
- Explain implementation decisions and provide verification steps.
- Fix existing code with targeted changes rather than unnecessary rewrites.

**Repository note:** No agent instruction files are claimed as committed. If any were subsequently created or used, their actual paths should be listed here and the files committed to the repository.

## 3. Development Plan and Specification

The assessment requirements and acceptance criteria were used as the primary specification.

An incremental implementation plan was developed with AI assistance.

### Phase 1 — Project Setup

Create an npm-workspaces monorepo with:

- Next.js frontend
- Express backend
- TypeScript configuration
- Environment configuration
- Shared development commands

### Phase 2 — Backend Implementation

Implement:

- Fake Store API integration
- Product listing and details
- Top-five-rated product selection
- Category filtering
- Product text search
- Customer enquiry validation
- SMTP email integration
- HTTP error handling

### Phase 3 — Frontend Implementation

Implement:

- Homepage with five highest-rated products
- All-products page
- Category navigation and product listings
- Product search
- Product details
- Customer enquiry form and confirmation
- Responsive styling and loading states

### Phase 4 — Testing and Verification

Add automated tests covering product services, search behavior, category filtering, enquiry validation, API responses, and environment configuration.

Use TypeScript checks, production builds, and manual browser testing to identify integration problems.

### Phase 5 — Documentation and Submission

Prepare:

- `README.md`
- `DECISIONS.md`
- `AI_USAGE.md`

The plan was maintained through the development conversation rather than through a separate committed specification document.

## 4. Five Key AI Prompts and Development Moments

### Moment 1 — Establishing the Application Architecture

**Prompt / instruction:**

> Build the Product Catalogue using Next.js, React, TypeScript, Node.js, and Express. Keep Fake Store API requests in the backend and implement the project one file at a time.

**AI contribution:**

AI helped organize the application into a frontend and backend using npm workspaces.

The backend was structured into routes, controllers, services, validators, and middleware.

**Impact:**

This established clear boundaries between presentation, business logic, and external integrations.

### Moment 2 — Choosing Function-Based Services

**Prompt / instruction:**

> Use function-based services instead of classes, and keep the implementation simple and maintainable.

**AI contribution:**

AI helped implement reusable service functions such as:

- `getAllProducts()`
- `getTopRatedProducts()`
- `getProductsByCategory()`
- `searchProducts()`
- `getProductById()`

**Impact:**

The resulting design avoided unnecessary class abstractions and kept business logic independently testable.

### Moment 3 — Correcting Category URL Handling

**Problem reported:**

> Categories containing spaces and apostrophes does not work.

**AI contribution:**

AI helped investigate URL encoding and decoding across Next.js dynamic routes and backend requests.

The category parameter handling was corrected.

**Impact:**

Categories such as `men's clothing` could be opened successfully, and their products appeared.

### Moment 4 — Reviewing the Search Acceptance Criteria

**Prompt:**

> GIVEN I am looking for a specific product AND I have entered a search term in the search bar WHEN I click the search button THEN I only see products that have text matching that search term. Review the requirement and acceptance criteria as you are searching for categories only.

**AI contribution:**

AI helped distinguish product text search from category filtering.

The intended search behavior was clarified as case-insensitive matching against product titles and descriptions, without including products solely because their category matched.

Additional tests were proposed for title matches, description matches, and category-only exclusions.

**Impact:**

This improved the alignment between the search implementation and the assessment's acceptance criteria.

### Moment 5 — Debugging Backend Tests

**Prompts / issues reported:**

> If I import the supertest I am getting error - "I cannot find module".

> Now one test failed fix that.

**AI contribution:**

AI helped investigate:

- Missing Supertest dependencies and TypeScript declarations.
- Express server lifecycle issues during tests.
- Malformed JSON returning HTTP 500 instead of HTTP 400.
- Incorrect environment variable names in configuration tests.

**Impact:**

The debugging process led to targeted changes in test setup, error handling, and environment tests.

It also reinforced the need to check AI-generated code against actual project dependencies and exported interfaces.

## 5. Where AI Got Something Wrong and How It Was Caught

### Issue 1 — Search Behavior Was Too Broad

**What went wrong:**

The initial search approach did not sufficiently distinguish product text matching from category filtering.

**How it was caught:**

The implementation was reviewed against the exact GIVEN/WHEN/THEN acceptance criterion.

**Correction:**

The intended matching rule was clarified to use product titles and descriptions rather than category membership alone.

Tests were introduced to detect category-only matches.

**Lesson:**

A feature appearing functional does not guarantee that it satisfies the acceptance criteria.

### Issue 2 — Category URLs Were Not Handled Correctly

**What went wrong:**

Categories containing spaces and apostrophes initially produced incorrect results.

**How it was caught:**

Manual browser testing showed that category names were not being handled correctly and that products were missing.

**Correction:**

URL parameter decoding was corrected and the category page was tested again.

**Lesson:**

Generated routing code needs to be verified using realistic input, including special characters.

### Issue 3 — Test Server Lifecycle Error

**What went wrong:**

The enquiry API tests encountered:

`Listen method has been called more than once without closing.`

**How it was caught:**

The Vitest terminal output exposed the repeated server listening error.

**Correction:**

The test approach was adjusted to use Supertest with the Express application rather than repeatedly starting a server manually.

**Lesson:**

Test infrastructure must be configured correctly before interpreting test failures as application defects.

### Issue 4 — Malformed JSON Returned the Wrong HTTP Status

**What went wrong:**

A malformed JSON request returned HTTP 500, while the test expected HTTP 400.

**How it was caught:**

An API integration test failed and displayed the mismatch between the expected and actual status codes.

**Correction:**

The error middleware was updated to distinguish malformed JSON parsing errors from unexpected server failures.

**Lesson:**

Tests can reveal incorrect error handling even when the main application functionality works.

### Issue 5 — Incorrect Environment Variable Name

**What went wrong:**

An AI-generated environment test used `EMAIL_TO`, while the application used `SALES_INBOX_EMAIL`.

**How it was caught:**

The invalid recipient email test unexpectedly passed configuration loading instead of rejecting the invalid value.

**Correction:**

The test was updated to use `SALES_INBOX_EMAIL`.

**Lesson:**

AI can invent plausible names that do not match an existing codebase. Generated tests and configuration must be checked against the actual implementation.

## 6. Verification and Developer Responsibility

AI-generated suggestions were reviewed through development and debugging.

The verification approach included:

- TypeScript type checking.
- Vitest unit tests.
- Supertest API integration tests.
- Manual browser testing.
- Reviewing terminal errors and correcting the relevant files.
- Checking implementation behavior against acceptance criteria.

Mocked tests were used to avoid depending on external services during automated verification.

However, mocked tests alone do not prove that external API requests or SMTP delivery work in a live environment.

Final test and build results should be confirmed before submission rather than assumed.

The developer remains responsible for understanding, reviewing, and validating the submitted implementation.

## 7. Conclusion

ChatGPT was used as an AI development assistant for planning, code generation, debugging, testing, and documentation.

The most important part of the workflow was not simply accepting AI-generated code, but reviewing it against requirements, identifying incorrect assumptions, and applying corrections.

The development process demonstrated that effective AI-assisted engineering combines the speed of AI tools with human judgment, testing, and accountability.
