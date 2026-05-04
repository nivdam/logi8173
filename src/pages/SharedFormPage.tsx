import { Box, Button, Flex } from "@chakra-ui/react"
import { Printer } from "lucide-react"
import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { usePublicTransaction } from "../api"
import { SharedFormError } from "../features/shared-form/SharedFormError"
import { SharedFormLoading } from "../features/shared-form/SharedFormLoading"
import { LoanPrintForm } from "../features/shared-form/LoanPrintForm"
import { t } from "../lib/i18n"
import { animations } from "../theme/animations"

export const SharedFormPage = () => {
  const { activityId = "", txId = "" } = useParams<SharedFormPageParams>()
  const [searchParams] = useSearchParams()
  const { data: transaction, isLoading, isError } = usePublicTransaction(activityId, txId)
  const shouldPrint = searchParams.get("print") === "1"

  useEffect(() => {
    if (!transaction || !shouldPrint) return
    const timeoutId = window.setTimeout(() => {
      window.print()
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [transaction, shouldPrint])

  if (isLoading) {
    return <SharedFormLoading />
  }

  if (isError || !transaction) {
    return <SharedFormError />
  }

  return (
    <Flex
      direction="column"
      align="center"
      minH="100dvh"
      bg="bg.muted"
      p="4"
      css={{
        ...animations.fadeInUp,
        "@media print": {
          display: "block",
          minHeight: "auto",
          padding: 0,
          background: "white",
        },
      }}
    >
      <Box w="full" py="6" css={{ "@media print": { padding: 0 } }}>
        <Flex justify="center" mb="4" css={{ "@media print": { display: "none" } }}>
          <Button colorPalette="primary" onClick={() => window.print()}>
            <Printer size={16} />
            {t("sharedForm.printForm")}
          </Button>
        </Flex>
        <LoanPrintForm transaction={transaction} />
      </Box>
    </Flex>
  )
}

type SharedFormPageParams = {
  activityId: string
  txId: string
}
