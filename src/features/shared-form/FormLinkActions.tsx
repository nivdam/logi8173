import { Button, Flex } from "@chakra-ui/react"
import { ExternalLink, Printer } from "lucide-react"
import { CopyFormLinkButton } from "./CopyFormLinkButton"
import { buildFormUrl } from "./form-url"
import { t } from "../../lib/i18n"

export const FormLinkActions = ({ activityId, txId }: Props) => {
  const handleOpen = () => {
    window.open(buildFormUrl(activityId, txId), "_blank", "noopener,noreferrer")
  }

  const handlePrint = () => {
    window.open(buildFormUrl(activityId, txId, { print: true }), "_blank", "noopener,noreferrer")
  }

  return (
    <Flex gap="2" wrap="wrap" justify="center">
      <CopyFormLinkButton activityId={activityId} txId={txId} />
      <Button size="sm" variant="ghost" color="fg.muted" onClick={handleOpen}>
        <ExternalLink size={14} />
        {t("sharedForm.openForm")}
      </Button>
      <Button size="sm" variant="ghost" color="fg.muted" onClick={handlePrint}>
        <Printer size={14} />
        {t("sharedForm.printForm")}
      </Button>
    </Flex>
  )
}

type Props = {
  activityId: string
  txId: string
}
