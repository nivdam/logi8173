/**
 * Authentication and authorization.
 * Verifies Google ID tokens (with caching) and looks up operators.
 */

var TOKEN_CACHE_TTL_SECONDS = 300; // 5 minutes

function getBreakGlassAdminEmail_() {
  return getConfigProperty_('BREAK_GLASS_ADMIN_EMAIL');
}

function isBreakGlassAdmin_(email) {
  var breakGlassEmail = getBreakGlassAdminEmail_();
  return !!breakGlassEmail && email === breakGlassEmail;
}

function buildOperatorResponse_(operator, tokenData, forcedRole) {
  return {
    email: operator.email || tokenData.email,
    fullName: operator.full_name || tokenData.fullName,
    role: forcedRole || operator.role,
    googleSub: operator.google_sub || tokenData.googleSub,
    avatarUrl: tokenData.avatarUrl,
    savedSignatureUrl: operator.saved_signature_url || ''
  };
}

function ensureBreakGlassOperator_(operatorsSheetId, tokenData) {
  ensureSheetHeaders_(operatorsSheetId, 'operators', SHEET_HEADERS['operators']);
  var now = new Date().toISOString();
  var existing = findRow_(operatorsSheetId, 'operators', 'email', tokenData.email);

  if (existing) {
    var updated = {
      email: existing.row.email,
      full_name: existing.row.full_name || tokenData.fullName,
      role: 'admin',
      google_sub: tokenData.googleSub,
      saved_signature_url: existing.row.saved_signature_url || '',
      is_active: true,
      created_at: existing.row.created_at || now,
      updated_at: now,
      created_by: existing.row.created_by || tokenData.email
    };
    updateRow_(operatorsSheetId, 'operators', existing.index, updated);
    return updated;
  }

  var breakGlassOperator = {
    email: tokenData.email,
    full_name: tokenData.fullName,
    role: 'admin',
    google_sub: tokenData.googleSub,
    saved_signature_url: '',
    is_active: true,
    created_at: now,
    updated_at: now,
    created_by: tokenData.email
  };
  appendRow_(operatorsSheetId, 'operators', breakGlassOperator);
  return breakGlassOperator;
}

function verifyIdToken_(idToken) {
  if (!idToken) {
    throw createError_('MISSING_TOKEN', 'No ID token provided');
  }

  // Check cache first to avoid network call on every request
  var cache = CacheService.getScriptCache();
  var cacheKey = 'token_' + Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, idToken
  ).map(function(b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');

  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  var response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }
  );

  if (response.getResponseCode() !== 200) {
    throw createError_('INVALID_ID_TOKEN', 'Token verification failed');
  }

  var payload = JSON.parse(response.getContentText());

  var expectedClientId = getConfigProperty_('WEB_CLIENT_ID');
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw createError_('INVALID_AUDIENCE', 'Token audience does not match');
  }

  var validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (validIssuers.indexOf(payload.iss) === -1) {
    throw createError_('INVALID_ISSUER', 'Token issuer is not valid');
  }

  if (Number(payload.exp) * 1000 < Date.now()) {
    throw createError_('TOKEN_EXPIRED', 'Token has expired');
  }

  if (payload.email_verified !== 'true' && payload.email_verified !== true) {
    throw createError_('EMAIL_NOT_VERIFIED', 'Email is not verified');
  }

  var tokenData = {
    googleSub: payload.sub,
    email: payload.email,
    fullName: payload.name || '',
    avatarUrl: payload.picture || ''
  };

  // Cache the verified token data
  cache.put(cacheKey, JSON.stringify(tokenData), TOKEN_CACHE_TTL_SECONDS);

  return tokenData;
}

function requireOperator_(request) {
  var tokenData = verifyIdToken_(request.idToken);

  // Before system is initialized — only SETUP_ADMIN_EMAIL can proceed
  if (!isSystemInitialized_()) {
    if (request.action === 'setup.status' || request.action === 'setup.initialize') {
      var setupAdminEmail = getConfigProperty_('SETUP_ADMIN_EMAIL');
      // SETUP_ADMIN_EMAIL must be set in Script Properties before first use
      if (setupAdminEmail &&
          tokenData.email !== setupAdminEmail &&
          !isBreakGlassAdmin_(tokenData.email)) {
        throw createError_('UNAUTHORIZED', 'Only the designated admin can initialize the system');
      }
      return buildOperatorResponse_({}, tokenData, 'admin');
    }
    throw createError_('NOT_INITIALIZED', 'System is not set up yet');
  }

  var operatorsSheetId = getConfigProperty_('OPERATORS_SHEET_ID');
  ensureSheetHeaders_(operatorsSheetId, 'operators', SHEET_HEADERS['operators']);
  var operators = readAllRows_(operatorsSheetId, 'operators');
  var operator = null;

  if (isBreakGlassAdmin_(tokenData.email)) {
    return buildOperatorResponse_(
      ensureBreakGlassOperator_(operatorsSheetId, tokenData),
      tokenData,
      'admin'
    );
  }

  // Look up by email, then verify google_sub matches
  for (var i = 0; i < operators.length; i++) {
    if (
      operators[i].email === tokenData.email &&
      operators[i].is_active !== false &&
      operators[i].is_active !== 'false'
    ) {
      operator = operators[i];
      break;
    }
  }

  if (operator && operator.google_sub && operator.google_sub !== tokenData.googleSub) {
    throw createError_('UNAUTHORIZED', 'Account mismatch — contact your admin');
  }

  // Update google_sub on first login (operator was added by admin before they ever logged in)
  if (operator && !operator.google_sub) {
    var existing = findRow_(operatorsSheetId, 'operators', 'email', tokenData.email);
    if (existing) {
      operator.google_sub = tokenData.googleSub;
      updateRow_(operatorsSheetId, 'operators', existing.index, operator);
    }
  }

  if (!operator) {
    throw createError_('UNAUTHORIZED', 'You are not registered as an operator');
  }

  return buildOperatorResponse_(operator, tokenData);
}

function assertRole_(operator, allowedRoles) {
  if (allowedRoles.indexOf(operator.role) === -1) {
    throw createError_('FORBIDDEN', 'Role "' + operator.role + '" is not allowed for this action');
  }
}
