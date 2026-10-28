/**
 * Offer countdown, evaluated in India time so every visitor sees the same
 * deadline whatever their device clock says.
 *
 *  - `endsAt` ("YYYY-MM-DD HH:MM"): a fixed deadline. The timer stops at zero.
 *  - otherwise `endTime` ("HH:MM", default 23:59): a daily cut-off that restarts
 *    every day.
 */
const IST_OFFSET_MS = 330 * 60 * 1000;

export type CountdownConfig = { endTime: string; endsAt: string };

/** Seconds left, never negative. */
export function secondsLeft(config: CountdownConfig, now = Date.now()): number {
  // Shift to IST, then read the UTC fields as IST wall-clock time.
  const istNow = now + IST_OFFSET_MS;

  const fixed = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})$/.exec(config.endsAt.trim());
  if (fixed) {
    const end = Date.UTC(+fixed[1], +fixed[2] - 1, +fixed[3], +fixed[4], +fixed[5], 59);
    return Math.max(0, Math.floor((end - istNow) / 1000));
  }

  const daily = /^(\d{1,2}):(\d{2})$/.exec(config.endTime.trim());
  const hours = daily ? Math.min(23, +daily[1]) : 23;
  const minutes = daily ? Math.min(59, +daily[2]) : 59;

  const today = new Date(istNow);
  let end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hours, minutes, 59);
  if (end < istNow) end += 24 * 60 * 60 * 1000;

  return Math.max(0, Math.floor((end - istNow) / 1000));
}

export function splitSeconds(total: number) {
  const two = (n: number) => String(n).padStart(2, "0");
  return {
    hh: two(Math.floor(total / 3600)),
    mm: two(Math.floor((total % 3600) / 60)),
    ss: two(total % 60),
  };
}
