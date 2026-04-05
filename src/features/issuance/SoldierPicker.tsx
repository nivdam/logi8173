import { useState } from "react"
import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { User, ChevronLeft } from "lucide-react"
import { SearchInput } from "../../components/SearchInput"
import { EmptyState } from "../../components/EmptyState"
import { useSoldiers } from "../../api"
import { t } from "../../lib/i18n"
import { animations } from "../../theme/animations"
import type { Soldier } from "../../types"

export const SoldierPicker = ({ onSelect }: Props) => {
  const { data: soldiers = [] } = useSoldiers()
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = soldiers.filter((soldier) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      soldier.fullName.toLowerCase().includes(query) ||
      soldier.personalId.includes(query)
    )
  })

  return (
    <VStack gap="4" align="stretch">
      <SearchInput
        onSearch={setSearchQuery}
        placeholder={t("issuance.searchSoldier")}
      />

      {filtered.length === 0 && searchQuery && (
        <EmptyState
          icon={User}
          title={t("issuance.noSoldiersFound")}
        />
      )}

      <VStack gap="0" align="stretch">
        {filtered.map((soldier, index) => (
          <SoldierRow
            key={soldier.personalId}
            soldier={soldier}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </VStack>
    </VStack>
  )
}

const SoldierRow = ({ soldier, index, onSelect }: SoldierRowProps) => {
  const handleSelect = () => {
    onSelect(soldier)
  }

  return (
    <Flex
      align="center"
      gap="3"
      py="3"
      px="3"
      borderRadius="xl"
      cursor="pointer"
      role="button"
      tabIndex={0}
      aria-label={`${t("issuance.selectSoldier")}: ${soldier.fullName}`}
      _hover={{ bg: "bg.muted" }}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleSelect()
        }
      }}
      css={{
        ...animations.listItem(index),
        transition: "background 0.15s ease",
      }}
    >
      <Flex
        align="center"
        justify="center"
        w="10"
        h="10"
        borderRadius="full"
        bg="sage.100"
        color="sage.700"
        fontWeight="600"
        textStyle="sm"
        flexShrink={0}
      >
        {soldier.fullName.trim()
          ? soldier.fullName.split(" ").filter(Boolean).map((word) => word[0]).join("")
          : "?"}
      </Flex>
      <Box flex="1" minW="0">
        <Text textStyle="sm" fontWeight="600">{soldier.fullName}</Text>
        <Flex gap="2" align="center">
          <Text textStyle="xs" color="fg.muted">{soldier.personalId}</Text>
          {soldier.company && (
            <>
              <Text textStyle="xs" color="fg.muted">·</Text>
              <Text textStyle="xs" color="fg.muted">{soldier.company}</Text>
            </>
          )}
        </Flex>
      </Box>
      <ChevronLeft size={16} color="var(--chakra-colors-fg-muted)" />
    </Flex>
  )
}

type Props = {
  onSelect: (soldier: Soldier) => void
}

type SoldierRowProps = {
  soldier: Soldier
  index: number
  onSelect: (soldier: Soldier) => void
}
