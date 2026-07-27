/**
 * Pulls the message Laravel actually sent.
 *
 * Written once, because the alternative is each screen guessing why a call
 * failed and telling the user something plausible but wrong.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const response = (
    error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } }
    }
  )?.response

  const firstFieldError = response?.data?.errors
    ? Object.values(response.data.errors)[0]?.[0]
    : undefined

  return response?.data?.message ?? firstFieldError ?? fallback
}
