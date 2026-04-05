import { Button, Flex, Text } from "@chakra-ui/react"
import { Phone, MessageCircle } from "lucide-react"
import { HoverCardArrow, HoverCardContent, HoverCardPositioner, HoverCardRoot, HoverCardTrigger } from "@chakra-ui/react"
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
    <HoverCardRoot openDelay={200} closeDelay={300} positioning={{ placement: "top" }}>
      <HoverCardTrigger asChild>
        <Text
          textStyle="sm"
          color="sunburst.500"
          dir="ltr"
          cursor="pointer"
          display="inline"
          tabIndex={0}
          _hover={{ textDecoration: "underline" }}
          role="button"
          aria-label={`${phone} — ${t("soldiers.call")} / ${t("soldiers.whatsapp")}`}
        >
          {phone}
        </Text>
      </HoverCardTrigger>
      <HoverCardPositioner>
        <HoverCardContent
          w="auto"
          borderRadius="xl"
          shadow="lg"
          p="1"
        >
          <HoverCardArrow />
          <Flex gap="1">
            <Button
              variant="ghost"
              size="xs"
              borderRadius="lg"
              gap="1.5"
              onClick={handleCall}
            >
              <Phone size={14} color="var(--chakra-colors-sage-600)" />
              <Text textStyle="xs">{t("soldiers.call")}</Text>
            </Button>
            <Button
              variant="ghost"
              size="xs"
              borderRadius="lg"
              gap="1.5"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={14} color="var(--chakra-colors-green-600)" />
              <Text textStyle="xs">{t("soldiers.whatsapp")}</Text>
            </Button>
          </Flex>
        </HoverCardContent>
      </HoverCardPositioner>
    </HoverCardRoot>
  )
}

type Props = {
  phone: string
}
