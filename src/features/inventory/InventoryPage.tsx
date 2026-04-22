import { useState } from "react";
import { Box, Button, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { PackageSearch, Plus, Save, X } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { ApiErrorState } from "../../components/ApiErrorState";
import { SearchInput } from "../../components/SearchInput";
import { FilterSelect } from "../../components/FilterSelect";
import { EmptyState } from "../../components/EmptyState";
import { t } from "../../lib/i18n";
import { toaster } from "../../lib/toaster";
import { filterInventory, sortInventory } from "../../lib/filters";
import { useActiveActivity } from "../../lib/active-activity-context";
import { useActivityClosedGuard } from "../../lib/use-activity-closed-guard";
import {
  useInventory,
  useBatchUpdateInventory,
  useActivityInventory,
  useBatchUpdateActivityInventory,
} from "../../api";
import { InventoryTable } from "./InventoryTable";
import { useEditableInventory } from "./useEditableInventory";
import type { SortConfig } from "../../components/SortableHeader";
import { CATEGORY_OPTIONS, CATEGORY_VALUES } from "./inventory.constants";
import type { InventoryItem, ItemCategory, ItemStatus } from "../../types";

const STATUS_OPTIONS = [
  { value: "ok", label: "תקין" },
  { value: "low", label: "מלאי נמוך" },
  { value: "gap", label: "חוסר" },
] as const;

const EMPTY_INVENTORY_ITEMS: InventoryItem[] = [];

const parseCategory = (value: string | undefined): ItemCategory | undefined =>
  CATEGORY_VALUES.includes(value ?? "") ? (value as ItemCategory) : undefined;

const parseStatus = (value: string | undefined): ItemStatus | undefined =>
  STATUS_OPTIONS.find((option) => option.value === value)?.value;

export const InventoryPage = () => {
  const { activeActivityId, activeActivity, isResolving, setActiveActivity } = useActiveActivity();
  const masterInventoryQuery = useInventory();
  const activityInventoryQuery = useActivityInventory(activeActivityId, { enabled: !isResolving });
  const inventoryQuery = activeActivityId ? activityInventoryQuery : masterInventoryQuery;
  const {
    data: inventoryData,
    error,
    isPending: isInventoryPending,
    refetch,
  } = inventoryQuery;
  const inventoryItems = inventoryData ?? EMPTY_INVENTORY_ITEMS;
  const masterBatchUpdate = useBatchUpdateInventory();
  const activityBatchUpdate = useBatchUpdateActivityInventory();
  const isLoading = isResolving || isInventoryPending;
  const isActivityClosed = !!activeActivityId && activeActivity?.status !== "active";
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    ItemCategory | undefined
  >(undefined);
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(
    undefined,
  );
  const [sort, setSort] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });

  const editable = useEditableInventory(inventoryItems);

  const handleActivityClosedReset = () => {
    if (editable.hasPendingChanges) {
      editable.cancelEditing();
      toaster.create({
        title: t("inventory.activityClosedMidEdit"),
        type: "warning",
        duration: 6000,
      });
    } else {
      toaster.create({
        title: t("inventory.activityClosedMidEdit"),
        type: "info",
        duration: 4000,
      });
    }
    setActiveActivity(undefined);
  };

  useActivityClosedGuard({
    isActivityClosed,
    onReset: handleActivityClosedReset,
  });

  const filtered = filterInventory(
    editable.editableRows,
    searchQuery,
    categoryFilter,
    statusFilter,
  );
  const sortedRows = sortInventory(filtered, sort);

  const hasActiveFilters = searchQuery || categoryFilter || statusFilter;

  const handleCategoryChange = (value: string | undefined) => {
    setCategoryFilter(parseCategory(value));
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(parseStatus(value));
  };

  const handleRetry = () => {
    void refetch();
  };

  const clearAll = () => {
    setSearchQuery("");
    setCategoryFilter(undefined);
    setStatusFilter(undefined);
  };

  const handleBatchSaveSuccess = (
    expectedTotal: number,
    result: { modified: number; added: number; deleted: number },
  ) => {
    const actualTotal = result.modified + result.added + result.deleted;
    const hasSkipped = actualTotal < expectedTotal;
    editable.cancelEditing();
    toaster.create({
      title: hasSkipped
        ? t("inventory.batchSavePartial")
        : t("inventory.batchSaveSuccess"),
      description: hasSkipped ? `${actualTotal}/${expectedTotal}` : undefined,
      type: hasSkipped ? "warning" : "success",
      duration: hasSkipped ? 6000 : 3000,
    });
  };

  const handleBatchSaveError = () => {
    toaster.create({
      title: t("common.error"),
      description: t("inventory.batchSaveError"),
      type: "error",
      duration: 5000,
    });
  };

  const handleBatchSave = () => {
    const payload = editable.buildPayload();
    const expectedTotal =
      payload.modified.length + payload.added.length + payload.deleted.length;
    if (activeActivityId) {
      activityBatchUpdate.mutate(
        { ...payload, activityId: activeActivityId },
        {
          onSuccess: (result) => handleBatchSaveSuccess(expectedTotal, result),
          onError: handleBatchSaveError,
        },
      );
      return;
    }
    masterBatchUpdate.mutate(payload, {
      onSuccess: (result) => handleBatchSaveSuccess(expectedTotal, result),
      onError: handleBatchSaveError,
    });
  };

  const isSaving = masterBatchUpdate.isPending || activityBatchUpdate.isPending;

  const isEditMode =
    editable.expandedRowId !== null || editable.hasPendingChanges;

  return (
    <VStack align="stretch" gap={{ base: "5", md: "7" }}>
      <Box
        position={isEditMode ? "sticky" : "static"}
        top={-4}
        mx={isEditMode ? { base: "-4", md: "-8" } : "0"}
        px={isEditMode ? { base: "4", md: "8" } : "0"}
        mt={isEditMode ? { base: "-4", md: "-8" } : "0"}
        pt={isEditMode ? { base: "4", md: "8" } : "0"}
        pb={isEditMode ? "3" : "0"}
        zIndex={isEditMode ? "docked" : "auto"}
        bg={isEditMode ? "bg.card" : "transparent"}
        borderBottomWidth={isEditMode ? "1px" : "0"}
        borderColor="border"
      >
        <Flex justify="space-between" align="start" flexWrap="wrap" gap="3">
          <PageHeader
            title={t("inventory.title")}
            description={t("inventory.description")}
          />
          <Flex gap="2" flexWrap="wrap" align="center">
            <Button
              size="md"
              borderRadius="lg"
              bg="sage.600"
              color="white"
              _hover={{ bg: "sage.700" }}
              onClick={editable.addRow}
            >
              <Plus size={14} />
              {t("inventory.addRow")}
            </Button>
            {editable.hasPendingChanges ? (
              <>
                <Button
                  size="md"
                  borderRadius="lg"
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: "blue.700" }}
                  disabled={!editable.canSave || isActivityClosed}
                  loading={isSaving}
                  onClick={handleBatchSave}
                >
                  <Save size={14} />
                  {t("inventory.saveChanges")}
                  <Text as="span" fontSize="xs" opacity={0.85}>
                    ({editable.changeCount})
                  </Text>
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  borderRadius="lg"
                  onClick={editable.cancelEditing}
                >
                  <X size={14} />
                  {t("inventory.cancelEdit")}
                </Button>
              </>
            ) : null}
          </Flex>
        </Flex>
      </Box>

      <Flex gap="3" flexWrap="wrap" align="center">
        <SearchInput
          placeholder={t("inventory.searchPlaceholder")}
          onSearch={setSearchQuery}
        />
        <FilterSelect
          label={t("inventory.allCategories")}
          value={categoryFilter}
          options={CATEGORY_OPTIONS}
          onChange={handleCategoryChange}
        />
        <FilterSelect
          label={t("inventory.allStatuses")}
          value={statusFilter}
          options={[...STATUS_OPTIONS]}
          onChange={handleStatusChange}
        />
        {hasActiveFilters ? (
          <Text
            textStyle="xs"
            color="sage.600"
            cursor="pointer"
            _hover={{ textDecoration: "underline" }}
            onClick={clearAll}
          >
            {t("inventory.clearFilters")}
          </Text>
        ) : null}
      </Flex>

      {isLoading ? (
        <Flex justify="center" py="16">
          <Spinner size="lg" color="sage.400" />
        </Flex>
      ) : error ? (
        <ApiErrorState
          title={t("inventory.title")}
          error={error}
          fallbackMessage={t("common.error")}
          actionLabel={t("common.retry")}
          onAction={handleRetry}
        />
      ) : sortedRows.length > 0 ? (
        <InventoryTable
          rows={sortedRows}
          expandedRowId={editable.expandedRowId}
          onToggleExpand={editable.toggleExpanded}
          sort={sort}
          onSort={setSort}
          onFieldChange={editable.updateField}
          onDeleteRow={editable.deleteRow}
        />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title={t("common.noResults")}
          description={t("inventory.noResultsDescription")}
          actionLabel={t("inventory.clearFilters")}
          onAction={clearAll}
        />
      )}
    </VStack>
  );
};
