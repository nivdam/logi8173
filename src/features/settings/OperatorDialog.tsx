import { useState } from "react"
import {
  Button,
  chakra,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
} from "@chakra-ui/react"
import type { AuthenticatedOperator, OperatorRole } from "../../lib/auth.types"
import { t } from "../../lib/i18n"
import { getOperatorRoleOptions } from "./settings-helpers"

export const OperatorDialog = ({
  open,
  operator,
  isSaving,
  resetKey,
  onOpenChange,
  onSubmit,
}: OperatorDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mx="4" maxW="md">
          <OperatorDialogForm
            key={resetKey}
            operator={operator}
            isSaving={isSaving}
            onSubmit={onSubmit}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)

const OperatorDialogForm = ({
  operator,
  isSaving,
  onSubmit,
}: OperatorDialogFormProps) => {
  const roleOptions = getOperatorRoleOptions()

  const [email, setEmail] = useState(operator?.email ?? "")
  const [fullName, setFullName] = useState(operator?.fullName ?? "")
  const [role, setRole] = useState<OperatorRole>(operator?.role ?? "viewer")

  const isEditing = operator !== undefined
  const isValid = email.trim() !== "" && fullName.trim() !== ""

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    await onSubmit({
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      savedSignatureUrl: operator?.savedSignatureUrl,
    })
  }

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = roleOptions.find(
      (option) => option.value === event.currentTarget.value,
    )
    if (selectedOption) {
      setRole(selectedOption.value)
    }
  }

  return (
    <chakra.form onSubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>
          {isEditing
            ? t("settings.operators.editTitle")
            : t("settings.operators.addTitle")}
        </Dialog.Title>
        <Dialog.Description>
          {t("settings.operators.dialogDescription")}
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Body>
        <Stack gap="4">
          <Field.Root required>
            <Field.Label>{t("settings.operators.email")}</Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              readOnly={isEditing}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>
              {t("settings.operators.fullName")}
            </Field.Label>
            <Input
              value={fullName}
              onChange={(event) =>
                setFullName(event.currentTarget.value)
              }
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>{t("settings.operators.role")}</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={role}
                onChange={handleRoleChange}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
        </Stack>
      </Dialog.Body>

      <Dialog.Footer>
        <Dialog.ActionTrigger asChild>
          <Button variant="ghost">{t("common.cancel")}</Button>
        </Dialog.ActionTrigger>
        <Button
          type="submit"
          colorPalette="primary"
          loading={isSaving}
          disabled={!isValid}
        >
          {t("common.save")}
        </Button>
      </Dialog.Footer>
    </chakra.form>
  )
}

type OperatorDialogValues = {
  email: string
  fullName: string
  role: OperatorRole
  savedSignatureUrl?: string
}

type OperatorDialogFormProps = {
  operator?: AuthenticatedOperator
  isSaving: boolean
  onSubmit: (values: OperatorDialogValues) => Promise<void>
}

type OperatorDialogProps = {
  open: boolean
  operator?: AuthenticatedOperator
  isSaving: boolean
  resetKey: number
  onOpenChange: (details: { open: boolean }) => void
  onSubmit: (values: OperatorDialogValues) => Promise<void>
}
