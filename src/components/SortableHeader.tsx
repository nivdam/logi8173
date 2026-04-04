import { Flex, Text } from "@chakra-ui/react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

export const SortableHeader = ({ label, sortKey, currentSort, onSort }: Props) => (
  <Flex
    align="center"
    gap="1"
    cursor="pointer"
    role="columnheader"
    onClick={() => {
      if (currentSort.key === sortKey) {
        onSort({
          key: sortKey,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        })
      } else {
        onSort({ key: sortKey, direction: "asc" })
      }
    }}
    _hover={{ color: "fg" }}
    css={{ userSelect: "none", transition: "color 0.15s ease" }}
  >
    <Text textStyle="xs" fontWeight="600" color="fg.muted">
      {label}
    </Text>
    {currentSort.key === sortKey ? (
      currentSort.direction === "asc" ? (
        <ArrowUp size={12} />
      ) : (
        <ArrowDown size={12} />
      )
    ) : (
      <ArrowUpDown size={12} style={{ opacity: 0.3 }} />
    )}
  </Flex>
)

type SortConfig = {
  key: string
  direction: "asc" | "desc"
}

type Props = {
  label: string
  sortKey: string
  currentSort: SortConfig
  onSort: (sort: SortConfig) => void
}

export type { SortConfig }
