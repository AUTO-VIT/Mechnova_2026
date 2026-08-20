import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { subscribeToAuditLogs } from '../../services/firestoreService';
import { formatTimestamp } from '../../utils/formatters';
import { ControlPanel } from '../common/ControlPanel';
import { DataLoadingPanel } from '../common/DataLoadingPanel';
import { StatusBadge } from '../common/StatusBadge';

export function AuditLogTable({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [logs, setLogs] = useState([]);
  const [logsResolved, setLogsResolved] = useState(false);
  const [logsLoadFailed, setLogsLoadFailed] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    setLogs([]);
    setLogsResolved(false);
    setLogsLoadFailed(false);
    return subscribeToAuditLogs(eventId, (nextLogs) => {
      setLogs(nextLogs || []);
      setLogsResolved(true);
    }, () => {
      setLogsLoadFailed(true);
      setLogsResolved(true);
    });
  }, [eventId]);

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const query = filterText.toLowerCase();
    return (log.action || '').toLowerCase().includes(query) || (log.actorUid || '').toLowerCase().includes(query) || (log.entityPath || '').toLowerCase().includes(query);
  }), [logs, filterText]);

  return (
    <ControlPanel title="Activity history" subtitle="A chronological record of administrative and team changes." badge={<StatusBadge status={logsResolved ? `${logs.length} records` : 'Loading'} variant="zinc" />} action={logsResolved && !logsLoadFailed ? <label className="flex min-h-10 items-center gap-2 border border-[var(--mn-line-strong)] bg-[var(--mn-ink-soft)] px-3"><Search className="h-3.5 w-3.5 text-[var(--mn-faint)]" /><span className="sr-only">Filter activity history</span><input type="search" value={filterText} onChange={(event) => setFilterText(event.target.value)} placeholder="Filter records" className="w-40 bg-transparent text-xs text-white outline-none placeholder:text-[var(--mn-faint)]" /></label> : null}>
      {!logsResolved ? <DataLoadingPanel label="Loading activity history…" /> : logsLoadFailed ? <div className="mn-alert mn-alert-error" role="alert">Could not load activity history. Refresh and try again.</div> : <div className="mn-table-wrap">
        <table className="mn-table">
          <thead><tr><th>Time</th><th>Role</th><th>User</th><th>Action</th><th>Record</th></tr></thead>
          <tbody>
            {filteredLogs.length === 0 ? <tr><td colSpan="5" className="py-10 text-center text-[var(--mn-faint)]">No matching activity records.</td></tr> : filteredLogs.map((log) => (
              <tr key={log.id || log.logId}><td className="text-[var(--mn-muted)]">{formatTimestamp(log.createdAtMs)}</td><td><StatusBadge status={log.actorRole || 'System'} variant={log.actorRole === 'ADMIN' ? 'red' : log.actorRole === 'TEAM' ? 'emerald' : 'zinc'} /></td><td className="font-mono text-[10px] text-white">{log.actorUid}</td><td className="font-medium text-[var(--mn-orange)]">{log.action}</td><td className="font-mono text-[10px] text-[var(--mn-violet)]">{log.entityPath}</td></tr>
            ))}
          </tbody>
        </table>
      </div>}
    </ControlPanel>
  );
}
