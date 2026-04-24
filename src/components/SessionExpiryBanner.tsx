import { Button, Flex, Icon, Text } from "@chakra-ui/react"
import { AlertTriangle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/use-auth"
import { savePostLoginRedirect } from "../lib/auth-helpers"
import { t } from "../lib/i18n"

export const SessionExpiryBanner = () => {
  const { status, isSessionExpiringSoon } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (status !== "authenticated" || !isSessionExpiringSoon) return null

  const handleLoginNow = () => {
    savePostLoginRedirect(`${location.pathname}${location.search}${location.hash}`)
    navigate("/login")
  }

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="3"
      px={{ base: "4", md: "6" }}
      py="3"
      bg="bg.muted"
      color="fg"
      borderBottomWidth="2px"
      borderColor="warning"
      role="status"
      aria-live="polite"
    >
      <Flex align="center" gap="2" minW="0">
        <Icon color="warning" flexShrink={0}>
          <AlertTriangle size={18} />
        </Icon>
        <Text textStyle="sm" fontWeight="500">
          {t("auth.sessionExpiryWarning")}
        </Text>
      </Flex>
      <Button
        size="md"
        minH="44px"
        variant="solid"
        colorPalette="primary"
        onClick={handleLoginNow}
        flexShrink="0"
      >
        {t("auth.loginNow")}
      </Button>
    </Flex>
  )
}
