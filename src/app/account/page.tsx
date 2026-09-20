"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomer } from "@/lib/auth/use-customer";

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

export default function AccountDashboardPage() {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, []);

  const activeShipments = orders.filter(
    (o) => o.status === "processing" || (o.shipments && o.shipments.length > 0),
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {customer?.firstName || customer?.username || "Customer"}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your Graha Kavach safety kits, delivery addresses, and shipment trackings.
            </p>
          </div>

          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-stone-800"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Track Any Order</span>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-stone-50/60 p-4">
            <span className="text-xs text-muted-foreground">Total Orders</span>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {loadingOrders ? "—" : orders.length}
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-stone-50/60 p-4">
            <span className="text-xs text-muted-foreground">Active Shipments</span>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {loadingOrders ? "—" : activeShipments.length}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-border/80 bg-stone-50/60 p-4 sm:col-span-1">
            <span className="text-xs text-muted-foreground">Account Status</span>
            <p className="mt-1 text-sm font-semibold text-foreground">Verified Member</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground">
              Verified orders placed directly with Graha Kavach
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <div className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <div className="mt-4">
              <Link
                href="/fire-safety-kit"
                className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90"
              >
                Browse Fire Safety Kit
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {orders.slice(0, 3).map((order) => {
              const formattedDate = new Date(order.dateCreated).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-foreground">
                        #{order.number}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                        {order.status}
                      </span>
                      {order.shipments && order.shipments.length > 0 ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Shipped ({order.shipments[0].trackingProvider})
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Placed on {formattedDate} • {order.itemCount} items • Total: ₹{order.total}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Address & Tracking Overview Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Shipping Address Card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-medium text-foreground">Delivery Address</h3>
            <Link
              href="/account/addresses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {customer?.shipping?.address_1 ? (
              <>
                <p className="font-semibold text-foreground">
                  {customer.shipping.first_name} {customer.shipping.last_name}
                </p>
                <p>{customer.shipping.address_1}</p>
                {customer.shipping.address_2 ? <p>{customer.shipping.address_2}</p> : null}
                <p>
                  {customer.shipping.city}, {customer.shipping.state} - {customer.shipping.postcode}
                </p>
                <p>India</p>
              </>
            ) : (
              <p className="italic">No default delivery address configured yet.</p>
            )}
          </div>
        </div>

        {/* Billing Address Card */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-medium text-foreground">Billing Address</h3>
            <Link
              href="/account/addresses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {customer?.billing?.address_1 ? (
              <>
                <p className="font-semibold text-foreground">
                  {customer.billing.first_name} {customer.billing.last_name}
                </p>
                <p>{customer.billing.address_1}</p>
                {customer.billing.address_2 ? <p>{customer.billing.address_2}</p> : null}
                <p>
                  {customer.billing.city}, {customer.billing.state} - {customer.billing.postcode}
                </p>
                <p>India</p>
                {customer.billing.phone ? (
                  <p className="mt-1 font-mono text-stone-600">+91 {customer.billing.phone}</p>
                ) : null}
              </>
            ) : (
              <p className="italic">No billing address saved yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
