/**
 * Activities lifecycle — list, open (create folder + snapshot), close (reconciliation).
 */

var ActivitiesController = {
  list: function(context) {
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var rows = readAllRows_(registryId, 'activities-registry');

    return rows.map(function(row) {
      return {
        activityId: row.activity_id,
        name: row.name,
        activityType: row.activity_type,
        status: row.status,
        openedBy: row.opened_by,
        startDate: row.start_date,
        endDate: row.end_date || '',
        folderId: row.folder_id,
        createdAt: row.created_at,
        closedAt: row.closed_at || ''
      };
    });
  },

  open: function(context) {
    var body = context.request.body;
    var now = new Date().toISOString();

    if (!body.name || !body.activityType || !body.startDate) {
      throw createError_('VALIDATION_ERROR', 'name, activityType, and startDate are required');
    }

    var validTypes = ['training', 'operation', 'war', 'other'];
    if (validTypes.indexOf(body.activityType) === -1) {
      throw createError_('VALIDATION_ERROR', 'Invalid activity type: ' + body.activityType);
    }

    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var activitiesFolderId = getConfigProperty_('ACTIVITIES_FOLDER_ID');
    var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');

    // Create activity folder
    var activitiesFolder = DriveApp.getFolderById(activitiesFolderId);
    var activityFolder = activitiesFolder.createFolder(body.name);
    var activityFolderId = activityFolder.getId();

    // Clone master-inventory as snapshot
    var snapshot = cloneSpreadsheet_(masterInventoryId, activityFolder, 'inventory-snapshot');

    // Create transactions sheet
    var transactionsSheet = createSpreadsheetInFolder_(
      activityFolder, 'transactions', 'transactions',
      SHEET_HEADERS['transactions']
    );

    // Create incidents sheet
    var incidentsSheet = createSpreadsheetInFolder_(
      activityFolder, 'incidents', 'incidents',
      SHEET_HEADERS['incidents']
    );

    // Create audit-log sheet (protected)
    var auditLogSheet = createSpreadsheetInFolder_(
      activityFolder, 'audit-log', 'audit-log',
      SHEET_HEADERS['audit-log']
    );
    protectAuditSheet_(auditLogSheet.getId());

    // Register the activity
    var activityId = generateId_('act');
    var activityRecord = {
      activity_id: activityId,
      name: body.name,
      activity_type: body.activityType,
      status: 'active',
      opened_by: context.operator.email,
      start_date: body.startDate,
      end_date: '',
      folder_id: activityFolderId,
      created_at: now,
      closed_at: ''
    };
    appendRow_(registryId, 'activities-registry', activityRecord);

    // Store activity-specific sheet IDs in PropertiesService
    setConfigProperties_({
      ['ACTIVITY_' + activityId + '_FOLDER_ID']: activityFolderId,
      ['ACTIVITY_' + activityId + '_SNAPSHOT_ID']: snapshot.getId(),
      ['ACTIVITY_' + activityId + '_TRANSACTIONS_ID']: transactionsSheet.getId(),
      ['ACTIVITY_' + activityId + '_INCIDENTS_ID']: incidentsSheet.getId(),
      ['ACTIVITY_' + activityId + '_AUDIT_LOG_ID']: auditLogSheet.getId()
    });

    logAudit_(auditLogSheet.getId(), 'activity.open', context.operator.email, {
      activityId: activityId, name: body.name
    });

    logGlobalAudit_('activity.open', context.operator.email, {
      activityId: activityId, name: body.name
    });

    return {
      activityId: activityId,
      name: body.name,
      activityType: body.activityType,
      status: 'active',
      openedBy: context.operator.email,
      startDate: body.startDate,
      folderUrl: 'https://drive.google.com/drive/folders/' + activityFolderId,
      createdAt: now
    };
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
