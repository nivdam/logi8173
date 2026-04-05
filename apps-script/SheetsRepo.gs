/**
 * Low-level Google Sheets read/write operations.
 * All data access goes through here.
 */

function readAllRows_(spreadsheetId, sheetName) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw createError_('SHEET_NOT_FOUND', 'Sheet "' + sheetName + '" not found');
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }

  return rows;
}

function appendRow_(spreadsheetId, sheetName, rowObject) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw createError_('SHEET_NOT_FOUND', 'Sheet "' + sheetName + '" not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowArray = [];

  for (var i = 0; i < headers.length; i++) {
    var value = rowObject[headers[i]];
    rowArray.push(value !== undefined ? value : '');
  }

  sheet.appendRow(rowArray);
  return rowObject;
}

function findRow_(spreadsheetId, sheetName, columnName, value) {
  var rows = readAllRows_(spreadsheetId, sheetName);

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][columnName]) === String(value)) {
      return { row: rows[i], index: i + 2 };
    }
  }

  return null;
}

function updateRow_(spreadsheetId, sheetName, rowIndex, rowObject) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw createError_('SHEET_NOT_FOUND', 'Sheet "' + sheetName + '" not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowArray = [];

  for (var i = 0; i < headers.length; i++) {
    var value = rowObject[headers[i]];
    rowArray.push(value !== undefined ? value : '');
  }

  sheet.getRange(rowIndex, 1, 1, rowArray.length).setValues([rowArray]);
  return rowObject;
}

function createSheetWithHeaders_(spreadsheetId, sheetName, headers) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.insertSheet(sheetName);
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return sheet;
}

function ensureSheetHeaders_(spreadsheetId, sheetName, requiredHeaders) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw createError_('SHEET_NOT_FOUND', 'Sheet "' + sheetName + '" not found');
  }

  var lastColumn = sheet.getLastColumn();
  var headers = lastColumn > 0
    ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    : [];
  var missingHeaders = [];

  for (var i = 0; i < requiredHeaders.length; i++) {
    if (headers.indexOf(requiredHeaders[i]) === -1) {
      missingHeaders.push(requiredHeaders[i]);
    }
  }

  if (missingHeaders.length === 0) {
    return;
  }

  var startColumn = headers.length + 1;
  sheet.insertColumnsAfter(headers.length || 1, missingHeaders.length);
  sheet.getRange(1, startColumn, 1, missingHeaders.length).setValues([missingHeaders]);
  sheet.getRange(1, startColumn, 1, missingHeaders.length).setFontWeight('bold');
}
