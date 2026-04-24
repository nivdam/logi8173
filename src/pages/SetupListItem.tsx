import { Flex, List, Text } from "@chakra-ui/react"
import { animations } from "../theme/animations"

export const SetupListItem = ({ icon: Icon, text, index }: Props) => (
  <List.Item css={animations.listItem(index)}>
    <Flex align="center" gap="3">
      <Flex
        align="center"
        justify="center"
        w="8"
        h="8"
        borderRadius="lg"
        bg="forest.100"
        flexShrink={0}
      >
        <Icon size={16} color="var(--chakra-colors-forest-600)" />
      </Flex>
      <Text textStyle="sm">{text}</Text>
    </Flex>
  </List.Item>
)

type Props = {
  icon: React.ComponentType<{ size?: number; color?: string }>
  text: string
  index: number
}
