import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Check, CloudRain, TreeEvergreen,
  Waveform, SpeakerSlash, ArrowLeft
} from '@phosphor-icons/react';
import { AmbientSound, GoalItem, Member, SessionFeeling } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { soundEngine } from '../../core/audio';

interface Props {
  currentMember: Member;
  companions: Member[];
  userGoals: GoalItem[];
  initialTitle: string;
  initialGoalId: string;
  ambientMode: AmbientSound;
  onChangeAmbient: (m: AmbientSound) => void;
  onPresenceChange: (isFocusing: boolean, title: string, durationPreset: number) => void;
  onCompleteSession: (goalId: string | null, title: string, mins: number, feeling: SessionFeeling) => void;
  onBackToToday: () => void;
}

// 3-Stage Focus Room (Before -> During -> After)
// Owns its own 1-second timer tick so App.tsx NEVER re-renders! (Audit Point 66, 67, 122)
export const FocusRoomPage: React.FC<Props> = ({
  currentMember,
  companions,
  userGoals,
  initialTitle,
  initialGoalId,
  ambientMode,
  onChangeAmbient,
  onPresenceChange,
  onCompleteSession,
  onBackToToday
}) => {
  const [stage, setStage] = useState<'before' | 'during' | 'after'>('before');
  const [intentionTitle, setIntentionTitle] = useState<string>(
    initialTitle || currentMember.todayIntention || userGoals[0]?.title || 'Deep Work Session'
  );
  const [selectedGoalId, setSelectedGoalId] = useState<string>(initialGoalId || userGoals[0]?.id || '');
  const [durationPreset, setDurationPreset] = useState<number>(25); // 25, 45, 90, or 0 (Open)

  // Isolated High-Frequency Timer State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [accumulatedSec, setAccumulatedSec] = useState<number>(0);
  const [displaySeconds, setDisplaySeconds] = useState<number>(25 * 60);
  const [completedMinutes, setCompletedMinutes] = useState<number>(25);

  useEffect(() => {
    if (stage !== 'during') return;
    const tick = () => {
      const activeElapsed =
        isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      const totalElapsed = accumulatedSec + activeElapsed;

      if (durationPreset === 0) {
        setDisplaySeconds(totalElapsed);
      } else {
        const targetSec = durationPreset * 60;
        const remaining = Math.max(0, targetSec - totalElapsed);
        setDisplaySeconds(remaining);
        if (remaining === 0 && isRunning) {
          setIsRunning(false);
          setStartedAtMs(null);
          setAccumulatedSec(targetSec);
          setCompletedMinutes(durationPreset);
          soundEngine.playChime();
          onPresenceChange(false, intentionTitle, durationPreset);
          setStage('after');
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [stage, isRunning, startedAtMs, accumulatedSec, durationPreset, intentionTitle, onPresenceChange]);

  const handleStartSession = () => {
    setAccumulatedSec(0);
    setDisplaySeconds(durationPreset === 0 ? 0 : durationPreset * 60);
    setStartedAtMs(Date.now());
    setIsRunning(true);
    setStage('during');
    onPresenceChange(true, intentionTitle, durationPreset || 25);
  };

  const handleTogglePause = () => {
    if (isRunning) {
      const elapsed = startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      setAccumulatedSec((prev) => prev + elapsed);
      setStartedAtMs(null);
      setIsRunning(false);
      onPresenceChange(false, intentionTitle, durationPreset);
    } else {
      setStartedAtMs(Date.now());
      setIsRunning(true);
      onPresenceChange(true, intentionTitle, durationPreset);
    }
  };

  const handleFinishEarly = () => {
    const activeElapsed =
      isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
    const totalSec = accumulatedSec + activeElapsed;
    const mins = Math.max(1, Math.round(totalSec / 60));
    setIsRunning(false);
    setStartedAtMs(null);
    setCompletedMinutes(mins);
    onPresenceChange(false, intentionTitle, durationPreset);
    setStage('after');
  };

  const handleRecordReflection = (feeling: SessionFeeling) => {
    onCompleteSession(selectedGoalId || null, intentionTitle, completedMinutes, feeling);
    setStage('before');
  };

  // ==========================================================================
  // STAGE 1: BEFORE FOCUS (DECISION)
  // ==========================================================================
  if (stage === 'before') {
    return (
      <div className="space-y-10 max-w-xl mx-auto py-4">
        <div className="space-y-2">
          <PulseLine active={false} label="Prepare your focus environment" />
          <h2 className="font-serif italic text-4xl">Enter Focus Room</h2>
        </div>

        <Surface variant="primary" className="p-7 sm:p-9 space-y-6">
          <div className="space-y-2">
            <label htmlFor="focus-intention" className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              1. What are you working on?
            </label>
            <input
              id="focus-intention"
              type="text"
              value={intentionTitle}
              onChange={(e) => setIntentionTitle(e.target.value)}
              placeholder="e.g., Write section 3 of report / Practice French"
              className="w-full rounded-2xl px-4 py-3 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>

          {userGoals.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="focus-goal" className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                2. Connected Goal Direction
              </label>
              <select
                id="focus-goal"
                value={selectedGoalId}
                onChange={(e) => {
                  setSelectedGoalId(e.target.value);
                  const g = userGoals.find((x) => x.id === e.target.value);
                  if (g && !intentionTitle.trim()) setIntentionTitle(g.title);
                }}
                className="w-full rounded-2xl px-4 py-3 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              >
                <option value="">General Focus</option>
                {userGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <span className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              3. Session Duration
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { mins: 25, label: '25 min' },
                { mins: 45, label: '45 min' },
                { mins: 90, label: '90 min' },
                { mins: 0, label: 'Open' }
              ].map((preset) => {
                const active = durationPreset === preset.mins;
                return (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => setDurationPreset(preset.mins)}
                    className={`py-3 rounded-2xl text-xs font-mono font-semibold border transition ${
                      active
                        ? 'text-white border-transparent'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                    style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            className="w-full py-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Play weight="fill" className="w-4 h-4" />
            <span>Begin Deep Focus</span>
          </button>
        </Surface>
      </div>
    );
  }

  // ==========================================================================
  // STAGE 2: DURING FOCUS (MINIMAL ZEN IMMERSION)
  // ==========================================================================
  if (stage === 'during') {
    return (
      <div className="min-h-[75vh] flex flex-col justify-between py-6 text-center">
        <div className="flex items-center justify-between">
          <PulseLine active={isRunning} label={isRunning ? 'Deep Focus' : 'Paused'} />
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              onPresenceChange(false, intentionTitle, durationPreset);
              setStage('before');
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change setup
          </button>
        </div>

        <div className="my-auto py-12 space-y-8 relative">
          <div className="space-y-2">
            <p className="font-serif italic text-2xl sm:text-3xl text-[var(--text-muted)]">
              {intentionTitle}
            </p>
          </div>

          <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-semibold tracking-tight select-none">
            {String(Math.floor(displaySeconds / 60)).padStart(2, '0')}:
            {String(displaySeconds % 60).padStart(2, '0')}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleTogglePause}
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-white flex items-center gap-2 shadow-lg"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {isRunning ? <Pause weight="fill" className="w-4 h-4" /> : <Play weight="fill" className="w-4 h-4" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              type="button"
              onClick={handleFinishEarly}
              className="px-5 py-4 rounded-2xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-1.5"
            >
              <Check weight="bold" className="w-4 h-4" />
              <span>Complete Session</span>
            </button>
          </div>
        </div>

        {/* Minimal Ambient Controls & Shared Presence */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'rain', label: 'Rain', Icon: CloudRain },
              { id: 'forest', label: 'Forest', Icon: TreeEvergreen },
              { id: 'tone', label: 'Tone', Icon: Waveform },
              { id: 'off', label: 'Mute', Icon: SpeakerSlash }
            ].map((s) => {
              const Icon = s.Icon;
              const active = ambientMode === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onChangeAmbient(s.id as AmbientSound)}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition ${
                    active
                      ? 'text-white border-transparent'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  <Icon weight="duotone" className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            {companions.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.presence?.isFocusing ? '#10b981' : 'var(--text-muted)' }}
                />
                <span>{c.name}: {c.presence?.isFocusing ? 'Focusing' : 'Resting'}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STAGE 3: AFTER FOCUS (REFLECTION)
  // ==========================================================================
  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-8">
      <Surface variant="primary" className="p-8 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-500">
            Session Complete
          </span>
          <h2 className="font-serif italic text-4xl">
            {completedMinutes} minutes focused
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Nice. One meaningful step forward on "{intentionTitle}".
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium">How did this session feel?</p>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'easy', label: 'Easy & Clear' },
              { id: 'normal', label: 'Steady' },
              { id: 'hard', label: 'Challenging' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleRecordReflection(opt.id as SessionFeeling)}
                className="py-3 px-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-semibold hover:border-[var(--accent)] transition"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToToday}
          className="text-xs text-[var(--text-muted)] hover:underline pt-2 block mx-auto"
        >
          Return to Today’s Rhythm
        </button>
      </Surface>
    </div>
  );
};
