"use client";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay needs a browser."));
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the secure payment window. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export type RazorpayResult =
  | { status: "paid"; payment: RazorpaySuccess }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

type PayInput = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: Partial<{ name: string; email: string; contact: string }>;
  one_click_checkout?: boolean;
};

/** Opens the Razorpay popup and resolves once the customer pays, closes it, or the payment fails. */
export async function payWithRazorpay(input: PayInput): Promise<RazorpayResult> {
  await loadScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Secure payment window is unavailable.");

  return new Promise<RazorpayResult>((resolve) => {
    const options: Record<string, unknown> = {
      key: input.keyId,
      order_id: input.orderId,
      amount: input.amount,
      currency: input.currency,
      name: input.name || "Graha Kavach",
      description: input.description || "Fire Safety Order",
      theme: { color: "#E01820" },
      one_click_checkout: input.one_click_checkout ?? true,
      handler: (payment: RazorpaySuccess) => resolve({ status: "paid", payment }),
      modal: {
        ondismiss: () => resolve({ status: "dismissed" }),
        backdropclose: false,
        escape: true,
      },
    };

    if (input.prefill) {
      options.prefill = input.prefill;
    }

    const instance = new Razorpay(options);

    instance.on("payment.failed", (response) =>
      resolve({
        status: "failed",
        message: response.error?.description || "The payment could not be completed.",
      }),
    );

    instance.open();
  });
}
