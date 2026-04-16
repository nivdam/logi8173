import { useEffect, useState } from "react"
import {
  Button,
  chakra,
  Dialog,
  Field,
  Flex,
  Image,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { RefreshCw } from "lucide-react"
import { SignatureCanvas } from "./SignatureCanvas"
import { t } from "../lib/i18n"
import { RANK_OPTIONS } from "../lib/rank-options"
import type { OperatorProfile } from "../lib/auth.types"

export const OperatorProfileDialog = ({
  open,
  onOpenChange,
  defaultFullName,
  defaultSavedSignature,
  initialProfile,
  isSaving,
  isBlocking = false,
  showReset = false,
  onReset,
  onSubmit,
}: OperatorProfileDialogProps) => {
  const [fullName, setFullName] = useState(defaultFullName)
  const [rank, setRank] = useState(initialProfile?.rank ?? "")
  const [personalId, setPersonalId] = useState(initialProfile?.personalId ?? "")
  const [phone, setPhone] = useState(initialProfile?.phone ?? "")
  const [savedSignature, setSavedSignature] = useState(
    initialProfile?.savedSignature ?? defaultSavedSignature ?? "",
  )
  const [isEditingSignature, setIsEditingSignature] = useState(
    (initialProfile?.savedSignature ?? defaultSavedSignature ?? "") === "",
  )

  useEffect(() => {
    if (!open) return
    setFullName(defaultFullName)
    setRank(initialProfile?.rank ?? "")
    setPersonalId(initialProfile?.personalId ?? "")
    setPhone(initialProfile?.phone ?? "")
    const sig = initialProfile?.savedSignature ?? defaultSavedSignature ?? ""
    setSavedSignature(sig)
    setIsEditingSignature(sig === "")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset state only when dialog opens
  }, [open])

  const isValid =
    fullName.trim() !== "" &&
    rank.trim() !== "" &&
    personalId.trim() !== "" &&
    phone.trim() !== "" &&
    savedSignature !== ""

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    onSubmit({
      fullName: fullName.trim(),
      rank: rank.trim(),
      personalId: personalId.trim(),
      phone: phone.trim(),
      savedSignature,
    })
  }

  const handleFullNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.currentTarget.value)
  }

  const handleRankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRank(event.target.value)
  }

  const handlePersonalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalId(event.currentTarget.value)
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.currentTarget.value)
  }

  const handleEditSignature = () => {
    setIsEditingSignature(true)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      closeOnEscape={!isBlocking}
      closeOnInteractOutside={!isBlocking}
      role="alertdialog"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx="4" maxW="2xl" asChild>
            <chakra.form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>{t("auth.profileTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("auth.profileDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="4">
                  <Text textStyle="sm" color="fg.muted">
                    {t("auth.profileDeviceOnly")}
                  </Text>

                  <Field.Root required>
                    <Field.Label>{t("soldiers.fullName")}</Field.Label>
                    <Input
                      value={fullName}
                      onChange={handleFullNameChange}
                    />
                  </Field.Root>

                  <Flex gap="4" direction={{ base: "column", md: "row" }}>
                    <Field.Root required flex="1">
                      <Field.Label>{t("auth.rank")}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          value={rank}
                          onChange={handleRankChange}
                        >
                          <option value="">{t("auth.selectRank")}</option>
                          {RANK_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root required flex="1">
                      <Field.Label>{t("soldiers.personalId")}</Field.Label>
                      <Input
                        type="tel"
                        value={personalId}
                        onChange={handlePersonalIdChange}
                        inputMode="numeric"
                      />
                    </Field.Root>
                  </Flex>

                  <Field.Root required>
                    <Field.Label>{t("soldiers.phone")}</Field.Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      inputMode="tel"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>{t("issuance.savedSignature")}</Field.Label>
                    {savedSignature !== "" && !isEditingSignature ? (
                      <Stack gap="3">
                        <Flex
                          borderWidth="2px"
                          borderColor="sage.300"
                          borderStyle="dashed"
                          borderRadius="xl"
                          overflow="hidden"
                          bg="white"
                          p="2"
                          justify="center"
                        >
                          <Image
                            src={savedSignature}
                            alt={t("issuance.savedSignature")}
                            maxH="160px"
                          />
                        </Flex>
                        <Flex justify="space-between" align="center">
                          <Text textStyle="xs" color="fg.muted">
                            {t("issuance.savedSignature")}
                          </Text>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            color="fg.muted"
                            onClick={handleEditSignature}
                          >
                            <RefreshCw size={12} />
                            {t("auth.editSignature")}
                          </Button>
                        </Flex>
                      </Stack>
                    ) : (
                      <SignatureCanvas
                        signatureData={savedSignature}
                        onSign={setSavedSignature}
                      />
                    )}
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                {!isBlocking && (
                  <Dialog.ActionTrigger asChild>
                    <Button type="button" variant="ghost">{t("common.cancel")}</Button>
                  </Dialog.ActionTrigger>
                )}
                {showReset && onReset && (
                  <Button
                    type="button"
                    variant="outline"
                    colorPalette="red"
                    onClick={onReset}
                  >
                    {t("auth.clearProfile")}
                  </Button>
                )}
                <Button type="submit" colorPalette="sage" loading={isSaving} disabled={!isValid}>
                  {t("common.save")}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

type OperatorProfileDialogProps = {
  open: boolean
  onOpenChange?: (details: { open: boolean }) => void
  defaultFullName: string
  defaultSavedSignature?: string
  initialProfile: OperatorProfile | undefined
  isSaving: boolean
  isBlocking?: boolean
  showReset?: boolean
  onReset?: () => void
  onSubmit: (profile: OperatorProfile) => void
}
