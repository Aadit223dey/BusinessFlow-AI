/**
 * Robust Error Formatting & Logging Utilities
 *
 * Prevents non-enumerable Error objects from serializing to "{}"
 * and extracts human-readable Supabase/Postgres error messages.
 */

export function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error instanceof Error && error.message && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, any>;

    if (typeof errObj.message === "string" && errObj.message.trim().length > 0) {
      return errObj.message;
    }
    if (typeof errObj.error_description === "string" && errObj.error_description.trim().length > 0) {
      return errObj.error_description;
    }
    if (typeof errObj.msg === "string" && errObj.msg.trim().length > 0) {
      return errObj.msg;
    }
    if (typeof errObj.error === "string" && errObj.error.trim().length > 0) {
      return errObj.error;
    }
    if (typeof errObj.details === "string" && errObj.details.trim().length > 0) {
      return errObj.details;
    }
    if (typeof errObj.hint === "string" && errObj.hint.trim().length > 0) {
      return `${errObj.message || "Database Error"}: ${errObj.hint}`;
    }

    // Extract non-enumerable properties from Error objects
    const keys = Object.getOwnPropertyNames(errObj);
    const extracted: Record<string, any> = {};
    for (const key of keys) {
      if (key !== "stack") {
        extracted[key] = errObj[key];
      }
    }

    if (extracted.message && typeof extracted.message === "string" && extracted.message.trim().length > 0) {
      return extracted.message;
    }

    try {
      const str = JSON.stringify(extracted);
      if (str && str !== "{}" && str !== "[]") {
        return str;
      }
    } catch {
      // Fallback below
    }
  }

  return String(error) || "An unexpected error occurred. Please try again.";
}

export function logAuthTrace(step: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔷 [AUTH TRACE - ${step}]:`, data ?? "");
  }
}

export function logAuthError(step: string, error: unknown) {
  const message = getErrorMessage(error);
  console.error(`🔴 [AUTH ERROR - ${step}]: ${message}`, error);
}
