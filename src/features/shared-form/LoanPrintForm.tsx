import { Box, Flex, Text } from "@chakra-ui/react"
import { SignatureImage } from "../../components/SignatureImage"
import type { PublicTransaction, PublicTransactionLineItem } from "../../types"

const formatDateTime = (isoString: string): string => {
  if (!isoString) return ""

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return isoString
  }

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear())
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const circledNumber = (value: number): string => {
  const rounded = Math.round(value)
  if (rounded >= 1 && rounded <= 20) {
    return String.fromCodePoint(0x245f + rounded)
  }
  return String(rounded)
}

const formatReturnNotes = (item: PublicTransactionLineItem): string => {
  if (item.returnEvents.length === 0) return item.notes ?? ""

  return item.returnEvents
    .map((event) => {
      const formNumber = event.formNumber ? ` · טופס ${event.formNumber}` : ""
      return `${formatDateTime(event.performedAt)}${formNumber}`
    })
    .join(", ")
}

const QuantityCell = ({ item }: { item: PublicTransactionLineItem }) => {
  if (item.returnedQty <= 0) {
    return <>{item.issuedQty || item.qty}</>
  }

  return (
    <Flex as="span" gap="2" align="center" justify="center" dir="ltr">
      <Text as="span" fontWeight="700" textDecoration={item.issuedQty > 20 ? "none" : undefined}>
        {circledNumber(item.issuedQty || item.qty)}
      </Text>
      <Text as="span">{item.remainingQty}</Text>
    </Flex>
  )
}

const DetailLine = ({ label, value }: DetailLineProps) => (
  <Flex borderBottomWidth="1px" borderColor="gray.700" minH="6" align="end" gap="2">
    <Text as="span" fontWeight="700" minW="16">
      {label}
    </Text>
    <Text as="span" flex="1">
      {value || "\u00a0"}
    </Text>
  </Flex>
)

const SignatureBox = ({ title, party, signatureBase64, date, showPhone }: SignatureBoxProps) => (
  <Box borderWidth="1.5px" borderColor="gray.800" minH="38" p="3">
    <Text fontWeight="700" textAlign="center" mb="2">
      {title}
    </Text>
    <DetailLine label="שם ומשפחה" value={party.fullName} />
    <Flex gap="4">
      <Box flex="1">
        <DetailLine label="מ.א" value={party.personalId} />
      </Box>
      <Box flex="1">
        <DetailLine label="דרגה" value={party.rank} />
      </Box>
    </Flex>
    {showPhone ? (
      <DetailLine label="טלפון" value={party.phone} />
    ) : (
      <DetailLine label="תאריך" value={date} />
    )}
    <Flex minH="18" align="center" justify="center" py="1" color="gray.900">
      {signatureBase64 ? (
        <SignatureImage
          src={signatureBase64}
          alt={`חתימה - ${title}`}
          maxW="170px"
          maxH="70px"
        />
      ) : null}
    </Flex>
    <Text textAlign="start" fontWeight="700">
      חתימה
    </Text>
  </Box>
)

export const LoanPrintForm = ({ transaction }: Props) => (
  <Box
    bg="white"
    color="gray.900"
    w="full"
    maxW="820px"
    mx="auto"
    p={{ base: "4", md: "8" }}
    borderWidth="1px"
    borderColor="gray.300"
    dir="rtl"
    css={{
      "@media print": {
        maxWidth: "none",
        width: "100%",
        minHeight: "auto",
        padding: "6mm",
        border: "0",
        boxShadow: "none",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
        fontSize: "11px",
      },
      "& table": {
        borderCollapse: "collapse",
        width: "100%",
        tableLayout: "fixed",
        border: "2px solid var(--chakra-colors-gray-900)",
      },
      "& th, & td": {
        border: "1.5px solid var(--chakra-colors-gray-800)",
        padding: "4px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.25",
      },
      "& th": {
        fontWeight: "700",
        color: "var(--chakra-colors-gray-900)",
        background: "var(--chakra-colors-gray-200)",
      },
      "& tbody tr": {
        height: "28px",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      },
    }}
  >
    <Box>
      <Box textAlign="center" mb="2">
        <Text as="h1" textStyle="xl" fontWeight="700" textDecoration="underline" lineHeight="1.1">
          טופס השאלת אפסניה - גדח״ן 8173
        </Text>
        <Text textStyle="sm" color="gray.600" fontWeight="600">
          מס׳ טופס: {transaction.formNumber || transaction.txId}
        </Text>
      </Box>

      <Flex align="end" justify="space-between" gap="4" mb="1">
        <Box minW="170px">
          <Text fontWeight="700">מאת: {transaction.giver.fullName}</Text>
          <Text textStyle="md" fontWeight="700" lineHeight="1.1">
            {transaction.giver.company || transaction.activityName}
          </Text>
        </Box>
        <Box minW="170px" textAlign="end">
          <Text fontWeight="700">אל: {transaction.receiver.fullName}</Text>
          <Text textStyle="md" fontWeight="700" lineHeight="1.1">
            {transaction.receiver.company || transaction.activityName}
          </Text>
        </Box>
      </Flex>

      <Box as="table" aria-label="טבלת פריטי אפסניה">
        <Box as="thead">
          <Box as="tr">
            <Box as="th" w="20%">
              מק״ט/מסט״ב
            </Box>
            <Box as="th" w="30%">
              שם הפריט
            </Box>
            <Box as="th" w="14%">
              יח׳ לחישוב
            </Box>
            <Box as="th" w="10%">
              כמות
            </Box>
            <Box as="th" w="26%">
              הערות
            </Box>
          </Box>
        </Box>
        <Box as="tbody">
          {transaction.items.map((item, index) => (
            <Box as="tr" key={`${item.itemId || item.name}-${index}`} minH="7">
              <Box as="td">{item.serialNumber || item.itemId || "\u00a0"}</Box>
              <Box as="td">{item.name}</Box>
              <Box as="td">{item.unitOfMeasure || "\u00a0"}</Box>
              <Box as="td">
                <QuantityCell item={item} />
              </Box>
              <Box as="td">{formatReturnNotes(item) || "\u00a0"}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      {transaction.notes ? (
        <Box mt="3" borderWidth="1.5px" borderColor="gray.800" p="2" minH="12">
          <Text fontWeight="700" mb="1">
            הערות כלליות:
          </Text>
          <Text>{transaction.notes}</Text>
        </Box>
      ) : null}

      <Flex gap="4" mt="5" align="stretch" direction="row">
        <Box flex="1">
          <SignatureBox
            title="פרטי המנפיק"
            party={transaction.giver}
            signatureBase64={transaction.giverSignatureBase64}
            date={formatDateTime(transaction.performedAt)}
          />
        </Box>
        <Box flex="1">
          <SignatureBox
            title="פרטי המקבל"
            party={transaction.receiver}
            signatureBase64={transaction.signatureBase64}
            showPhone
          />
        </Box>
      </Flex>
    </Box>
  </Box>
)

type Props = {
  transaction: PublicTransaction
}

type DetailLineProps = {
  label: string
  value: string | undefined
}

type SignatureBoxProps = {
  title: string
  party: PublicTransaction["giver"]
  signatureBase64: string
  date?: string
  showPhone?: boolean
}
