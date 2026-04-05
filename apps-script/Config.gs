/**
 * Configuration access via PropertiesService.
 * Uses CacheService for performance (5-minute TTL).
 */

function getConfigProperty_(key) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('config_' + key);
  if (cached) return cached;

  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (value) {
    cache.put('config_' + key, value, 300);
  }
  return value || '';
}

function setConfigProperty_(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
  CacheService.getScriptCache().put('config_' + key, value, 300);
}

function setConfigProperties_(properties) {
  PropertiesService.getScriptProperties().setProperties(properties);
  var cache = CacheService.getScriptCache();
  for (var key in properties) {
    cache.put('config_' + key, properties[key], 300);
  }
}

function isSystemInitialized_() {
  return !!getConfigProperty_('ROOT_FOLDER_ID');
}
