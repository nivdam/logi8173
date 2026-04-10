import { Box, Grid, Stack, Text } from "@chakra-ui/react"
import type { SystemStyleObject } from "@chakra-ui/react"
import {
  formatDate,
  formatDateTime,
  getActivityStatusColor,
  getActivityStatusLabel,
} from "../../lib/formatters"
import { t } from "../../lib/i18n"
import type { AuthenticatedOperator, OperatorProfile } from "../../lib/auth.types"
import type { Activity } from "../../types"
import {
  getActivityTypeLabel,
  getOpenedByLabel,
  getSelectedItemCountLabel,
} from "./activity-helpers"

export const ActivityDetailSummary = ({
  activity,
  operator,
  operatorProfile,
}: Props) => (
  <>
    <Grid
      templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
      gap={{ base: "3", md: "4" }}
    >
      <DetailCard
        label={t("activities.fields.type")}
        value={getActivityTypeLabel(activity.activityType)}
      />
      <DetailCard
        label={t("activities.fields.status")}
        value={getActivityStatusLabel(activity.status)}
        color={getActivityStatusColor(activity.status)}
      />
      <DetailCard
        label={t("activities.fields.startDate")}
        value={formatDate(activity.startDate)}
      />
      <DetailCard
        label={t("activities.fields.selectedItems")}
        value={getSelectedItemCountLabel(activity.selectedItemCount)}
      />
    </Grid>

    <Box
      bg="bg.card"
      borderWidth="1px"
      borderColor="border"
      borderRadius="2xl"
      p={{ base: "4", md: "6" }}
    >
      <Grid
        templateColumns={{ base: "repeat(3, 1fr)", md: "repeat(3, 1fr)" }}
        gap={{ base: "3", md: "4" }}
      >
        <MetaRow
          label={t("activities.fields.openedBy")}
          value={getOpenedByLabel(activity.openedBy, operator, operatorProfile)}
        />
        <MetaRow
          label={t("activities.fields.createdAt")}
          value={formatDateTime(activity.createdAt)}
        />
        <MetaRow
          label={t("activities.fields.closedAt")}
          value={
            activity.closedAt
              ? formatDateTime(activity.closedAt)
              : t("activities.stillOpen")
          }
        />
      </Grid>
    </Box>
  </>
)

const DetailCard = ({ label, value, color }: DetailCardProps) => (
  <Box
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    p={{ base: "3", md: "5" }}
  >
    <Text textStyle="xs" color="fg.muted">
      {label}
    </Text>
    <Text
      textStyle={{ base: "md", md: "lg" }}
      fontWeight="600"
      mt="1"
      color={color}
    >
      {value}
    </Text>
  </Box>
)

const MetaRow = ({ label, value }: MetaRowProps) => (
  <Stack gap="1">
    <Text textStyle="xs" color="fg.muted">
      {label}
    </Text>
    <Text textStyle="sm" fontWeight="500" wordBreak="break-word">
      {value}
    </Text>
  </Stack>
)

type Props = {
  activity: Activity
  operator: AuthenticatedOperator | undefined
  operatorProfile: OperatorProfile | undefined
}

type DetailCardProps = {
  label: string
  value: string
  color?: SystemStyleObject["color"]
}

type MetaRowProps = {
  label: string
  value: string
}
