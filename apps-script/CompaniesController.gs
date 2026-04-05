/**
 * Companies management — list, add/update.
 */

var CompaniesController = {
  list: function(context) {
    var sheetId = getConfigProperty_('COMPANIES_SHEET_ID');
    var rows = readAllRows_(sheetId, 'companies');

    return rows.map(function(row) {
      return {
        companyId: row.company_id,
        name: row.name,
        isActive: row.is_active === true || row.is_active === 'true',
        createdAt: row.created_at
      };
    });
  },

  upsert: function(context) {
    var sheetId = getConfigProperty_('COMPANIES_SHEET_ID');
    var body = context.request.body;
    var now = new Date().toISOString();

    if (!body.name) {
      throw createError_('VALIDATION_ERROR', 'name is required');
    }

    var existing = body.companyId
      ? findRow_(sheetId, 'companies', 'company_id', body.companyId)
      : null;

    if (existing) {
      var updated = {
        company_id: body.companyId,
        name: body.name,
        is_active: body.isActive !== undefined ? body.isActive : existing.row.is_active,
        created_at: existing.row.created_at
      };
      updateRow_(sheetId, 'companies', existing.index, updated);

      logGlobalAudit_('companies.update', context.operator.email, {
        companyId: body.companyId
      });

      return { companyId: updated.company_id, name: updated.name };
    }

    var newCompany = {
      company_id: generateId_('comp'),
      name: body.name,
      is_active: true,
      created_at: now
    };
    appendRow_(sheetId, 'companies', newCompany);

    logGlobalAudit_('companies.create', context.operator.email, {
      companyId: newCompany.company_id
    });

    return { companyId: newCompany.company_id, name: newCompany.name };
  }
};
