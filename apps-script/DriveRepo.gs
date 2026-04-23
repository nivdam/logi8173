/**
 * Google Drive operations — folders, sheets, file uploads.
 */

function createFolderInRoot_(folderName) {
  var rootFolderId = getConfigProperty_('ROOT_FOLDER_ID');
  var parentFolder = DriveApp.getFolderById(rootFolderId);
  var newFolder = parentFolder.createFolder(folderName);
  return newFolder;
}

function createSpreadsheetInFolder_(folder, name, sheetName, headers) {
  var spreadsheet = SpreadsheetApp.create(name);
  var file = DriveApp.getFileById(spreadsheet.getId());

  // Move to target folder
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  // Rename default sheet and add headers
  var sheet = spreadsheet.getSheets()[0];
  sheet.setName(sheetName);
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  applyTextColumnFormats_(sheet, headers);

  return spreadsheet;
}

function cloneSpreadsheet_(sourceSpreadsheetId, targetFolder, newName) {
  var sourceFile = DriveApp.getFileById(sourceSpreadsheetId);
  var copy = sourceFile.makeCopy(newName, targetFolder);
  return SpreadsheetApp.openById(copy.getId());
}

function uploadSignature_(base64Data, fileName) {
  var signaturesFolderId = getConfigProperty_('SIGNATURES_FOLDER_ID');

  if (!signaturesFolderId) {
    throw createError_('NOT_INITIALIZED', 'Signatures folder not configured');
  }

  if (!base64Data || typeof base64Data !== 'string') {
    throw createError_('VALIDATION_ERROR', 'Invalid signature data');
  }

  // base64Data comes as "data:image/<type>;base64,XXXXX"
  var parts = base64Data.split(',');
  if (parts.length !== 2) {
    throw createError_('VALIDATION_ERROR', 'Invalid base64 data URI format');
  }

  var mimeMatch = parts[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw createError_('VALIDATION_ERROR', 'Could not extract MIME type from data URI');
  }

  var contentType = mimeMatch[1];
  var allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.indexOf(contentType) === -1) {
    throw createError_('VALIDATION_ERROR', 'Unsupported image type: ' + contentType);
  }

  var folder = DriveApp.getFolderById(signaturesFolderId);
  var decoded = Utilities.base64Decode(parts[1]);
  var blob = Utilities.newBlob(decoded, contentType, fileName);

  var file = folder.createFile(blob);
  // Keep files private — only accessible by the Apps Script service account (deployer)
  // The frontend displays signatures via the API, not direct Drive URLs

  return file.getId();
}

function generateId_(prefix) {
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var id = prefix + '_';
  for (var i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
