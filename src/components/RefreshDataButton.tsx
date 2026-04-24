import { useState } from "react"
import { IconButton, Spinner, Tooltip } from "@chakra-ui/react"
import { RotateCw } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { t } from "../lib/i18n"

export const RefreshDataButton = () => {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Tooltip.Root positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={t("common.refreshData")}
          variant="ghost"
          size="md"
          borderRadius="full"
          color="fg"
          onClick={handleRefresh}
          disabled={isRefreshing}
          css={{
            transition: "all 0.2s ease",
            "& svg": {
              transition: "transform 0.3s ease",
            },
            "&:hover svg": {
              transform: isRefreshing ? undefined : "rotate(45deg)",
            },
          }}
        >
          {isRefreshing ? (
            <Spinner size="sm" color="interactive" />
          ) : (
            <RotateCw size={18} />
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
