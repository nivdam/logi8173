import { Button, Flex, Stack } from "@chakra-ui/react"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { PageHeader } from "../../components/PageHeader"
import { t } from "../../lib/i18n"
import type { Activity } from "../../types"

export const ActivityDetailHeader = ({
  activity,
  canCloseActivity,
  isClosing,
  onBack,
  onCloseActivity,
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
      <PageHeader
        title={activity.name}
        description={t("activities.detailDescription")}
      />
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
          loading={isClosing}
          onClick={onCloseActivity}
        >
          {t("activities.closeAction")}
        </Button>
      ) : null}
    </Flex>
  </Flex>
)

type Props = {
  activity: Activity
  canCloseActivity: boolean
  isClosing: boolean
  onBack: () => void
  onCloseActivity: () => void
  onOpenFolder: () => void
}
