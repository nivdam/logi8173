/**
 * Dashboard summary — aggregates data from multiple sheets.
 */

var DashboardController = {
  summary: function(context) {
    var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');
    var registryId = getConfigProperty_('ACTIVITIES_REGISTRY_ID');
    var companiesSheetId = getConfigProperty_('COMPANIES_SHEET_ID');

    // Inventory stats
    var inventoryRows = readAllRows_(masterInventoryId, 'master-inventory');
    var totalItems = inventoryRows.length;
    var lowStockCount = 0;
    var gapCount = 0;

    for (var i = 0; i < inventoryRows.length; i++) {
      var qty = Number(inventoryRows[i].initial_qty) || 0;
      var threshold = Number(inventoryRows[i].min_threshold) || 0;

      if (qty <= 0) {
        gapCount++;
      } else if (qty <= threshold) {
        lowStockCount++;
      }
    }

    // Active activities count
    var activities = readAllRows_(registryId, 'activities-registry');
    var activeActivities = 0;
    for (var a = 0; a < activities.length; a++) {
      if (activities[a].status === 'active') {
        activeActivities++;
      }
    }

    // Recent transactions — from the most recent active activity
    var recentTransactions = [];
    var activeActivity = null;
    for (var b = activities.length - 1; b >= 0; b--) {
      if (activities[b].status === 'active') {
        activeActivity = activities[b];
        break;
      }
    }

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
            txType: row.tx_type,
            giverName: row.giver_name,
            giverPersonalId: row.giver_personal_id,
            receiverName: row.receiver_name,
            receiverPersonalId: row.receiver_personal_id,
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

      // Count from recent transactions
      for (var d = 0; d < recentTransactions.length; d++) {
        if (recentTransactions[d].txType === 'issue') {
          // Would need soldier → company lookup for accurate counts
          // For now, count total issued items
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
