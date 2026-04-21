import { Flex, Text } from "@chakra-ui/react"
import { CircleCheck, AlertTriangle, CircleX } from "lucide-react"
import { animations } from "../theme/animations"
import type { ItemStatus } from "../types"

const statusConfig = {
  ok: { color: "green.600", bg: "green.600/10", icon: CircleCheck },
  low: { color: "yellow.600", bg: "yellow.600/10", icon: AlertTriangle },
  gap: { color: "red.600", bg: "rose.50", icon: CircleX },
}

export const StatusBadge = ({ status, label }: Props) => {
  const config = statusConfig[status]

  return (
    <Flex
      display="inline-flex"
      align="center"
      gap="1.5"
      px="2.5"
      py="1"
      borderRadius="full"
      bg={config.bg}
      css={status === "gap" ? animations.pulse : undefined}
    >
      <config.icon size={13} color={`var(--chakra-colors-${config.color.replace(".", "-")})`} />
      <Text textStyle="xs" fontWeight="500" color={config.color}>
        {label}
      </Text>
    </Flex>
  )
}

type Props = {
  status: ItemStatus
  label: string
}
