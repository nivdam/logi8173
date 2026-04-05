import { Box, Button, Flex, Text, Textarea, VStack } from "@chakra-ui/react"
import { Edit3, User, Package } from "lucide-react"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { getConditionLabel } from "./issuance.constants"
import { SignatureCanvas } from "./SignatureCanvas"
import type { Soldier } from "../../types"
import type { SelectedItem } from "./issuance.types"

export const IssuanceReview = ({
  receiver,
  selectedItems,
  notes,
  signatureData,
  onEditSoldier,
  onEditItems,
  onNotesChange,
  onSign,
}: Props) => {
  const totalItems = selectedItems.reduce((sum, item) => sum + item.selectedQty, 0)

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(event.target.value)
  }

  return (
    <VStack gap="5" align="stretch">
      {/* Soldier section */}
      <Box
        bg="bg.card"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        p="4"
        css={animations.fadeInUp}
      >
        <Flex justify="space-between" align="center" mb="3">
          <Flex align="center" gap="2">
            <User size={16} />
            <Text textStyle="sm" fontWeight="600">{t("issuance.reviewSoldier")}</Text>
          </Flex>
          <Button variant="ghost" size="xs" color="sage.600" onClick={onEditSoldier}>
            <Edit3 size={14} />
            {t("issuance.editSoldier")}
          </Button>
        </Flex>
        <Flex align="center" gap="3">
          <Flex
            align="center"
            justify="center"
            w="10"
            h="10"
            borderRadius="full"
            bg="sage.100"
            color="sage.700"
            fontWeight="600"
            textStyle="sm"
          >
            {receiver.fullName.trim()
              ? receiver.fullName.split(" ").filter(Boolean).map((word) => word[0]).join("")
              : "?"}
          </Flex>
          <Box>
            <Text textStyle="sm" fontWeight="600">{receiver.fullName}</Text>
            <Text textStyle="xs" color="fg.muted">{receiver.personalId} · {receiver.company}</Text>
          </Box>
        </Flex>
      </Box>

      {/* Items section */}
      <Box
        bg="bg.card"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        p="4"
        css={animations.delayedFadeInUp(0.1)}
      >
        <Flex justify="space-between" align="center" mb="3">
          <Flex align="center" gap="2">
            <Package size={16} />
            <Text textStyle="sm" fontWeight="600">
              {t("issuance.reviewItems")} ({totalItems})
            </Text>
          </Flex>
          <Button variant="ghost" size="xs" color="sage.600" onClick={onEditItems}>
            <Edit3 size={14} />
            {t("issuance.editItems")}
          </Button>
        </Flex>
        <VStack gap="2" align="stretch">
          {selectedItems.map((item) => (
            <Flex key={item.itemId} justify="space-between" align="center" py="1">
              <Text textStyle="sm">{item.name}</Text>
              <Flex gap="2" align="center">
                <Text textStyle="xs" color="fg.muted">{getConditionLabel(item.condition)}</Text>
                <Text textStyle="sm" fontWeight="600">×{item.selectedQty}</Text>
              </Flex>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Notes */}
      <Box css={animations.delayedFadeInUp(0.2)}>
        <Text textStyle="sm" fontWeight="500" mb="2">{t("issuance.notes")}</Text>
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder={t("issuance.notesPlaceholder")}
          borderRadius="xl"
          rows={2}
          resize="none"
        />
      </Box>

      {/* Signature */}
      <Box css={animations.delayedFadeInUp(0.3)}>
        <SignatureCanvas onSign={onSign} signatureData={signatureData} />
      </Box>
    </VStack>
  )
}

type Props = {
  receiver: Soldier
  selectedItems: SelectedItem[]
  notes: string
  signatureData: string
  onEditSoldier: () => void
  onEditItems: () => void
  onNotesChange: (notes: string) => void
  onSign: (base64: string) => void
}
