/**
 * Activities lifecycle — list, get, open with selected inventory, close.
 */

var ActivitiesController = {
  list: function() {
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var rows = readAllRows_(registryId, 'activities-registry');

    return rows.map(function(row) {
      return mapActivityRow_(row);
    });
  },

  get: function(context) {
    var body = context.request.body;

    if (!body.activityId) {
      throw createError_('VALIDATION_ERROR', 'activityId is required');
    }

    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var existing = findRow_(registryId, 'activities-registry', 'activity_id', body.activityId);

    if (!existing) {
      throw createError_('NOT_FOUND', 'Activity not found: ' + body.activityId);
    }

    var snapshotItems = getActivitySnapshotItems_(body.activityId);

    return {
      activity: mapActivityRow_(existing.row, {
        selectedItemCount: snapshotItems.length
      }),
      snapshotItems: snapshotItems
    };
  },

  open: function(context) {
    var body = context.request.body;
    var now = new Date().toISOString();
    var openInput = validateOpenActivityInput_(body);
    var openContext = prepareOpenActivityOpenContext_(openInput);
    var activityId = generateId_('act');

    var activityResources = createActivityResources_(
      openContext.activitiesFolderId,
      openInput.activityName,
      openContext.selectedInventoryRows
    );

    var activityRecord = buildActivityRecord_(
      activityId,
      openInput.activityName,
      openInput.activityType,
      context.operator.email,
      openInput.startDate,
      activityResources.activityFolderId,
      now
    );
    appendRow_(openContext.registryId, 'activities-registry', activityRecord);

    persistActivityResources_(activityId, activityResources);
    logActivityOpened_(
      activityId,
      openInput.activityName,
      context.operator.email,
      activityResources.auditLogId,
      openContext.selectedInventoryRows.length
    );

    return mapActivityRow_(activityRecord, {
      folderUrl: buildActivityFolderUrl_(activityResources.activityFolderId),
      selectedItemCount: openContext.selectedInventoryRows.length
    });
  },

  close: function(context) {
    var body = context.request.body;

    if (!body.activityId) {
      throw createError_('VALIDATION_ERROR', 'activityId is required');
    }

    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var existing = findRow_(registryId, 'activities-registry', 'activity_id', body.activityId);

    if (!existing) {
      throw createError_('NOT_FOUND', 'Activity not found: ' + body.activityId);
    }

    if (existing.row.status === 'closed') {
      throw createError_('ALREADY_CLOSED', 'Activity is already closed');
    }

    var now = new Date().toISOString();
    var updated = {
      activity_id: existing.row.activity_id,
      name: existing.row.name,
      activity_type: existing.row.activity_type,
      status: 'closed',
      opened_by: existing.row.opened_by,
      start_date: existing.row.start_date,
      end_date: body.endDate || now,
      folder_id: existing.row.folder_id,
      created_at: existing.row.created_at,
      closed_at: now
    };
    updateRow_(registryId, 'activities-registry', existing.index, updated);

    var auditLogId = getConfigProperty_('ACTIVITY_' + body.activityId + '_AUDIT_LOG_ID');
    if (auditLogId) {
      logAudit_(auditLogId, 'activity.close', context.operator.email, {
        activityId: body.activityId
      });
    }

    logGlobalAudit_('activity.close', context.operator.email, {
      activityId: body.activityId
    });

    return {
      activityId: updated.activity_id,
      name: updated.name,
      status: 'closed',
      closedAt: now
    };
  }
};

function mapActivityRow_(row, overrides) {
  var snapshotId = getConfigProperty_('ACTIVITY_' + row.activity_id + '_SNAPSHOT_ID');
  var base = {
    activityId: row.activity_id,
    name: row.name,
    activityType: row.activity_type,
    status: row.status,
    openedBy: row.opened_by,
    startDate: row.start_date,
    endDate: row.end_date || '',
    folderId: row.folder_id,
    folderUrl: buildActivityFolderUrl_(row.folder_id),
    createdAt: row.created_at,
    closedAt: row.closed_at || '',
    selectedItemCount: snapshotId ? readAllRows_(snapshotId, 'inventory-snapshot').length : 0
  };

  if (!overrides) {
    return base;
  }

  for (var key in overrides) {
    if (overrides.hasOwnProperty(key)) {
      base[key] = overrides[key];
    }
  }

  return base;
}

function validateOpenActivityInput_(body) {
  var activityName = String(body.name || '').trim();
  var startDate = String(body.startDate || '').trim();
  var activityType = body.activityType;
  var selectedItemIds = normalizeSelectedItemIds_(body.itemIds);
  var validTypes = ['training', 'operation', 'war', 'other'];

  if (!activityName || !activityType || !startDate) {
    throw createError_('VALIDATION_ERROR', 'name, activityType, and startDate are required');
  }

  if (validTypes.indexOf(activityType) === -1) {
    throw createError_('VALIDATION_ERROR', 'Invalid activity type: ' + activityType);
  }

  return {
    activityName: activityName,
    activityType: activityType,
    startDate: startDate,
    selectedItemIds: selectedItemIds
  };
}

function prepareOpenActivityOpenContext_(openInput) {
  var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');
  var masterInventoryRows = readAllRows_(masterInventoryId, 'master-inventory');

  return {
    registryId: getConfigProperty_('ACTIVITIES_REGISTRY_ID'),
    activitiesFolderId: getConfigProperty_('ACTIVITIES_FOLDER_ID'),
    selectedInventoryRows: selectInventoryRows_(masterInventoryRows, openInput.selectedItemIds)
  };
}

function createActivityResources_(activitiesFolderId, activityName, selectedInventoryRows) {
  var activitiesFolder = DriveApp.getFolderById(activitiesFolderId);
  var activityFolder = activitiesFolder.createFolder(activityName);
  var snapshot = createActivitySnapshot_(activityFolder, selectedInventoryRows);
  var transactionsSheet = createSpreadsheetInFolder_(
    activityFolder, 'transactions', 'transactions',
    SHEET_HEADERS['transactions']
  );
  var incidentsSheet = createSpreadsheetInFolder_(
    activityFolder, 'incidents', 'incidents',
    SHEET_HEADERS['incidents']
  );
  var auditLogSheet = createSpreadsheetInFolder_(
    activityFolder, 'audit-log', 'audit-log',
    SHEET_HEADERS['audit-log']
  );

  protectAuditSheet_(auditLogSheet.getId());

  return {
    activityFolderId: activityFolder.getId(),
    snapshotId: snapshot.getId(),
    transactionsId: transactionsSheet.getId(),
    incidentsId: incidentsSheet.getId(),
    auditLogId: auditLogSheet.getId()
  };
}

function createActivitySnapshot_(activityFolder, selectedInventoryRows) {
  var snapshot = createSpreadsheetInFolder_(
    activityFolder,
    'inventory-snapshot',
    'inventory-snapshot',
    SHEET_HEADERS['master-inventory']
  );

  for (var i = 0; i < selectedInventoryRows.length; i++) {
    appendRow_(snapshot.getId(), 'inventory-snapshot', selectedInventoryRows[i]);
  }

  return snapshot;
}

function buildActivityRecord_(activityId, activityName, activityType, operatorEmail, startDate, activityFolderId, now) {
  return {
    activity_id: activityId,
    name: activityName,
    activity_type: activityType,
    status: 'active',
    opened_by: operatorEmail,
    start_date: startDate,
    end_date: '',
    folder_id: activityFolderId,
    created_at: now,
    closed_at: ''
  };
}

function persistActivityResources_(activityId, activityResources) {
  setConfigProperties_({
    ['ACTIVITY_' + activityId + '_FOLDER_ID']: activityResources.activityFolderId,
    ['ACTIVITY_' + activityId + '_SNAPSHOT_ID']: activityResources.snapshotId,
    ['ACTIVITY_' + activityId + '_TRANSACTIONS_ID']: activityResources.transactionsId,
    ['ACTIVITY_' + activityId + '_INCIDENTS_ID']: activityResources.incidentsId,
    ['ACTIVITY_' + activityId + '_AUDIT_LOG_ID']: activityResources.auditLogId
  });
}

function logActivityOpened_(activityId, activityName, operatorEmail, auditLogId, selectedItemCount) {
  var auditDetails = {
    activityId: activityId,
    name: activityName,
    selectedItemCount: selectedItemCount
  };

  logAudit_(auditLogId, 'activity.open', operatorEmail, auditDetails);
  logGlobalAudit_('activity.open', operatorEmail, auditDetails);
}

function buildActivityFolderUrl_(folderId) {
  return folderId ? 'https://drive.google.com/drive/folders/' + folderId : '';
}

function normalizeSelectedItemIds_(itemIds) {
  if (!itemIds || !Array.isArray(itemIds)) {
    return [];
  }

  var uniqueIds = [];
  var seen = {};

  for (var i = 0; i < itemIds.length; i++) {
    var itemId = String(itemIds[i] || '').trim();
    if (!itemId || seen[itemId]) {
      continue;
    }
    seen[itemId] = true;
    uniqueIds.push(itemId);
  }

  return uniqueIds;
}

function selectInventoryRows_(inventoryRows, selectedItemIds) {
  var selectedMap = {};
  var selectedRows = [];

  for (var i = 0; i < selectedItemIds.length; i++) {
    selectedMap[selectedItemIds[i]] = true;
  }

  for (var j = 0; j < inventoryRows.length; j++) {
    if (selectedMap[inventoryRows[j].item_id]) {
      selectedRows.push(inventoryRows[j]);
    }
  }

  if (selectedRows.length !== selectedItemIds.length) {
    var foundMap = {};
    for (var k = 0; k < selectedRows.length; k++) {
      foundMap[selectedRows[k].item_id] = true;
    }

    var missing = [];
    for (var m = 0; m < selectedItemIds.length; m++) {
      if (!foundMap[selectedItemIds[m]]) {
        missing.push(selectedItemIds[m]);
      }
    }

    throw createError_('VALIDATION_ERROR', 'Unknown inventory items: ' + missing.join(', '));
  }

  return selectedRows;
}

function getActivitySnapshotItems_(activityId) {
  var snapshotId = getConfigProperty_('ACTIVITY_' + activityId + '_SNAPSHOT_ID');

  if (!snapshotId) {
    throw createError_('NOT_FOUND', 'Activity inventory snapshot not found: ' + activityId);
  }

  var inventoryRows = readAllRows_(snapshotId, 'inventory-snapshot');
  var stockMap = buildActivityStockMap_(activityId, inventoryRows);
  var items = [];

  for (var i = 0; i < inventoryRows.length; i++) {
    items.push(mapInventoryRowToItem_(inventoryRows[i], stockMap[inventoryRows[i].item_id]));
  }

  return items;
}

function buildActivityStockMap_(activityId, inventoryRows) {
  var transactionsId = getConfigProperty_('ACTIVITY_' + activityId + '_TRANSACTIONS_ID');
  var transactions = transactionsId ? readAllRows_(transactionsId, 'transactions') : [];
  var stockMap = {};

  for (var i = 0; i < inventoryRows.length; i++) {
    stockMap[inventoryRows[i].item_id] = Number(inventoryRows[i].initial_qty) || 0;
  }

  var reduceTypes = { issue: true, borrow_in: true, write_off: true };
  var increaseTypes = { return: true, return_borrow: true };

  for (var t = 0; t < transactions.length; t++) {
    var items = [];
    try {
      items = JSON.parse(transactions[t].items_json || '[]');
    } catch (parseError) {
      items = [];
    }

    for (var j = 0; j < items.length; j++) {
      var itemId = items[j].itemId;
      if (stockMap[itemId] === undefined) {
        continue;
      }

      var qty = Number(items[j].qty) || 0;
      if (reduceTypes[transactions[t].tx_type]) {
        stockMap[itemId] -= qty;
      } else if (increaseTypes[transactions[t].tx_type] || transactions[t].tx_type === 'count_adjustment') {
        stockMap[itemId] += qty;
      }
    }
  }

  return stockMap;
}

function mapInventoryRowToItem_(row, currentQtyOverride) {
  var currentQty = currentQtyOverride !== undefined
    ? Number(currentQtyOverride) || 0
    : Number(row.initial_qty) || 0;
  var minThreshold = Number(row.min_threshold) || 0;
  var status = 'ok';

  if (currentQty <= 0) {
    status = 'gap';
  } else if (currentQty <= minThreshold) {
    status = 'low';
  }

  return {
    itemId: row.item_id,
    itemNumber: row.item_number,
    name: row.name,
    category: row.category,
    tags: row.tags ? String(row.tags).split(',') : [],
    unitOfMeasure: row.unit_of_measure,
    currentQty: currentQty,
    minThreshold: minThreshold,
    status: status,
    notes: row.notes || ''
  };
}
