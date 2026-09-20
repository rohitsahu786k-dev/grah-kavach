"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { INDIAN_STATES, type IndianAddress } from "@/lib/validation/checkout";

type AddressFormProps = {
  address: IndianAddress;
  onChange: (field: keyof IndianAddress, value: string) => void;
  errors: Partial<Record<keyof IndianAddress, string>>;
  disabled?: boolean;
};

export function AddressForm({
  address,
  onChange,
  errors,
  disabled = false,
}: AddressFormProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-foreground">
          1. Contact Information
        </h3>
        <p className="text-xs text-muted-foreground">
          Order updates and shipment tracking alerts will be sent here.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="email"
            label="Email Address"
            hint="For order confirmation & invoice"
            error={errors.email}
            required
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                type="email"
                value={address.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="name@example.com"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            id="phone"
            label="Mobile Number"
            hint="For courier delivery coordination"
            error={errors.phone}
            required
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-stone-500">
                  +91
                </span>
                <Input
                  id={id}
                  type="tel"
                  value={address.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="pl-12 font-mono tracking-wider"
                  disabled={disabled}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground">
          2. Delivery Address (India)
        </h3>
        <p className="text-xs text-muted-foreground">
          Please provide complete details for dispatch via Delhivery / India Post / BlueDart.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First Name"
            error={errors.firstName}
            required
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                value={address.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                placeholder="First name"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            id="lastName"
            label="Last Name"
            error={errors.lastName}
            required
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                value={address.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                placeholder="Last name"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field
            id="address1"
            label="Flat, House no., Building, Company, Apartment"
            error={errors.address1}
            required
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                value={address.address1}
                onChange={(e) => onChange("address1", e.target.value)}
                placeholder="e.g. Flat 302, Green Valley Apartments, MG Road"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            id="address2"
            label="Area, Street, Sector, Village, Landmark (Optional)"
            hint="Helps delivery executive locate your address quickly"
            error={errors.address2}
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                value={address.address2 || ""}
                onChange={(e) => onChange("address2", e.target.value)}
                placeholder="e.g. Near City Hospital / Opp. Police Station"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="postcode"
              label="PIN Code"
              hint="6 digits"
              error={errors.postcode}
              required
            >
              {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                <Input
                  id={id}
                  type="text"
                  maxLength={6}
                  value={address.postcode}
                  onChange={(e) => onChange("postcode", e.target.value)}
                  placeholder="313001"
                  className="font-mono tracking-wider"
                  disabled={disabled}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              )}
            </Field>

            <Field
              id="city"
              label="Town / City"
              error={errors.city}
              required
            >
              {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                <Input
                  id={id}
                  value={address.city}
                  onChange={(e) => onChange("city", e.target.value)}
                  placeholder="e.g. Udaipur"
                  disabled={disabled}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              )}
            </Field>

            <Field
              id="state"
              label="State"
              error={errors.state}
              required
            >
              {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                <Select
                  id={id}
                  value={address.state}
                  onChange={(e) => onChange("state", e.target.value)}
                  disabled={disabled}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            id="orderNotes"
            label="Delivery Instructions (Optional)"
            hint="Special notes for delivery personnel"
            error={errors.orderNotes}
          >
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Textarea
                id={id}
                value={address.orderNotes || ""}
                onChange={(e) => onChange("orderNotes", e.target.value)}
                placeholder="e.g. Ring the bell, deliver to front desk"
                className="min-h-[80px]"
                disabled={disabled}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}
