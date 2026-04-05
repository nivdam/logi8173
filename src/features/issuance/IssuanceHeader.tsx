import { useState } from "react"
import { Box, Button, DatePicker, Flex, Grid, Heading, Input, Portal, Text } from "@chakra-ui/react"
import {
  CalendarDateTime,
  getLocalTimeZone,
} from "@internationalized/date"
import { Calendar } from "lucide-react"
import { useAuth } from "../../lib/auth-context"
import { t } from "../../lib/i18n"
import { SoldierAutocomplete } from "./SoldierAutocomplete"
import type { DateValue } from "@internationalized/date"
import type { Soldier } from "../../types"

const createNow = (): CalendarDateTime => {
  const now = new Date()
  return new CalendarDateTime(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  )
}

export const IssuanceHeader = ({
  receiver,
  onSelectReceiver,
  onClearReceiver,
}: IssuanceHeaderProps) => {
  const { operator } = useAuth()
  const [dateValue, setDateValue] = useState<CalendarDateTime[]>([createNow()])

  const timeValue = dateValue[0]
    ? `${String(dateValue[0].hour).padStart(2, "0")}:${String(dateValue[0].minute).padStart(2, "0")}`
    : ""

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parts = event.currentTarget.value.split(":")
    if (parts.length < 2) return
    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return
    setDateValue((previous) => {
      const current = previous[0] ?? createNow()
      return [current.set({ hour: hours, minute: minutes })]
    })
  }

  const handleDateChange = (details: { value: DateValue[] }) => {
    const newDate = details.value[0]
    if (!newDate) {
      setDateValue([])
      return
    }
    const previousTime = dateValue[0] ?? { hour: 0, minute: 0 }
    setDateValue([
      new CalendarDateTime(
        newDate.year,
        newDate.month,
        newDate.day,
        previousTime.hour,
        previousTime.minute,
      ),
    ])
  }

  return (
    <Box>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="5">
        {/* Giver (operator) section — first */}
        <Box>
          <Heading size="sm" fontWeight="600" mb="3">
            {t("issuance.giverSection")}
          </Heading>
          <Flex
            direction="column"
            gap="1"
            p="3"
            bg="bg.muted"
            borderRadius="lg"
          >
            <Text textStyle="sm" fontWeight="600">
              {operator?.fullName}
            </Text>
            <Text textStyle="xs" color="fg.muted">
              {operator?.email}
            </Text>
          </Flex>
        </Box>

        {/* Receiver section — second */}
        <Box>
          <Heading size="sm" fontWeight="600" mb="3">
            {t("issuance.receiverSection")}
          </Heading>
          <SoldierAutocomplete
            selectedSoldier={receiver}
            onSelect={onSelectReceiver}
            onClear={onClearReceiver}
          />
        </Box>
      </Grid>

      {/* Date & Time picker */}
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
                {dateValue[0]
                  ? `${dateValue[0].day.toString().padStart(2, "0")}/${dateValue[0].month.toString().padStart(2, "0")}/${dateValue[0].year}   ·   ${String(dateValue[0].hour).padStart(2, "0")}:${String(dateValue[0].minute).padStart(2, "0")}`
                  : t("issuance.date")}
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

type IssuanceHeaderProps = {
  receiver: Soldier | undefined
  onSelectReceiver: (soldier: Soldier) => void
  onClearReceiver: () => void
}
