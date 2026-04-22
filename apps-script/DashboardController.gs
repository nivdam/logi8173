/**
 * Dashboard summary — aggregates data from multiple sheets.
 */

var DashboardController = {
  summary: function(context) {
    var body = (context && context.request && context.request.body) || {};
    var rawActivityId = body.activityId;
    var requestedActivityId = '';
    if (rawActivityId !== null && rawActivityId !== undefined && String(rawActivityId).trim() !== '') {
      requestedActivityId = String(rawActivityId).trim();
    }
    var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var companiesSheetId = getConfigProperty_('COMPANIES_SHEET_ID');

    // Resolve the activity used for scoping (explicit request → that one; otherwise latest active)
    var activities = readAllRows_(registryId, 'activities-registry');
    var activeActivity = null;
    if (requestedActivityId) {
      for (var r = 0; r < activities.length; r++) {
        if (String(activities[r].activity_id) === requestedActivityId) {
          activeActivity = activities[r];
          break;
        }
      }
      if (!activeActivity) {
        throw createError_('NOT_FOUND', 'Activity not found: ' + requestedActivityId);
      }
    } else {
      for (var b = activities.length - 1; b >= 0; b--) {
        if (activities[b].status === 'active') {
          activeActivity = activities[b];
          break;
        }
      }
    }

    // Inventory stats — activity snapshot with transaction-adjusted stock when scoped,
    // raw master inventory otherwise.
    var totalItems = 0;
    var lowStockCount = 0;
    var gapCount = 0;

    if (requestedActivityId) {
      var snapshotItems = getActivitySnapshotItems_(requestedActivityId);
      totalItems = snapshotItems.length;
      for (var i = 0; i < snapshotItems.length; i++) {
        var qty = Number(snapshotItems[i].currentQty) || 0;
        var threshold = Number(snapshotItems[i].minThreshold) || 0;
        if (qty <= 0) {
          gapCount++;
        } else if (qty <= threshold) {
          lowStockCount++;
        }
      }
    } else {
      var inventoryRows = readAllRows_(masterInventoryId, 'master-inventory');
      totalItems = inventoryRows.length;
      for (var j = 0; j < inventoryRows.length; j++) {
        var masterQty = Number(inventoryRows[j].initial_qty) || 0;
        var masterThreshold = Number(inventoryRows[j].min_threshold) || 0;
        if (masterQty <= 0) {
          gapCount++;
        } else if (masterQty <= masterThreshold) {
          lowStockCount++;
        }
      }
    }

    // Active activities count — 1 when scoped to a specific activity, else global count
    var activeActivities = 0;
    if (requestedActivityId) {
      activeActivities = activeActivity && activeActivity.status === 'active' ? 1 : 0;
    } else {
      for (var a = 0; a < activities.length; a++) {
        if (activities[a].status === 'active') {
          activeActivities++;
        }
      }
    }

    var recentTransactions = [];

    if (activeActivity) {
      var txSheetId = getConfigProperty_('ACTIVITY_' + activeActivity.activity_id + '_TRANSACTIONS_ID');
      if (txSheetId) {
        var allTx = readAllRows_(txSheetId, 'transactions');
        var lastTen = allTx.slice(-10).reverse();
        recentTransactions = lastTen.map(function(row) {
          var items = [];
          try { items = JSON.parse(row.items_json || '[]'); } catch (e) { items = []; }
          return {
            txId: row.tx_id,
            formNumber: row.form_number || '',
            txType: row.tx_type,
            giverName: row.giver_name,
            giverPersonalId: String(row.giver_personal_id || ''),
            receiverName: row.receiver_name,
            receiverPersonalId: String(row.receiver_personal_id || ''),
            performedBy: row.performed_by,
            performedAt: row.performed_at,
            items: items,
            notes: row.notes || ''
          };
        });
      }
    }

    // Company breakdown — count issued items per company from active activity
    var companyBreakdown = [];
    if (companiesSheetId) {
      var companies = readAllRows_(companiesSheetId, 'companies');
      var companyIssuedCounts = {};

      for (var c = 0; c < companies.length; c++) {
        companyIssuedCounts[companies[c].name] = 0;
      }

      // Build soldier → company lookup.
      // When scoped to a specific activity, read from its activity-soldiers sheet
      // (separate from the battalion-wide roster); fall back to global soldiers.
      var soldierCompanyMap = {};
      var scopedSoldiersSheetId = null;
      if (requestedActivityId) {
        scopedSoldiersSheetId = getConfigProperty_('ACTIVITY_' + requestedActivityId + '_SOLDIERS_ID');
      }
      var soldiersSheetId = scopedSoldiersSheetId || getConfigProperty_('SOLDIERS_SHEET_ID');
      if (soldiersSheetId) {
        var soldiers = readAllRows_(soldiersSheetId, scopedSoldiersSheetId ? 'activity-soldiers' : 'soldiers');
        for (var s = 0; s < soldiers.length; s++) {
          if (soldiers[s].personal_id && soldiers[s].company) {
            soldierCompanyMap[String(soldiers[s].personal_id)] = soldiers[s].company;
          }
        }
      }

      // Count issued items per company from recent transactions
      for (var d = 0; d < recentTransactions.length; d++) {
        var tx = recentTransactions[d];
        if (tx.txType === 'issue' && tx.receiverPersonalId) {
          var soldierCompany = soldierCompanyMap[tx.receiverPersonalId];
          if (soldierCompany && companyIssuedCounts[soldierCompany] !== undefined) {
            var txItemCount = 0;
            for (var e = 0; e < tx.items.length; e++) {
              txItemCount += Math.abs(Number(tx.items[e].qty) || 0);
            }
            companyIssuedCounts[soldierCompany] += txItemCount;
          }
        }
      }

      for (var companyName in companyIssuedCounts) {
        companyBreakdown.push({
          companyName: companyName,
          issuedCount: companyIssuedCounts[companyName]
        });
      }
    }

    return {
      totalItems: totalItems,
      lowStockCount: lowStockCount,
      gapCount: gapCount,
      activeActivities: activeActivities,
      recentTransactions: recentTransactions,
      companyBreakdown: companyBreakdown
    };
  }
};
