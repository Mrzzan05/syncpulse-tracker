import React, { useState } from 'react';
import {
  Heart, ShieldCheck, DownloadSimple, UploadSimple, LinkSimple, Trash
} from '@phosphor-icons/react';
import { AppState, Member } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { GET_THEME_TOKENS } from '../../theme/tokens';
import { formatRelativeTime } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  isLatteMode: boolean;
  syncUrl: string;
  onChangeSyncUrl: (url: string) => void;
  onChangeRoomCode: (code: string) => void;
  memberMetrics: Record<string, {
    todayMins: number;
    totalHours: string;
    streak: number;
    level: number;
    grid28: { dateStr: string; prettyDate: string; mins: number; level: number }[];
  }>;
  onCheerLog: (logId: string) => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onResetZero: () => void;
}

export const SanctuaryPage: React.FC<Props> = ({
  state,
  currentMember,
  isLatteMode,
  syncUrl,
  onChangeSyncUrl,
  onChangeRoomCode,
  memberMetrics,
  onCheerLog,
  onExportJSON,
  onImportJSON,
  onResetZero
}) => {
  const [selectedCell, setSelectedCell] = useState<{ member: string; date: string; mins: number } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const activeCount = state.members.filter((m) => m.presence?.isFocusing).length;

  return (
    <div className="space-y-12">
      {/* 1. Shared Presence Header */}
      <section className="space-y-2">
        <PulseLine
          active={activeCount > 0}
          label={activeCount > 0 ? `${activeCount} focusing in sanctuary` : 'Shared space at rest'}
        />
        <h2 className="font-serif italic text-3xl sm:text-4xl">Sanctuary Presence</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Side-by-side 28-day consistency and live companion status
        </p>
      </section>

      {/* 2. Companion Presence & 28-Day Rhythm */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.members.map((m) => {
          const mTokens = GET_THEME_TOKENS(m.theme, isLatteMode);
          const stat = memberMetrics[m.id];
          const isFocusing = Boolean(m.presence?.isFocusing);
          return (
            <Surface key={m.id} variant="secondary" className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: isFocusing ? '#10b981' : 'var(--text-muted)',
                      boxShadow: isFocusing ? '0 0 8px #10b981' : 'none'
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-base">{m.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {isFocusing
                        ? `Focusing on ${m.presence?.targetTitle}`
                        : stat?.streak
                        ? `${stat.streak} days building rhythm`
                        : 'Ready to begin'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {stat?.totalHours || '0.0'}h
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {(stat?.grid28 || []).map((cell) => (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedCell({ member: m.name, date: cell.prettyDate, mins: cell.mins })}
                    className={`h-7 rounded-lg border transition flex items-center justify-center text-[10px] font-mono ${mTokens.heatLevels[cell.level]}`}
                  >
                    {cell.mins > 0 ? cell.mins : ''}
                  </button>
                ))}
              </div>

              {selectedCell && selectedCell.member === m.name && (
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  {selectedCell.date}: {selectedCell.mins} minutes focused
                </p>
              )}
            </Surface>
          );
        })}
      </section>

      {/* 3. Shared Focus Moments */}
      <section className="space-y-4">
        <h3 className="font-serif italic text-2xl">Recent Focus Moments</h3>
        <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)]">
          {state.logs.length === 0 ? (
            <p className="text-xs py-8 text-center text-[var(--text-muted)]">
              Your shared feed is quiet. Complete your first focus session to inspire your companion.
            </p>
          ) : (
            state.logs.slice(0, 10).map((log) => {
              const logMember = state.members.find((m) => m.id === log.userId);
              if (!logMember) return null;
              const isOwn = log.userId === currentMember.id;
              const cheered = log.cheeredBy.includes(currentMember.id);
              return (
                <div key={log.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-semibold">{logMember.name}</span>
                    <span className="text-[var(--text-muted)] truncate">{log.targetTitle}</span>
                    {log.feeling && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                        {log.feeling}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[var(--text-muted)]">
                      +{log.minutes}m • {formatRelativeTime(log.createdAtMs, log.date)}
                    </span>
                    <button
                      type="button"
                      disabled={isOwn}
                      onClick={() => onCheerLog(log.id)}
                      className="px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-1"
                    >
                      <Heart weight={cheered || log.cheeredBy.length > 0 ? 'fill' : 'duotone'} className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      <span>{log.cheeredBy.length}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Data Privacy, Local-First Assurance & Live Sync (Audit Point 74, 75, 157) */}
      <Surface variant="ambient" className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif italic text-2xl flex items-center gap-2">
              <ShieldCheck weight="duotone" className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Your Data & Sanctuary Sync
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Local-first privacy: your progress lives safely in your browser first and syncs to your private room when online.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[var(--text-muted)] mb-1">Private Room Code</label>
            <input
              type="text"
              value={state.roomCode}
              onChange={(e) => onChangeRoomCode(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2 font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            />
          </div>
          <div>
            <label className="block text-[var(--text-muted)] mb-1">Live Sync Database URL</label>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => onChangeSyncUrl(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2 font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={async () => {
              const link = `${window.location.origin}${window.location.pathname}?room=${state.roomCode}`;
              await navigator.clipboard.writeText(link);
              setCopiedInvite(true);
              setTimeout(() => setCopiedInvite(false), 2500);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <LinkSimple weight="bold" className="w-4 h-4" />
            <span>{copiedInvite ? 'Invite Link Copied!' : 'Copy Companion Invite Link'}</span>
          </button>

          <button
            type="button"
            onClick={onExportJSON}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-medium flex items-center gap-1.5"
          >
            <DownloadSimple weight="duotone" className="w-4 h-4" /> Export Data (.json)
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-medium flex items-center gap-1.5 cursor-pointer">
            <UploadSimple weight="duotone" className="w-4 h-4" /> Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImportJSON(e.target.files[0])}
            />
          </label>

          <button
            type="button"
            onClick={onResetZero}
            className="px-3 py-2.5 rounded-xl text-xs text-rose-400 hover:underline flex items-center gap-1 ml-auto"
          >
            <Trash weight="duotone" className="w-4 h-4" /> Reset Hours to Zero
          </button>
        </div>
      </Surface>
    </div>
  );
};
export default SanctuaryPage;
