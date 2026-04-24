import { useState } from "react"
import {
  Button,
  Checkbox,
  chakra,
  Dialog,
  Field,
  Input,
  Portal,
  Stack,
} from "@chakra-ui/react"
import type { Company } from "../../types"
import { t } from "../../lib/i18n"

export const CompanyDialog = ({
  open,
  company,
  isSaving,
  resetKey,
  onOpenChange,
  onSubmit,
}: CompanyDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mx="4" maxW="md">
          <CompanyDialogForm
            key={resetKey}
            company={company}
            isSaving={isSaving}
            onSubmit={onSubmit}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)

const CompanyDialogForm = ({
  company,
  isSaving,
  onSubmit,
}: CompanyDialogFormProps) => {
  const [name, setName] = useState(company?.name ?? "")
  const [isActive, setIsActive] = useState(company?.isActive ?? true)

  const isEditing = company !== undefined
  const isValid = name.trim() !== ""

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    await onSubmit({
      companyId: company?.companyId,
      name: name.trim(),
      isActive,
    })
  }

  const handleCheckedChange = (details: { checked: boolean | "indeterminate" }) => {
    setIsActive(details.checked === true)
  }

  return (
    <chakra.form onSubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>
          {isEditing
            ? t("settings.companies.editTitle")
            : t("settings.companies.addTitle")}
        </Dialog.Title>
        <Dialog.Description>
          {t("settings.companies.dialogDescription")}
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Body>
        <Stack gap="4">
          <Field.Root required>
            <Field.Label>{t("settings.companies.name")}</Field.Label>
            <Input
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </Field.Root>

          <Checkbox.Root
            checked={isActive}
            onCheckedChange={handleCheckedChange}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              {t("settings.companies.isActive")}
            </Checkbox.Label>
          </Checkbox.Root>
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

type CompanyDialogValues = {
  companyId?: string
  name: string
  isActive: boolean
}

type CompanyDialogFormProps = {
  company?: Company
  isSaving: boolean
  onSubmit: (values: CompanyDialogValues) => Promise<void>
}

type CompanyDialogProps = {
  open: boolean
  company?: Company
  isSaving: boolean
  resetKey: number
  onOpenChange: (details: { open: boolean }) => void
  onSubmit: (values: CompanyDialogValues) => Promise<void>
}
