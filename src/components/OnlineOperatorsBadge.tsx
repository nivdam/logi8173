import { Box, Circle, Flex, Float, IconButton, Text } from "@chakra-ui/react"
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPositioner,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from "@chakra-ui/react"
import { Circle as CircleIcon, Users } from "lucide-react"
import { useOnlineOperators } from "../api"
import { t } from "../lib/i18n"
import type { OnlineOperator } from "../types"

const OnlineOperatorRow = ({ operator }: OnlineOperatorRowProps) => (
  <Flex align="center" gap="2" py="1">
    <Box color="green.500" flexShrink={0}>
      <CircleIcon size={8} fill="currentColor" />
    </Box>
    <Text textStyle="sm" truncate>
      {operator.fullName}
    </Text>
  </Flex>
)

export const OnlineOperatorsBadge = () => {
  const { data: onlineOperators, isError } = useOnlineOperators()
  const count = onlineOperators?.length ?? 0

  if (count === 0 || isError) {
    return null
  }

  return (
    <PopoverRoot positioning={{ placement: "bottom-end" }}>
      <PopoverTrigger asChild>
        <IconButton
          aria-label={`${count} ${t("presence.onlineCount")}`}
          variant="ghost"
          size="md"
          borderRadius="full"
          color="fg"
          position="relative"
        >
          <Users size={18} />
          <Float placement="top-end" offsetX="1" offsetY="1">
            <Circle
              size="4"
              bg="success"
              color="fg.onPrimary"
              fontSize="9px"
              fontWeight="700"
              borderWidth="2px"
              borderColor="bg.card"
            >
              {count}
            </Circle>
          </Float>
        </IconButton>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent minW="180px" maxW="260px">
          <PopoverArrow />
          <PopoverBody p="3">
            <Text textStyle="xs" fontWeight="600" color="fg.muted" mb="2">
              {t("presence.onlineOperators")}
            </Text>
            <Flex direction="column" gap="0.5">
              {onlineOperators?.map((operator) => (
                <OnlineOperatorRow key={operator.fullName} operator={operator} />
              ))}
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  )
}

type OnlineOperatorRowProps = {
  operator: OnlineOperator
}
