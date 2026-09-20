"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomer } from "@/lib/auth/use-customer";

const navItems = [
  {
    label: "Dashboard",
    href: "/account",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Profile & Security",
    href: "/account/profile",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Track Shipment",
    href: "/track-order",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomer();

  const handleLogout = async () => {
    await logout();
    router.push("/account/login");
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
        {/* Customer Mini Profile */}
        <div className="border-b border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Signed In As
          </p>
          <p className="mt-1 truncate font-semibold text-foreground">
            {customer?.firstName
              ? `${customer.firstName} ${customer.lastName || ""}`.trim()
              : customer?.username || "Customer"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{customer?.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-stone-700 hover:bg-stone-100 hover:text-foreground"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-red-50 hover:text-danger"
          >
            <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
