import { Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import type { LucideIcon } from "lucide-react"

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: Props) => (
  <Flex align="center" justify="center" py="16">
    <VStack gap="4" textAlign="center">
      {Icon ? (
        <Flex
          align="center"
          justify="center"
          w="16"
          h="16"
          borderRadius="full"
          bg="bg.muted"
          color="fg.muted"
        >
          <Icon size={32} strokeWidth={1.2} />
        </Flex>
      ) : null}
      <Heading size="md" fontWeight="500">{title}</Heading>
      {description ? <Text textStyle="sm" color="fg.muted" maxW="sm">{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button size="sm" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </VStack>
  </Flex>
)

type Props = {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}
