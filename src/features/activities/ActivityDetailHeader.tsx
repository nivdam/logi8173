import { Badge, Button, Flex, Stack } from "@chakra-ui/react"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { getActivityStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import type { Activity } from "../../types"

export const ActivityDetailHeader = ({
  activity,
  canCloseActivity,
  canReopenActivity,
  isStatusChanging,
  onBack,
  onCloseActivity,
  onReopenActivity,
  onOpenFolder,
}: Props) => (
  <Flex
    gap="3"
    direction={{ base: "column", md: "row" }}
    justify="space-between"
  >
    <Stack gap="3">
      <Button variant="ghost" alignSelf="flex-start" px="0" onClick={onBack}>
        <ArrowLeft size={16} />
        {t("activities.backToList")}
      </Button>
      <Flex align="center" gap="3">
        <PageHeader
          title={activity.name}
          description={t("activities.detailDescription")}
        />
        <Badge
          colorPalette={activity.status === "active" ? "green" : "gray"}
          variant="subtle"
          fontSize="sm"
        >
          {getActivityStatusLabel(activity.status)}
        </Badge>
      </Flex>
    </Stack>

    <Flex gap="3" align="flex-start" direction="row" alignSelf="flex-end">
      <Button variant="outline" onClick={onOpenFolder}>
        <FolderOpen size={16} />
        {t("activities.folderAction")}
      </Button>
      {canCloseActivity ? (
        <Button
          colorPalette="red"
          variant="outline"
          loading={isStatusChanging}
          onClick={onCloseActivity}
        >
          {t("activities.closeAction")}
        </Button>
      ) : null}
      {canReopenActivity ? (
        <Button
          colorPalette="green"
          variant="outline"
          loading={isStatusChanging}
          onClick={onReopenActivity}
        >
          {t("activities.reopenAction")}
        </Button>
      ) : null}
    </Flex>
  </Flex>
)

type Props = {
  activity: Activity
  canCloseActivity: boolean
  canReopenActivity: boolean
  isStatusChanging: boolean
  onBack: () => void
  onCloseActivity: () => void
  onReopenActivity: () => void
  onOpenFolder: () => void
}
