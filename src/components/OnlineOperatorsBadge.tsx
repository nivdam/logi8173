import { Box, Flex, Text } from "@chakra-ui/react"
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPositioner,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from "@chakra-ui/react"
import { Circle } from "lucide-react"
import { useOnlineOperators } from "../api"
import { t } from "../lib/i18n"
import type { OnlineOperator } from "../types"

const OnlineOperatorRow = ({ operator }: OnlineOperatorRowProps) => (
  <Flex align="center" gap="2" py="1">
    <Box color="green.500" flexShrink={0}>
      <Circle size={8} fill="currentColor" />
    </Box>
    <Text textStyle="sm" truncate>
      {operator.fullName || operator.email}
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
        <Flex
          align="center"
          gap="1.5"
          px="2.5"
          py="1.5"
          minH="11"
          minW="11"
          borderRadius="full"
          cursor="pointer"
          bg="green.50"
          _hover={{ bg: "green.100" }}
          role="button"
          aria-label={`${count} ${t("presence.onlineCount")}`}
        >
          <Box color="green.500">
            <Circle size={8} fill="currentColor" />
          </Box>
          <Text textStyle="xs" fontWeight="600" color="green.700">
            {count}
          </Text>
        </Flex>
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
                <OnlineOperatorRow key={operator.email} operator={operator} />
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
