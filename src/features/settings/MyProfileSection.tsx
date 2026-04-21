import { useState } from "react"
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Pencil, User } from "lucide-react"
import { OperatorProfileDialog } from "../../components/OperatorProfileDialog"
import { useAuth } from "../../lib/use-auth"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { showApiErrorToast } from "../../lib/api-error"
import { useSaveOperatorProfile } from "../operator-profile/useSaveOperatorProfile"
import type { OperatorProfile } from "../../lib/auth.types"

export const MyProfileSection = () => {
  const { operator, operatorProfile, clearOperatorProfile } = useAuth()
  const { save, isSaving } = useSaveOperatorProfile()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (details: { open: boolean }) => {
    setIsDialogOpen(details.open)
  }

  const handleSaveProfile = async (profile: OperatorProfile) => {
    try {
      await save(profile)
      setIsDialogOpen(false)
    } catch (error) {
      showApiErrorToast({
        actionLabel: t("settings.myProfile.saveError"),
        error,
      })
    }
  }

  const handleResetProfile = () => {
    clearOperatorProfile()
    setIsDialogOpen(false)
  }

  if (!operator) return null

  const hasProfile = operatorProfile !== undefined

  return (
    <>
      <Box
        bg="bg.card"
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        p={{ base: "3", md: "5" }}
        css={animations.delayedFadeInUp(0)}
      >
        <Flex align="center" gap="2" mb="4">
          <Box>
            <Heading size="md" fontWeight="600">
              {t("settings.myProfile.title")}
            </Heading>
            <Text color="fg.muted" textStyle="sm" mt="1" display={{ base: "none", md: "block" }}>
              {t("settings.myProfile.description")}
            </Text>
          </Box>
          <Button
            ms="auto"
            size="sm"
            onClick={handleOpenDialog}
            colorPalette="sage"
            variant={hasProfile ? "outline" : "solid"}
          >
            <Pencil size={14} />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              {t("settings.myProfile.editAction")}
            </Text>
          </Button>
        </Flex>

        {hasProfile ? (
          <VStack gap="3" align="stretch">
            <Flex
              align="center"
              gap={{ base: "3", md: "4" }}
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
              p={{ base: "3", md: "4" }}
            >
              <Box flex="1" minW="0">
                <Flex align="center" gap="2" mb="1">
                  <Text fontWeight="600" textStyle="sm">
                    {operatorProfile.fullName}
                  </Text>
                  <Badge colorPalette="sage" variant="subtle">
                    {operatorProfile.rank}
                  </Badge>
                </Flex>
                <VStack gap="0.5" align="start">
                  <Text textStyle="xs" color="fg.muted">
                    {t("soldiers.personalId")}: {operatorProfile.personalId}
                  </Text>
                  <Text textStyle="xs" color="fg.muted">
                    {t("soldiers.phone")}: {operatorProfile.phone}
                  </Text>
                  <Text textStyle="xs" color="fg.muted">
                    {operator.email}
                  </Text>
                </VStack>
              </Box>

              {operatorProfile.savedSignature !== "" ? (
                <Flex
                  borderWidth="1px"
                  borderColor="sage.200"
                  borderStyle="dashed"
                  borderRadius="lg"
                  overflow="hidden"
                  bg="white"
                  p="1"
                  flexShrink={0}
                  w={{ base: "80px", md: "120px" }}
                  h={{ base: "40px", md: "50px" }}
                  justify="center"
                  align="center"
                >
                  <Image
                    src={operatorProfile.savedSignature}
                    alt={t("issuance.savedSignature")}
                    maxH="100%"
                    maxW="100%"
                  />
                </Flex>
              ) : null}
            </Flex>
          </VStack>
        ) : (
          <Flex
            direction="column"
            align="center"
            gap="2"
            py="6"
            color="fg.muted"
          >
            <User size={32} />
            <Text textStyle="sm">{t("settings.myProfile.notSet")}</Text>
            <Button size="sm" colorPalette="sage" onClick={handleOpenDialog}>
              {t("settings.myProfile.editAction")}
            </Button>
          </Flex>
        )}
      </Box>

      <OperatorProfileDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        defaultFullName={operatorProfile?.fullName ?? operator.fullName}
        defaultSavedSignature={operator.savedSignatureUrl}
        initialProfile={operatorProfile}
        isSaving={isSaving}
        showReset={hasProfile}
        onReset={handleResetProfile}
        onSubmit={handleSaveProfile}
      />
    </>
  )
}
