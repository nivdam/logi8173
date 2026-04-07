import { AlertTriangle } from "lucide-react"
import { EmptyState } from "./EmptyState"
import { getApiErrorMessage } from "../lib/api-error"
import { t } from "../lib/i18n"

export const ApiErrorState = ({
  error,
  title,
  fallbackMessage,
  actionLabel,
  onAction,
}: ApiErrorStateProps) => (
  <EmptyState
    icon={AlertTriangle}
    title={title || t("common.error")}
    description={getApiErrorMessage(error, fallbackMessage)}
    actionLabel={actionLabel}
    onAction={onAction}
  />
)

type ApiErrorStateProps = {
  error: unknown
  title?: string
  fallbackMessage?: string
  actionLabel?: string
  onAction?: () => void
}
