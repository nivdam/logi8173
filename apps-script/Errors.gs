/**
 * Structured error creation.
 */

function createError_(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}
