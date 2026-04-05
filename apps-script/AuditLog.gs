/**
 * Audit logging — appends to an activity's audit-log sheet.
 * Audit is mandatory: if logging fails, the operation fails.
 */

var SENSITIVE_FIELDS = ['signatureBase64', 'idToken', 'password', 'token'];

function sanitizeDetails_(details) {
  if (!details || typeof details !== 'object') return details;

  var sanitized = {};
  for (var key in details) {
    if (SENSITIVE_FIELDS.indexOf(key) !== -1) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = details[key];
    }
  }
  return sanitized;
}

function logAudit_(spreadsheetId, action, actorEmail, details) {
  var row = {
    timestamp: new Date().toISOString(),
    action: action,
    actor_email: actorEmail,
    details_json: JSON.stringify(sanitizeDetails_(details))
  };

  appendRow_(spreadsheetId, 'audit-log', row);
}

function logGlobalAudit_(action, actorEmail, details) {
  var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
  if (!registryId) return;

  logAudit_(registryId, action, actorEmail, details);
}

/**
 * Protects the audit-log sheet so only the script owner can edit.
 * Called during setup and activity creation.
 */
function protectAuditSheet_(spreadsheetId) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName('audit-log');
  if (!sheet) return;

  var protection = sheet.protect().setDescription('Audit log — do not edit');
  // Remove all editors except the script owner
  var editors = protection.getEditors();
  for (var i = 0; i < editors.length; i++) {
    protection.removeEditor(editors[i]);
  }
  protection.setDomainEdit(false);
}
