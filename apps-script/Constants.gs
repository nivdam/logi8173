/**
 * Sheet column headers for each entity.
 * Used when creating new sheets and when parsing rows.
 */

var SHEET_HEADERS = {
  'master-inventory': [
    'item_id', 'item_number', 'name', 'category', 'tags',
    'unit_of_measure', 'initial_qty', 'min_threshold', 'notes',
    'created_at', 'updated_at'
  ],
  'operators': [
    'email', 'full_name', 'role', 'google_sub',
    'saved_signature_url', 'is_active', 'created_at', 'updated_at', 'created_by'
  ],
  'soldiers': [
    'personal_id', 'full_name', 'rank', 'company', 'platoon', 'phone',
    'created_at', 'updated_at'
  ],
  'companies': [
    'company_id', 'name', 'is_active', 'created_at'
  ],
  'activities-registry': [
    'activity_id', 'name', 'activity_type', 'status', 'opened_by',
    'start_date', 'end_date', 'folder_id', 'created_at', 'closed_at'
  ],
  'transactions': [
    'tx_id', 'tx_type', 'giver_personal_id', 'giver_name',
    'receiver_personal_id', 'receiver_name', 'performed_by',
    'performed_at', 'items_json', 'notes', 'signature_url'
  ],
  'incidents': [
    'incident_id', 'item_id', 'item_name', 'soldier_personal_id',
    'soldier_name', 'type', 'qty', 'description',
    'created_at', 'resolved_at'
  ],
  'audit-log': [
    'timestamp', 'action', 'actor_email', 'details_json'
  ]
};
