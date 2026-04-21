/**
 * Soldiers management — list, add/update.
 */

var SOLDIERS_LIST_CACHE_TTL_SECONDS = 60;

function normalizeSoldierPhone_(value) {
  var raw = String(value || '').trim();
  if (!raw) return '';

  var digits = raw.replace(/\D/g, '');

  // Google Sheets may coerce Israeli mobile numbers from 05XXXXXXXX to 5XXXXXXXX.
  if (digits.length === 9 && digits.indexOf('5') === 0) {
    return '0' + digits;
  }

  return raw;
}

function mapSoldierRow_(row) {
  return {
    personalId: String(row.personal_id || ''),
    fullName: row.full_name,
    rank: row.rank || '',
    company: row.company,
    platoon: row.platoon || '',
    phone: normalizeSoldierPhone_(row.phone),
    createdAt: row.created_at
  };
}

function buildSoldierRecord_(body, createdAt, updatedAt) {
  return {
    personal_id: String(body.personalId || '').trim(),
    full_name: String(body.fullName || '').trim(),
    rank: String(body.rank || '').trim(),
    company: String(body.company || '').trim(),
    platoon: String(body.platoon || '').trim(),
    phone: normalizeSoldierPhone_(body.phone),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function validateSoldierBody_(body) {
  if (!body.personalId || !body.fullName || !body.rank || !body.company) {
    throw createError_('VALIDATION_ERROR', 'personalId, fullName, rank, and company are required');
  }
}

function getActivitySoldiersSheetId_(activityId, createIfMissing) {
  var normalizedActivityId = String(activityId || '').trim();
  if (!normalizedActivityId) {
    throw createError_('VALIDATION_ERROR', 'activityId is required');
  }

  var propertyKey = 'ACTIVITY_' + normalizedActivityId + '_SOLDIERS_ID';
  var existingSheetId = getConfigProperty_(propertyKey);
  if (existingSheetId) return existingSheetId;

  if (!createIfMissing) return '';

  var activityFolderId = getConfigProperty_('ACTIVITY_' + normalizedActivityId + '_FOLDER_ID');
  if (!activityFolderId) {
    throw createError_('NOT_FOUND', 'Activity folder not found: ' + normalizedActivityId);
  }

  var activityFolder = DriveApp.getFolderById(activityFolderId);
  var activitySoldiersSheet = createSpreadsheetInFolder_(
    activityFolder,
    'activity-soldiers',
    'activity-soldiers',
    SHEET_HEADERS['activity-soldiers']
  );

  setConfigProperty_(propertyKey, activitySoldiersSheet.getId());
  return activitySoldiersSheet.getId();
}

function upsertSoldierInSheet_(sheetId, body, context, auditAction) {
  ensureSheetHeaders_(sheetId, 'soldiers', SHEET_HEADERS['soldiers']);
  var now = new Date().toISOString();
  var existing = findRow_(sheetId, 'soldiers', 'personal_id', body.personalId);

  if (existing) {
    var updated = buildSoldierRecord_(body, existing.row.created_at, now);
    updateRow_(sheetId, 'soldiers', existing.index, updated);

    logGlobalAudit_(auditAction + '.update', context.operator.email, {
      personalId: body.personalId
    });

    clearCachedSoldiersList_(sheetId);
    return { personalId: updated.personal_id, fullName: updated.full_name };
  }

  var newSoldier = buildSoldierRecord_(body, now, now);
  appendRow_(sheetId, 'soldiers', newSoldier);

  logGlobalAudit_(auditAction + '.create', context.operator.email, {
    personalId: body.personalId
  });

  clearCachedSoldiersList_(sheetId);
  return { personalId: newSoldier.personal_id, fullName: newSoldier.full_name };
}

function upsertActivitySoldierInSheet_(sheetId, body, context) {
  ensureSheetHeaders_(sheetId, 'activity-soldiers', SHEET_HEADERS['activity-soldiers']);
  var now = new Date().toISOString();
  var existing = findRow_(sheetId, 'activity-soldiers', 'personal_id', body.personalId);

  if (existing) {
    var updated = buildSoldierRecord_(body, existing.row.created_at, now);
    updateRow_(sheetId, 'activity-soldiers', existing.index, updated);
    logGlobalAudit_('activitySoldiers.update', context.operator.email, {
      activityId: body.activityId,
      personalId: body.personalId
    });
    return { personalId: updated.personal_id, fullName: updated.full_name };
  }

  var newSoldier = buildSoldierRecord_(body, now, now);
  appendRow_(sheetId, 'activity-soldiers', newSoldier);
  logGlobalAudit_('activitySoldiers.create', context.operator.email, {
    activityId: body.activityId,
    personalId: body.personalId
  });
  return { personalId: newSoldier.personal_id, fullName: newSoldier.full_name };
}

function getSoldiersListCacheKey_(sheetId) {
  return 'soldiers_list_' + sheetId;
}

function readCachedSoldiersList_(sheetId) {
  try {
    var raw = CacheService.getScriptCache().get(getSoldiersListCacheKey_(sheetId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeCachedSoldiersList_(sheetId, soldiers) {
  try {
    CacheService
      .getScriptCache()
      .put(
        getSoldiersListCacheKey_(sheetId),
        JSON.stringify(soldiers),
        SOLDIERS_LIST_CACHE_TTL_SECONDS
      );
  } catch (error) {
    // Cache is an optimization only.
  }
}

function clearCachedSoldiersList_(sheetId) {
  try {
    CacheService.getScriptCache().remove(getSoldiersListCacheKey_(sheetId));
  } catch (error) {
    // Cache is an optimization only.
  }
}

var SoldiersController = {
  list: function(context) {
    var sheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
    var cached = readCachedSoldiersList_(sheetId);
    if (cached) return cached;

    var rows = readAllRows_(sheetId, 'soldiers');

    var soldiers = rows.map(mapSoldierRow_);

    writeCachedSoldiersList_(sheetId, soldiers);
    return soldiers;
  },

  upsert: function(context) {
    var sheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
    var body = context.request.body;
    validateSoldierBody_(body);
    return upsertSoldierInSheet_(sheetId, body, context, 'soldiers');
  },

  listActivity: function(context) {
    var activityId = context.request.body.activityId;
    var sheetId = getActivitySoldiersSheetId_(activityId, false);
    if (!sheetId) return [];

    var rows = readAllRows_(sheetId, 'activity-soldiers');
    return rows.map(mapSoldierRow_);
  },

  upsertActivity: function(context) {
    var body = context.request.body;
    validateSoldierBody_(body);
    var sheetId = getActivitySoldiersSheetId_(body.activityId, true);
    return upsertActivitySoldierInSheet_(sheetId, body, context);
  }
};
