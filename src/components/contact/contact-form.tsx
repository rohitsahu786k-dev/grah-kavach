"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Fire Safety Consultation",
    message: "",
    website_hp: "", // Honeypot
  });
  /*
   * When the form was rendered in the browser, sent with the submission as a
   * simple bot check. It is never displayed, so it is a ref rather than state:
   * recording it must not cause a re-render.
   */
  const formLoadTime = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    inquiryId?: number;
  } | null>(null);

  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          timestamp: formLoadTime.current,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message. Please try again.");
      }

      setFeedback({
        type: "success",
        message: data.message || "Thank you! Your inquiry has been submitted successfully.",
        inquiryId: data.inquiryId,
      });

      // Reset form
      setFormState({
        name: "",
        email: "",
        phone: "",
        subject: "Fire Safety Consultation",
        message: "",
        website_hp: "",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Send Us a Message
      </h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Fill out the form below. Our fire safety technical team typically responds within 2 business hours.
      </p>

      {feedback?.type === "success" && (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-950">Inquiry Received</p>
              <p className="mt-1 text-sm text-emerald-800">{feedback.message}</p>
              {feedback.inquiryId && (
                <p className="mt-2 text-xs font-mono font-medium text-emerald-700">
                  Reference ID: #GK-{feedback.inquiryId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {feedback?.type === "error" && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Hidden Honeypot Field for anti-spam bots */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_hp">Leave this empty</label>
          <input
            type="text"
            id="website_hp"
            name="website_hp"
            tabIndex={-1}
            autoComplete="off"
            value={formState.website_hp}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5 flex rounded-md shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-border bg-background-subtle px-3 text-sm text-foreground-muted">
                +91
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                maxLength={10}
                value={formState.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="block w-full min-w-0 rounded-r-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formState.email}
            onChange={handleChange}
            placeholder="rahul.sharma@example.com"
            className="mt-1.5 block w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Subject / Query Type
          </label>
          <select
            id="subject"
            name="subject"
            value={formState.subject}
            onChange={handleChange}
            className="mt-1.5 block w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Fire Safety Consultation">Residential Fire Safety Consultation</option>
            <option value="Order & Delivery Tracking">Order & Shipping Inquiry</option>
            <option value="Apartment Society / Bulk Orders">Apartment Society / Bulk Protection</option>
            <option value="Product Specifications">Product Specifications & Maintenance</option>
            <option value="Other">Other Inquiry</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            value={formState.message}
            onChange={handleChange}
            placeholder="How can our safety engineers assist you?"
            className="mt-1.5 block w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Message...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
