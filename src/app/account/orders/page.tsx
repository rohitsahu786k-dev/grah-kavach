"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  total: string;
};

type OrderSummary = {
  id: number;
  number: string;
  orderKey: string;
  status: string;
  dateCreated: string;
  total: string;
  currency: string;
  itemCount: number;
  items: OrderItem[];
  shipping: Record<string, string>;
  billing: Record<string, string>;
  shipments: {
    trackingNumber: string;
    trackingProvider: string;
    trackingLink: string;
    dateShipped: string;
  }[];
  isShipped: boolean;
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-8">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete history of your Graha Kavach equipment purchases and shipment tracking
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <div className="inline-block size-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="mt-3">Loading order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-foreground">No Orders Found</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You haven&apos;t placed any orders with Graha Kavach yet.
            </p>
            <div className="mt-6">
              <Link
                href="/fire-safety-kit"
                className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
              >
                Browse Fire Safety Kit
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.dateCreated).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-stone-50/50 p-5 transition-all hover:border-stone-300 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                    <div>
                      <span className="font-mono text-base font-bold text-foreground">
                        Order #{order.number}
                      </span>
                      <p className="text-xs text-muted-foreground">Placed on {formattedDate}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-xs border border-border">
                        {order.status}
                      </span>

                      {order.shipments && order.shipments.length > 0 ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          Shipped: {order.shipments[0].trackingProvider}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-foreground">₹{item.total}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Total:</span>{" "}
                      <span className="text-base font-bold text-foreground">₹{order.total}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {order.shipments && order.shipments.length > 0 && order.shipments[0].trackingLink ? (
                        <a
                          href={order.shipments[0].trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          Track Package ↗
                        </a>
                      ) : null}

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-xs border border-border hover:bg-stone-100"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
