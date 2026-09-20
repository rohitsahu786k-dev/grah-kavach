import { z } from "zod";

export const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UT", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
] as const;

export const indianAddressSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(100, "Email is too long"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/^(\+91|0)/, "").replace(/\D/g, ""))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Enter a valid 10-digit Indian mobile number",
    }),
  address1: z
    .string()
    .trim()
    .min(3, "House/flat number and street name are required")
    .max(150, "Address is too long"),
  address2: z
    .string()
    .trim()
    .max(150, "Landmark/locality is too long")
    .optional()
    .default(""),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(50, "City name is too long"),
  state: z
    .string()
    .trim()
    .min(1, "Please select your state"),
  postcode: z
    .string()
    .trim()
    .refine((val) => /^[1-9][0-9]{5}$/.test(val), {
      message: "Enter a valid 6-digit PIN code",
    }),
  country: z.literal("IN").default("IN"),
  orderNotes: z
    .string()
    .trim()
    .max(500, "Order notes must be under 500 characters")
    .optional()
    .default(""),
});

export const checkoutSubmissionSchema = z.object({
  address: indianAddressSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart cannot be empty"),
  couponCode: z.string().trim().optional().default(""),
  idempotencyKey: z.string().min(10, "Idempotency key is missing"),
});

export type IndianAddress = z.infer<typeof indianAddressSchema>;
export type CheckoutSubmission = z.infer<typeof checkoutSubmissionSchema>;
