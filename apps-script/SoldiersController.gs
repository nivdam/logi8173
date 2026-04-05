/**
 * Soldiers management — list, add/update.
 */

var SoldiersController = {
  list: function(context) {
    var sheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
    ensureSheetHeaders_(sheetId, 'soldiers', SHEET_HEADERS['soldiers']);
    var rows = readAllRows_(sheetId, 'soldiers');

    return rows.map(function(row) {
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

    return { personalId: newSoldier.personal_id, fullName: newSoldier.full_name };
  }
};
