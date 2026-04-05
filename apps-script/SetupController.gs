/**
 * System initialization — creates Drive folder structure and all base sheets.
 */

var SetupController = {
  status: function(context) {
    var initialized = isSystemInitialized_();
    var result = { initialized: initialized };

    if (initialized) {
      var rootFolderId = getConfigProperty_('ROOT_FOLDER_ID');
      result.folderUrl = 'https://drive.google.com/drive/folders/' + rootFolderId;
    }

    return result;
  },

  initialize: function(context) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw createError_('BUSY', 'Another setup is in progress, please wait');
    }

    try {
      return SetupController._doInitialize(context);
    } finally {
      lock.releaseLock();
    }
  },

  _doInitialize: function(context) {
    if (isSystemInitialized_()) {
      throw createError_('ALREADY_INITIALIZED', 'System is already set up');
    }

    var operator = context.operator;

    // 1. Create root folder
    var rootFolder = DriveApp.createFolder('Logi8173');
    var rootFolderId = rootFolder.getId();

    // 2. Create signatures folder
    var signaturesFolder = rootFolder.createFolder('signatures');
    var signaturesFolderId = signaturesFolder.getId();

    // 3. Create activities folder
    var activitiesFolder = rootFolder.createFolder('activities');
    var activitiesFolderId = activitiesFolder.getId();

    // 4. Create master-inventory spreadsheet
    var masterInventory = createSpreadsheetInFolder_(
      rootFolder, 'master-inventory', 'master-inventory',
      SHEET_HEADERS['master-inventory']
    );

    // 5. Create operators spreadsheet
    var operatorsSheet = createSpreadsheetInFolder_(
      rootFolder, 'operators', 'operators',
      SHEET_HEADERS['operators']
    );

    // 6. Add current user as first admin operator
    var now = new Date().toISOString();
    appendRow_(operatorsSheet.getId(), 'operators', {
      email: operator.email,
      full_name: operator.fullName,
      role: 'admin',
      google_sub: operator.googleSub,
      saved_signature_url: '',
      created_at: now,
      updated_at: now,
      created_by: operator.email
    });

    // 7. Create soldiers spreadsheet
    var soldiersSheet = createSpreadsheetInFolder_(
      rootFolder, 'soldiers', 'soldiers',
      SHEET_HEADERS['soldiers']
    );

    // 8. Create companies spreadsheet
    var companiesSheet = createSpreadsheetInFolder_(
      rootFolder, 'companies', 'companies',
      SHEET_HEADERS['companies']
    );

    // 9. Create activities-registry spreadsheet (with audit-log sheet)
    var activitiesRegistry = createSpreadsheetInFolder_(
      rootFolder, 'activities-registry', 'activities-registry',
      SHEET_HEADERS['activities-registry']
    );
    createSheetWithHeaders_(
      activitiesRegistry.getId(), 'audit-log',
      SHEET_HEADERS['audit-log']
    );
    protectAuditSheet_(activitiesRegistry.getId());

    // 10. Store all IDs in PropertiesService
    setConfigProperties_({
      ROOT_FOLDER_ID: rootFolderId,
      SIGNATURES_FOLDER_ID: signaturesFolderId,
      ACTIVITIES_FOLDER_ID: activitiesFolderId,
      MASTER_INVENTORY_ID: masterInventory.getId(),
      OPERATORS_SHEET_ID: operatorsSheet.getId(),
      SOLDIERS_SHEET_ID: soldiersSheet.getId(),
      COMPANIES_SHEET_ID: companiesSheet.getId(),
      ACTIVITIES_REGISTRY_ID: activitiesRegistry.getId()
    });

    logGlobalAudit_('setup.initialize', operator.email, {
      rootFolderId: rootFolderId
    });

    return {
      folderUrl: 'https://drive.google.com/drive/folders/' + rootFolderId,
      folderName: 'Logi8173'
    };
  }
};
