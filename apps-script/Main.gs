/**
 * Entry points for Google Apps Script Web App.
 * Thin adapters — all logic lives in Router.gs and controllers.
 */

function doGet(e) {
  return handleRequest_('GET', e);
}

function doPost(e) {
  return handleRequest_('POST', e);
}
