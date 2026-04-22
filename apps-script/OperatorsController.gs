/**
 * Operator management — current user profile, list, add/update.
 */

function buildOperatorProfilePropertyKey_(email) {
  return 'OPERATOR_PROFILE_' + buildStablePropertyKey_(email);
}

function buildOperatorPersonalIdClaimKey_(personalId) {
  return 'OPERATOR_PERSONAL_ID_' + buildStablePropertyKey_(personalId);
}

function buildStablePropertyKey_(value) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || '').toLowerCase()
  );
  var parts = [];
  for (var i = 0; i < digest.length; i++) {
    var byteValue = digest[i];
    parts.push(('0' + ((byteValue + 256) % 256).toString(16)).slice(-2));
  }
  return parts.join('');
}

function canSyncDifferentPersonalId_(operator) {
  return operator.role === 'admin' || operator.role === 'warehouse_operator';
}

function normalizeComparableText_(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function readOperatorProfileBinding_(properties, email) {
  var raw = properties.getProperty(buildOperatorProfilePropertyKey_(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function getOperatorPersonalId_(operator) {
  var email = String(operator && operator.email || '').toLowerCase();
  if (!email) return '';
  var binding = readOperatorProfileBinding_(
    PropertiesService.getScriptProperties(),
    email
  );
  return binding ? String(binding.personalId || '').trim() : '';
}

function assertCanSyncProfilePersonalId_(context, previousPersonalId, personalId, claimedBy, operatorEmail, existing) {
  if (claimedBy && claimedBy !== operatorEmail) {
    throw createError_('VALIDATION_ERROR', 'Personal ID is already bound to another operator');
  }

  if (canSyncDifferentPersonalId_(context.operator)) return;

  if (previousPersonalId) {
    if (previousPersonalId !== personalId) {
      throw createError_('VALIDATION_ERROR', 'Personal ID is already bound to this operator');
    }
    return;
  }

  if (!existing) {
    throw createError_('VALIDATION_ERROR', 'Personal ID must already exist before it can be bound to this operator');
  }

  var operatorName = normalizeComparableText_(context.operator.fullName);
  var soldierName = normalizeComparableText_(existing.row.full_name);
  var requestedName = normalizeComparableText_(context.request.body.fullName);
  if (!operatorName || soldierName !== operatorName || requestedName !== operatorName) {
    throw createError_('VALIDATION_ERROR', 'Personal ID does not match the authenticated operator');
  }
}

var OperatorsController = {
  me: function(context) {
    var properties = PropertiesService.getScriptProperties();
    var binding = readOperatorProfileBinding_(properties, context.operator.email);
    var response = {
      email: context.operator.email,
      fullName: context.operator.fullName,
      role: context.operator.role,
      googleSub: context.operator.googleSub,
      avatarUrl: context.operator.avatarUrl,
      savedSignatureUrl: context.operator.savedSignatureUrl
    };
    if (binding && binding.pinnedActivityId) {
      response.pinnedActivityId = String(binding.pinnedActivityId);
    }
    return response;
  },

  setPinnedActivity: function(context) {
    var body = context.request.body || {};
    var operatorEmail = String(context.operator.email || '').toLowerCase();
    if (!operatorEmail) {
      throw createError_('VALIDATION_ERROR', 'operator email missing');
    }

    var rawActivityId = body.activityId;
    var pinnedActivityId = '';
    if (rawActivityId !== null && rawActivityId !== undefined && String(rawActivityId).trim() !== '') {
      var trimmedActivityId = String(rawActivityId).trim();
      if (trimmedActivityId.length > 128) {
        throw createError_('VALIDATION_ERROR', 'activityId is too long');
      }
      var activitiesRegistryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
      var existingActivity = findRow_(activitiesRegistryId, 'activities-registry', 'activity_id', trimmedActivityId);
      if (!existingActivity) {
        throw createError_('NOT_FOUND', 'Activity not found: ' + trimmedActivityId);
      }
      pinnedActivityId = trimmedActivityId;
    }

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) {
      throw createError_('BUSY', 'Another profile update is being processed, please wait');
    }

    try {
      var properties = PropertiesService.getScriptProperties();
      var previousBinding = readOperatorProfileBinding_(properties, operatorEmail) || {};
      var nextBinding = {};
      for (var key in previousBinding) {
        if (previousBinding.hasOwnProperty(key)) {
          nextBinding[key] = previousBinding[key];
        }
      }
      if (pinnedActivityId) {
        nextBinding.pinnedActivityId = pinnedActivityId;
      } else {
        delete nextBinding.pinnedActivityId;
      }
      nextBinding.updatedAt = new Date().toISOString();

      properties.setProperty(
        buildOperatorProfilePropertyKey_(operatorEmail),
        JSON.stringify(nextBinding)
      );

      logGlobalAudit_('operators.setPinnedActivity', context.operator.email, {
        pinnedActivityId: pinnedActivityId || ''
      });

      var response = {};
      if (pinnedActivityId) {
        response.pinnedActivityId = pinnedActivityId;
      }
      return response;
    } finally {
      lock.releaseLock();
    }
  },

  syncMyProfile: function(context) {
    var body = context.request.body;
    validateSoldierBody_(body);
    var operatorEmail = String(context.operator.email || '').toLowerCase();
    var personalId = String(body.personalId || '').trim();

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) {
      throw createError_('BUSY', 'Another profile sync is being processed, please wait');
    }

    try {
      var properties = PropertiesService.getScriptProperties();
      var previousBinding = readOperatorProfileBinding_(properties, operatorEmail);
      var previousPersonalId = previousBinding ? String(previousBinding.personalId || '') : '';
      if (
        previousPersonalId &&
        previousPersonalId !== personalId &&
        !canSyncDifferentPersonalId_(context.operator)
      ) {
        throw createError_('VALIDATION_ERROR', 'Personal ID is already bound to this operator');
      }

      var claimKey = buildOperatorPersonalIdClaimKey_(personalId);
      var claimedBy = String(properties.getProperty(claimKey) || '').toLowerCase();

      var sheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
      ensureSheetHeaders_(sheetId, 'soldiers', SHEET_HEADERS['soldiers']);

      var existing = findRow_(sheetId, 'soldiers', 'personal_id', personalId);
      assertCanSyncProfilePersonalId_(
        context,
        previousPersonalId,
        personalId,
        claimedBy,
        operatorEmail,
        existing
      );

      var created = false;
      var now = new Date().toISOString();
      var fullName = String(body.fullName || '').trim();
      if (existing) {
        var updatedSoldier = buildSoldierRecord_(body, existing.row.created_at, now);
        updateRow_(sheetId, 'soldiers', existing.index, updatedSoldier);
        logGlobalAudit_('operators.syncMyProfile.updateSoldier', context.operator.email, {
          personalId: personalId
        });
        clearCachedSoldiersList_(sheetId);
        fullName = updatedSoldier.full_name;
      } else if (canSyncDifferentPersonalId_(context.operator)) {
        var newSoldier = buildSoldierRecord_(
          {
            personalId: personalId,
            fullName: body.fullName,
            rank: body.rank,
            company: body.company,
            platoon: body.platoon,
            phone: body.phone
          },
          now,
          now
        );

        appendRow_(sheetId, 'soldiers', newSoldier);
        logGlobalAudit_('operators.syncMyProfile.createSoldier', context.operator.email, {
          personalId: personalId
        });
        clearCachedSoldiersList_(sheetId);
        created = true;
        fullName = newSoldier.full_name;
      }

      var mergedBinding = {
        personalId: personalId,
        fullName: String(body.fullName || '').trim(),
        rank: String(body.rank || '').trim(),
        company: String(body.company || '').trim(),
        platoon: String(body.platoon || '').trim(),
        phone: normalizeSoldierPhone_(body.phone),
        updatedAt: new Date().toISOString()
      };
      if (previousBinding && previousBinding.pinnedActivityId) {
        mergedBinding.pinnedActivityId = previousBinding.pinnedActivityId;
      }
      properties.setProperty(buildOperatorProfilePropertyKey_(operatorEmail), JSON.stringify(mergedBinding));
      properties.setProperty(claimKey, operatorEmail);
      if (previousPersonalId && previousPersonalId !== personalId) {
        properties.deleteProperty(buildOperatorPersonalIdClaimKey_(previousPersonalId));
      }

      return {
        personalId: personalId,
        fullName: fullName,
        created: created
      };
    } finally {
      lock.releaseLock();
    }
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
