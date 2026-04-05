import { Navigate } from "react-router-dom"
import { Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { useAuth } from "../lib/use-auth"
import { canAccessRoute } from "../lib/auth-helpers"
import { t } from "../lib/i18n"
import type { OperatorRole } from "../lib/auth.types"

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
          <Heading size="lg">{t("auth.noAccess")}</Heading>
          <Text color="fg.muted">{t("auth.noAccessDescription")}</Text>
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
