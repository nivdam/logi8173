import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  chakra,
  Dialog,
  Heading,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { SearchInput } from "../../components/SearchInput";
import { t } from "../../lib/i18n";
import type { InventoryItem } from "../../types";
import { SelectableInventoryRow } from "./SelectableInventoryRow";

export const ActivityInventoryDialog = ({
  open,
  inventoryItems,
  isInventoryLoading,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const filteredInventory = useMemo(() => {
    const lowerQuery = searchQuery.trim().toLowerCase();
    return inventoryItems.filter((item) => {
      if (!lowerQuery) return true;
      return (
        item.name.toLowerCase().includes(lowerQuery) ||
        item.itemNumber.toLowerCase().includes(lowerQuery)
      );
    });
  }, [inventoryItems, searchQuery]);

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((currentId) => currentId !== itemId)
        : [...current, itemId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedItemIds.length === 0) return;
    onSubmit(selectedItemIds);
  };

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open) {
      setSearchQuery("");
      setSelectedItemIds([]);
    }
    onOpenChange(details);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      size="xl"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content asChild>
            <chakra.form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>{t("activities.addInventoryTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("activities.addInventoryDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="4">
                  <Stack gap="1">
                    <Badge
                      alignSelf="flex-start"
                      colorPalette="primary"
                      variant="subtle"
                    >
                      {t("activities.selectedItemsCount")} {selectedItemIds.length}
                    </Badge>
                    <Text textStyle="sm" color="fg.muted">
                      {t("activities.addInventoryHelper")}
                    </Text>
                  </Stack>

                  <SearchInput
                    placeholder={t("activities.selectItemsSearchPlaceholder")}
                    onSearch={setSearchQuery}
                  />

                  <Box
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="xl"
                    p="3"
                    maxH="420px"
                    overflowY="auto"
                  >
                    {isInventoryLoading ? (
                      <Box py="12">
                        <Spinner
                          display="block"
                          mx="auto"
                          size="md"
                          color="forest.400"
                        />
                      </Box>
                    ) : filteredInventory.length > 0 ? (
                      <Stack gap="2">
                        {filteredInventory.map((item) => (
                          <SelectableInventoryRow
                            key={item.itemId}
                            item={item}
                            isSelected={selectedItemIds.includes(item.itemId)}
                            onToggle={handleToggleItem}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <EmptyState
                        icon={PackageSearch}
                        title={t("activities.noInventoryMatchesTitle")}
                        description={t(
                          "activities.noInventoryMatchesDescription",
                        )}
                      />
                    )}
                  </Box>

                  <Heading size="xs" color="fg.muted" fontWeight="500">
                    {t("activities.openWithoutItemsHint")}
                  </Heading>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button type="button" variant="ghost">
                    {t("common.cancel")}
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  colorPalette="primary"
                  loading={isSubmitting}
                  disabled={selectedItemIds.length === 0}
                >
                  {t("activities.addInventoryAction")}
                </Button>
              </Dialog.Footer>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

type Props = {
  open: boolean;
  inventoryItems: InventoryItem[];
  isInventoryLoading: boolean;
  isSubmitting: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onSubmit: (itemIds: string[]) => void;
};
