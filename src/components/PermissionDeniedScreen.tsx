import { Button } from "@chakra-ui/react"
import { ApiError } from "../lib/api"
import { AuthErrorCard } from "./AuthErrorCard"
import { t } from "../lib/i18n"
import { useAuth } from "../lib/use-auth"

export const PermissionDeniedScreen = ({ error }: Props) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <AuthErrorCard
      title={t("setup.permissionErrorTitle")}
      description={t("setup.permissionErrorDescription")}
      technicalMessage={`${error.code}: ${error.message}`}
      severity="alert"
    >
      <Button colorPalette="sage" variant="solid" w="100%" size="lg" onClick={handleLogout}>
        {t("auth.logout")}
      </Button>
    </AuthErrorCard>
  )
}

type Props = {
  error: ApiError
}
