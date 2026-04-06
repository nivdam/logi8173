/**
 * Request routing, parsing, and response helpers.
 * All requests are POST (idToken always in body, never in URL).
 */

function getRoutes_() {
  return {
    // Setup
    'setup.status':       { handler: SetupController.status,     roles: null },
    'setup.initialize':   { handler: SetupController.initialize, roles: ['admin'] },

    // Auth
    'auth.me':            { handler: OperatorsController.me,     roles: null },

    // Operators
    'operators.list':     { handler: OperatorsController.list,   roles: ['admin'] },
    'operators.upsert':   { handler: OperatorsController.upsert, roles: ['admin'] },

    // Inventory
    'inventory.list':     { handler: InventoryController.list,   roles: null },
    'inventory.upsert':   { handler: InventoryController.upsert, roles: ['admin', 'warehouse_operator'] },

    // Soldiers
    'soldiers.list':      { handler: SoldiersController.list,    roles: null },
    'soldiers.upsert':    { handler: SoldiersController.upsert,  roles: ['admin', 'warehouse_operator'] },

    // Companies
    'companies.list':     { handler: CompaniesController.list,   roles: null },
    'companies.upsert':   { handler: CompaniesController.upsert, roles: ['admin'] },

    // Activities
    'activities.list':    { handler: ActivitiesController.list,  roles: null },
    'activities.open':    { handler: ActivitiesController.open,  roles: ['admin', 'warehouse_operator'] },
    'activities.close':   { handler: ActivitiesController.close, roles: ['admin'] },

    // Transactions
    'tx.list':            { handler: TransactionsController.list,   roles: null },
    'tx.create':          { handler: TransactionsController.create, roles: ['admin', 'warehouse_operator'] },

    // Dashboard
    'dashboard.summary':  { handler: DashboardController.summary, roles: null }
  };
}

function handleRequest_(method, event) {
  try {
    var request = parseRequest_(event);
    var route = getRoutes_()[request.action];

    if (!route) {
      return jsonError_('UNKNOWN_ACTION', 'Unknown action: ' + request.action);
    }

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

function parseRequest_(event) {
  var action = (event.parameter && event.parameter.action) || '';

  var body = {};
  var idToken = '';

  // Try POST body first (direct POST without redirect)
  if (event.postData && event.postData.contents) {
    try {
      body = JSON.parse(event.postData.contents);
      idToken = body.idToken || '';
      delete body.idToken;
    } catch (parseError) {
      throw createError_('INVALID_BODY', 'Could not parse request body as JSON');
    }
  }

  // Fallback: read payload from query parameter (POST→GET redirect loses body)
  if (!idToken && event.parameter && event.parameter.payload) {
    try {
      body = JSON.parse(event.parameter.payload);
      idToken = body.idToken || '';
      delete body.idToken;
    } catch (parseError) {
      throw createError_('INVALID_BODY', 'Could not parse payload parameter as JSON');
    }
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
