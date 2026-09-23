"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Flame,
  Headphones,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  RotateCcw,
  Shield,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/lib/wordpress/adapters";

function getNavIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("fire") || l.includes("kit")) return Flame;
  if (l.includes("account") || l.includes("profile")) return User;
  if (l.includes("track") || l.includes("order")) return Package;
  if (l.includes("wishlist") || l.includes("saved")) return Heart;
  if (l.includes("cart") || l.includes("basket")) return ShoppingCart;
  if (l.includes("privacy")) return Shield;
  if (l.includes("terms") || l.includes("condition")) return FileText;
  if (l.includes("ship") || l.includes("delivery")) return Truck;
  if (l.includes("refund") || l.includes("return")) return RotateCcw;
  if (l.includes("cancel")) return XCircle;
  if (l.includes("contact")) return Headphones;
  if (l.includes("faq")) return HelpCircle;
  if (l.includes("how to") || l.includes("manual")) return BookOpen;
  if (l.includes("placement") || l.includes("guide")) return MapPin;
  return null;
}

export function FooterNavGroup({ title, links }: { title: string; links: NavItem[] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const expanded = isDesktop || openOnMobile;

  return (
    <div className="border-b border-gray-100 py-2.5 lg:border-0 lg:py-0">
      <div>
        <button
          type="button"
          onClick={() => setOpenOnMobile((value) => !value)}
          aria-expanded={isDesktop ? undefined : openOnMobile}
          className={cn(
            "flex min-h-10 w-full items-center justify-between text-left font-bold text-gray-900 text-sm",
            "lg:pointer-events-none lg:min-h-0 lg:cursor-default",
          )}
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-gray-400 transition-transform duration-200 lg:hidden",
              openOnMobile && "rotate-180",
            )}
          />
        </button>
        {/* Orange accent bar under heading */}
        <div className="mt-1.5 hidden h-0.5 w-6 rounded-full bg-[#f95738] lg:block" />
      </div>

      <ul
        className={cn(
          "space-y-3 pb-3 pt-2 text-sm lg:mt-3.5 lg:space-y-3.5 lg:pb-0 lg:pt-0",
          expanded ? "block" : "hidden",
        )}
      >
        {links.map((item) => {
          const Icon = getNavIcon(item.label);
          return (
            <li key={`${title}-${item.href}`}>
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {Icon ? (
                  <Icon className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-[#e63920]" />
                ) : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
