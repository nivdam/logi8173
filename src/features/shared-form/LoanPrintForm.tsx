import { Box, Flex, Image, Text } from "@chakra-ui/react"
import { SignatureImage } from "../../components/SignatureImage"
import logo from "../../assets/logo-with-text.png"
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
  <Flex borderBottomWidth="1px" borderColor="gray.700" minH="7" align="end">
    <Text as="span" fontWeight="700" minW="24">
      {label}
    </Text>
    <Text as="span" flex="1">
      {value || "\u00a0"}
    </Text>
  </Flex>
)

const SignatureBox = ({ title, party, signatureBase64, date, showPhone }: SignatureBoxProps) => (
  <Box borderWidth="1px" borderColor="gray.700" minH="52" p="3">
    <Text fontWeight="700" textAlign="center" mb="3">
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
    <Flex minH="28" align="center" justify="center" py="2" color="gray.900">
      {signatureBase64 ? (
        <SignatureImage src={signatureBase64} alt={`חתימה - ${title}`} maxH="90px" />
      ) : null}
    </Flex>
    <Text textAlign="end" fontWeight="700">
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
        minHeight: "100vh",
        padding: "10mm",
        border: "0",
        boxShadow: "none",
        printColorAdjust: "exact",
        WebkitPrintColorAdjust: "exact",
      },
      "table": {
        borderCollapse: "collapse",
        width: "100%",
      },
      "th, td": {
        border: "1px solid var(--chakra-colors-gray-700)",
        padding: "6px",
        textAlign: "center",
        verticalAlign: "middle",
      },
      "th": {
        fontWeight: "700",
        background: "var(--chakra-colors-gray-100)",
      },
    }}
  >
    <Flex align="start" justify="space-between" gap="4" mb="4">
      <Box minW="170px">
        <Text fontWeight="700">מאת: {transaction.giver.fullName}</Text>
        <Text textStyle="sm">{transaction.giver.company || transaction.activityName}</Text>
      </Box>
      <Box textAlign="center">
        <Image src={logo} alt="8173 לוגיסטיקה" w="90px" h="auto" mx="auto" mb="2" />
        <Text as="h1" textStyle="xl" fontWeight="700" textDecoration="underline">
          טופס השאלת אפסניה
        </Text>
        <Text textStyle="sm" fontWeight="700">
          מס׳ טופס: {transaction.formNumber || transaction.txId}
        </Text>
      </Box>
      <Box minW="170px" textAlign="end">
        <Text fontWeight="700">אל: {transaction.receiver.fullName}</Text>
        <Text textStyle="sm">{transaction.receiver.company || transaction.activityName}</Text>
      </Box>
    </Flex>

    <Box as="table" aria-label="טבלת פריטי אפסניה">
      <Box as="thead">
        <Box as="tr">
          <Box as="th" w="18%">מק״ט/מסט״ב</Box>
          <Box as="th">שם הפריט</Box>
          <Box as="th" w="14%">יח׳ לחישוב</Box>
          <Box as="th" w="14%">כמות</Box>
          <Box as="th" w="28%">הערות</Box>
        </Box>
      </Box>
      <Box as="tbody">
        {transaction.items.map((item, index) => (
          <Box as="tr" key={`${item.itemId || item.name}-${index}`}>
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

    <Flex gap="4" mt="8" align="stretch" direction={{ base: "column", md: "row" }}>
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
