import { IconButton, Spinner, Tooltip } from "@chakra-ui/react"
import { RotateCw } from "lucide-react"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { t } from "../lib/i18n"

export const RefreshDataButton = () => {
  const queryClient = useQueryClient()
  const fetchingCount = useIsFetching()
  const isFetching = fetchingCount > 0

  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }

  return (
    <Tooltip.Root positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={t("common.refreshData")}
          variant="ghost"
          size="sm"
          borderRadius="full"
          onClick={handleRefresh}
          disabled={isFetching}
          css={{
            transition: "all 0.2s ease",
            "& svg": {
              transition: "transform 0.3s ease",
            },
            "&:hover svg": {
              transform: isFetching ? undefined : "rotate(45deg)",
            },
          }}
        >
          {isFetching ? (
            <Spinner size="xs" color="sage.400" />
          ) : (
            <RotateCw size={16} />
          )}
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          {t("common.refreshData")}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}
