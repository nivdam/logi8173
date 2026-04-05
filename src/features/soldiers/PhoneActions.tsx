import { Button, Flex, Text } from "@chakra-ui/react"
import { Phone, MessageCircle } from "lucide-react"
import { PopoverArrow, PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from "@chakra-ui/react"
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

  const handleTriggerClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <PopoverRoot positioning={{ placement: "bottom-start" }}>
      <PopoverTrigger asChild>
        <Text
          textStyle="sm"
          color="sunburst.500"
          dir="ltr"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={handleTriggerClick}
          role="cell"
        >
          {phone}
        </Text>
      </PopoverTrigger>
      <PopoverContent
        w="auto"
        borderRadius="xl"
        shadow="lg"
        p="1"
      >
        <PopoverArrow />
        <PopoverBody p="1">
          <Flex direction="column" gap="1">
            <Button
              variant="ghost"
              size="sm"
              borderRadius="lg"
              justifyContent="start"
              gap="2"
              onClick={handleCall}
            >
              <Phone size={15} color="var(--chakra-colors-sage-600)" />
              <Text textStyle="sm">{t("soldiers.call")}</Text>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              borderRadius="lg"
              justifyContent="start"
              gap="2"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={15} color="var(--chakra-colors-green-600)" />
              <Text textStyle="sm">{t("soldiers.whatsapp")}</Text>
            </Button>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  )
}

type Props = {
  phone: string
}
