import React, { useState } from 'react';
import {
  Heart, Fire, Plant, Lightning, Buildings, Crown
} from '@phosphor-icons/react';
import { AppState, Member } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { GET_THEME_TOKENS } from '../../theme/tokens';
import { formatRelativeTime } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  isLatteMode: boolean;
  memberMetrics: Record<string, {
    todayMins: number;
    totalHours: string;
    streak: number;
    level: number;
    grid28: { dateStr: string; prettyDate: string; mins: number; level: number }[];
  }>;
  onCheerLog: (logId: string) => void;
}

export const SanctuaryView: React.FC<Props> = ({
  state,
  currentMember,
  isLatteMode,
  memberMetrics,
  onCheerLog
}) => {
  const [selectedCell, setSelectedCell] = useState<{ member: string; date: string; mins: number } | null>(null);
  const activeCount = state.members.filter((m) => m.presence?.isFocusing).length;

  const myStats = memberMetrics[currentMember.id];
  const userLogs = state.logs.filter((l) => l.userId === currentMember.id);
  const totalHrs = Number(myStats?.totalHours || 0);
  const hasDeep = userLogs.some((l) => l.minutes >= 90);
  const cheersReceived = userLogs.reduce((a, l) => a + l.cheeredBy.length, 0);

  const badges = [
    { id: 'spark', Icon: Plant, name: 'First Spark', desc: 'Complete your first focus session', unlocked: userLogs.length > 0 },
    { id: 'flame', Icon: Fire, name: '3-Day Rhythm', desc: '3 consecutive days building momentum', unlocked: (myStats?.streak || 0) >= 3 },
    { id: 'deep', Icon: Lightning, name: 'Deep Diver', desc: 'Complete a 90+ minute session', unlocked: hasDeep },
    { id: 'warm', Icon: Heart, name: 'Shared Warmth', desc: 'Receive cheers from companions', unlocked: cheersReceived >= 2 },
    { id: 'club10', Icon: Buildings, name: '10-Hour Milestone', desc: 'Invest 10 hours in your directions', unlocked: totalHrs >= 10 },
    { id: 'legend50', Icon: Crown, name: '50-Hour Mastery', desc: 'Invest 50 hours in your directions', unlocked: totalHrs >= 50 }
  ];

  return (
    <div className="space-y-12">
      {/* Shared Presence Header */}
      <section className="space-y-2">
        <PulseLine
          active={activeCount > 0}
          label={activeCount > 0 ? `${activeCount} focusing in sanctuary` : 'Sanctuary at rest'}
        />
        <h2 className="font-serif italic text-3xl sm:text-4xl">Shared Sanctuary Rhythm</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Side-by-side consistency across the last 28 days
        </p>
      </section>

      {/* Companion 28-Day Rhythm Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.members.map((m) => {
          const mTokens = GET_THEME_TOKENS(m.theme, isLatteMode);
          const stat = memberMetrics[m.id];
          return (
            <Surface key={m.id} variant="secondary" className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{m.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {stat?.streak ? `${stat.streak} days building rhythm` : 'Starting fresh'} • {stat?.totalHours || '0.0'}h total
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  Lv.{stat?.level || 1}
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

      {/* Shared Focus Moments Feed */}
      <section className="space-y-4">
        <h3 className="font-serif italic text-2xl">Recent Focus Moments</h3>
        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {state.logs.length === 0 ? (
            <p className="text-xs py-8 text-center text-[var(--text-muted)]">
              Your shared feed is quiet. Complete a focus session to inspire your companions.
            </p>
          ) : (
            state.logs.slice(0, 12).map((log) => {
              const logMember = state.members.find((m) => m.id === log.userId);
              if (!logMember) return null;
              const isOwn = log.userId === currentMember.id;
              const cheered = log.cheeredBy.includes(currentMember.id);
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs">
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
        </Surface>
      </section>

      {/* Milestones */}
      <section className="space-y-4">
        <h3 className="font-serif italic text-2xl">{currentMember.name}’s Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map((b) => {
            const Icon = b.Icon;
            return (
              <Surface
                key={b.id}
                variant={b.unlocked ? 'secondary' : 'ambient'}
                className={`p-4 flex items-center gap-3 ${b.unlocked ? '' : 'opacity-40'}`}
              >
                <Icon weight={b.unlocked ? 'duotone' : 'regular'} className="w-6 h-6 shrink-0" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-xs font-semibold">{b.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{b.desc}</p>
                </div>
              </Surface>
            );
          })}
        </div>
      </section>
    </div>
  );
};
