async function syncClockHandler(data, context, admin) {
  const serverEpochMs = Date.now();
  return {
    serverEpochMs,
    iso: new Date(serverEpochMs).toISOString()
  };
}

module.exports = { syncClockHandler };
