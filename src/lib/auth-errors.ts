/**
 * Centralized Authentication Error Transformer
 *
 * Maps raw Supabase, Postgres, network, and RLS errors into
 * structured, user-friendly error messages. Eliminates empty {}
 * error outputs across the frontend.
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  category:
    | "INVALID_CREDENTIALS"
    | "EMAIL_EXISTS"
    | "EMAIL_UNCONFIRMED"
    | "WEAK_PASSWORD"
    | "RATE_LIMITED"
    | "NETWORK_ERROR"
    | "DATABASE_ERROR"
    | "RLS_RECURSION"
    | "UNEXPECTED_ERROR";
  raw?: unknown;
}

export function parseAuthError(error: unknown): UserFriendlyError {
  if (!error) {
    return {
      title: "Unknown Error",
      message: "An unexpected error occurred. Please try again.",
      category: "UNEXPECTED_ERROR",
    };
  }

  // Extract message string from various error payload formats
  let rawMessage = "";
  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    rawMessage = String(
      errObj.message ||
      errObj.error_description ||
      errObj.msg ||
      errObj.error ||
      errObj.details ||
      ""
    );
    // Prevent "{}" or "[object Object]" from leaking
    if (!rawMessage || rawMessage === "{}" || rawMessage === "[object Object]") {
      try {
        const keys = Object.getOwnPropertyNames(error);
        const extracted: Record<string, unknown> = {};
        for (const key of keys) {
          if (key !== "stack") extracted[key] = (error as Record<string, unknown>)[key];
        }
        const str = JSON.stringify(extracted);
        rawMessage = str && str !== "{}" ? str : "";
      } catch {
        rawMessage = "";
      }
    }
  }

  // Check for RLS Recursion Error
  if (rawMessage.includes("infinite recursion") || rawMessage.includes("recursion detected")) {
    return {
      title: "Security Configuration Issue",
      message: "A database access conflict occurred. Our engineering team has been notified.",
      category: "RLS_RECURSION",
      raw: error,
    };
  }

  // Common Supabase Auth Error Patterns
  if (rawMessage.includes("Invalid login credentials") || rawMessage.includes("invalid_credentials")) {
    return {
      title: "Invalid Credentials",
      message: "The email or password you entered is incorrect. Please check your details and try again.",
      category: "INVALID_CREDENTIALS",
    };
  }

  if (rawMessage.includes("User already registered") || rawMessage.includes("email_exists")) {
    return {
      title: "Email Already Registered",
      message: "An account with this email address already exists. Try logging in instead.",
      category: "EMAIL_EXISTS",
    };
  }

  if (rawMessage.includes("Email not confirmed")) {
    return {
      title: "Email Unconfirmed",
      message: "Please check your inbox and verify your email address before logging in.",
      category: "EMAIL_UNCONFIRMED",
    };
  }

  if (rawMessage.includes("Password should be at least")) {
    return {
      title: "Weak Password",
      message: "Your password must be at least 8 characters long and include numbers and special characters.",
      category: "WEAK_PASSWORD",
    };
  }

  if (rawMessage.toLowerCase().includes("rate limit") || rawMessage.toLowerCase().includes("too many requests")) {
    return {
      title: "Too Many Requests",
      message: "You have made too many attempts. Please wait a few minutes before trying again.",
      category: "RATE_LIMITED",
    };
  }

  if (rawMessage.includes("Failed to fetch") || rawMessage.includes("NetworkError") || rawMessage.includes("ERR_CONNECTION")) {
    return {
      title: "Connection Failed",
      message: "Unable to reach the server. Please check your internet connection and try again.",
      category: "NETWORK_ERROR",
    };
  }

  // Database-specific errors (Postgres error codes)
  if (rawMessage.includes("42P17") || rawMessage.includes("42501") || rawMessage.includes("42P01")) {
    return {
      title: "Database Error",
      message: "A database operation failed. Please try again or contact support.",
      category: "DATABASE_ERROR",
      raw: error,
    };
  }

  return {
    title: "Authentication Error",
    message:
      rawMessage.length > 0 && !rawMessage.startsWith("{")
        ? rawMessage
        : "An unexpected error occurred during authentication.",
    category: "UNEXPECTED_ERROR",
    raw: error,
  };
}
