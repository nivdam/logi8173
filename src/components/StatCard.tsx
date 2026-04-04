import { Flex, Heading, Text } from "@chakra-ui/react"
import type { LucideIcon } from "lucide-react"

export const StatCard = ({ icon: Icon, value, label, color = "fg" }: Props) => (
  <Flex
    direction="column"
    gap="3"
    p="5"
    bg="bg.card"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="border"
    shadow="sm"
  >
    <Flex align="center" gap="3">
      <Flex
        align="center"
        justify="center"
        w="10"
        h="10"
        borderRadius="lg"
        bg="bg.muted"
      >
        <Icon size={20} />
      </Flex>
      <Heading size="2xl" fontWeight="700" color={color}>
        {value}
      </Heading>
    </Flex>
    <Text textStyle="sm" color="fg.muted">{label}</Text>
  </Flex>
)

type Props = {
  icon: LucideIcon
  value: number | string
  label: string
  color?: string
}
