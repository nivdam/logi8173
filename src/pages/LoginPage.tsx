import { Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "./login-helpers"
import { useAuthLogin } from "../lib/auth-context"
import { DEV_ADMIN_EMAIL } from "../lib/config"
import { t } from "../lib/i18n"
import type { OperatorRole } from "../lib/auth.types"
import logo from "../assets/logo-with-text.png"

export const LoginPage = () => {
  const navigate = useNavigate()
  const onLoginSuccess = useAuthLogin()

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential
    if (!idToken) return

    const decoded = jwtDecode(idToken)

    const operator = {
      email: decoded.email,
      fullName: decoded.name,
      role: resolveRole(decoded.email),
      avatarUrl: decoded.picture,
      googleSub: decoded.sub,
      savedSignatureUrl: undefined,
    }

    onLoginSuccess({ operator, idToken })
    navigate("/", { replace: true })
  }

  return (
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
          onError={() => {
            console.error("Google login failed")
          }}
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
  )
}

const resolveRole = (email: string): OperatorRole => {
  if (DEV_ADMIN_EMAIL && email === DEV_ADMIN_EMAIL) return "admin"
  return "viewer"
}
