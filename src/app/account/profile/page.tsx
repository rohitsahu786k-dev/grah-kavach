"use client";

import { useState } from "react";
import { useCustomer } from "@/lib/auth/use-customer";
import { Field, Input } from "@/components/ui/form";

export default function AccountProfilePage() {
  const { customer, refresh } = useCustomer();

  const [firstName, setFirstName] = useState(customer?.firstName || "");
  const [lastName, setLastName] = useState(customer?.lastName || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setStatusMessage({ type: "error", text: "First and last names are required." });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setStatusMessage({ type: "error", text: "New password must be at least 6 characters." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ type: "error", text: "Passwords do not match." });
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      await refresh();
      setNewPassword("");
      setConfirmPassword("");
      setStatusMessage({ type: "success", text: "Profile updated successfully in WooCommerce." });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving profile.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-8">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Profile & Security
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal customer profile and authentication password
          </p>
        </div>

        {statusMessage ? (
          <div
            className={`mt-6 rounded-xl border p-4 text-xs font-medium ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-danger"
            }`}
          >
            {statusMessage.text}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Identity */}
          <div>
            <h3 className="text-base font-medium text-foreground">Personal Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="firstName" label="First Name" required>
                {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                  <Input
                    id={id}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={submitting}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    required
                  />
                )}
              </Field>

              <Field id="lastName" label="Last Name" required>
                {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                  <Input
                    id={id}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={submitting}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                    required
                  />
                )}
              </Field>
            </div>

            <div className="mt-4">
              <Field id="email" label="Email Address (Primary Login)">
                {({ id }) => (
                  <Input
                    id={id}
                    value={customer?.email || ""}
                    disabled
                    className="bg-stone-100 text-stone-500 cursor-not-allowed"
                  />
                )}
              </Field>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Email is tied to your WooCommerce customer identity. Contact support to change email.
              </p>
            </div>
          </div>

          {/* Change Password */}
          <div className="border-t border-border pt-6">
            <h3 className="text-base font-medium text-foreground">Change Password</h3>
            <p className="text-xs text-muted-foreground">
              Leave blank if you do not wish to update your password.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="newPassword" label="New Password" hint="At least 6 characters">
                {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                  <Input
                    id={id}
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={submitting}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                  />
                )}
              </Field>

              <Field id="confirmPassword" label="Confirm New Password">
                {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                  <Input
                    id={id}
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={submitting}
                    aria-describedby={describedBy}
                    aria-invalid={invalid}
                  />
                )}
              </Field>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
