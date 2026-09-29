"use client";

import { useState } from "react";
import { Edit2, MapPin, Plus, Receipt, ShieldCheck, Truck } from "lucide-react";
import { useCustomer } from "@/lib/auth/use-customer";
import { AddressForm } from "@/components/checkout/address-form";
import { indianAddressSchema, type IndianAddress } from "@/lib/validation/checkout";

export default function AccountAddressesPage() {
  const { customer, refresh } = useCustomer();
  const [editingTab, setEditingTab] = useState<"shipping" | "billing" | null>(null);

  const shipping = customer?.shipping || {};
  const billing = customer?.billing || {};

  const hasShipping = Boolean(shipping.address_1 && shipping.city);
  const hasBilling = Boolean(billing.address_1 && billing.city);

  const [shippingForm, setShippingForm] = useState<IndianAddress>({
    firstName: shipping.first_name || customer?.firstName || "",
    lastName: shipping.last_name || customer?.lastName || "",
    company: shipping.company || "",
    gstin: shipping.gstin || "",
    email: customer?.email || "",
    phone: billing.phone || "",
    address1: shipping.address_1 || "",
    address2: shipping.address_2 || "",
    city: shipping.city || "",
    state: shipping.state || "RJ",
    postcode: shipping.postcode || "",
    country: "IN",
    orderNotes: "",
  });

  const [billingForm, setBillingForm] = useState<IndianAddress>({
    firstName: billing.first_name || customer?.firstName || "",
    lastName: billing.last_name || customer?.lastName || "",
    company: billing.company || "",
    gstin: billing.gstin || "",
    email: billing.email || customer?.email || "",
    phone: billing.phone || "",
    address1: billing.address_1 || "",
    address2: billing.address_2 || "",
    city: billing.city || "",
    state: billing.state || "RJ",
    postcode: billing.postcode || "",
    country: "IN",
    orderNotes: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof IndianAddress, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentAddress = editingTab === "shipping" ? shippingForm : billingForm;
  const setCurrentAddress = editingTab === "shipping" ? setShippingForm : setBillingForm;

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

  const startEdit = (tab: "shipping" | "billing") => {
    setEditingTab(tab);
    setFormErrors({});
    setStatusMessage(null);

    // Sync latest customer values
    if (tab === "shipping") {
      setShippingForm({
        firstName: shipping.first_name || customer?.firstName || "",
        lastName: shipping.last_name || customer?.lastName || "",
        company: shipping.company || "",
        gstin: shipping.gstin || "",
        email: customer?.email || "",
        phone: billing.phone || "",
        address1: shipping.address_1 || "",
        address2: shipping.address_2 || "",
        city: shipping.city || "",
        state: shipping.state || "RJ",
        postcode: shipping.postcode || "",
        country: "IN",
        orderNotes: "",
      });
    } else {
      setBillingForm({
        firstName: billing.first_name || customer?.firstName || "",
        lastName: billing.last_name || customer?.lastName || "",
        company: billing.company || "",
        gstin: billing.gstin || "",
        email: billing.email || customer?.email || "",
        phone: billing.phone || "",
        address1: billing.address_1 || "",
        address2: billing.address_2 || "",
        city: billing.city || "",
        state: billing.state || "RJ",
        postcode: billing.postcode || "",
        country: "IN",
        orderNotes: "",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTab) return;

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
          type: editingTab,
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
        text: `${editingTab === "shipping" ? "Delivery" : "Billing"} address saved successfully.`,
      });
      setEditingTab(null);
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
            Saved delivery and billing destinations for your account and tax invoices
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

        {/* View mode: Clean separate cards */}
        {!editingTab ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Delivery / Shipping Card */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-stone-50/50 p-5 shadow-xs transition hover:border-primary/40">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary-subtle p-2 text-primary">
                      <Truck className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Delivery Address</h3>
                      <p className="text-[11px] text-muted-foreground">Default shipping destination</p>
                    </div>
                  </div>
                  {hasShipping ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Saved
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                      Not set
                    </span>
                  )}
                </div>

                <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {hasShipping ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        {shipping.first_name} {shipping.last_name}
                      </p>
                      {shipping.company ? (
                        <p className="font-medium text-foreground">{shipping.company}</p>
                      ) : null}
                      <p className="mt-1">{shipping.address_1}</p>
                      {shipping.address_2 ? <p>{shipping.address_2}</p> : null}
                      <p>
                        {shipping.city}, {shipping.state} - {shipping.postcode}
                      </p>
                      <p className="mt-2 font-medium text-foreground">India</p>
                    </>
                  ) : (
                    <p className="py-4 text-stone-500 italic">
                      No delivery address saved yet. Add your address for faster checkout.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => startEdit("shipping")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-stone-50 hover:text-primary"
                >
                  {hasShipping ? (
                    <>
                      <Edit2 className="size-3.5" />
                      <span>Edit Delivery Address</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Add Delivery Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Billing / Tax Invoice Card */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-stone-50/50 p-5 shadow-xs transition hover:border-primary/40">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary-subtle p-2 text-primary">
                      <Receipt className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Billing Address</h3>
                      <p className="text-[11px] text-muted-foreground">For tax invoices & receipts</p>
                    </div>
                  </div>
                  {hasBilling ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Saved
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                      Not set
                    </span>
                  )}
                </div>

                <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  {hasBilling ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        {billing.first_name} {billing.last_name}
                      </p>
                      {billing.company ? (
                        <p className="font-medium text-foreground">{billing.company}</p>
                      ) : null}
                      {billing.gstin ? (
                        <p className="mt-0.5 font-mono text-[11px] font-medium text-primary">
                          GSTIN: {billing.gstin}
                        </p>
                      ) : null}
                      <p className="mt-1">{billing.address_1}</p>
                      {billing.address_2 ? <p>{billing.address_2}</p> : null}
                      <p>
                        {billing.city}, {billing.state} - {billing.postcode}
                      </p>
                      <p className="mt-2 font-medium text-foreground">India</p>
                      {billing.phone ? (
                        <p className="mt-2 font-mono text-stone-600">Mobile: +91 {billing.phone}</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="py-4 text-stone-500 italic">
                      No billing address saved yet. Add business details for GST invoices.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => startEdit("billing")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-foreground shadow-xs transition hover:bg-stone-50 hover:text-primary"
                >
                  {hasBilling ? (
                    <>
                      <Edit2 className="size-3.5" />
                      <span>Edit Billing Address</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Add Billing Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form mode: Displayed only when editing */
          <div className="mt-6 rounded-xl border border-primary/20 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {editingTab === "shipping" ? "Edit Delivery Address" : "Edit Billing Address"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingTab === "shipping"
                    ? "Update your primary shipping destination in India"
                    : "Update your tax invoice billing address and optional GSTIN"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTab(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6">
              <AddressForm
                address={currentAddress}
                onChange={handleFieldChange}
                errors={formErrors}
                disabled={submitting}
              />

              <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving Address..."
                    : `Save ${editingTab === "shipping" ? "Delivery" : "Billing"} Address`}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTab(null)}
                  disabled={submitting}
                  className="inline-flex rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
