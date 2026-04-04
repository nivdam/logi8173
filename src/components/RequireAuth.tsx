import { Navigate } from "react-router-dom"
import { Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { useAuth } from "../lib/auth-context"
import type { OperatorRole } from "../lib/auth.types"
import { canAccessRoute } from "../lib/auth-helpers"

export const RequireAuth = ({
  requiredRole,
  children,
}: Props) => {
  const { status, operator } = useAuth()

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && (!operator || !canAccessRoute(operator.role, requiredRole))) {
    return (
      <Flex align="center" justify="center" minH="50dvh">
        <VStack gap="4">
          <Heading size="lg">אין הרשאה</Heading>
          <Text color="fg.muted">אין לך הרשאה לצפות בדף זה.</Text>
        </VStack>
      </Flex>
    )
  }

  return children
}

type Props = {
  requiredRole?: OperatorRole[]
  children: React.ReactNode
}
