import "server-only";

import { z } from "zod";
import { wooRequest } from "./client";

export const wooPaymentGatewaySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  instructions: z.string().optional().default(""),
  enabled: z.boolean(),
  method_title: z.string().optional().default(""),
  method_description: z.string().optional().default(""),
});

export type WooPaymentGateway = z.infer<typeof wooPaymentGatewaySchema>;

export type PaymentMethodInfo = {
  id: string;
  title: string;
  description: string;
  instructions: string;
  isOnline: boolean;
};

export async function getActivePaymentGateways(): Promise<PaymentMethodInfo[]> {
  try {
    const gateways = await wooRequest<WooPaymentGateway[]>({
      path: "/payment_gateways",
      schema: z.array(wooPaymentGatewaySchema),
      revalidate: false,
    });

    return gateways
      .filter((g) => g.enabled)
      .map((g) => ({
        id: g.id,
        title: g.title || g.method_title || g.id,
        description: g.description || g.method_description || "",
        instructions: g.instructions || "",
        isOnline: !["cod", "bacs", "cheque"].includes(g.id.toLowerCase()),
      }));
  } catch {
    return [];
  }
}
