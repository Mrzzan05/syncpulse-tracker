import React, { useState } from 'react';
import {
  Play, Pause, ArrowCounterClockwise, Check, CloudRain, TreeEvergreen,
  Waveform, SpeakerSlash, Smiley, SmileyMeh, Fire
} from '@phosphor-icons/react';
import { AmbientSound, GoalItem, Member, SessionFeeling } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { TimerMode } from './useFocusTimer';

interface Props {
  currentMember: Member;
  companions: Member[];
  userGoals: GoalItem[];
  selectedGoalId: string;
  onSelectGoal: (id: string) => void;
  timer: {
    mode: TimerMode;
    isRunning: boolean;
    displaySeconds: number;
    elapsedMinutes: number;
    toggle: () => void;
    reset: (m?: TimerMode) => void;
  };
  ambientMode: AmbientSound;
  onChangeAmbient: (m: AmbientSound) => void;
  onCompleteSession: (mins: number, feeling: SessionFeeling) => void;
}

export const FocusRoomView: React.FC<Props> = ({
  currentMember,
  companions,
  userGoals,
  selectedGoalId,
  onSelectGoal,
  timer,
  ambientMode,
  onChangeAmbient,
  onCompleteSession
}) => {
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const canLog = timer.elapsedMinutes >= 1 && timer.mode !== 'break';

  const handleFinishClick = () => {
    if (!canLog) return;
    setShowReflection(true);
  };

  const confirmSessionReflection = (feeling: SessionFeeling) => {
    onCompleteSession(timer.elapsedMinutes, feeling);
    setShowReflection(false);
  };

  const activeGoal = userGoals.find((g) => g.id === selectedGoalId) || userGoals[0];

  return (
    <div className="space-y-8 py-2">
      {/* Header & Live Pulse */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <PulseLine
            active={timer.isRunning}
            label={timer.isRunning ? 'Deep focus in progress' : 'Sanctuary ready'}
          />
          <h2 className="font-serif italic text-3xl sm:text-4xl mt-1">
            {activeGoal ? activeGoal.title : 'Mindful Focus Room'}
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {(['pomodoro', 'stopwatch', 'break'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => timer.reset(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                timer.mode === m ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              style={timer.mode === m ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {m === 'pomodoro' ? '25m Focus' : m === 'stopwatch' ? 'Open Flow' : '5m Break'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Focus Stage */}
      <Surface variant="primary" className="p-8 sm:p-14 text-center relative overflow-hidden space-y-8">
        {timer.isRunning && (
          <div
            className="focus-halo absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--accent-soft) 0%, transparent 70%)'
            }}
          />
        )}

        <div className="relative z-10 max-w-sm mx-auto">
          <label htmlFor="focus-goal-picker" className="sr-only">Select active goal</label>
          <select
            id="focus-goal-picker"
            value={selectedGoalId}
            onChange={(e) => onSelectGoal(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl text-xs text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <option value="">Select direction to nourish...</option>
            {userGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
              </option>
            ))}
          </select>
        </div>

        {/* Giant Calm Clock */}
        <div className="relative z-10 font-mono text-7xl sm:text-8xl font-semibold tracking-tight select-none py-2">
          {String(Math.floor(timer.displaySeconds / 60)).padStart(2, '0')}:
          {String(timer.displaySeconds % 60).padStart(2, '0')}
        </div>

        {/* Controls or Post-Session Reflection */}
        {!showReflection ? (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={timer.toggle}
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-white flex items-center gap-2.5 shadow-lg transition transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {timer.isRunning ? <Pause weight="fill" className="w-5 h-5" /> : <Play weight="fill" className="w-5 h-5" />}
              <span>{timer.isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            {canLog && (
              <button
                type="button"
                onClick={handleFinishClick}
                className="px-5 py-4 rounded-2xl font-semibold text-sm border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-2 transition hover:border-[var(--accent)]"
              >
                <Check weight="bold" className="w-4 h-4" />
                <span>Complete (+{timer.elapsedMinutes}m)</span>
              </button>
            )}

            <button
              type="button"
              aria-label="Reset Timer"
              onClick={() => timer.reset()}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <ArrowCounterClockwise weight="duotone" className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative z-10 max-w-md mx-auto p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
            <p className="text-sm font-medium">
              Nice session (+{timer.elapsedMinutes}m). How did this focus feel?
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => confirmSessionReflection('hard')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <SmileyMeh weight="duotone" className="w-5 h-5 text-amber-400" />
                <span>Challenging</span>
              </button>
              <button
                type="button"
                onClick={() => confirmSessionReflection('steady')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <Smiley weight="duotone" className="w-5 h-5 text-emerald-400" />
                <span>Steady</span>
              </button>
              <button
                type="button"
                onClick={() => confirmSessionReflection('great')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <Fire weight="duotone" className="w-5 h-5 text-purple-400" />
                <span>Deep Flow</span>
              </button>
            </div>
          </div>
        )}

        {/* Ambient Soundscape Bar */}
        <div className="relative z-10 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'rain', label: 'Soft Rain', Icon: CloudRain },
            { id: 'forest', label: 'Forest Wind', Icon: TreeEvergreen },
            { id: 'tone', label: 'Warm Tone', Icon: Waveform },
            { id: 'off', label: 'Silence', Icon: SpeakerSlash }
          ].map((s) => {
            const Icon = s.Icon;
            const active = ambientMode === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeAmbient(s.id as AmbientSound)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition ${
                  active
                    ? 'text-white border-transparent'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </Surface>

      {/* Nearby Companions in the Sanctuary */}
      <Surface variant="ambient" className="p-5 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Companions in Sanctuary
        </span>
        <div className="flex flex-wrap items-center gap-4">
          {[currentMember, ...companions].map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: m.presence?.isFocusing ? '#10b981' : 'var(--text-muted)' }}
              />
              <span className="font-semibold">{m.name}:</span>
              <span className="text-[var(--text-muted)]">
                {m.presence?.isFocusing ? `Focusing (${m.presence.targetTitle})` : 'Resting'}
              </span>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
};
