/**
 * Request routing, parsing, and response helpers.
 * All requests are POST (idToken always in body, never in URL).
 * Public routes (public: true) skip authentication entirely.
 */

function getRoutes_() {
  return {
    // Setup
    'setup.status':       { handler: SetupController.status,     roles: null },
    'setup.initialize':   { handler: SetupController.initialize, roles: ['admin'] },

    // Auth
    'auth.me':            { handler: OperatorsController.me,     roles: null },
    'operators.syncMyProfile': { handler: OperatorsController.syncMyProfile, roles: null },

    // Operators
    'operators.list':     { handler: OperatorsController.list,   roles: ['admin'] },
    'operators.upsert':   { handler: OperatorsController.upsert, roles: ['admin'] },
    'operators.delete':   { handler: OperatorsController.remove, roles: ['admin'] },

    // Inventory
    'inventory.list':     { handler: InventoryController.list,   roles: null },
    'inventory.upsert':       { handler: InventoryController.upsert,      roles: ['admin', 'warehouse_operator'] },
    'inventory.batchUpdate':  { handler: InventoryController.batchUpdate, roles: ['admin', 'warehouse_operator'] },

    // Soldiers
    'soldiers.list':      { handler: SoldiersController.list,    roles: null },
    'soldiers.upsert':    { handler: SoldiersController.upsert,  roles: ['admin', 'warehouse_operator'] },
    'activitySoldiers.list':   { handler: SoldiersController.listActivity,   roles: null },
    'activitySoldiers.upsert': { handler: SoldiersController.upsertActivity, roles: ['admin', 'warehouse_operator'] },

    // Imports
    'imports.fetchSheetText': { handler: ImportController.fetchSheetText, roles: ['admin'] },

    // Companies
    'companies.list':     { handler: CompaniesController.list,   roles: null },
    'companies.upsert':   { handler: CompaniesController.upsert, roles: ['admin'] },

    // Activities
    'activities.list':    { handler: ActivitiesController.list,  roles: null },
    'activities.get':     { handler: ActivitiesController.get,   roles: null },
    'activities.open':    { handler: ActivitiesController.open,  roles: ['admin', 'warehouse_operator'] },
    'activities.close':   { handler: ActivitiesController.close, roles: ['admin'] },
    'activities.reopen':  { handler: ActivitiesController.reopen, roles: ['admin'] },
    'activities.addItems': { handler: ActivitiesController.addItems, roles: ['admin', 'warehouse_operator'] },

    // Transactions
    'tx.list':            { handler: TransactionsController.list,      roles: null },
    'tx.create':          { handler: TransactionsController.create,    roles: ['admin', 'warehouse_operator'] },
    'tx.getPublic':       { handler: TransactionsController.getPublic, roles: null, public: true },

    // Dashboard
    'dashboard.summary':  { handler: DashboardController.summary, roles: null },

    // Presence
    'presence.heartbeat': { handler: PresenceController.heartbeat, roles: null },
    'presence.getOnline': { handler: PresenceController.getOnline, roles: null }
  };
}

function handleRequest_(method, event) {
  try {
    var action = (event.parameter && event.parameter.action) || '';
    var route = getRoutes_()[action];

    if (!route) {
      return jsonError_('UNKNOWN_ACTION', 'Unknown action: ' + action);
    }

    // Public routes skip authentication entirely
    if (route.public) {
      var request = parsePublicRequest_(event, action);
      var context = { request: request, operator: null };
      var result = route.handler(context);
      return jsonSuccess_(result);
    }

    var request = parseRequest_(event);
    var operator = requireOperator_(request);

    if (route.roles) {
      assertRole_(operator, route.roles);
    }

    var context = { request: request, operator: operator };
    var result = route.handler(context);

    return jsonSuccess_(result);
  } catch (error) {
    var errorCode = error.code || 'INTERNAL_ERROR';
    // Only return known error messages; hide internal details
    var errorMessage = error.code ? error.message : 'An unexpected error occurred';
    return jsonError_(errorCode, errorMessage);
  }
}

function parsePublicRequest_(event, action) {
  var body = {};

  if (event.postData && event.postData.contents) {
    try {
      body = JSON.parse(event.postData.contents);
    } catch (parseError) {
      throw createError_('INVALID_BODY', 'Could not parse request body as JSON');
    }
  }

  return {
    action: action,
    body: body,
    idToken: ''
  };
}

function parseRequest_(event) {
  var action = (event.parameter && event.parameter.action) || '';

  var body = {};
  var idToken = '';

  // Try POST body first (direct POST without redirect)
  if (event.postData && event.postData.contents) {
    var parsedPost = parsePayloadJson_(event.postData.contents, 'Could not parse request body as JSON');
    body = parsedPost.body;
    idToken = parsedPost.idToken;
  }

  // Fallback: read payload from query parameter (POST→GET redirect loses body)
  if (!idToken && event.parameter && event.parameter.payload) {
    var parsedPayload = parsePayloadJson_(event.parameter.payload, 'Could not parse payload parameter as JSON');
    body = parsedPayload.body;
    idToken = parsedPayload.idToken;
  }

  if (!idToken) {
    throw createError_('MISSING_TOKEN', 'No ID token provided');
  }

  return {
    action: action,
    body: body,
    idToken: idToken
  };
}

function parsePayloadJson_(rawPayload, errorMessage) {
  try {
    var parsedBody = JSON.parse(rawPayload);
    var parsedToken = parsedBody.idToken || '';
    delete parsedBody.idToken;

    return {
      body: parsedBody,
      idToken: parsedToken
    };
  } catch (parseError) {
    throw createError_('INVALID_BODY', errorMessage);
  }
}

function jsonSuccess_(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(code, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: code, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
