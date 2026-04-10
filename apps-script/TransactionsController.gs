/**
 * Transactions — list per activity, create with stock validation + signature.
 */

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
        txType: row.tx_type,
        giverPersonalId: row.giver_personal_id,
        giverName: row.giver_name,
        receiverPersonalId: row.receiver_personal_id,
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

  _doCreate: function(context) {
    var body = context.request.body;
    var now = new Date().toISOString();

    var validTypes = ['issue', 'return', 'borrow_in', 'return_borrow', 'count_adjustment', 'write_off'];
    if (validTypes.indexOf(body.txType) === -1) {
      throw createError_('VALIDATION_ERROR', 'Invalid transaction type: ' + body.txType);
    }

    // For issue/borrow_in: receiver must be specified
    if ((body.txType === 'issue' || body.txType === 'borrow_in') && !body.receiverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'receiverPersonalId is required for ' + body.txType);
    }

    // For return/return_borrow: giver must be specified
    if ((body.txType === 'return' || body.txType === 'return_borrow') && !body.giverPersonalId) {
      throw createError_('VALIDATION_ERROR', 'giverPersonalId is required for ' + body.txType);
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

    // Upload signature if provided
    var signatureUrl = '';
    if (body.signatureBase64) {
      var fileName = 'sig_' + generateId_('sig') + '.png';
      signatureUrl = uploadSignature_(body.signatureBase64, fileName);
    }

    // Generate unique transaction ID
    var txId = generateId_('tx');

    // Check for duplicate (idempotency)
    if (body.clientTxId) {
      var existingTx = findRow_(transactionsId, 'transactions', 'tx_id', body.clientTxId);
      if (existingTx) {
        return { txId: body.clientTxId, status: 'duplicate' };
      }
      txId = body.clientTxId;
    }

    var transaction = {
      tx_id: txId,
      tx_type: body.txType,
      giver_personal_id: body.giverPersonalId || '',
      giver_name: body.giverName || '',
      receiver_personal_id: body.receiverPersonalId || '',
      receiver_name: body.receiverName || '',
      performed_by: context.operator.email,
      performed_at: now,
      items_json: JSON.stringify(body.items),
      notes: body.notes || '',
      signature_url: signatureUrl
    };

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
