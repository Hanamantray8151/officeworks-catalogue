"use client";

import { useState, type FormEvent } from "react";

import { ApiError, submitEnquiry } from "@/lib/api";

interface EnquiryFormProps {
  productId: number;
  productTitle: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();

  if (name.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must not exceed 100 characters.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[0-9\s()-]{7,20}$/.test(phone)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (message.length > 1000) {
    errors.message = "Message must not exceed 1000 characters.";
  }

  return errors;
}

export default function EnquiryForm({
  productId,
  productTitle,
}: EnquiryFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);

  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [serverError, setServerError] = useState<string | null>(null);

  function updateField(field: keyof FormValues, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setServerError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || successMessage) {
      return;
    }

    const validationErrors = validateForm(values);

    setErrors(validationErrors);
    setServerError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitEnquiry({
        productId,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });

      setSuccessMessage(
        response.message || "Thank you! Your enquiry has been submitted.",
      );

      setValues(initialValues);
    } catch (error) {
      console.error("Enquiry submission failed:", error);

      if (error instanceof ApiError) {
        if (error.status === 400) {
          setServerError("Please check your details and try again.");
        } else if (error.status === 404) {
          setServerError("This product is no longer available.");
        } else {
          setServerError("We couldn't send your enquiry. Please try again.");
        }
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="form-success" role="status" aria-live="polite">
        <h2>Enquiry Submitted</h2>

        <p>{successMessage}</p>

        <p>
          Your enquiry about <strong>{productTitle}</strong> has been received.
        </p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Enquire About This Product</h2>

      <p className="product-description">
        Product: <strong>{productTitle}</strong>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div className="form-group">
          <label htmlFor="enquiry-name" className="form-label">
            Full Name *
          </label>

          <input
            id="enquiry-name"
            name="name"
            type="text"
            className="form-input"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            maxLength={101}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.name && (
            <p id="name-error" className="form-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email address */}
        <div className="form-group">
          <label htmlFor="enquiry-email" className="form-label">
            Email Address *
          </label>

          <input
            id="enquiry-email"
            name="email"
            type="email"
            className="form-input"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.email && (
            <p id="email-error" className="form-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone number */}
        <div className="form-group">
          <label htmlFor="enquiry-phone" className="form-label">
            Phone Number *
          </label>

          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            className="form-input"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.phone && (
            <p id="phone-error" className="form-error" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Optional message */}
        <div className="form-group">
          <label htmlFor="enquiry-message" className="form-label">
            Message (Optional)
          </label>

          <textarea
            id="enquiry-message"
            name="message"
            className="form-textarea"
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={5}
            maxLength={1001}
            placeholder="What would you like to know about this product?"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            disabled={isSubmitting}
          />

          {errors.message && (
            <p id="message-error" className="form-error" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Server submission error */}
        {serverError && (
          <div className="error-state" role="alert">
            <p>{serverError}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Sending Enquiry..." : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}
