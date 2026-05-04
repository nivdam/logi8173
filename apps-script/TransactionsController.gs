/**
 * Transactions — list per activity, create with stock validation + signature.
 */

/**
 * Returns the next sequential form number in format 1008-XXXX.
 * Must be called inside an existing LockService lock (create already holds one).
 */
function extractFormCounter_(formNumber) {
  var match = String(formNumber || '').match(/^1008-(\d+)$/);
  return match ? Number(match[1]) || 0 : 0;
}

function getExistingFormCounterBaseline_() {
  var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
  if (!registryId) return 0;

  var activityRows = readAllRows_(registryId, 'activities-registry');
  var totalTransactions = 0;
  var highestFormCounter = 0;

  for (var i = 0; i < activityRows.length; i++) {
    var activityId = activityRows[i].activity_id;
    if (!activityId) continue;

    var transactionsId = getConfigProperty_('ACTIVITY_' + activityId + '_TRANSACTIONS_ID');
    if (!transactionsId) continue;

    var transactions = readAllRows_(transactionsId, 'transactions');
    totalTransactions += transactions.length;

    for (var j = 0; j < transactions.length; j++) {
      var parsedCounter = extractFormCounter_(transactions[j].form_number);
      if (parsedCounter > highestFormCounter) {
        highestFormCounter = parsedCounter;
      }
    }
  }

  return Math.max(totalTransactions, highestFormCounter);
}

function getNextFormNumber_() {
  var props = PropertiesService.getScriptProperties();
  var storedCounter = props.getProperty('FORM_COUNTER');
  var current = 0;

  if (storedCounter === null || storedCounter === '') {
    current = getExistingFormCounterBaseline_();
  } else {
    current = Number(storedCounter) || 0;
  }

  var next = current + 1;
  props.setProperty('FORM_COUNTER', String(next));
  var padded = String(next);
  while (padded.length < 4) {
    padded = '0' + padded;
  }
  return '1008-' + padded;
}

function buildPublicSoldierDetails_(row) {
  return {
    personalId: String(row.personal_id || '').trim(),
    fullName: String(row.full_name || '').trim(),
    rank: String(row.rank || '').trim(),
    company: String(row.company || '').trim(),
    phone: normalizeSoldierPhone_(row.phone)
  };
}

function readSignatureBase64_(fileId) {
  if (!fileId) return '';

  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var bytes = blob.getBytes();
    var base64 = Utilities.base64Encode(bytes);
    return 'data:' + blob.getContentType() + ';base64,' + base64;
  } catch (driveError) {
    return '';
  }
}

function lookupPublicSoldierDetails_(activityId, personalId) {
  var normalizedPersonalId = String(personalId || '').trim();
  if (!normalizedPersonalId) return null;

  var activitySoldiersSheetId = getActivitySoldiersSheetId_(activityId, false);
  var activitySoldierRow = activitySoldiersSheetId
    ? findRow_(activitySoldiersSheetId, 'activity-soldiers', 'personal_id', normalizedPersonalId)
    : null;
  if (activitySoldierRow) {
    return buildPublicSoldierDetails_(activitySoldierRow.row);
  }

  var soldiersSheetId = getConfigProperty_('SOLDIERS_SHEET_ID');
  if (!soldiersSheetId) return null;

  var soldierRow = findRow_(soldiersSheetId, 'soldiers', 'personal_id', normalizedPersonalId);
  return soldierRow ? buildPublicSoldierDetails_(soldierRow.row) : null;
}

function lookupPublicOperatorDetails_(email) {
  var normalizedEmail = String(email || '').toLowerCase();
  if (!normalizedEmail) return null;

  var operatorsSheetId = getConfigProperty_('OPERATORS_SHEET_ID');
  var operatorRow = operatorsSheetId
    ? findRow_(operatorsSheetId, 'operators', 'email', normalizedEmail)
    : null;
  var binding = readOperatorProfileBinding_(
    PropertiesService.getScriptProperties(),
    normalizedEmail
  ) || {};
  if (!operatorRow && !binding.fullName && !binding.personalId) return null;
  var publicSafeRoles = ['admin', 'warehouse_operator', 'commander', 'viewer'];
  var rawRole = operatorRow ? operatorRow.row.role || '' : '';

  return {
    fullName: String(binding.fullName || (operatorRow ? operatorRow.row.full_name : '') || '').trim(),
    personalId: String(binding.personalId || '').trim(),
    rank: String(binding.rank || '').trim(),
    company: String(binding.company || '').trim(),
    phone: normalizeSoldierPhone_(binding.phone),
    role: publicSafeRoles.indexOf(rawRole) !== -1 ? rawRole : ''
  };
}

function buildPublicPartyDetails_(activityId, personalId, fallbackName, operatorEmail) {
  var operatorDetails = lookupPublicOperatorDetails_(operatorEmail);
  if (operatorDetails && operatorDetails.personalId && operatorDetails.personalId === String(personalId || '').trim()) {
    return operatorDetails;
  }

  var soldierDetails = lookupPublicSoldierDetails_(activityId, personalId);
  if (soldierDetails) return soldierDetails;

  return {
    fullName: String(fallbackName || '').trim(),
    personalId: String(personalId || '').trim(),
    rank: '',
    company: '',
    phone: '',
    role: ''
  };
}

function parseTransactionItems_(row) {
  try {
    return JSON.parse(row.items_json || '[]');
  } catch (parseError) {
    return [];
  }
}

function buildReturnAllocations_(transactions, issueRow) {
  var issueItems = parseTransactionItems_(issueRow);
  var targetAllocations = issueItems.map(function(item, index) {
    return {
      txId: issueRow.tx_id,
      index: index,
      itemId: item.itemId,
      name: item.name,
      issuedQty: Number(item.qty) || 0,
      returnedQty: 0,
      returnEvents: []
    };
  });
  var receiverPersonalId = String(issueRow.receiver_personal_id || '').trim();
  var allIssueAllocations = [];
  var issueRows = transactions
    .filter(function(row) {
      return (
        (row.tx_type === 'issue' || row.tx_type === 'borrow_in') &&
        String(row.receiver_personal_id || '').trim() === receiverPersonalId
      );
    })
    .sort(function(left, right) {
      return new Date(left.performed_at || 0).getTime() - new Date(right.performed_at || 0).getTime();
    });

  for (var i = 0; i < issueRows.length; i++) {
    var rowItems = parseTransactionItems_(issueRows[i]);
    for (var itemIndex = 0; itemIndex < rowItems.length; itemIndex++) {
      var rowItem = rowItems[itemIndex];
      var targetAllocation = issueRows[i].tx_id === issueRow.tx_id
        ? targetAllocations[itemIndex]
        : null;
      allIssueAllocations.push(targetAllocation || {
        txId: issueRows[i].tx_id,
        index: itemIndex,
        itemId: rowItem.itemId,
        name: rowItem.name,
        issuedQty: Number(rowItem.qty) || 0,
        returnedQty: 0,
        returnEvents: []
      });
    }
  }

  var sortedReturns = transactions
    .filter(function(row) {
      return (
        (row.tx_type === 'return' || row.tx_type === 'return_borrow') &&
        String(row.giver_personal_id || '').trim() === receiverPersonalId
      );
    })
    .sort(function(left, right) {
      return new Date(left.performed_at || 0).getTime() - new Date(right.performed_at || 0).getTime();
    });

  for (var r = 0; r < sortedReturns.length; r++) {
    var returnItems = parseTransactionItems_(sortedReturns[r]);
    for (var ri = 0; ri < returnItems.length; ri++) {
      var returnItem = returnItems[ri];
      var returnItemId = returnItem.itemId || returnItem.name;
      var qtyToApply = Number(returnItem.qty) || 0;

      for (var a = 0; a < allIssueAllocations.length; a++) {
        if (qtyToApply <= 0) break;
        var allocation = allIssueAllocations[a];
        var allocationItemId = allocation.itemId || allocation.name;
        if (allocationItemId !== returnItemId) continue;

        var openQty = allocation.issuedQty - allocation.returnedQty;
        var appliedQty = Math.min(openQty, qtyToApply);
        if (appliedQty <= 0) continue;

        allocation.returnedQty += appliedQty;
        qtyToApply -= appliedQty;
        allocation.returnEvents.push({
          qty: appliedQty,
          formNumber: sortedReturns[r].form_number || '',
          performedAt: sortedReturns[r].performed_at || '',
          txId: sortedReturns[r].tx_id || ''
        });
      }
    }
  }

  return targetAllocations;
}

function buildPublicFormItems_(transactions, row) {
  var items = parseTransactionItems_(row);
  var isIssuanceType = row.tx_type === 'issue' || row.tx_type === 'borrow_in';
  var returnAllocations = isIssuanceType ? buildReturnAllocations_(transactions, row) : [];

  return items.map(function(item, index) {
    var allocation = returnAllocations[index] || {
      issuedQty: Number(item.qty) || 0,
      returnedQty: row.tx_type === 'return' || row.tx_type === 'return_borrow' ? Number(item.qty) || 0 : 0,
      returnEvents: []
    };
    var issuedQty = Number(allocation.issuedQty) || Number(item.qty) || 0;
    var returnedQty = Number(allocation.returnedQty) || 0;

    return {
      itemId: item.itemId || '',
      name: item.name || '',
      qty: Number(item.qty) || 0,
      issuedQty: issuedQty,
      returnedQty: returnedQty,
      remainingQty: Math.max(issuedQty - returnedQty, 0),
      condition: item.condition || 'used',
      unitOfMeasure: item.unitOfMeasure || '',
      notes: item.notes || '',
      serialNumber: item.serialNumber || '',
      isCustom: item.isCustom === true,
      returnEvents: allocation.returnEvents || []
    };
  });
}

var TransactionsController = {
  list: function(context) {
    var activityId = context.request.body.activityId;

    if (!activityId) {
      throw createError_('VALIDATION_ERROR', 'activityId is required');
    }

    var transactionsId = getConfigProperty_('ACTIVITY_' + activityId + '_TRANSACTIONS_ID');
    if (!transactionsId) {
      throw createError_('NOT_FOUND', 'Activity transactions not found: ' + activityId);
    }

    var rows = readAllRows_(transactionsId, 'transactions');

    return rows.map(function(row) {
      var items = [];
      try {
        items = JSON.parse(row.items_json || '[]');
      } catch (parseError) {
        items = [];
      }

      return {
        txId: row.tx_id,
        formNumber: row.form_number || '',
        txType: row.tx_type,
        giverPersonalId: String(row.giver_personal_id || ''),
        giverName: row.giver_name,
        receiverPersonalId: String(row.receiver_personal_id || ''),
        receiverName: row.receiver_name,
        performedBy: row.performed_by,
        performedAt: row.performed_at,
        items: items,
        notes: row.notes || '',
        signatureUrl: row.signature_url || ''
      };
    });
  },

  create: function(context) {
    var body = context.request.body;

    if (!body.activityId || !body.txType || !body.items || !body.items.length) {
      throw createError_('VALIDATION_ERROR', 'activityId, txType, and items are required');
    }

    // Lock per activity to prevent race conditions (stock overselling, duplicate idempotency keys)
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) {
      throw createError_('BUSY', 'Another transaction is being processed, please wait');
    }

    try {
      return TransactionsController._doCreate(context);
    } finally {
      lock.releaseLock();
    }
  },

  getPublic: function(context) {
    var body = context.request.body;

    if (!body.activityId || !body.txId) {
      throw createError_('VALIDATION_ERROR', 'activityId and txId are required');
    }

    var transactionsId = getConfigProperty_('ACTIVITY_' + body.activityId + '_TRANSACTIONS_ID');
    if (!transactionsId) {
      throw createError_('NOT_FOUND', 'Transaction not found');
    }

    var existing = findRow_(transactionsId, 'transactions', 'tx_id', body.txId);
    if (!existing) {
      throw createError_('NOT_FOUND', 'Transaction not found');
    }

    ensureSheetHeaders_(transactionsId, 'transactions', SHEET_HEADERS['transactions']);
    var row = existing.row;
    var transactions = readAllRows_(transactionsId, 'transactions');
    var items = buildPublicFormItems_(transactions, row);

    // Look up activity name from registry
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var activityRow = findRow_(registryId, 'activities-registry', 'activity_id', body.activityId);
    var activityName = activityRow ? activityRow.row.name : '';

    var isIssuanceType = row.tx_type === 'issue' || row.tx_type === 'borrow_in';
    var soldierPersonalId = isIssuanceType
      ? String(row.receiver_personal_id || '').trim()
      : String(row.giver_personal_id || '').trim();
    var soldierDetails = lookupPublicSoldierDetails_(body.activityId, soldierPersonalId);
    var operatorDetails = lookupPublicOperatorDetails_(row.performed_by);
    var giverDetails = buildPublicPartyDetails_(
      body.activityId,
      row.giver_personal_id,
      row.giver_name,
      row.performed_by
    );
    var receiverDetails = buildPublicPartyDetails_(
      body.activityId,
      row.receiver_personal_id,
      row.receiver_name,
      row.performed_by
    );
    var signatureBase64 = readSignatureBase64_(row.signature_url);
    var giverSignatureBase64 = readSignatureBase64_(row.giver_signature_url);

    return {
      txId: row.tx_id,
      formNumber: row.form_number || '',
      txType: row.tx_type,
      giverPersonalId: String(row.giver_personal_id || ''),
      giverName: row.giver_name || '',
      receiverPersonalId: String(row.receiver_personal_id || ''),
      receiverName: row.receiver_name || '',
      performedAt: row.performed_at || '',
      items: items,
      notes: row.notes || '',
      signatureBase64: signatureBase64,
      giverSignatureBase64: giverSignatureBase64,
      activityName: activityName,
      soldier: soldierDetails,
      operator: operatorDetails,
      giver: giverDetails,
      receiver: receiverDetails
    };
  },

  _doCreate: function(context) {
    var body = context.request.body;
    var now = new Date().toISOString();
    var giverPersonalId = String(body.giverPersonalId || '').trim();
    var receiverPersonalId = String(body.receiverPersonalId || '').trim();

    var validTypes = ['issue', 'return', 'borrow_in', 'return_borrow', 'count_adjustment', 'write_off'];
    if (validTypes.indexOf(body.txType) === -1) {
      throw createError_('VALIDATION_ERROR', 'Invalid transaction type: ' + body.txType);
    }

    // For issue/borrow_in: receiver must be specified
    if ((body.txType === 'issue' || body.txType === 'borrow_in') && !receiverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'receiverPersonalId is required for ' + body.txType);
    }
    if ((body.txType === 'issue' || body.txType === 'borrow_in') && !giverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'giverPersonalId is required for ' + body.txType);
    }

    // For return/return_borrow: giver must be specified
    if ((body.txType === 'return' || body.txType === 'return_borrow') && !giverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'giverPersonalId is required for ' + body.txType);
    }
    if ((body.txType === 'return' || body.txType === 'return_borrow') && !receiverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'receiverPersonalId is required for ' + body.txType);
    }

    // Operator cannot issue to or receive from themselves
    if (giverPersonalId && receiverPersonalId && giverPersonalId === receiverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'Giver and receiver cannot be the same person');
    }
    var operatorPersonalId = getOperatorPersonalId_(context.operator);
    if (
      !operatorPersonalId &&
      (body.txType === 'issue' ||
        body.txType === 'borrow_in' ||
        body.txType === 'return' ||
        body.txType === 'return_borrow')
    ) {
      throw createError_('VALIDATION_ERROR', 'Operator profile must be synced before creating transactions');
    }
    if (
      operatorPersonalId &&
      (body.txType === 'issue' || body.txType === 'borrow_in') &&
      receiverPersonalId === operatorPersonalId
    ) {
      throw createError_('VALIDATION_ERROR', 'Operator cannot issue to themselves');
    }
    if (
      operatorPersonalId &&
      (body.txType === 'return' || body.txType === 'return_borrow') &&
      giverPersonalId === operatorPersonalId
    ) {
      throw createError_('VALIDATION_ERROR', 'Operator cannot return from themselves');
    }

    var transactionsId = getConfigProperty_('ACTIVITY_' + body.activityId + '_TRANSACTIONS_ID');
    if (!transactionsId) {
      throw createError_('NOT_FOUND', 'Activity not found: ' + body.activityId);
    }

    // Verify activity is still active
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var activityRow = findRow_(registryId, 'activities-registry', 'activity_id', body.activityId);
    if (!activityRow) {
      throw createError_('NOT_FOUND', 'Activity not found in registry: ' + body.activityId);
    }
    if (activityRow.row.status !== 'active') {
      throw createError_('ACTIVITY_NOT_ACTIVE', 'Cannot add transactions to a ' + activityRow.row.status + ' activity');
    }

    // Validate stock sufficiency for types that reduce stock
    var stockReducingTypes = ['issue', 'borrow_in', 'write_off'];
    if (stockReducingTypes.indexOf(body.txType) !== -1) {
      validateStockSufficiency_(body.activityId, body.items);
    }

    // Upload signatures if provided
    var signatureUrl = '';
    if (body.signatureBase64) {
      var fileName = 'sig_' + generateId_('sig') + '.png';
      signatureUrl = uploadSignature_(body.signatureBase64, fileName);
    }
    var giverSignatureUrl = '';
    if (body.giverSignatureBase64) {
      var giverFileName = 'sig_' + generateId_('sig') + '.png';
      giverSignatureUrl = uploadSignature_(body.giverSignatureBase64, giverFileName);
    }

    // Generate unique transaction ID
    var txId = generateId_('tx');

    // Check for duplicate (idempotency)
    if (body.clientTxId) {
      var existingTx = findRow_(transactionsId, 'transactions', 'tx_id', body.clientTxId);
      if (existingTx) {
        return { txId: body.clientTxId, formNumber: existingTx.row.form_number || '', status: 'duplicate' };
      }
      txId = body.clientTxId;
    }

    // Generate sequential form number (already inside lock from create())
    var formNumber = getNextFormNumber_();

    var transaction = {
      tx_id: txId,
      form_number: formNumber,
      tx_type: body.txType,
      giver_personal_id: giverPersonalId,
      giver_name: body.giverName || '',
      receiver_personal_id: receiverPersonalId,
      receiver_name: body.receiverName || '',
      performed_by: context.operator.email,
      performed_at: now,
      items_json: JSON.stringify(body.items),
      notes: body.notes || '',
      signature_url: signatureUrl,
      giver_signature_url: giverSignatureUrl
    };

    ensureSheetHeaders_(transactionsId, 'transactions', SHEET_HEADERS['transactions']);
    appendRow_(transactionsId, 'transactions', transaction);

    // Audit log
    var auditLogId = getConfigProperty_('ACTIVITY_' + body.activityId + '_AUDIT_LOG_ID');
    if (auditLogId) {
      logAudit_(auditLogId, 'tx.create', context.operator.email, {
        txId: txId,
        txType: body.txType,
        itemCount: body.items.length
      });
    }

    return {
      txId: txId,
      formNumber: formNumber,
      txType: body.txType,
      performedBy: context.operator.email,
      performedAt: now,
      items: body.items,
      signatureUrl: signatureUrl
    };
  }
};

function validateStockSufficiency_(activityId, requestedItems) {
  var snapshotId = getConfigProperty_('ACTIVITY_' + activityId + '_SNAPSHOT_ID');
  if (!snapshotId) return;

  var inventoryRows = readActivitySnapshotRows_(snapshotId);
  var transactionsId = getConfigProperty_('ACTIVITY_' + activityId + '_TRANSACTIONS_ID');
  var transactions = transactionsId ? readAllRows_(transactionsId, 'transactions') : [];

  // Build current stock map: initial_qty adjusted by all movements
  var stockMap = {};
  for (var i = 0; i < inventoryRows.length; i++) {
    stockMap[inventoryRows[i].item_id] = Number(inventoryRows[i].initial_qty) || 0;
  }

  // Types that reduce stock vs types that increase stock
  var reduceTypes = ['issue', 'borrow_in', 'write_off'];
  var increaseTypes = ['return', 'return_borrow'];

  // Apply all transaction movements (including count_adjustment which can be negative)
  for (var t = 0; t < transactions.length; t++) {
    var items = [];
    try {
      items = JSON.parse(transactions[t].items_json || '[]');
    } catch (parseError) {
      continue;
    }

    var txType = transactions[t].tx_type;

    for (var j = 0; j < items.length; j++) {
      var itemId = items[j].itemId;
      if (stockMap[itemId] === undefined) continue;

      if (reduceTypes.indexOf(txType) !== -1) {
        stockMap[itemId] -= Number(items[j].qty) || 0;
      } else if (increaseTypes.indexOf(txType) !== -1) {
        stockMap[itemId] += Number(items[j].qty) || 0;
      } else if (txType === 'count_adjustment') {
        // count_adjustment qty can be negative (reduce) or positive (increase)
        stockMap[itemId] += Number(items[j].qty) || 0;
      }
    }
  }

  // Validate requested items
  var insufficientItems = [];
  for (var r = 0; r < requestedItems.length; r++) {
    var requested = requestedItems[r];
    var available = stockMap[requested.itemId] || 0;
    if (Number(requested.qty) > available) {
      insufficientItems.push({
        itemId: requested.itemId,
        name: requested.name || '',
        requested: requested.qty,
        available: available
      });
    }
  }

  if (insufficientItems.length > 0) {
    throw createError_('INSUFFICIENT_STOCK', 'Not enough stock for: ' +
      insufficientItems.map(function(item) {
        return item.name + ' (requested: ' + item.requested + ', available: ' + item.available + ')';
      }).join(', ')
    );
  }
}
