import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, Award, Beaker } from "lucide-react";

export function FactorySection() {
  return (
    <section className="relative w-full overflow-hidden bg-stone-100 py-12 sm:py-16 lg:py-20 border-t border-border/40">
      {/* Background Factory Image */}
      <div className="absolute inset-0">
        <Image
          src="https://admin.grahakavach.in/wp-content/uploads/Speciality-Geochem-Factory-Entrance.png"
          alt="Speciality Geochem Manufacturing Facility Entrance — Udaipur, Rajasthan"
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center sm:object-left"
        />
        {/* Soft gradient fade on large screens so left side showcases the factory entrance clearly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-white/40 sm:to-white/90" />
      </div>

      {/* Content Container: Positioned on the Right Side */}
      <Container width="wide" className="relative z-10">
        <div className="flex justify-end">
          <div className="w-full max-w-xl rounded-2xl border border-border/80 bg-white/95 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-md">
            
            <span className="gk-text-gradient text-xs font-semibold tracking-[0.2em] uppercase">
              Parent Company & Manufacturing
            </span>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
              Speciality Geochem — Trusted Manufacturing Since 1996
            </h2>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground-muted">
              Operating two advanced RIICO industrial production units in Udaipur, Rajasthan. From ABC dry powder extinguishers to automatic fire balls and blankets, every Graha Kavach safety product is formulated, assembled, and batch-tested in-house with zero middlemen.
            </p>

            {/* Quick Credentials */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-medium text-foreground">
              <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-stone-50/80 p-2.5">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <span className="leading-snug">2 RIICO Units</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-stone-50/80 p-2.5">
                <Award className="size-4 shrink-0 text-primary" />
                <span className="leading-snug">ISO & CE Certified</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-stone-50/80 p-2.5">
                <Beaker className="size-4 shrink-0 text-primary" />
                <span className="leading-snug">In-House Lab</span>
              </div>
            </div>

            {/* Website Matching Button */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                href="https://specialitygeochem.com/"
                target="_blank"
                rel="noopener noreferrer"
                size="md"
              >
                <span>Visit Speciality Geochem</span>
                <ExternalLink className="size-4" />
              </Button>
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
