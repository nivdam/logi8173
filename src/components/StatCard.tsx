import { Flex, Heading, Text } from "@chakra-ui/react"
import type { LucideIcon } from "lucide-react"

export const StatCard = ({ icon: Icon, value, label, color = "sage.600", bgTint = "sage.50" }: Props) => (
  <Flex
    direction="column"
    gap={{ base: "2", md: "3" }}
    p={{ base: "4", md: "5" }}
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
        w={{ base: "9", md: "10" }}
        h={{ base: "9", md: "10" }}
        borderRadius="lg"
        bg={bgTint}
        color={color}
      >
        <Icon size={20} />
      </Flex>
      <Heading size={{ base: "xl", md: "2xl" }} fontWeight="700" color={color}>
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
  bgTint?: string
}
