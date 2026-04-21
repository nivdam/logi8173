import { useMemo, useState } from "react"
import { Box, Button, Combobox, createListCollection, Flex, Portal, Text } from "@chakra-ui/react"
import { X, User } from "lucide-react"
import { useSoldiers } from "../../api"
import { useAuth } from "../../lib/use-auth"
import { t } from "../../lib/i18n"
import type { Soldier } from "../../types"
import { AddSoldierDialog } from "./AddSoldierDialog"

export const SoldierAutocomplete = ({ selectedSoldier, onSelect, onClear }: SoldierAutocompleteProps) => {
  const { data: soldiers = [] } = useSoldiers()
  const { operatorProfile } = useAuth()
  const operatorPersonalId = operatorProfile?.personalId
  const [inputValue, setInputValue] = useState("")
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!inputValue) return soldiers
    const query = inputValue.toLowerCase()
    return soldiers.filter((soldier) =>
      soldier.fullName.toLowerCase().includes(query) ||
      String(soldier.personalId).includes(query),
    )
  }, [inputValue, soldiers])

  const collection = useMemo(
    () =>
      createListCollection({
        items: filtered,
        itemToValue: (soldier) => soldier.personalId,
        itemToString: (soldier) => soldier.fullName,
        isItemDisabled: (soldier) => soldier.personalId === operatorPersonalId,
      }),
    [filtered, operatorPersonalId],
  )

  const handleInputChange = (details: { inputValue: string }) => {
    setInputValue(details.inputValue)
  }

  const handleSelect = (details: { value: string[] }) => {
    const selectedPersonalId = details.value[0]
    if (!selectedPersonalId) return
    if (selectedPersonalId === operatorPersonalId) return
    const soldier = soldiers.find((s) => s.personalId === selectedPersonalId)
    if (soldier) {
      onSelect(soldier)
      setInputValue("")
      setIsComboboxOpen(false)
    }
  }

  const handleSoldierCreated = (soldier: Soldier) => {
    onSelect(soldier)
    setInputValue("")
  }

  const handleOpenAddDialog = () => {
    setIsComboboxOpen(false)
    setIsAddDialogOpen(true)
  }

  const handleAddDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setIsComboboxOpen(false)
    }
  }

  const handleClear = () => {
    onClear()
    setInputValue("")
  }

  if (selectedSoldier) {
    return (
      <Flex
        align="center"
        gap="3"
        p="3"
        bg="sage.50"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="sage.200"
      >
        <Flex
          align="center"
          justify="center"
          w="10"
          h="10"
          borderRadius="full"
          bg="sage.100"
          color="sage.700"
          flexShrink={0}
        >
          <User size={18} />
        </Flex>
        <Box flex="1" minW="0">
          <Text textStyle="sm" fontWeight="600" truncate>
            {selectedSoldier.fullName}
            {selectedSoldier.company && ` · ${selectedSoldier.company}`}
          </Text>
          <Text textStyle="xs" color="fg.muted">
            {selectedSoldier.personalId}
            {selectedSoldier.phone && ` · ${selectedSoldier.phone}`}
          </Text>
        </Box>
        <Button
          variant="ghost"
          size="xs"
          color="fg.muted"
          onClick={handleClear}
          aria-label={t("issuance.changeSoldier")}
        >
          <X size={14} />
        </Button>
      </Flex>
    )
  }

  return (
    <>
      <Combobox.Root
        collection={collection}
        inputValue={inputValue}
        open={isComboboxOpen}
        onInputValueChange={handleInputChange}
        onValueChange={handleSelect}
        onOpenChange={(details) => setIsComboboxOpen(details.open)}
        openOnClick
      >
        <Combobox.Control>
          <Combobox.Input
            placeholder={t("issuance.searchSoldierPlaceholder")}
            aria-label={t("issuance.receiverSection")}
          />
          <Combobox.Trigger />
        </Combobox.Control>
        <Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>
                {filtered.map((soldier) => {
                  const isCurrentOperator = soldier.personalId === operatorPersonalId
                  return (
                    <Combobox.Item key={soldier.personalId} item={soldier}>
                      <Combobox.ItemText>
                        <Flex align="center" gap="2">
                          <Flex
                            align="center"
                            justify="center"
                            w="7"
                            h="7"
                            borderRadius="full"
                            bg="sage.50"
                            color="sage.600"
                            flexShrink={0}
                          >
                            <Text textStyle="xs" fontWeight="600">
                              {soldier.fullName.charAt(0)}
                            </Text>
                          </Flex>
                          <Box minW="0">
                            <Text textStyle="sm" fontWeight="500" truncate>
                              {soldier.fullName}
                              {isCurrentOperator && (
                                <Text as="span" textStyle="xs" color="fg.muted" ms="2">
                                  ({t("issuance.cannotSignSelf")})
                                </Text>
                              )}
                            </Text>
                            <Text textStyle="xs" color="fg.muted">
                              {soldier.personalId}
                              {soldier.company && ` · ${soldier.company}`}
                            </Text>
                          </Box>
                        </Flex>
                      </Combobox.ItemText>
                    </Combobox.Item>
                  )
                })}
              </Combobox.List>
              <Combobox.Empty>
                <Flex direction="column" gap="3" p="3" align="stretch">
                  <Text textStyle="sm" color="fg.muted" textAlign="center">
                    {t("issuance.noSoldiersFound")}
                  </Text>
                  <Button
                    variant="outline"
                    colorPalette="sage"
                    size="sm"
                    onClick={handleOpenAddDialog}
                  >
                    {t("issuance.addNewSoldier")}
                  </Button>
                </Flex>
              </Combobox.Empty>
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>

      <AddSoldierDialog
        open={isAddDialogOpen}
        initialQuery={inputValue}
        onOpenChange={handleAddDialogOpenChange}
        onCreated={handleSoldierCreated}
      />
    </>
  )
}

type SoldierAutocompleteProps = {
  selectedSoldier: Soldier | undefined
  onSelect: (soldier: Soldier) => void
  onClear: () => void
}
