import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SecurePaymentStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-gray-200/90 bg-white/95 px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs backdrop-blur-xs overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
        {/* Left: Card icon and text */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0ed] text-[#e63920]">
            <CreditCard className="size-4 sm:size-4.5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold tracking-tight text-gray-900 leading-tight">
              Secure payment options
            </p>
            <p className="mt-0.5 text-[10px] sm:text-[11px] text-gray-500 leading-normal max-w-[200px] sm:max-w-none">
              Pay safely through supported Indian payment methods at checkout.
            </p>
          </div>
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden xl:block h-6 w-px bg-gray-200 shrink-0 mx-1" />

        {/* Right: Payment Method Pills - perfectly inline and contained */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {/* 1. PhonePe */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none">
              <circle cx="12" cy="12" r="12" fill="#5F259F" />
              <path
                d="M7.5 7h9M12.5 7v3.8c0 1.8-1.4 3.2-3.2 3.2H7.5M12.5 10.5c1.8 0 3.2 1.4 3.2 3.2V18"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12.5 5.5l2.2-2.2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-semibold text-[#5F259F]">PhonePe</span>
          </span>

          {/* 2. GPay */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="size-3.5 shrink-0">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium text-gray-700">Pay</span>
          </span>

          {/* 3. UPI */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 20 18" className="h-3 w-auto shrink-0" fill="none">
              <path d="M4 15L11 3H6L2 15H4Z" fill="#097939" />
              <path d="M9 15L16 3h-5l-4 12h4z" fill="#ED7524" />
            </svg>
            <span className="font-bold tracking-tight text-gray-900">UPI</span>
          </span>

          {/* 4. Cards */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span className="font-medium text-gray-700">Cards</span>
          </span>

          {/* 5. VISA - Original iconic Visa logo with gold flick */}
          <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-gray-200/90 bg-white px-2.5 py-1 shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 36 12" className="h-3 w-auto" fill="none">
              <path d="M13.8 0.2L9.1 11.5H6L3.6 2.5C3.5 2 3.3 1.7 2.9 1.5C2.2 1.1 1 0.8 0 0.5L0.1 0.2H5.1C5.8 0.2 6.4 0.7 6.5 1.4L7.7 8.2L10.8 0.2H13.8ZM25.9 7.8C25.9 4.8 21.9 4.7 21.9 3.3C21.9 2.8 22.4 2.3 23.3 2.2C23.8 2.1 25.1 2 26.6 2.8L27.2 0.5C26.4 0.2 25.4 0 24.1 0C21.1 0 19.1 1.7 19.1 4C19.1 5.8 20.6 6.7 21.7 7.3C22.9 7.9 23.3 8.3 23.3 8.8C23.3 9.7 22.3 10.1 21.3 10.1C19.8 10.1 19 9.6 18.2 9.2L17.6 11.6C18.4 12 19.8 12.3 21.1 12.3C24.3 12.3 26.4 10.7 25.9 7.8ZM33.5 11.5H30.9L28.8 0.2H31.5L33.5 11.5ZM18.1 0.2L15.8 11.5H12.9L15.3 0.2H18.1Z" fill="#1A1F71"/>
              <path d="M5.2 0.2H0.1L0 0.5C2.6 1.1 4.5 3.2 5.2 5.1L6 1.5C6.1 0.7 5.8 0.2 5.2 0.2Z" fill="#F7B600"/>
            </svg>
          </span>

          {/* 6. RuPay - Original official RuPay logo with cyan & orange chevrons */}
          <span className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 52 14" className="h-3 w-auto" fill="none">
              <text x="0" y="11.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#093354" letterSpacing="-0.3">RuPay</text>
              <path d="M40 2L44 7L40 12H42.5L46.5 7L42.5 2H40Z" fill="#00A5D9"/>
              <path d="M44.5 2L48.5 7L44.5 12H47L51 7L47 2H44.5Z" fill="#F37021"/>
            </svg>
          </span>

          {/* 7. Mastercard - Official interlocking circles */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 28 18" className="h-3.5 w-auto shrink-0" fill="none">
              <circle cx="9" cy="9" r="8" fill="#EB001B" />
              <circle cx="19" cy="9" r="8" fill="#F79E1B" />
              <path d="M14 3.7A8 8 0 0 0 14 14.3A8 8 0 0 0 14 3.7z" fill="#FF5F00" />
            </svg>
            <span className="font-medium text-gray-800">Mastercard</span>
          </span>

          {/* 8. NetBanking */}
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-[#0066B2]" fill="currentColor">
              <path d="M2 9h20V7L12 2 2 7v2zm2 2v7h3v-7H4zm6 0v7h4v-7h-4zm7 0v7h3v-7h-3zM2 20h20v2H2v-2z" />
            </svg>
            <span className="font-medium text-gray-700">NetBanking</span>
          </span>

          {/* 9. COD */}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200/90 bg-white px-2.5 py-1 text-[11px] shadow-2xs hover:border-gray-300 transition-colors whitespace-nowrap">
            <span className="font-bold text-gray-900">₹</span>
            <span className="font-semibold text-gray-900">COD</span>
          </span>
        </div>
      </div>
    </div>
  );
}
