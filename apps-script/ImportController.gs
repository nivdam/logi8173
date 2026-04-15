/**
 * Import helpers for fetching spreadsheet content through Apps Script.
 */

var ImportController = {
  fetchSheetText: function(context) {
    var sourceUrl = String(context.request.body.sourceUrl || '').trim();

    if (!sourceUrl) {
      throw createError_('VALIDATION_ERROR', 'sourceUrl is required');
    }

    var parsed = parseGoogleSheetUrl_(sourceUrl);
    var spreadsheet;

    try {
      spreadsheet = SpreadsheetApp.openById(parsed.spreadsheetId);
    } catch (error) {
      throw createError_('IMPORT_SOURCE_UNAVAILABLE', 'Could not open the requested Google Sheet');
    }

    var sheet = parsed.gid
      ? findSheetByGid_(spreadsheet, parsed.gid)
      : spreadsheet.getSheets()[0];

    if (!sheet) {
      throw createError_('NOT_FOUND', 'Could not find the requested sheet tab');
    }

    var values = sheet.getDataRange().getDisplayValues();

    if (!values || values.length === 0) {
      throw createError_('IMPORT_SOURCE_UNAVAILABLE', 'The selected sheet is empty');
    }

    return {
      text: values.map(formatTsvRow_).join('\n'),
      sheetName: sheet.getName(),
      rowCount: values.length
    };
  }
};

function parseGoogleSheetUrl_(sourceUrl) {
  var match = sourceUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw createError_('VALIDATION_ERROR', 'Invalid Google Sheets URL');
  }

  var gidMatch = sourceUrl.match(/[?#&]gid=(\d+)/);

  return {
    spreadsheetId: match[1],
    gid: gidMatch ? gidMatch[1] : ''
  };
}

function findSheetByGid_(spreadsheet, gid) {
  var sheets = spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i += 1) {
    if (String(sheets[i].getSheetId()) === String(gid)) {
      return sheets[i];
    }
  }

  return null;
}

function formatTsvRow_(row) {
  return row.map(function(cell) {
    return String(cell == null ? '' : cell)
      .replace(/\r?\n/g, ' ')
      .replace(/\t/g, ' ')
      .trim();
  }).join('\t');
}
