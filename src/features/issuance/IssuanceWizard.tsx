import { useState } from "react"
import { Box, Button, Flex } from "@chakra-ui/react"
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth-context"
import { useCreateTransaction } from "../../api"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import { StepProgressBar } from "./StepProgressBar"
import { SoldierPicker } from "./SoldierPicker"
import { ItemSelector } from "./ItemSelector"
import { IssuanceReview } from "./IssuanceReview"
import { IssuanceSuccess } from "./IssuanceSuccess"
import { PageHeader } from "../../components/PageHeader"
import type { Soldier } from "../../types"
import type { IssuanceStep, ItemCondition, SelectedItem } from "./issuance.types"

export const IssuanceWizard = () => {
  const navigate = useNavigate()
  const { operator } = useAuth()
  const createTransaction = useCreateTransaction()

  const [currentStep, setCurrentStep] = useState<IssuanceStep>("soldier")
  const [receiver, setReceiver] = useState<Soldier | undefined>(undefined)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [notes, setNotes] = useState("")
  const [signatureData, setSignatureData] = useState("")

  const handleSelectSoldier = (soldier: Soldier) => {
    setReceiver(soldier)
    setCurrentStep("items")
  }

  const handleUpdateItem = (itemId: string, name: string, availableQty: number, qty: number) => {
    setSelectedItems((previous) => {
      if (qty <= 0) {
        return previous.filter((item) => item.itemId !== itemId)
      }

      const existing = previous.find((item) => item.itemId === itemId)
      if (existing) {
        return previous.map((item) =>
          item.itemId === itemId ? { ...item, selectedQty: qty } : item,
        )
      }

      return [...previous, { itemId, name, availableQty, selectedQty: qty, condition: "new" as const }]
    })
  }

  const handleChangeCondition = (itemId: string, condition: ItemCondition) => {
    setSelectedItems((previous) =>
      previous.map((item) =>
        item.itemId === itemId ? { ...item, condition } : item,
      ),
    )
  }

  const handleConfirmIssuance = () => {
    if (!receiver || !operator) return

    const transactionItems = selectedItems
      .filter((item) => item.selectedQty > 0)
      .map((item) => ({
        itemId: item.itemId,
        name: item.name,
        qty: item.selectedQty,
        condition: item.condition,
      }))

    if (transactionItems.length === 0) return

    createTransaction.mutate(
      {
        activityId: "act1",
        txType: "issue",
        giverPersonalId: operator.email,
        giverName: operator.fullName,
        receiverPersonalId: receiver.personalId,
        receiverName: receiver.fullName,
        items: transactionItems,
        notes,
        signatureBase64: signatureData,
      },
      {
        onSuccess: () => {
          setCurrentStep("success")
        },
      },
    )
  }

  const handleNewIssuance = () => {
    setReceiver(undefined)
    setSelectedItems([])
    setNotes("")
    setSignatureData("")
    setCurrentStep("soldier")
  }

  const handleBackToDashboard = () => {
    navigate("/")
  }

  const handleEditSoldier = () => {
    setCurrentStep("soldier")
  }

  const handleEditItems = () => {
    setCurrentStep("items")
  }

  const handleGoToReview = () => {
    setCurrentStep("review")
  }

  const hasSelectedItems = selectedItems.some((item) => item.selectedQty > 0)
  const hasSignature = !!signatureData

  if (currentStep === "success" && receiver) {
    const totalItems = selectedItems.reduce((sum, item) => sum + item.selectedQty, 0)
    return (
      <IssuanceSuccess
        receiver={receiver}
        itemCount={totalItems}
        onNewIssuance={handleNewIssuance}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  const confirmButtonLabel = createTransaction.isPending
    ? t("issuance.confirming")
    : t("issuance.confirmIssuance")

  return (
    <Flex direction="column" gap="5">
      <PageHeader title={t("issuance.title")} />

      {(currentStep === "soldier" || currentStep === "items" || currentStep === "review") && (
        <StepProgressBar currentStep={currentStep} />
      )}

      <Box css={animations.fadeInUp}>
        {currentStep === "soldier" && (
          <SoldierPicker onSelect={handleSelectSoldier} />
        )}

        {currentStep === "items" && (
          <ItemSelector
            selectedItems={selectedItems}
            onUpdateItem={handleUpdateItem}
            onChangeCondition={handleChangeCondition}
          />
        )}

        {currentStep === "review" && receiver && (
          <IssuanceReview
            receiver={receiver}
            selectedItems={selectedItems.filter((item) => item.selectedQty > 0)}
            notes={notes}
            signatureData={signatureData}
            onEditSoldier={handleEditSoldier}
            onEditItems={handleEditItems}
            onNotesChange={setNotes}
            onSign={setSignatureData}
          />
        )}
      </Box>

      {/* Sticky bottom action bar */}
      {currentStep === "items" && (
        <StepActionBar
          onBack={handleEditSoldier}
          onNext={handleGoToReview}
          nextLabel={t("issuance.next")}
          isNextDisabled={!hasSelectedItems}
        />
      )}

      {currentStep === "review" && (
        <StepActionBar
          onBack={handleEditItems}
          onNext={handleConfirmIssuance}
          nextLabel={confirmButtonLabel}
          isNextDisabled={!hasSignature || createTransaction.isPending}
          isLoading={createTransaction.isPending}
        />
      )}
    </Flex>
  )
}

const StepActionBar = ({ onBack, onNext, nextLabel, isNextDisabled, isLoading }: StepActionBarProps) => (
  <Flex
    position="sticky"
    bottom="0"
    bg="bg.card"
    borderTopWidth="1px"
    borderColor="border"
    p="4"
    mx="-4"
    mb="-4"
    gap="3"
    zIndex="sticky"
  >
    <Button
      flex="1"
      variant="outline"
      borderRadius="xl"
      onClick={onBack}
    >
      <ArrowRight size={16} />
      {t("issuance.back")}
    </Button>
    <Button
      flex="2"
      bg="sage.600"
      color="white"
      borderRadius="xl"
      _hover={{ bg: "sage.700" }}
      onClick={onNext}
      disabled={isNextDisabled}
    >
      {isLoading && <Loader2 size={16} />}
      {nextLabel}
      {!isLoading && <ArrowLeft size={16} />}
    </Button>
  </Flex>
)

type StepActionBarProps = {
  onBack: () => void
  onNext: () => void
  nextLabel: string
  isNextDisabled: boolean
  isLoading?: boolean
}
