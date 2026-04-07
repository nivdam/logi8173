import { t } from "./i18n"
import { toaster } from "./toaster"

const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred"

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) => {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message
  }

  return fallbackMessage
}

export const showApiErrorToast = ({
  actionLabel,
  error,
  fallbackMessage,
}: ShowApiErrorToastInput) => {
  const message = getApiErrorMessage(error, fallbackMessage)

  toaster.create({
    title: t("common.error"),
    description: `${actionLabel}: ${message}`,
    type: "error",
    duration: 5000,
  })
}

type ShowApiErrorToastInput = {
  actionLabel: string
  error: unknown
  fallbackMessage?: string
}
