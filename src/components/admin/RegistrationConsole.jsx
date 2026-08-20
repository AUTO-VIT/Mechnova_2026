import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, UsersRound } from 'lucide-react';
import { subscribeToRegisteredTeams } from '../../services/firestoreService';
import { formatTimestamp } from '../../utils/formatters';
import { ControlPanel } from '../common/ControlPanel';

function csvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function buildRegistrationRows(teams) {
  const header = ['Team ID', 'Team Code', 'Team Name', 'Registration Status', 'Registered At', 'Member Number', 'Member Name', 'Member Email', 'Google Drive Registration Proof'];
  const rows = teams.flatMap((team) => {
    const members = Array.isArray(team.members) && team.members.length > 0 ? team.members : [{}];
    return members.map((member, index) => [team.id, team.teamCode, team.teamName, team.status, formatTimestamp(team.createdAtMs), index + 1, member.name, member.email, member.registrationProofUrl]);
  });
  return [header, ...rows];
}

export function RegistrationConsole({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [teams, setTeams] = useState([]);
  useEffect(() => subscribeToRegisteredTeams(eventId, setTeams), [eventId]);
  const memberCount = useMemo(() => teams.reduce((total, team) => total + (Array.isArray(team.members) ? team.members.length : 0), 0), [teams]);

  const downloadExcelCsv = () => {
    const csv = buildRegistrationRows(teams).map((row) => row.map(csvValue).join(',')).join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mechnova-registrations-${eventId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <ControlPanel title="Team registrations" subtitle="Review registered teams, member details, and proof links." action={<button type="button" onClick={downloadExcelCsv} disabled={teams.length === 0} className="mn-button mn-button-primary min-h-10"><Download className="h-4 w-4" />Download CSV for Excel</button>}>
      <div className="space-y-7">
        <div className="mn-stat-grid is-two"><div className="mn-stat"><label>Registered teams</label><strong>{teams.length}</strong></div><div className="mn-stat"><label>Registered members</label><strong className="text-[var(--mn-violet)]">{memberCount}</strong></div></div>
        <div className="mn-table-wrap">
          <table className="mn-table min-w-[980px]">
            <thead><tr><th>Team</th><th>Code</th><th>Members</th><th>Registered</th><th>Proof links</th></tr></thead>
            <tbody>
              {teams.length === 0 ? <tr><td colSpan="5" className="py-10 text-center text-[var(--mn-faint)]">No teams have registered yet.</td></tr> : teams.map((team) => (
                <tr key={team.id}><td><strong className="text-sm font-semibold text-white">{team.teamName || 'Unnamed team'}</strong><span className="mn-label mt-2 block">{team.status || 'Registered'}</span></td><td className="font-mono text-[var(--mn-violet)]">{team.teamCode || '—'}</td><td><div className="space-y-3">{(team.members || []).map((member, index) => <div key={`${team.id}-${index}`}><span className="font-medium text-white">{member.name || 'Unnamed member'}</span><span className="mt-0.5 block text-[var(--mn-faint)]">{member.email || 'No email'}</span></div>)}</div></td><td className="text-[var(--mn-muted)]">{formatTimestamp(team.createdAtMs)}</td><td><div className="space-y-2">{(team.members || []).map((member, index) => member.registrationProofUrl ? <a key={`${team.id}-proof-${index}`} href={member.registrationProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[var(--mn-violet)] hover:text-white"><ExternalLink className="h-3 w-3" />Member {index + 1}</a> : null)}{!(team.members || []).some((member) => member.registrationProofUrl) && <span className="text-[var(--mn-faint)]">No proof link</span>}</div></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex gap-2 text-xs leading-5 text-[var(--mn-faint)]"><UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" />The export contains one row per member, including the team code and Google Drive proof URL.</p>
      </div>
    </ControlPanel>
  );
}
