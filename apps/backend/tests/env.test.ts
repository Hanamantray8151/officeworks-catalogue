import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Valid environment values for testing.
const validEnvironment = {
  NODE_ENV: "test",
  API_PORT: "4000",
  PRODUCT_API_BASE_URL: "https://fakestoreapi.com",

  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_USER: "test-user",
  SMTP_PASSWORD: "test-password",

  EMAIL_FROM: "noreply@example.com",
  SALES_INBOX_EMAIL: "sales@example.com",
};

// Set a predictable environment before each test.
function setValidEnvironment() {
  for (const [key, value] of Object.entries(validEnvironment)) {
    vi.stubEnv(key, value);
  }
}

// Import a fresh copy of the configuration module.
async function loadEnvironment() {
  vi.resetModules();

  return import("../src/config/env");
}

describe("Backend Environment Configuration", () => {
  beforeEach(() => {
    setValidEnvironment();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("loads valid environment configuration", async () => {
    await expect(loadEnvironment()).resolves.toBeDefined();
  });

  it("accepts a valid API port", async () => {
    vi.stubEnv("API_PORT", "5000");

    await expect(loadEnvironment()).resolves.toBeDefined();
  });

  it("rejects an invalid API port", async () => {
    vi.stubEnv("API_PORT", "not-a-number");

    await expect(loadEnvironment()).rejects.toThrow();
  });

  it("rejects an invalid product API URL", async () => {
    vi.stubEnv("PRODUCT_API_BASE_URL", "not-a-valid-url");

    await expect(loadEnvironment()).rejects.toThrow();
  });

  it("accepts a valid HTTPS product API URL", async () => {
    vi.stubEnv("PRODUCT_API_BASE_URL", "https://example.com/api");

    await expect(loadEnvironment()).resolves.toBeDefined();
  });

  it("accepts a valid SMTP port", async () => {
    vi.stubEnv("SMTP_PORT", "2525");

    await expect(loadEnvironment()).resolves.toBeDefined();
  });

  it("rejects an invalid SMTP port", async () => {
    vi.stubEnv("SMTP_PORT", "invalid-port");

    await expect(loadEnvironment()).rejects.toThrow();
  });

  it("rejects an invalid sender email", async () => {
    vi.stubEnv("SALES_INBOX_EMAIL", "invalid-email");

    await expect(loadEnvironment()).rejects.toThrow();
  });

  it("rejects an invalid recipient email", async () => {
    vi.stubEnv("SALES_INBOX_EMAIL", "not-an-email");

    await expect(loadEnvironment()).rejects.toThrow();
  });

  it("accepts valid sender and recipient emails", async () => {
    vi.stubEnv("EMAIL_FROM", "support@example.com");

    vi.stubEnv("SALES_INBOX_EMAIL", "enquiries@example.com");

    await expect(loadEnvironment()).resolves.toBeDefined();
  });
});
