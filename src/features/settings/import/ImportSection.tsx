import { useState } from "react"
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { FileSpreadsheet } from "lucide-react"
import { t } from "../../../lib/i18n"
import { ImportDialog } from "./ImportDialog"

export const ImportSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (details: { open: boolean }) => {
    setIsDialogOpen(details.open)
  }

  return (
    <Box
      bg="bg.card"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      p={{ base: "5", md: "6" }}
    >
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <FileSpreadsheet size={20} />
          <Heading size="md" fontWeight="600">{t("settings.import.title")}</Heading>
        </Flex>
        <Text textStyle="sm" color="fg.muted">
          {t("settings.import.description")}
        </Text>
        <Button
          size="sm"
          variant="outline"
          borderRadius="lg"
          alignSelf="start"
          onClick={handleOpenDialog}
        >
          <FileSpreadsheet size={16} />
          {t("settings.import.action")}
        </Button>
      </Flex>

      <ImportDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange} />
    </Box>
  )
}
