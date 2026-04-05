import { useState } from "react"

export const useErrorBanner = () => {
  const [error, setError] = useState<string | undefined>(undefined)

  const showError = (message: string) => setError(message)
  const clearError = () => setError(undefined)

  return { error, showError, clearError }
}
