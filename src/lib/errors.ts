/**
 * Error taxonomy for the data layer.
 *
 * Callers need to tell these apart so the UI can respond honestly: a backend
 * that is down is not the same as a product that does not exist, and neither
 * should ever be rendered as a plausible-looking placeholder.
 */

export type DataErrorKind =
  | "unavailable"      // the backend could not be reached or returned 5xx
  | "unauthorized"     // credentials missing or rejected
  | "not_found"        // the resource genuinely does not exist
  | "malformed"        // reached, responded, but the shape was wrong
  | "timeout";

export class DataError extends Error {
  readonly kind: DataErrorKind;
  readonly source: "wordpress" | "woocommerce";
  readonly status?: number;

  constructor(
    kind: DataErrorKind,
    source: "wordpress" | "woocommerce",
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = "DataError";
    this.kind = kind;
    this.source = source;
    this.status = status;
  }
}

export function isDataError(error: unknown): error is DataError {
  return error instanceof DataError;
}

export function isNotFound(error: unknown): boolean {
  return isDataError(error) && error.kind === "not_found";
}

/**
 * Run a data call and return `null` instead of throwing when the resource is
 * simply absent. Genuine failures still throw, so an outage is never
 * mistaken for "no content".
 */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/**
 * Degrade a non-critical section to `null` on any data failure, logging the
 * reason server-side.
 *
 * Use this only where an absent section is honest — a blog teaser list, a
 * testimonial strip. Never use it for price, stock or order state, where a
 * missing value must surface as an error rather than as silence.
 */
export async function orNullLogged<T>(promise: Promise<T>, label: string): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    const reason = isDataError(error) ? `${error.kind} (${error.source})` : String(error);
    console.error(`[data] ${label} unavailable: ${reason}`);
    return null;
  }
}
