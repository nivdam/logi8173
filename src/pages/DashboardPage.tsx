import { Heading, Text, VStack } from "@chakra-ui/react"

export const DashboardPage = () => (
  <VStack align="start" gap="4">
    <Heading size="lg">לוח בקרה</Heading>
    <Text color="fg.muted">סיכום מצב מלאי, פעילויות אחרונות וחוסרים.</Text>
  </VStack>
)
