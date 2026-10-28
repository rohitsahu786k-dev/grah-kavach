"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { secondsLeft, splitSeconds, type CountdownConfig } from "@/lib/landing/countdown";

type Parts = { hh: string; mm: string; ss: string };

const PLACEHOLDER: Parts = { hh: "00", mm: "00", ss: "00" };
const CountdownContext = createContext<Parts>(PLACEHOLDER);

/**
 * One ticking clock shared by every timer on the page. Until it mounts it shows
 * zeros, because the server cannot know the visitor's moment.
 */
export function CountdownProvider({ config, children }: { config: CountdownConfig; children: React.ReactNode }) {
  const [parts, setParts] = useState<Parts>(PLACEHOLDER);

  useEffect(() => {
    const tick = () => setParts(splitSeconds(secondsLeft(config)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config]);

  return <CountdownContext.Provider value={parts}>{children}</CountdownContext.Provider>;
}

export function useCountdown(): Parts {
  return useContext(CountdownContext);
}

/** HH:MM:SS as text. Pass `className` for size and colour. */
export function Timer({ className }: { className?: string }) {
  const { hh, mm, ss } = useCountdown();
  return (
    <span className={`lp-timer ${className ?? ""}`} suppressHydrationWarning>
      {hh}:{mm}:{ss}
    </span>
  );
}

/** The three-box countdown in the hero. */
export function TimerBoxes({ units }: { units: [string, string, string] }) {
  const { hh, mm, ss } = useCountdown();
  const cells: Array<[string, string, boolean]> = [
    [hh, units[0], false],
    [mm, units[1], false],
    [ss, units[2], true],
  ];

  return (
    <div className="flex items-start justify-center gap-2">
      {cells.map(([value, label, accent], index) => (
        <div key={label} className="flex items-start gap-2">
          {index > 0 ? <div className="lp-timer text-[32px] leading-[60px] text-accent">:</div> : null}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`lp-timer min-w-[78px] rounded-[10px] bg-[#2a2a2a] px-1.5 py-2.5 text-center text-[40px] leading-none ${
                accent ? "text-accent" : "text-white"
              }`}
              suppressHydrationWarning
            >
              {value}
            </div>
            <div className="text-[13px] text-[#a8a29e]">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
