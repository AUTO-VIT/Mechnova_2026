import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, UsersRound } from 'lucide-react';
import { subscribeToRegisteredTeams } from '../../services/firestoreService';
import { formatTimestamp } from '../../utils/formatters';
import { ControlPanel } from '../common/ControlPanel';

function csvValue(value) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

function buildRegistrationRows(teams) {
  const header = [
    'Team ID',
    'Team Code',
    'Team Name',
    'Registration Status',
    'Registered At',
    'Member Number',
    'Member Name',
    'Member Email',
    'Google Drive Registration Proof'
  ];
  const rows = teams.flatMap((team) => {
    const members = Array.isArray(team.members) && team.members.length > 0 ? team.members : [{}];
    return members.map((member, index) => [
      team.id,
      team.teamCode,
      team.teamName,
      team.status,
      formatTimestamp(team.createdAtMs),
      index + 1,
      member.name,
      member.email,
      member.registrationProofUrl
    ]);
  });

  return [header, ...rows];
}

export function RegistrationConsole({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [teams, setTeams] = useState([]);

  useEffect(() => subscribeToRegisteredTeams(eventId, setTeams), [eventId]);

  const memberCount = useMemo(
    () => teams.reduce((total, team) => total + (Array.isArray(team.members) ? team.members.length : 0), 0),
    [teams]
  );

  const downloadExcelCsv = () => {
    const csv = buildRegistrationRows(teams)
      .map((row) => row.map(csvValue).join(','))
      .join('\r\n');
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
    <ControlPanel
      title="TEAM REGISTRATION LEDGER"
      subtitle="Registered Teams, Member Details & Proof Links"
      action={
        <button
          type="button"
          onClick={downloadExcelCsv}
          disabled={teams.length === 0}
          className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2 font-mono text-xs font-bold uppercase text-white shadow-[0_0_20px_rgba(16,185,129,0.28)] transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          <Download className="h-4 w-4" /> Download for Excel
        </button>
      }
    >
      <div className="space-y-6 pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#855AB4]/30 bg-[#221545]/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Registered teams</span>
            <span className="mt-2 block font-mono text-3xl font-bold text-white">{teams.length}</span>
          </div>
          <div className="rounded-2xl border border-[#855AB4]/30 bg-[#221545]/40 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Registered members</span>
            <span className="mt-2 block font-mono text-3xl font-bold text-[#B26FCB]">{memberCount}</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-zinc-900 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-3">Team</th>
                <th className="p-3">Code</th>
                <th className="p-3">Members</th>
                <th className="p-3">Registered</th>
                <th className="p-3">Proof links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-[#0a030d]">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-sm text-zinc-500">No teams have registered for this event yet.</td>
                </tr>
              ) : teams.map((team) => (
                <tr key={team.id} className="align-top hover:bg-zinc-900/50">
                  <td className="p-3 font-bold text-white">{team.teamName || 'Unnamed team'}<span className="mt-1 block font-mono text-[10px] font-normal text-zinc-500">{team.status || 'REGISTERED'}</span></td>
                  <td className="p-3 font-mono text-[#B26FCB]">{team.teamCode || '—'}</td>
                  <td className="p-3">
                    <div className="space-y-2 text-zinc-300">
                      {(team.members || []).map((member, index) => <div key={`${team.id}-${index}`}><span className="font-medium text-white">{member.name || 'Unnamed member'}</span><span className="block text-zinc-500">{member.email || 'No email'}</span></div>)}
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400">{formatTimestamp(team.createdAtMs)}</td>
                  <td className="p-3">
                    <div className="space-y-2">
                      {(team.members || []).map((member, index) => member.registrationProofUrl ? <a key={`${team.id}-proof-${index}`} href={member.registrationProofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#B26FCB] hover:text-white"><ExternalLink className="h-3 w-3" /> Member {index + 1}</a> : null)}
                      {!(team.members || []).some((member) => member.registrationProofUrl) && <span className="text-zinc-600">No proof link</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-center gap-2 text-xs text-zinc-500"><UsersRound className="h-4 w-4 text-[#B26FCB]" />The export creates one Excel-ready row per registered member, including their proof URL.</p>
      </div>
    </ControlPanel>
  );
}
