import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react"
import { Phone, MessageCircle } from "lucide-react"
import { t } from "../../lib/i18n"

const formatWhatsAppUrl = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "")
  const international = cleaned.startsWith("0")
    ? "972" + cleaned.slice(1)
    : cleaned
  return `https://wa.me/${international}`
}

const formatTelUrl = (phone: string): string => {
  return `tel:${phone}`
}

export const PhoneActions = ({ phone }: Props) => {
  const handleCall = (event: React.MouseEvent) => {
    event.stopPropagation()
    window.open(formatTelUrl(phone), "_self")
  }

  const handleWhatsApp = (event: React.MouseEvent) => {
    event.stopPropagation()
    window.open(formatWhatsAppUrl(phone), "_blank")
  }

  return (
    <Flex align="center" gap="1" role="cell">
      <Text textStyle="sm" color="fg.muted" dir="ltr">{phone}</Text>
      <Tooltip.Root positioning={{ placement: "top" }}>
        <Tooltip.Trigger asChild>
          <IconButton
            aria-label={t("soldiers.call")}
            variant="ghost"
            size="xs"
            borderRadius="full"
            color="sage.600"
            onClick={handleCall}
            css={{ "&:hover": { color: "sage.700" } }}
          >
            <Phone size={14} />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>{t("soldiers.call")}</Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
      <Tooltip.Root positioning={{ placement: "top" }}>
        <Tooltip.Trigger asChild>
          <IconButton
            aria-label={t("soldiers.whatsapp")}
            variant="ghost"
            size="xs"
            borderRadius="full"
            color="green.600"
            onClick={handleWhatsApp}
            css={{ "&:hover": { color: "green.700" } }}
          >
            <MessageCircle size={14} />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>{t("soldiers.whatsapp")}</Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    </Flex>
  )
}

type Props = {
  phone: string
}
