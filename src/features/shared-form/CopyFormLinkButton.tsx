import { Button } from "@chakra-ui/react"
import { Check, Link } from "lucide-react"
import { useState } from "react"
import { t } from "../../lib/i18n"

const buildFormUrl = (activityId: string, txId: string): string =>
  `${window.location.origin}/form/${activityId}/${txId}`

export const CopyFormLinkButton = ({ activityId, txId }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = buildFormUrl(activityId, txId)
    if (!navigator.clipboard) {
      window.prompt(t("sharedForm.copyLink"), url)
      return
    }
    void navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true)
        window.setTimeout(() => {
          setCopied(false)
        }, 2000)
      },
      () => {
        window.prompt(t("sharedForm.copyLink"), url)
      },
    )
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      color={copied ? "green.600" : "fg.muted"}
      onClick={handleCopy}
    >
      {copied ? <Check size={14} /> : <Link size={14} />}
      {copied ? t("sharedForm.linkCopied") : t("sharedForm.copyLink")}
    </Button>
  )
}

type Props = {
  activityId: string
  txId: string
}
