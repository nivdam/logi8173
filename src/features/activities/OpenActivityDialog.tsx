import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  chakra,
  Dialog,
  Field,
  Grid,
  Heading,
  Input,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PackageSearch } from "lucide-react";
import { ApiErrorState } from "../../components/ApiErrorState";
import { EmptyState } from "../../components/EmptyState";
import { FilterSelect } from "../../components/FilterSelect";
import { SearchInput } from "../../components/SearchInput";
import { t } from "../../lib/i18n";
import { SelectableInventoryRow } from "./SelectableInventoryRow";
import { getActivityTypeOptions, parseActivityType } from "./activity-helpers";
import type { InventoryItem } from "../../types";
import type { OpenActivityFormValues } from "./activity-types";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const OpenActivityDialog = ({
  open,
  inventoryItems,
  isInventoryLoading,
  inventoryError,
  onRetryInventory,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: Props) => {
  const [name, setName] = useState("");
  const [activityType, setActivityType] =
    useState<OpenActivityFormValues["activityType"]>("training");
  const [startDate, setStartDate] = useState(getTodayDate);
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

  const selectedCount = selectedItemIds.length;
  const isValid = name.trim() !== "" && startDate !== "";

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  const handleTypeChange = (value: string | undefined) => {
    setActivityType(parseActivityType(value));
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setStartDate(event.currentTarget.value);
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((currentId) => currentId !== itemId)
        : [...current, itemId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    onSubmit({
      name: name.trim(),
      activityType,
      startDate,
      itemIds: selectedItemIds,
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      size="cover"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content mx={{ base: "0", md: "4" }} pb={2} maxW="5xl" asChild>
            <chakra.form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>{t("activities.openDialogTitle")}</Dialog.Title>
                <Dialog.Description>
                  {t("activities.openDialogDescription")}
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="5">
                  <Grid
                    templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }}
                    gap="4"
                  >
                    <Field.Root required>
                      <Field.Label>{t("activities.fields.name")}</Field.Label>
                      <Input
                        value={name}
                        onChange={handleNameChange}
                        placeholder={t("activities.namePlaceholder")}
                      />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>{t("activities.fields.type")}</Field.Label>
                      <FilterSelect
                        label={t("activities.selectType")}
                        value={activityType}
                        options={getActivityTypeOptions()}
                        onChange={handleTypeChange}
                      />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>
                        {t("activities.fields.startDate")}
                      </Field.Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                      />
                    </Field.Root>
                  </Grid>

                  <Stack gap="3">
                    <Stack gap="1">
                      <Heading size="sm" fontWeight="600">
                        {t("activities.selectItemsTitle")}
                      </Heading>
                      <Text textStyle="sm" color="fg.muted">
                        {t("activities.selectItemsDescription")}
                      </Text>
                    </Stack>
                    <Badge
                      alignSelf="flex-start"
                      colorPalette="primary"
                      variant="subtle"
                    >
                      {t("activities.selectedItemsCount")} {selectedCount}
                    </Badge>

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
                      ) : inventoryError ? (
                        <ApiErrorState
                          error={inventoryError}
                          title={t("activities.loadErrorTitle")}
                          fallbackMessage={t("activities.loadErrorDescription")}
                          actionLabel={t("common.retry")}
                          onAction={onRetryInventory}
                        />
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
                    <Text textStyle="xs" color="fg.muted">
                      {t("activities.openWithoutItemsHint")}
                    </Text>
                  </Stack>
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
                  disabled={!isValid}
                >
                  {t("activities.openAction")}
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
  inventoryError: unknown;
  onRetryInventory: () => void;
  isSubmitting: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onSubmit: (values: OpenActivityFormValues) => void;
};
