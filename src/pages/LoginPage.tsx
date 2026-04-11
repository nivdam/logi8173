import { Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "./login-helpers"
import { useAuthLogin } from "../lib/use-auth"
import { ErrorBanner } from "../components/ErrorBanner"
import { useErrorBanner } from "../components/use-error-banner"
import { api } from "../lib/api"
import { getApiErrorMessage } from "../lib/api-error"
import { t } from "../lib/i18n"
import logo from "../assets/logo-with-text.png"

export const LoginPage = () => {
  const navigate = useNavigate()
  const onLoginSuccess = useAuthLogin()
  const { error, showError, clearError } = useErrorBanner()

  const handleGoogleError = () => {
    showError(t("auth.loginFailed"))
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential
    if (!idToken) return

    try {
      const decoded = jwtDecode(idToken)
      const operator = await api.authenticateWithGoogleToken(idToken)

      onLoginSuccess({
        operator: {
          ...operator,
          avatarUrl: operator.avatarUrl || decoded.picture,
        },
        idToken,
      })
      navigate("/", { replace: true })
    } catch (loginError) {
      showError(getApiErrorMessage(loginError, t("auth.loginFailed")))
    }
  }

  return (
    <>
      <ErrorBanner message={error} onDismiss={clearError} />
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100dvh"
        bg="bg"
        px="4"
      >
        <VStack gap="8">
          <VStack gap="4">
            <Image src={logo} alt={t("app.battalion")} w="140px" h="auto" />
            <Heading size="2xl" fontWeight="700">
              {t("app.tagline")}
            </Heading>
            <Text textStyle="lg" color="fg.muted">
              {t("auth.loginPrompt")}
            </Text>
          </VStack>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            width="300"
          />

          <Text textStyle="xs" color="fg.muted">
            {t("app.battalion")}
          </Text>
        </VStack>
      </Flex>
    </>
  )
}
