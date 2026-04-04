import { Heading, Text, VStack } from "@chakra-ui/react"
import { animations } from "../theme/animations"

export const PageHeader = ({ title, description }: Props) => (
  <VStack align="start" gap="1" css={animations.fadeInUp}>
    <Heading size="lg" fontWeight="600">{title}</Heading>
    {description ? <Text textStyle="sm" color="fg.muted">{description}</Text> : null}
  </VStack>
)

type Props = {
  title: string
  description?: string
}
