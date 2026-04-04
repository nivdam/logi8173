import { Flex, Text } from "@chakra-ui/react"

export const StatusBadge = ({ label, color }: Props) => (
  <Flex
    display="inline-flex"
    align="center"
    px="2.5"
    py="0.5"
    borderRadius="full"
    bg={`${color}/10`}
  >
    <Text textStyle="xs" fontWeight="500" color={color}>
      {label}
    </Text>
  </Flex>
)

type Props = {
  label: string
  color: string
}
