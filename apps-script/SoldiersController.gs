/**
 * Soldiers management — list, add/update.
 */

var SOLDIERS_LIST_CACHE_TTL_SECONDS = 60;

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

    var soldiers = rows.map(function(row) {
      return {
        personalId: row.personal_id,
        fullName: row.full_name,
        rank: row.rank || '',
        company: row.company,
        platoon: row.platoon || '',
        phone: row.phone || '',
        createdAt: row.created_at
      };
    });

    writeCachedSoldiersList_(sheetId, soldiers);
    return soldiers;
  },

  upsert: function(context) {
    var sheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
    ensureSheetHeaders_(sheetId, 'soldiers', SHEET_HEADERS['soldiers']);
    var body = context.request.body;
    var now = new Date().toISOString();

    if (!body.personalId || !body.fullName || !body.rank || !body.company) {
      throw createError_('VALIDATION_ERROR', 'personalId, fullName, rank, and company are required');
    }

    var existing = findRow_(sheetId, 'soldiers', 'personal_id', body.personalId);

    if (existing) {
      var updated = {
        personal_id: body.personalId,
        full_name: body.fullName,
        rank: body.rank,
        company: body.company,
        platoon: body.platoon || '',
        phone: body.phone || '',
        created_at: existing.row.created_at,
        updated_at: now
      };
      updateRow_(sheetId, 'soldiers', existing.index, updated);

      logGlobalAudit_('soldiers.update', context.operator.email, {
        personalId: body.personalId
      });

      clearCachedSoldiersList_(sheetId);
      return { personalId: updated.personal_id, fullName: updated.full_name };
    }

    var newSoldier = {
      personal_id: body.personalId,
      full_name: body.fullName,
      rank: body.rank,
      company: body.company,
      platoon: body.platoon || '',
      phone: body.phone || '',
      created_at: now,
      updated_at: now
    };
    appendRow_(sheetId, 'soldiers', newSoldier);

    logGlobalAudit_('soldiers.create', context.operator.email, {
      personalId: body.personalId
    });

    clearCachedSoldiersList_(sheetId);
    return { personalId: newSoldier.personal_id, fullName: newSoldier.full_name };
  }
};
