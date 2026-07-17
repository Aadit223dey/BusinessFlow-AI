/**
 * Scoped Context Fetch Wrappers
 *
 * Intercepts asynchronous service operations, catches database connection
 * issues or server execution errors, and standardizes output signatures.
 */

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Wraps an asynchronous operation with standardized error handling.
 *
 * Returns a normalized response signature mapping:
 * `{ data: T | null, error: { code: string, message: string } | null }`
 *
 * @param operation - The async function to execute
 * @returns A normalized ApiResponse
 *
 * @example
 * ```ts
 * const result = await handleAsyncOperation(async () => {
 *   const { data, error } = await supabase.from("users").select("*");
 *   if (error) throw error;
 *   return data;
 * });
 *
 * if (result.error) {
 *   console.error(result.error.message);
 * } else {
 *   console.log(result.data);
 * }
 * ```
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error: unknown) {
    const apiError: ApiError = {
      code: error instanceof Error ? "UNEXPECTED_ERROR" : "UNKNOWN_ERROR",
      message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
    };
    return { data: null, error: apiError };
  }
}
