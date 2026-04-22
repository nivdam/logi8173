/**
 * Activity-scoped inventory — list/edit the snapshot items attached to a single activity.
 * Writes are blocked for closed activities (BE is source of truth for that guard).
 */

var ActivityInventoryController = {
  list: function(context) {
    var body = (context && context.request && context.request.body) || {};
    var activityId = String(body.activityId || '').trim();
    if (!activityId) {
      throw createError_('VALIDATION_ERROR', 'activityId is required');
    }
    return getActivitySnapshotItems_(activityId);
  },

  batchUpdate: function(context) {
    var body = (context && context.request && context.request.body) || {};
    var activityId = String(body.activityId || '').trim();
    if (!activityId) {
      throw createError_('VALIDATION_ERROR', 'activityId is required');
    }

    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var activityRow = findRow_(registryId, 'activities-registry', 'activity_id', activityId);
    if (!activityRow) {
      throw createError_('NOT_FOUND', 'Activity not found: ' + activityId);
    }
    if (activityRow.row.status !== 'active') {
      throw createError_('VALIDATION_ERROR', 'Activity is not active: ' + activityId);
    }

    var snapshotId = getConfigProperty_('ACTIVITY_' + activityId + '_SNAPSHOT_ID');
    if (!snapshotId) {
      throw createError_('NOT_FOUND', 'Activity inventory snapshot not found: ' + activityId);
    }

    var now = new Date().toISOString();
    var results = { modified: 0, added: 0, deleted: 0 };

    var modified = body.modified || [];
    for (var m = 0; m < modified.length; m++) {
      var mod = modified[m];
      if (!mod.itemId) continue;
      var existing = findRowInFirstAvailableSheet_(snapshotId, ACTIVITY_SNAPSHOT_SHEET_NAMES, 'item_id', mod.itemId);
      if (!existing) continue;
      var updated = {
        item_id: mod.itemId,
        item_number: mod.itemNumber !== undefined ? mod.itemNumber : existing.row.item_number,
        name: mod.name !== undefined ? mod.name : existing.row.name,
        category: mod.category !== undefined ? mod.category : existing.row.category,
        tags: mod.tags !== undefined ? (Array.isArray(mod.tags) ? mod.tags.join(',') : mod.tags) : existing.row.tags,
        unit_of_measure: mod.unitOfMeasure !== undefined ? mod.unitOfMeasure : existing.row.unit_of_measure,
        initial_qty: mod.currentQty !== undefined ? mod.currentQty : existing.row.initial_qty,
        min_threshold: mod.minThreshold !== undefined ? mod.minThreshold : existing.row.min_threshold,
        notes: mod.notes !== undefined ? mod.notes : existing.row.notes,
        created_at: existing.row.created_at,
        updated_at: now
      };
      updateRow_(snapshotId, existing.sheetName, existing.index, updated);
      results.modified++;
    }

    var added = body.added || [];
    for (var a = 0; a < added.length; a++) {
      var add = added[a];
      if (!add.name || !add.category) continue;
      var newItem = {
        item_id: add.itemId || generateId_('item'),
        item_number: add.itemNumber || '',
        name: add.name,
        category: add.category,
        tags: Array.isArray(add.tags) ? add.tags.join(',') : (add.tags || ''),
        unit_of_measure: add.unitOfMeasure || '',
        initial_qty: add.currentQty || 0,
        min_threshold: add.minThreshold || 0,
        notes: add.notes || '',
        created_at: now,
        updated_at: now
      };
      var primarySheet = ACTIVITY_SNAPSHOT_SHEET_NAMES[0];
      appendRow_(snapshotId, primarySheet, newItem);
      results.added++;
    }

    var deleted = body.deleted || [];
    for (var d = deleted.length - 1; d >= 0; d--) {
      var delId = String(deleted[d]);
      var found = findRowInFirstAvailableSheet_(snapshotId, ACTIVITY_SNAPSHOT_SHEET_NAMES, 'item_id', delId);
      if (found) {
        deleteRow_(snapshotId, found.sheetName, found.index);
        results.deleted++;
      }
    }

    var auditLogId = getConfigProperty_('ACTIVITY_' + activityId + '_AUDIT_LOG_ID');
    if (auditLogId) {
      logAudit_(auditLogId, 'activityInventory.batchUpdate', context.operator.email, {
        activityId: activityId,
        modified: results.modified,
        added: results.added,
        deleted: results.deleted
      });
    }

    return results;
  }
};

function findRowInFirstAvailableSheet_(spreadsheetId, sheetNames, columnName, value) {
  for (var i = 0; i < sheetNames.length; i++) {
    var found = findRow_(spreadsheetId, sheetNames[i], columnName, value);
    if (found) {
      found.sheetName = sheetNames[i];
      return found;
    }
  }
  return null;
}
