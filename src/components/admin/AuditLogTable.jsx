import React, { useState, useEffect } from 'react';
import { subscribeToAuditLogs } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Terminal, Search } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function AuditLogTable({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [logs, setLogs] = useState([]);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const unsub = subscribeToAuditLogs(eventId, (l) => setLogs(l || []));
    return () => unsub();
  }, [eventId]);

  const filteredLogs = logs.filter(
    (l) =>
      (l.action || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (l.actorUid || '').toLowerCase().includes(filterText.toLowerCase()) ||
      (l.entityPath || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <ControlPanel
      title="SYSTEM AUDIT LEDGER"
      subtitle="Immutable Append-Only Log Feed"
      badge={<StatusBadge status={`${logs.length} RECORDS`} variant="zinc" />}
      action={
        <div className="flex items-center gap-2 border border-zinc-800 bg-[#0a030d] px-3 py-1 font-mono text-xs">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter audit logs..."
            className="bg-transparent text-white focus:outline-none w-36"
          />
        </div>
      }
    >
      <div className="overflow-x-auto border border-zinc-800 font-mono text-xs pt-2">
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor Role</th>
              <th className="p-3">Actor UID</th>
              <th className="p-3">Action Type</th>
              <th className="p-3">Entity Target Path</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-[#0a030d]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-zinc-500">
                  No audit log entries matching query.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id || log.logId} className="hover:bg-zinc-900/50">
                  <td className="p-3 text-zinc-400">{formatTimestamp(log.createdAtMs)}</td>
                  <td className="p-3">
                    <StatusBadge
                      status={log.actorRole || "SYSTEM"}
                      variant={log.actorRole === "ADMIN" ? "red" : log.actorRole === "TEAM" ? "emerald" : "zinc"}
                    />
                  </td>
                  <td className="p-3 text-white font-bold">{log.actorUid}</td>
                  <td className="p-3 text-amber-400 font-bold">{log.action}</td>
                  <td className="p-3 text-cyan-400 font-mono text-[11px]">{log.entityPath}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ControlPanel>
  );
}
