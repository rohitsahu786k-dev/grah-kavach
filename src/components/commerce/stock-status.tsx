import { Badge } from "@/components/ui/badge";
import type { ProductSummary } from "@/types";

type StockStatusProps = {
  status: ProductSummary["stockStatus"];
  quantity?: number | null;
  /** Below this, show the remaining count to signal genuine scarcity. */
  lowStockThreshold?: number;
  className?: string;
};

/**
 * Only states WooCommerce actually reports. No invented "selling fast" —
 * fabricated urgency on a safety product is both misleading and needless.
 */
export function StockStatus({
  status,
  quantity,
  lowStockThreshold = 5,
  className,
}: StockStatusProps) {
  if (status === "outofstock") {
    return (
      <Badge tone="neutral" className={className}>
        Out of stock
      </Badge>
    );
  }

  if (status === "onbackorder") {
    return (
      <Badge tone="warning" className={className}>
        Available on backorder
      </Badge>
    );
  }

  const isLow = typeof quantity === "number" && quantity > 0 && quantity <= lowStockThreshold;

  return (
    <Badge tone={isLow ? "warning" : "success"} className={className}>
      {isLow ? `Only ${quantity} left` : "In stock"}
    </Badge>
  );
}
