/**
 * Operator management — current user profile, list, add/update.
 */

var OperatorsController = {
  me: function(context) {
    return {
      email: context.operator.email,
      fullName: context.operator.fullName,
      role: context.operator.role,
      googleSub: context.operator.googleSub,
      avatarUrl: context.operator.avatarUrl,
      savedSignatureUrl: context.operator.savedSignatureUrl
    };
  },

  list: function(context) {
    var sheetId = getConfigProperty_('OPERATORS_SHEET_ID');
    var rows = readAllRows_(sheetId, 'operators');

    return rows.map(function(row) {
      return {
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        googleSub: row.google_sub,
        savedSignatureUrl: row.saved_signature_url,
        createdAt: row.created_at
      };
    });
  },

  upsert: function(context) {
    var sheetId = getConfigProperty_('OPERATORS_SHEET_ID');
    var body = context.request.body;
    var now = new Date().toISOString();

    if (!body.email || !body.fullName || !body.role) {
      throw createError_('VALIDATION_ERROR', 'email, fullName, and role are required');
    }

    var validRoles = ['admin', 'warehouse_operator', 'commander', 'viewer'];
    if (validRoles.indexOf(body.role) === -1) {
      throw createError_('VALIDATION_ERROR', 'Invalid role: ' + body.role);
    }

    var existing = findRow_(sheetId, 'operators', 'email', body.email);

    if (existing) {
      var updated = {
        email: body.email,
        full_name: body.fullName,
        role: body.role,
        google_sub: existing.row.google_sub,
        saved_signature_url: body.savedSignatureUrl || existing.row.saved_signature_url,
        created_at: existing.row.created_at,
        updated_at: now,
        created_by: existing.row.created_by
      };
      updateRow_(sheetId, 'operators', existing.index, updated);

      logGlobalAudit_('operators.update', context.operator.email, {
        targetEmail: body.email, role: body.role
      });

      return { email: updated.email, fullName: updated.full_name, role: updated.role };
    }

    var newOperator = {
      email: body.email,
      full_name: body.fullName,
      role: body.role,
      google_sub: '',
      saved_signature_url: '',
      created_at: now,
      updated_at: now,
      created_by: context.operator.email
    };
    appendRow_(sheetId, 'operators', newOperator);

    logGlobalAudit_('operators.create', context.operator.email, {
      targetEmail: body.email, role: body.role
    });

    return { email: newOperator.email, fullName: newOperator.full_name, role: newOperator.role };
  }
};
