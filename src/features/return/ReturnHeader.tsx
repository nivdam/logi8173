import { Box, Button, DatePicker, Flex, Grid, Input, Portal, Text, Heading } from "@chakra-ui/react"
import { CalendarDateTime, getLocalTimeZone } from "@internationalized/date"
import { Calendar } from "lucide-react"
import { useAuth } from "../../lib/use-auth"
import { t } from "../../lib/i18n"
import { SoldierAutocomplete } from "../issuance/SoldierAutocomplete"
import type { DateValue } from "@internationalized/date"
import type { Soldier } from "../../types"

const parseIsoToCalendar = (iso: string): CalendarDateTime => {
  const date = new Date(iso)
  return new CalendarDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  )
}

const calendarToIso = (date: CalendarDateTime): string => {
  const d = new Date(date.year, date.month - 1, date.day, date.hour, date.minute)
  return d.toISOString()
}

const formatDateTime = (date: CalendarDateTime): string => {
  const day = date.day.toString().padStart(2, "0")
  const month = date.month.toString().padStart(2, "0")
  const hours = String(date.hour).padStart(2, "0")
  const minutes = String(date.minute).padStart(2, "0")
  return `${day}/${month}/${date.year}   ·   ${hours}:${minutes}`
}

export const ReturnHeader = ({
  activityId,
  giver,
  performedAt,
  onSelectGiver,
  onClearGiver,
  onSetPerformedAt,
}: ReturnHeaderProps) => {
  const { operator, operatorProfile } = useAuth()
  const accountDisplayName = operatorProfile?.fullName || t("auth.accountNameFallback")

  const calendarValue = parseIsoToCalendar(performedAt)
  const dateValue = [calendarValue]
  const timeValue = `${String(calendarValue.hour).padStart(2, "0")}:${String(calendarValue.minute).padStart(2, "0")}`

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parts = event.currentTarget.value.split(":")
    if (parts.length < 2) return
    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return
    const updated = calendarValue.set({ hour: hours, minute: minutes })
    onSetPerformedAt(calendarToIso(updated))
  }

  const handleDateChange = (details: { value: DateValue[] }) => {
    const newDate = details.value[0]
    if (!newDate) return
    const updated = new CalendarDateTime(
      newDate.year,
      newDate.month,
      newDate.day,
      calendarValue.hour,
      calendarValue.minute,
    )
    onSetPerformedAt(calendarToIso(updated))
  }

  return (
    <Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        <Box>
          <Heading size="sm" fontWeight="600" mb="3">
            {t("returns.giverSection")}
          </Heading>
          <SoldierAutocomplete
            activityId={activityId}
            selectedSoldier={giver}
            onSelect={onSelectGiver}
            onClear={onClearGiver}
          />
        </Box>

        <Box>
          <Heading size="sm" fontWeight="600" mb="3">
            {t("returns.receiverSection")}
          </Heading>
          <Flex
            direction="column"
            gap="1"
            p="3"
            bg="bg.muted"
            borderRadius="lg"
          >
            <Text textStyle="sm" fontWeight="600">
              {accountDisplayName}
            </Text>
            <Text textStyle="xs" color="fg.muted">
              {operatorProfile
                ? `${operatorProfile.rank} · ${operatorProfile.personalId} · ${operatorProfile.phone}`
                : operator?.email}
            </Text>
          </Flex>
        </Box>
      </Grid>

      <Box mt="4">
        <DatePicker.Root
          value={dateValue}
          onValueChange={handleDateChange}
          closeOnSelect
          locale="he-IL"
          timeZone={getLocalTimeZone()}
          colorPalette="sage"
          positioning={{ placement: "bottom-start" }}
        >
          <DatePicker.Label>
            <Text textStyle="sm" fontWeight="500" color="fg.muted">
              {t("issuance.date")}
            </Text>
          </DatePicker.Label>
          <DatePicker.Control>
            <DatePicker.Trigger asChild>
              <Button variant="outline" size="lg" borderRadius="lg" justifyContent="space-between" w={{ base: "full", md: "340px" }} px="5" h="12">
                {formatDateTime(calendarValue)}
                <Calendar size={16} />
              </Button>
            </DatePicker.Trigger>
          </DatePicker.Control>
          <Portal>
            <DatePicker.Positioner>
              <DatePicker.Content
                p="3"
                shadow="lg"
                borderRadius="xl"
                css={{
                  "& [data-selected]": {
                    bg: "var(--chakra-colors-sage-600)",
                    color: "white",
                    borderRadius: "var(--chakra-radii-md)",
                    fontWeight: "700",
                  },
                  "& [data-today]": {
                    borderWidth: "2px",
                    borderColor: "var(--chakra-colors-sage-400)",
                    borderRadius: "var(--chakra-radii-md)",
                  },
                  "& [data-outside-range]": {
                    opacity: 0.3,
                  },
                }}
              >
                <DatePicker.View view="day">
                  <DatePicker.Header />
                  <DatePicker.DayTable />
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    size="sm"
                    mt="2"
                    aria-label={t("issuance.time")}
                  />
                </DatePicker.View>
              </DatePicker.Content>
            </DatePicker.Positioner>
          </Portal>
        </DatePicker.Root>
      </Box>
    </Box>
  )
}

type ReturnHeaderProps = {
  activityId: string | undefined
  giver: Soldier | undefined
  performedAt: string
  onSelectGiver: (soldier: Soldier) => void
  onClearGiver: () => void
  onSetPerformedAt: (iso: string) => void
}
