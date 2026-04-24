import { Accordion, Box, Flex, Text } from "@chakra-ui/react"
import type { LucideIcon } from "lucide-react"

const triggerOpenStyles = {
  position: "relative" as const,
  _before: {
    position: "absolute" as const,
    content: "''",
    top: "-3px",
    insetInline: 5,
    h: 1.5,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    bgColor: "sunburst.400",
    boxShadow: "sm",
  },
}

export const IssuanceAccordionSection = ({
  value,
  icon: Icon,
  label,
  overflowVisible,
  children,
}: IssuanceAccordionSectionProps) => (
  <Accordion.Item
    value={value}
    bg="bg.card"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="border"
    overflow={overflowVisible ? "visible" : undefined}
    _open={{ boxShadow: "md" }}
  >
    <Accordion.ItemTrigger px="4" py="3" _open={triggerOpenStyles}>
      <Flex align="center" gap="2" flex="1">
        <Flex
          align="center"
          justify="center"
          w="7"
          h="7"
          borderRadius="full"
          bg="forest.100"
          color="forest.700"
        >
          <Icon size={14} />
        </Flex>
        <Text fontWeight="600">{label}</Text>
      </Flex>
      <Accordion.ItemIndicator />
    </Accordion.ItemTrigger>
    <Accordion.ItemContent>
      <Box px="4" pb="4" overflow={overflowVisible ? "visible" : undefined}>
        {children}
      </Box>
    </Accordion.ItemContent>
  </Accordion.Item>
)

type IssuanceAccordionSectionProps = {
  value: string
  icon: LucideIcon
  label: string
  overflowVisible?: boolean
  children: React.ReactNode
}
