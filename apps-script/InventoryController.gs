/**
 * Inventory management — list items with computed stock, add/update items.
 */

var InventoryController = {
  list: function(context) {
    var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');
    var rows = readAllRows_(masterInventoryId, 'master-inventory');

    return rows.map(function(row) {
      var currentQty = Number(row.initial_qty) || 0;
      var minThreshold = Number(row.min_threshold) || 0;
      var status = 'ok';

      if (currentQty <= 0) {
        status = 'gap';
      } else if (currentQty <= minThreshold) {
        status = 'low';
      }

      return {
        itemId: row.item_id,
        itemNumber: row.item_number,
        name: row.name,
        category: row.category,
        tags: row.tags ? String(row.tags).split(',') : [],
        unitOfMeasure: row.unit_of_measure,
        currentQty: currentQty,
        minThreshold: minThreshold,
        status: status,
        notes: row.notes || ''
      };
    });
  },

  upsert: function(context) {
    var masterInventoryId = getConfigProperty_('MASTER_INVENTORY_ID');
    var body = context.request.body;
    var now = new Date().toISOString();

    if (!body.name || !body.category) {
      throw createError_('VALIDATION_ERROR', 'name and category are required');
    }

    var existing = body.itemId
      ? findRow_(masterInventoryId, 'master-inventory', 'item_id', body.itemId)
      : null;

    if (existing) {
      var updated = {
        item_id: body.itemId,
        item_number: body.itemNumber || existing.row.item_number,
        name: body.name,
        category: body.category,
        tags: Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || ''),
        unit_of_measure: body.unitOfMeasure || existing.row.unit_of_measure,
        initial_qty: body.initialQty !== undefined ? body.initialQty : existing.row.initial_qty,
        min_threshold: body.minThreshold !== undefined ? body.minThreshold : existing.row.min_threshold,
        notes: body.notes !== undefined ? body.notes : existing.row.notes,
        created_at: existing.row.created_at,
        updated_at: now
      };
      updateRow_(masterInventoryId, 'master-inventory', existing.index, updated);

      logGlobalAudit_('inventory.update', context.operator.email, {
        itemId: body.itemId, name: body.name
      });

      return { itemId: updated.item_id, name: updated.name };
    }

    var newItem = {
      item_id: generateId_('item'),
      item_number: body.itemNumber || '',
      name: body.name,
      category: body.category,
      tags: Array.isArray(body.tags) ? body.tags.join(',') : (body.tags || ''),
      unit_of_measure: body.unitOfMeasure || '',
      initial_qty: body.initialQty || 0,
      min_threshold: body.minThreshold || 0,
      notes: body.notes || '',
      created_at: now,
      updated_at: now
    };
    appendRow_(masterInventoryId, 'master-inventory', newItem);

    logGlobalAudit_('inventory.create', context.operator.email, {
      itemId: newItem.item_id, name: newItem.name
    });

    return { itemId: newItem.item_id, name: newItem.name };
  }
};
