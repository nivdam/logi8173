import { Button, Flex, Text } from "@chakra-ui/react"
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
      bg="yellow.100"
      color="yellow.900"
      borderBottomWidth="1px"
      borderColor="yellow.300"
      role="status"
      aria-live="polite"
    >
      <Text textStyle="sm" fontWeight="500">
        {t("auth.sessionExpiryWarning")}
      </Text>
      <Button
        size="md"
        minH="44px"
        variant="solid"
        colorPalette="yellow"
        onClick={handleLoginNow}
        flexShrink="0"
      >
        {t("auth.loginNow")}
      </Button>
    </Flex>
  )
}
