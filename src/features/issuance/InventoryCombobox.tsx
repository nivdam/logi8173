import { Combobox, Flex, Portal, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import type { ListCollection } from "@chakra-ui/react"
import type { InventoryItem } from "../../types/inventory"

export const InventoryCombobox = ({
  collection,
  filtered,
  inputValue,
  onInputValueChange,
  onValueChange,
  placeholder,
  ariaLabel,
}: InventoryComboboxProps) => (
  <Combobox.Root
    collection={collection}
    inputValue={inputValue}
    onInputValueChange={onInputValueChange}
    onValueChange={onValueChange}
    openOnClick
    allowCustomValue
  >
    <Combobox.Control>
      <Combobox.Input
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.List>
            {filtered.map((item) => (
              <Combobox.Item key={item.itemId} item={item}>
                <Combobox.ItemText>
                  <Flex align="center" gap="2">
                    <Text textStyle="sm" truncate>{item.name}</Text>
                    <Text textStyle="xs" color="fg.muted">{item.itemNumber}</Text>
                  </Flex>
                </Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.List>
          <Combobox.Empty>
            <Text textStyle="sm" color="fg.muted" p="2" textAlign="center">
              {t("common.noResults")}
            </Text>
          </Combobox.Empty>
        </Combobox.Content>
      </Combobox.Positioner>
    </Portal>
  </Combobox.Root>
)

type InventoryComboboxProps = {
  collection: ListCollection<InventoryItem>
  filtered: InventoryItem[]
  inputValue: string
  onInputValueChange: (details: { inputValue: string }) => void
  onValueChange: (details: { value: string[] }) => void
  placeholder: string
  ariaLabel: string
}
