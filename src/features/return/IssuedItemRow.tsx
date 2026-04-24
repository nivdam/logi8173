import { Checkbox, Flex, Text } from "@chakra-ui/react"
import { t } from "../../lib/i18n"
import type { SoldierIssuedItem } from "./return.types"

export const IssuedItemRow = ({ item, isSelected, onToggle }: IssuedItemRowProps) => {
  const handleCheckedChange = () => {
    onToggle()
  }

  return (
    <Checkbox.Root
      checked={isSelected}
      onCheckedChange={handleCheckedChange}
      width="100%"
    >
      <Checkbox.HiddenInput />
      <Flex
        align="center"
        gap="3"
        px="3"
        py="2"
        borderRadius="lg"
        bg={isSelected ? "forest.50" : "bg.muted"}
        borderWidth="1px"
        borderColor={isSelected ? "forest.300" : "transparent"}
        cursor="pointer"
        width="100%"
      >
        <Checkbox.Control />
        <Flex flex="1" direction={{ base: "column", md: "row" }} gap={{ base: "1", md: "3" }} align={{ md: "center" }}>
          <Flex flex="1" direction="column" gap="0.5">
            <Checkbox.Label>
              <Text textStyle="sm" fontWeight="500">{item.name}</Text>
            </Checkbox.Label>
            {item.catalogNumber !== "" && (
              <Text textStyle="xs" color="fg.muted">{item.catalogNumber}</Text>
            )}
          </Flex>
          <Flex gap="3" align="center" flexShrink={0}>
            <Flex direction="column" align="center">
              <Text textStyle="xs" color="fg.muted">{t("returns.remainingQty")}</Text>
              <Text textStyle="sm" fontWeight="600" color="forest.700">
                {item.remainingQty} {item.unitOfMeasure}
              </Text>
            </Flex>
            {item.returnedQty > 0 && (
              <Flex direction="column" align="center">
                <Text textStyle="xs" color="fg.muted">{t("returns.returnedQty")}</Text>
                <Text textStyle="xs" color="fg.muted">
                  {item.returnedQty}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Checkbox.Root>
  )
}

type IssuedItemRowProps = {
  item: SoldierIssuedItem
  isSelected: boolean
  onToggle: () => void
}
