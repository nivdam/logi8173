import { Accordion, Box, Flex, Heading, Image, Text, VStack } from "@chakra-ui/react"
import { ChevronDown } from "lucide-react"
import { t } from "../lib/i18n"
import logo from "../assets/logo-with-text.png"

export const AuthErrorCard = ({
  title,
  description,
  technicalMessage,
  severity = "status",
  children,
}: Props) => {
  const isAlert = severity === "alert"
  return (
    <Flex
      align="center"
      justify="center"
      minH="100dvh"
      bg="bg.auth"
      p={{ base: "4", md: "6" }}
    >
      <Box
        maxW="sm"
        w="100%"
        bg="bg.card"
        borderWidth="1px"
        borderColor="sage.200"
        borderRadius="2xl"
        boxShadow="authCard"
        overflow="hidden"
        px={{ base: "6", md: "8" }}
        py={{ base: "8", md: "10" }}
      >
        <VStack gap="6" align="center">
          <Image src={logo} alt={t("app.battalion")} w="72px" h="auto" />

          <VStack
            gap="2"
            align="center"
            textAlign="center"
            role={isAlert ? "alert" : "status"}
            aria-live={isAlert ? "assertive" : "polite"}
          >
            <Heading as="h1" fontWeight="700" textStyle={{ base: "xl", md: "2xl" }} color="fg.default">
              {title}
            </Heading>
            <Text color="fg.muted" textStyle="sm">
              {description}
            </Text>
          </VStack>

          {children}

          {technicalMessage ? (
            <Accordion.Root collapsible variant="plain" size="sm" w="100%">
              <Accordion.Item value="details">
                <Accordion.ItemTrigger cursor="pointer" px="0" justifyContent="center" minH="44px">
                  <Text textStyle="xs" color="fg.muted">
                    {t("setup.backendErrorDetailsTitle")}
                  </Text>
                  <Accordion.ItemIndicator>
                    <ChevronDown size={14} />
                  </Accordion.ItemIndicator>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Box bg="gray.50" borderRadius="lg" px="4" py="3" mt="1">
                    <Text
                      color="fg.muted"
                      textStyle="xs"
                      wordBreak="break-word"
                      fontFamily="mono"
                      dir="ltr"
                      textAlign="left"
                    >
                      {technicalMessage}
                    </Text>
                  </Box>
                </Accordion.ItemContent>
              </Accordion.Item>
            </Accordion.Root>
          ) : null}
        </VStack>
      </Box>
    </Flex>
  )
}

type Props = {
  title: string
  description: string
  technicalMessage?: string
  severity?: "alert" | "status"
  children?: React.ReactNode
}
