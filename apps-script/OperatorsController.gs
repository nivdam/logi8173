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
    ensureSheetHeaders_(sheetId, 'operators', SHEET_HEADERS['operators']);
    var rows = readAllRows_(sheetId, 'operators');

    return rows.filter(function(row) {
      return row.is_active !== false && row.is_active !== 'false';
    }).map(function(row) {
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
    ensureSheetHeaders_(sheetId, 'operators', SHEET_HEADERS['operators']);
    var body = context.request.body;
    var now = new Date().toISOString();
    var normalizedEmail = String(body.email || '').toLowerCase();

    if (!normalizedEmail || !body.fullName || !body.role) {
      throw createError_('VALIDATION_ERROR', 'email, fullName, and role are required');
    }

    var validRoles = ['admin', 'warehouse_operator', 'commander', 'viewer'];
    if (validRoles.indexOf(body.role) === -1) {
      throw createError_('VALIDATION_ERROR', 'Invalid role: ' + body.role);
    }

    var existing = findRow_(sheetId, 'operators', 'email', normalizedEmail);

    if (existing) {
      var updated = {
        email: normalizedEmail,
        full_name: body.fullName,
        role: body.role,
        google_sub: existing.row.google_sub,
        saved_signature_url: body.savedSignatureUrl || existing.row.saved_signature_url,
        is_active: true,
        created_at: existing.row.created_at,
        updated_at: now,
        created_by: existing.row.created_by
      };
      updateRow_(sheetId, 'operators', existing.index, updated);

      logGlobalAudit_('operators.update', context.operator.email, {
        targetEmail: normalizedEmail, role: body.role
      });

      return { email: updated.email, fullName: updated.full_name, role: updated.role };
    }

    var newOperator = {
      email: normalizedEmail,
      full_name: body.fullName,
      role: body.role,
      google_sub: '',
      saved_signature_url: '',
      is_active: true,
      created_at: now,
      updated_at: now,
      created_by: context.operator.email
    };
    appendRow_(sheetId, 'operators', newOperator);

    logGlobalAudit_('operators.create', context.operator.email, {
      targetEmail: normalizedEmail, role: body.role
    });

    return { email: newOperator.email, fullName: newOperator.full_name, role: newOperator.role };
  },

  remove: function(context) {
    var sheetId = getConfigProperty_('OPERATORS_SHEET_ID');
    ensureSheetHeaders_(sheetId, 'operators', SHEET_HEADERS['operators']);
    var body = context.request.body;
    var now = new Date().toISOString();
    var targetEmail = String(body.email || '').toLowerCase();

    if (!targetEmail) {
      throw createError_('VALIDATION_ERROR', 'email is required');
    }

    if (targetEmail === String(context.operator.email || '').toLowerCase()) {
      throw createError_('VALIDATION_ERROR', 'You cannot delete your own operator account');
    }

    if (isBreakGlassAdmin_(targetEmail)) {
      throw createError_('VALIDATION_ERROR', 'Cannot delete the break-glass admin operator');
    }

    var existing = findRow_(sheetId, 'operators', 'email', targetEmail);
    if (!existing) {
      throw createError_('NOT_FOUND', 'Operator not found');
    }

    var operators = readAllRows_(sheetId, 'operators');
    var remainingAdminCount = operators.filter(function(row) {
      return (
        String(row.email || '').toLowerCase() !== targetEmail &&
        row.role === 'admin' &&
        row.is_active !== false &&
        row.is_active !== 'false'
      );
    }).length;

    if (existing.row.role === 'admin' && remainingAdminCount === 0) {
      throw createError_('VALIDATION_ERROR', 'At least one admin operator must remain');
    }

    updateRow_(sheetId, 'operators', existing.index, {
      email: existing.row.email,
      full_name: existing.row.full_name,
      role: existing.row.role,
      google_sub: existing.row.google_sub,
      saved_signature_url: existing.row.saved_signature_url,
      is_active: false,
      created_at: existing.row.created_at,
      updated_at: now,
      created_by: existing.row.created_by
    });

    logGlobalAudit_('operators.delete', context.operator.email, {
      targetEmail: targetEmail
    });

    return { email: targetEmail };
  }
};
