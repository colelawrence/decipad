export function config() {
  return {
    fetchPrefix: process.env.DECI_API_URL || '',
    sendChangesDebounceMs:
      Number(process.env.DECI_SEND_CHANGES_DEBOUNCE_MS) || 0,
    maxRetryIntervalMs: Number(process.env.DECI_MAX_RETRY_INTERVAL_MS) || 10000,
    debounceProcessSlateOpsMs:
      Number(process.env.DECI_DEBOUNCE_PROCESS_SLATE_OPS) || 500,
  };
}
