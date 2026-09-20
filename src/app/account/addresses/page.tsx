"use client";

import { useState } from "react";
import { useCustomer } from "@/lib/auth/use-customer";
import { AddressForm } from "@/components/checkout/address-form";
import { indianAddressSchema, type IndianAddress } from "@/lib/validation/checkout";

export default function AccountAddressesPage() {
  const { customer, refresh } = useCustomer();
  const [activeTab, setActiveTab] = useState<"shipping" | "billing">("shipping");

  const initialShipping: IndianAddress = {
    firstName: customer?.shipping?.first_name || customer?.firstName || "",
    lastName: customer?.shipping?.last_name || customer?.lastName || "",
    email: customer?.email || "",
    phone: customer?.billing?.phone || "",
    address1: customer?.shipping?.address_1 || "",
    address2: customer?.shipping?.address_2 || "",
    city: customer?.shipping?.city || "",
    state: customer?.shipping?.state || "RJ",
    postcode: customer?.shipping?.postcode || "",
    country: "IN",
    orderNotes: "",
  };

  const initialBilling: IndianAddress = {
    firstName: customer?.billing?.first_name || customer?.firstName || "",
    lastName: customer?.billing?.last_name || customer?.lastName || "",
    email: customer?.billing?.email || customer?.email || "",
    phone: customer?.billing?.phone || "",
    address1: customer?.billing?.address_1 || "",
    address2: customer?.billing?.address_2 || "",
    city: customer?.billing?.city || "",
    state: customer?.billing?.state || "RJ",
    postcode: customer?.billing?.postcode || "",
    country: "IN",
    orderNotes: "",
  };

  const [shippingAddress, setShippingAddress] = useState<IndianAddress>(initialShipping);
  const [billingAddress, setBillingAddress] = useState<IndianAddress>(initialBilling);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof IndianAddress, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentAddress = activeTab === "shipping" ? shippingAddress : billingAddress;
  const setCurrentAddress = activeTab === "shipping" ? setShippingAddress : setBillingAddress;

  const handleFieldChange = (field: keyof IndianAddress, value: string) => {
    setCurrentAddress((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const parsed = indianAddressSchema.safeParse(currentAddress);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof IndianAddress, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof IndianAddress;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      setStatusMessage({ type: "error", text: "Please fix the highlighted errors." });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          address: parsed.data,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update address.");
      }

      await refresh();
      setStatusMessage({
        type: "success",
        text: `${activeTab === "shipping" ? "Delivery" : "Billing"} address updated successfully in WooCommerce.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving address.",
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
            Address Book
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your default delivery and billing destinations for seamless ordering
          </p>
        </div>

        {/* Tab switch */}
        <div className="mt-6 flex border-b border-border">
          <button
            type="button"
            onClick={() => {
              setActiveTab("shipping");
              setFormErrors({});
              setStatusMessage(null);
            }}
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "shipping"
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-foreground"
            }`}
          >
            Delivery Address (Shipping)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("billing");
              setFormErrors({});
              setStatusMessage(null);
            }}
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "billing"
                ? "border-primary text-primary"
                : "border-transparent text-stone-500 hover:text-foreground"
            }`}
          >
            Billing Address (Tax Invoices)
          </button>
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

        <form onSubmit={handleSave} className="mt-6">
          <AddressForm
            address={currentAddress}
            onChange={handleFieldChange}
            errors={formErrors}
            disabled={submitting}
          />

          <div className="mt-8 border-t border-border pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Saving Address..." : `Save ${activeTab === "shipping" ? "Delivery" : "Billing"} Address`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
