/**
 * Lightweight operator presence — heartbeat and online status.
 * Uses CacheService (not a dedicated sheet) because presence is ephemeral.
 * Each operator's last-seen timestamp is stored in script cache with a 2-minute TTL.
 * A registry key tracks which operators have sent heartbeats recently.
 */

var PRESENCE_TTL_SECONDS = 120; // 2 minutes — operator is "online" within this window
var PRESENCE_REGISTRY_KEY = 'presence_registry';
var PRESENCE_REGISTRY_TTL_SECONDS = 300; // 5 minutes — registry lives longer than individual entries

var PresenceController = {
  heartbeat: function(context) {
    var cache = CacheService.getScriptCache();
    var email = context.operator.email;
    var now = new Date().toISOString();

    // Store this operator's last-seen timestamp
    var entryKey = 'presence_' + email;
    var entry = JSON.stringify({
      email: email,
      fullName: context.operator.fullName,
      lastSeen: now
    });
    cache.put(entryKey, entry, PRESENCE_TTL_SECONDS);

    // Update the registry of known-online operators
    var registryRaw = cache.get(PRESENCE_REGISTRY_KEY);
    var registry = registryRaw ? JSON.parse(registryRaw) : [];

    if (registry.indexOf(email) === -1) {
      registry.push(email);
    }

    cache.put(PRESENCE_REGISTRY_KEY, JSON.stringify(registry), PRESENCE_REGISTRY_TTL_SECONDS);

    return { ok: true };
  },

  getOnline: function(context) {
    var cache = CacheService.getScriptCache();
    var registryRaw = cache.get(PRESENCE_REGISTRY_KEY);

    if (!registryRaw) {
      return [];
    }

    var registry = JSON.parse(registryRaw);
    var onlineOperators = [];
    var activeEmails = [];

    for (var i = 0; i < registry.length; i++) {
      var entryKey = 'presence_' + registry[i];
      var entryRaw = cache.get(entryKey);

      // If the individual entry still exists, the operator is online
      if (entryRaw) {
        var entry = JSON.parse(entryRaw);
        onlineOperators.push({
          email: entry.email,
          fullName: entry.fullName,
          lastSeen: entry.lastSeen
        });
        activeEmails.push(registry[i]);
      }
    }

    // Clean up stale entries from registry
    if (activeEmails.length !== registry.length) {
      cache.put(PRESENCE_REGISTRY_KEY, JSON.stringify(activeEmails), PRESENCE_REGISTRY_TTL_SECONDS);
    }

    return onlineOperators;
  }
};
