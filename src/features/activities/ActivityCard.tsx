import { Badge, Box, Flex, Grid, Heading, Stack, Text } from "@chakra-ui/react"
import { formatDate, formatDateTime, getActivityStatusLabel } from "../../lib/formatters"
import { t } from "../../lib/i18n"
import { getActivityTypeLabel, getSelectedItemCountLabel } from "./activity-helpers"
import type { Activity } from "../../types"

export const ActivityCard = ({
  activity,
  openedByLabel,
  onOpen,
}: ActivityCardProps) => (
  <Box
    data-testid="activity-card"
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    p={{ base: "5", md: "6" }}
    cursor="pointer"
    onClick={onOpen}
    transition="border-color 0.15s ease, transform 0.15s ease"
    _hover={{ borderColor: "sage.300", transform: "translateY(-1px)" }}
  >
    <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap="4">
      <Stack gap="1">
        <Heading size="md" fontWeight="600">{activity.name}</Heading>
        <Text textStyle="sm" color="fg.muted">
          {getActivityTypeLabel(activity.activityType)} · {formatDate(activity.startDate)}
        </Text>
      </Stack>

      <Badge colorPalette={activity.status === "active" ? "green" : "gray"} variant="subtle">
        {getActivityStatusLabel(activity.status)}
      </Badge>
    </Flex>

    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="4" mt="5">
      <MetaRow label={t("activities.fields.selectedItems")} value={getSelectedItemCountLabel(activity.selectedItemCount)} />
      <MetaRow label={t("activities.fields.openedBy")} value={openedByLabel} />
      <MetaRow label={t("activities.fields.createdAt")} value={formatDateTime(activity.createdAt)} />
    </Grid>
  </Box>
)

const MetaRow = ({ label, value }: MetaRowProps) => (
  <Stack gap="1">
    <Text textStyle="xs" color="fg.muted">{label}</Text>
    <Text textStyle="sm" fontWeight="500" wordBreak="break-word">{value}</Text>
  </Stack>
)

type ActivityCardProps = {
  activity: Activity
  openedByLabel: string
  onOpen: () => void
}

type MetaRowProps = {
  label: string
  value: string
}
