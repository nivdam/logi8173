import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { Plus } from "lucide-react"
import { animations } from "../../theme/animations"

export const SettingsSectionCard = ({
  title,
  description,
  actionLabel,
  animationDelay = 0.1,
  onAction,
  children,
}: SettingsSectionCardProps) => (
  <Box
    bg="bg.card"
    borderWidth="1px"
    borderColor="border"
    borderRadius="xl"
    p={{ base: "3", md: "5" }}
    css={animations.delayedFadeInUp(animationDelay)}
  >
    <Flex align="center" gap="2" mb="4">
      <Box>
        <Heading size="md" fontWeight="600">
          {title}
        </Heading>
        <Text color="fg.muted" textStyle="sm" mt="1" display={{ base: "none", md: "block" }}>
          {description}
        </Text>
      </Box>
      <Button ms="auto" size="sm" onClick={onAction} colorPalette="primary" aria-label={actionLabel}>
        <Plus size={16} />
        <Box as="span" display={{ base: "none", sm: "inline" }}>
          {actionLabel}
        </Box>
      </Button>
    </Flex>

    {children}
  </Box>
)

type SettingsSectionCardProps = {
  title: string
  description: string
  actionLabel: string
  animationDelay?: number
  onAction: () => void
  children: React.ReactNode
}
