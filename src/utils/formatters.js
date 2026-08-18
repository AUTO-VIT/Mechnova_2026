/**
 * Format milliseconds into MM:SS.s monospaced telemetry format
 * Example: 9400 -> "00:09.4"
 */
export function formatTimeMs(ms) {
  if (ms === null || ms === undefined || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${mm}:${ss}.${tenths}`;
}

/**
 * Format milliseconds into seconds string
 * Example: 8500 -> "8.5s"
 */
export function formatSeconds(ms) {
  if (ms === null || ms === undefined || ms < 0) ms = 0;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format Date ms into readable ISO or localized timestamp
 */
export function formatTimestamp(ms) {
  if (!ms) return 'N/A';
  const d = new Date(ms);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Format points with thousand separators
 */
export function formatPoints(pts) {
  if (pts === null || pts === undefined) return '0';
  return Number(pts).toLocaleString();
}
