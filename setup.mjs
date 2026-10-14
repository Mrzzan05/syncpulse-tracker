// setup.mjs - SyncPulse v8.0 (Production-Ready Architecture: Isolated Timer, 3-Stage Focus Room, Repository Layer, Lazy Loading & Insights)
// Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'src/types.ts': `export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';
export type SessionFeeling = 'easy' | 'normal' | 'hard';
export type AmbientSound = 'off' | 'rain' | 'forest' | 'tone';

export interface ActivePresence {
  isFocusing: boolean;
  targetTitle: string;
  durationPreset: number;
  startedAtMs: number;
}

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
  todayIntention?: string;
  presence?: ActivePresence | null;
}

export interface ScheduleItem {
  id: string;
  userId: string;
  day: string;
  title: string;
  startTime: string;
  endTime: string;
  details: string;
  category: 'Core' | 'Lab' | 'General' | 'Language' | 'University';
  attendedDates: string[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'Short-Term' | 'Long-Term' | 'Habit' | 'Career';
  targetHours: number;
  loggedMinutes: number;
  deadline: string;
  milestones: GoalMilestone[];
}

export interface TaskItem {
  id: string;
  userId: string;
  goalId?: string; // Links action directly to a Goal/Direction
  day: string;
  title: string;
  reminderTime: string;
  completed: boolean;
  estimatedMinutes: number;
  createdAt: string;
}

export interface ExamItem {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  professor: string;
  type: 'Core' | 'General' | 'Language';
}

export interface TimeLog {
  id: string;
  sourceKey?: string;
  userId: string;
  goalId?: string;
  targetTitle: string;
  minutes: number;
  date: string;
  createdAtMs: number;
  feeling?: SessionFeeling;
  cheeredBy: string[];
}

export interface AppState {
  version: number;
  isConfigured: boolean;
  workspaceName: string;
  roomCode: string;
  lastUpdatedMs: number;
  members: Member[];
  schedules: ScheduleItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  exams: ExamItem[];
  logs: TimeLog[];
}
`,

  'src/core/insights.ts': `import { TimeLog } from '../types';
import { getLocalDateStr } from './utils';

export interface RhythmInsights {
  bestTimeOfDay: string;
  consistencyText: string;
  avgSessionMins: number;
  thisWeekSessions: number;
  thisWeekMinutes: number;
}

// Turns raw logs into human-centric self-understanding insights (Audit Point 84 & 124)
export function computeRhythmInsights(logs: TimeLog[], userId: string, streak: number): RhythmInsights {
  const userLogs = logs.filter((l) => l.userId === userId && l.minutes > 0);

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  const weekAgoStr = getLocalDateStr(weekAgo);

  const weekLogs = userLogs.filter((l) => l.date >= weekAgoStr);
  const thisWeekSessions = weekLogs.length;
  const thisWeekMinutes = weekLogs.reduce((a, b) => a + b.minutes, 0);

  const avgSessionMins =
    userLogs.length > 0
      ? Math.round(userLogs.reduce((a, b) => a + b.minutes, 0) / userLogs.length)
      : 0;

  // Analyze time-of-day buckets
  let morning = 0;
  let afternoon = 0;
  let night = 0;

  userLogs.forEach((l) => {
    const hr = new Date(l.createdAtMs).getHours();
    if (hr >= 5 && hr < 12) morning += l.minutes;
    else if (hr >= 12 && hr < 18) afternoon += l.minutes;
    else night += l.minutes;
  });

  let bestTimeOfDay = 'Building your baseline rhythm';
  if (userLogs.length > 0) {
    if (night >= morning && night >= afternoon) bestTimeOfDay = 'You focus deepest in the evening & night';
    else if (morning >= afternoon) bestTimeOfDay = 'Your sharpest focus happens in the morning';
    else bestTimeOfDay = 'You find your strongest flow in the afternoon';
  }

  const consistencyText =
    streak >= 7
      ? \`\${streak} days of steady rhythm — a true habit is forming\`
      : streak >= 3
      ? \`\${streak} days building your rhythm consistently\`
      : streak >= 1
      ? \`You showed up today — small steps build momentum\`
      : 'Your first focused moment today starts the rhythm';

  return {
    bestTimeOfDay,
    consistencyText,
    avgSessionMins,
    thisWeekSessions,
    thisWeekMinutes
  };
}
`,

  'src/core/repository.ts': `import { AppState } from '../types';
import { INITIAL_STATE } from '../initialData';
import { getTodayWeekday } from './utils';

const STORAGE_KEY = 'syncpulse_v8';

export type SyncStatus = {
  state: 'local' | 'syncing' | 'synced' | 'offline';
  lastSyncedAtMs: number | null;
};

export const migrateState = (raw: any): AppState => {
  if (!raw || !Array.isArray(raw.members) || raw.members.length === 0) {
    return INITIAL_STATE;
  }
  const todayDay = getTodayWeekday();
  return {
    version: 8,
    isConfigured: raw.isConfigured !== undefined ? Boolean(raw.isConfigured) : true,
    workspaceName: raw.workspaceName || 'Sanctuary',
    roomCode: raw.roomCode || 'mr-1405',
    lastUpdatedMs: raw.lastUpdatedMs || Date.now(),
    members: raw.members,
    schedules: Array.isArray(raw.schedules) ? raw.schedules : [],
    goals: Array.isArray(raw.goals)
      ? raw.goals.map((g: any) => ({
          ...g,
          targetHours: Math.max(1, Number(g.targetHours) || 10),
          milestones: Array.isArray(g.milestones) ? g.milestones : []
        }))
      : [],
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.map((t: any) => ({ ...t, day: t.day || todayDay }))
      : [],
    exams: Array.isArray(raw.exams) ? raw.exams : [],
    logs: Array.isArray(raw.logs)
      ? raw.logs.map((l: any) => ({
          ...l,
          createdAtMs: l.createdAtMs || Date.now(),
          cheeredBy: Array.isArray(l.cheeredBy) ? l.cheeredBy : []
        }))
      : []
  };
};

// Local-First Storage Repository Adapter (Audit Point 70, 71, 135, 153)
class SanctuaryRepository {
  public loadLocal(): AppState {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('syncpulse_v7') ||
      localStorage.getItem('syncpulse_v6');
    if (raw) {
      try {
        return migrateState(JSON.parse(raw));
      } catch {}
    }
    return INITIAL_STATE;
  }

  public saveLocal(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  public buildEndpoint(baseUrl: string, roomCode: string): string {
    const safeRoom = (roomCode || 'mr-1405')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const trimmed = baseUrl.trim().replace(/\\/$/, '').replace(/\\.json$/, '');
    return \`\${trimmed}/sanctuaries/\${safeRoom}.json\`;
  }

  public async pushRemote(baseUrl: string, state: AppState): Promise<boolean> {
    if (!baseUrl || !state.isConfigured) return false;
    try {
      const endpoint = this.buildEndpoint(baseUrl, state.roomCode);
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async pullRemote(baseUrl: string, roomCode: string): Promise<AppState | null> {
    if (!baseUrl || !roomCode) return null;
    try {
      const endpoint = this.buildEndpoint(baseUrl, roomCode);
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.members)) {
        return migrateState(data);
      }
      return null;
    } catch {
      return null;
    }
  }

  public exportJSONFile(state: AppState, dateStr: string): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = \`syncpulse-\${state.roomCode}-\${dateStr}.json\`;
    a.click();
  }
}

export const repository = new SanctuaryRepository();
`,

  'src/components/ui/Primitives.tsx': `import React from 'react';
import { X } from '@phosphor-icons/react';

export interface SurfaceProps {
  variant?: 'primary' | 'secondary' | 'ambient';
  className?: string;
  children: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  variant = 'secondary',
  className = '',
  children
}) => {
  const styles = {
    primary: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg',
    secondary: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
    ambient: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
  };
  return (
    <div className={\`rounded-3xl transition-colors duration-200 \${styles[variant]} \${className}\`}>
      {children}
    </div>
  );
};

// Signature SyncPulse visual element: ●──────●──────●
export const PulseLine: React.FC<{ active?: boolean; label?: string }> = ({ active = false, label }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-transform"
          style={{
            backgroundColor: active ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: active ? '0 0 10px var(--accent)' : 'none'
          }}
        />
        <div className="h-[2px] flex-1 bg-[var(--track-bg)] overflow-hidden relative rounded-full">
          {active && (
            <div
              className="absolute inset-y-0 w-1/2 pulse-wave-bar rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
        </div>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: active ? 'var(--accent)' : 'var(--border-subtle)' }}
        />
      </div>
      {label && (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
};

// Calm Skeleton Loader (Audit Point 60 & 129: "Syncing your rhythm... ●━━━○━━━○")
export const RhythmSkeleton: React.FC = () => (
  <div className="py-16 space-y-6 max-w-md mx-auto text-center animate-pulse">
    <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-muted)]">
      <span>Syncing your rhythm...</span>
      <span>●━━━○━━━○</span>
    </div>
    <div className="h-8 bg-[var(--bg-elevated)] rounded-2xl w-3/4 mx-auto" />
    <div className="h-32 bg-[var(--bg-surface)] rounded-3xl w-full border border-[var(--border-subtle)]" />
  </div>
);

export const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic text-2xl">{title}</h3>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
`,

  'src/features/today/TodayPage.tsx': `import React, { useState, useMemo } from 'react';
import {
  Play, CheckCircle, Circle, Plus, Trash, ArrowRight
} from '@phosphor-icons/react';
import { AppState, Member, ScheduleItem, TaskItem } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { DAYS, getTimeOfDayGreeting, toMins, getLocalDateStr } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  todayMins: number;
  streak: number;
  thisWeekSessions: number;
  realTodayName: string;
  onUpdateIntention: (text: string) => void;
  onStartFocusWithTarget: (title: string, goalId?: string) => void;
  onToggleClass: (sched: ScheduleItem) => void;
  onToggleTask: (task: TaskItem) => void;
  onAddTask: (day: string, title: string, time: string, mins: number, goalId?: string) => void;
  onDeleteTask: (task: TaskItem) => void;
}

export const TodayPage: React.FC<Props> = ({
  state,
  currentMember,
  todayMins,
  streak,
  thisWeekSessions,
  realTodayName,
  onUpdateIntention,
  onStartFocusWithTarget,
  onToggleClass,
  onToggleTask,
  onAddTask,
  onDeleteTask
}) => {
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('17:00');
  const [newTaskMins, setNewTaskMins] = useState(45);
  const [newTaskGoalId, setNewTaskGoalId] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string>('');

  const todayStr = getLocalDateStr();
  const userGoals = state.goals.filter((g) => g.userId === currentMember.id);
  const primaryGoal = userGoals[0];

  const dailyStream = useMemo(() => {
    const dayClasses = state.schedules.filter(
      (s) => s.userId === currentMember.id && s.day === timelineDay
    );
    const dayTasks = state.tasks.filter(
      (t) => t.userId === currentMember.id && t.day === timelineDay
    );

    const items: any[] = [];
    dayClasses.forEach((c) => {
      const sM = toMins(c.startTime);
      const eM = Math.max(sM + 30, toMins(c.endTime));
      items.push({
        id: c.id,
        kind: 'class',
        title: c.title,
        subtitle: c.details,
        startMins: sM,
        startTime: c.startTime,
        durationMins: eM - sM,
        completed: c.attendedDates.includes(todayStr),
        rawClass: c
      });
    });

    dayTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const linkedGoal = userGoals.find((g) => g.id === t.goalId);
      items.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: linkedGoal
          ? \`→ \${linkedGoal.title} • ≈ \${t.estimatedMinutes}m\`
          : \`≈ \${t.estimatedMinutes} min intention\`,
        startMins: sM,
        startTime: t.reminderTime,
        durationMins: t.estimatedMinutes || 30,
        completed: t.completed,
        goalId: t.goalId,
        rawTask: t
      });
    });

    items.sort((a, b) => a.startMins - b.startMins);
    return items;
  }, [state.schedules, state.tasks, currentMember.id, timelineDay, todayStr, userGoals]);

  const nextAction = dailyStream.find((item) => !item.completed);
  const companionsFocusing = state.members.filter(
    (m) => m.id !== currentMember.id && m.presence?.isFocusing
  );

  const showMicroFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 2600);
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(
      timelineDay,
      newTaskTitle.trim(),
      newTaskTime,
      newTaskMins,
      newTaskGoalId || primaryGoal?.id
    );
    setNewTaskTitle('');
    showMicroFeedback('Intention added to your rhythm.');
  };

  return (
    <div className="space-y-12">
      {/* 1. Primary Greeting & Intention (Audit Point 51 & 120) */}
      <section className="space-y-3">
        <PulseLine
          active={Boolean(currentMember.presence?.isFocusing) || companionsFocusing.length > 0}
          label={
            companionsFocusing.length > 0
              ? \`\${companionsFocusing.map((c) => c.name).join(' & ')} focusing nearby\`
              : todayMins > 0
              ? \`\${Math.floor(todayMins / 60)}h \${todayMins % 60}m focused today\`
              : 'Your sanctuary is quiet'
          }
        />

        <h2 className="font-serif italic text-4xl sm:text-5xl tracking-tight pt-1">
          {getTimeOfDayGreeting()}, {currentMember.name}.
        </h2>

        <div className="pt-1">
          <label htmlFor="daily-intention-input" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
            Today’s Primary Intention
          </label>
          <input
            id="daily-intention-input"
            type="text"
            value={currentMember.todayIntention || ''}
            onChange={(e) => onUpdateIntention(e.target.value)}
            placeholder={
              nextAction
                ? \`Move "\${nextAction.title}" forward...\`
                : primaryGoal
                ? \`Make progress on \${primaryGoal.title}...\`
                : 'What single thing matters most today?'
            }
            className="w-full bg-transparent text-lg sm:text-xl font-medium border-b border-[var(--border-subtle)] focus:border-[var(--accent)] pb-2 focus:outline-none placeholder:opacity-50"
          />
        </div>
      </section>

      {/* 2. Primary Surface: Next Meaningful Action -> Enter Focus Room */}
      <Surface variant="primary" className="p-7 sm:p-9">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Next Meaningful Step
            </span>
            <h3 className="font-serif italic text-2xl sm:text-3xl">
              {currentMember.todayIntention?.trim() ||
                nextAction?.title ||
                primaryGoal?.title ||
                'Deep Focus Session'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {nextAction
                ? \`Scheduled for \${nextAction.startTime} (≈ \${nextAction.durationMins}m)\`
                : '25m, 45m, or 90m distraction-free focus session'}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartFocusWithTarget(
                currentMember.todayIntention?.trim() ||
                  nextAction?.title ||
                  primaryGoal?.title ||
                  'Deep Focus',
                nextAction?.goalId || primaryGoal?.id
              )
            }
            className="px-6 py-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2.5 shadow-md transition transform hover:scale-[1.02] shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Play weight="fill" className="w-4 h-4" />
            <span>Start Focus</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </Surface>

      {/* 3. Open Canvas: Today's Rhythm (No heavy card boxes per item - Audit Point 163) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-serif italic text-2xl">Today’s Rhythm</h3>
            {feedbackToast && (
              <span className="text-xs font-mono text-emerald-500 transition-opacity">
                {feedbackToast}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {DAYS.map((d) => {
              const active = d === timelineDay;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTimelineDay(d)}
                  className={\`px-2.5 py-1 rounded-lg text-xs font-medium transition \${
                    active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }\`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  {d.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)]">
          {dailyStream.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-sm font-medium">Your space is clear on {timelineDay}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Add an intention below or step straight into the Focus Room.
              </p>
            </div>
          ) : (
            dailyStream.map((entry) => (
              <div
                key={entry.id}
                className="py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    aria-label={\`Complete \${entry.title}\`}
                    onClick={() => {
                      if (entry.kind === 'class' && entry.rawClass) {
                        onToggleClass(entry.rawClass);
                      } else if (entry.kind === 'task' && entry.rawTask) {
                        onToggleTask(entry.rawTask);
                      }
                      if (!entry.completed) showMicroFeedback('Nice. One step forward.');
                    }}
                    className="shrink-0"
                  >
                    {entry.completed ? (
                      <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle weight="duotone" className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={\`text-sm font-medium truncate \${entry.completed ? 'line-through opacity-50' : ''}\`}>
                      {entry.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{entry.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-[var(--text-muted)]">{entry.startTime}</span>
                  {entry.kind === 'task' && entry.rawTask && (
                    <button
                      type="button"
                      aria-label={\`Remove \${entry.title}\`}
                      onClick={() => onDeleteTask(entry.rawTask!)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-rose-400 transition"
                    >
                      <Trash weight="duotone" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Lightweight Intention Composer Linked to Goal */}
          <form onSubmit={handleSubmitTask} className="py-3.5 flex flex-wrap items-center gap-2.5">
            <Plus weight="bold" className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={\`Add an action for \${timelineDay}...\`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[150px] bg-transparent text-xs py-1 focus:outline-none"
            />
            {userGoals.length > 0 && (
              <select
                value={newTaskGoalId}
                onChange={(e) => setNewTaskGoalId(e.target.value)}
                className="text-xs bg-transparent text-[var(--text-muted)] max-w-[140px] truncate"
                title="Link to Goal"
              >
                <option value="">→ Link Goal</option>
                {userGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="text-xs font-mono bg-transparent text-[var(--text-muted)]"
            />
            <select
              value={newTaskMins}
              onChange={(e) => setNewTaskMins(Number(e.target.value))}
              className="text-xs font-mono bg-transparent text-[var(--text-muted)]"
            >
              <option value={25}>≈ 25m</option>
              <option value={45}>≈ 45m</option>
              <option value={60}>≈ 60m</option>
              <option value={90}>≈ 90m</option>
            </select>
            {newTaskTitle.trim() && (
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Add
              </button>
            )}
          </form>
        </div>
      </section>

      {/* 4. Supporting Quiet Footer: Rhythm Summary */}
      <footer className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
        <span>
          {streak > 0
            ? \`\${streak} days building your rhythm\`
            : 'Start a session today to begin your rhythm'}
        </span>
        <span className="font-mono">
          {thisWeekSessions} focused {thisWeekSessions === 1 ? 'session' : 'sessions'} this week
        </span>
      </footer>
    </div>
  );
};
`,

  'src/features/focus/FocusRoomPage.tsx': `import React, { useState, useEffect } from 'react';
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
                    className={\`py-3 rounded-2xl text-xs font-mono font-semibold border transition \${
                      active
                        ? 'text-white border-transparent'
                        : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }\`}
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
                  className={\`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition \${
                    active
                      ? 'text-white border-transparent'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }\`}
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
`,

  'src/features/journey/JourneyPage.tsx': `import React, { useState } from 'react';
import {
  Plus, PencilSimple, Trash, CheckCircle, Circle, CaretDown, CaretUp,
  ListChecks, X, Sparkle
} from '@phosphor-icons/react';
import { AppState, ExamItem, GoalItem, Member, ScheduleItem } from '../../types';
import { Surface } from '../../components/ui/Primitives';
import { DAYS, getLocalDateStr, getTodayWeekday } from '../../core/utils';
import { RhythmInsights } from '../../core/insights';

interface Props {
  state: AppState;
  currentMember: Member;
  insights: RhythmInsights;
  onOpenNewGoal: () => void;
  onOpenEditGoal: (g: GoalItem) => void;
  onDeleteGoal: (g: GoalItem) => void;
  onLogGoalMinutes: (goalId: string, title: string, mins: number) => void;
  onAddMilestone: (goalId: string, title: string) => void;
  onToggleMilestone: (goalId: string, msId: string) => void;
  onDeleteMilestone: (goalId: string, msId: string) => void;
  onOpenAddClass: (day: string) => void;
  onDeleteClass: (item: ScheduleItem) => void;
  onOpenAddExam: () => void;
  onDeleteExam: (ex: ExamItem) => void;
}

export const JourneyPage: React.FC<Props> = ({
  state,
  currentMember,
  insights,
  onOpenNewGoal,
  onOpenEditGoal,
  onDeleteGoal,
  onLogGoalMinutes,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
  onOpenAddClass,
  onDeleteClass,
  onOpenAddExam,
  onDeleteExam
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(getTodayWeekday());
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [milestoneInputs, setMilestoneInputs] = useState<Record<string, string>>({});

  const todayStr = getLocalDateStr();
  const userGoals = state.goals.filter((g) => g.userId === currentMember.id);

  return (
    <div className="space-y-12">
      {/* 1. Self-Understanding Insights (Audit Point 84 & 124: Insight > Raw Statistics) */}
      <section className="space-y-4">
        <h2 className="font-serif italic text-3xl sm:text-4xl">Your Rhythm & Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Surface variant="ambient" className="p-5 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
              <Sparkle weight="fill" className="w-3 h-3" style={{ color: 'var(--accent)' }} />
              Focus Pattern
            </span>
            <p className="text-xs font-medium leading-relaxed pt-1">{insights.bestTimeOfDay}</p>
          </Surface>

          <Surface variant="ambient" className="p-5 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
              Consistency
            </span>
            <p className="text-xs font-medium leading-relaxed pt-1">{insights.consistencyText}</p>
          </Surface>

          <Surface variant="ambient" className="p-5 space-y-1">
            <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
              This Week’s Depth
            </span>
            <p className="text-xs font-medium leading-relaxed pt-1">
              {insights.thisWeekSessions} sessions ({Math.floor(insights.thisWeekMinutes / 60)}h {insights.thisWeekMinutes % 60}m)
              {insights.avgSessionMins > 0 ? \` • Avg \${insights.avgSessionMins}m\` : ''}
            </p>
          </Surface>
        </div>
      </section>

      {/* 2. Long-Term Directions (Goals Connected to Daily Actions) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif italic text-2xl">Directions & Goals</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Every focus session and linked task moves these forward
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-white flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus weight="bold" className="w-3.5 h-3.5" /> New Goal
          </button>
        </div>

        <div className="space-y-4">
          {userGoals.map((g) => {
            const safeTarget = Math.max(1, g.targetHours);
            const hrs = +(g.loggedMinutes / 60).toFixed(1);
            const pct = Math.min(100, Math.round((hrs / safeTarget) * 100));
            const todayContribution = state.logs
              .filter((l) => l.userId === currentMember.id && l.date === todayStr && (l.goalId === g.id || l.targetTitle === g.title))
              .reduce((a, b) => a + b.minutes, 0);

            const milestones = g.milestones || [];
            const nextMilestone = milestones.find((m) => !m.completed);
            const isExpanded = Boolean(expandedGoals[g.id]);

            return (
              <Surface key={g.id} variant="secondary" className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        {g.category}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{g.deadline}</span>
                      {todayContribution > 0 && (
                        <span className="text-xs font-mono text-emerald-500">
                          +{todayContribution}m today
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-base mt-2">{g.title}</h4>
                    {nextMilestone && !isExpanded && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Next milestone: <span className="text-[var(--text-main)]">{nextMilestone.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <PencilSimple weight="duotone" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400"
                    >
                      <Trash weight="duotone" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>
                      {hrs}h <span className="text-[var(--text-muted)]">of {safeTarget}h ({pct}%)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[25, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => onLogGoalMinutes(g.id, g.title, mins)}
                          className="px-2.5 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px]"
                        >
                          +{mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--track-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: \`\${pct}%\`, backgroundColor: 'var(--accent)' }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setExpandedGoals((p) => ({ ...p, [g.id]: !p[g.id] }))}
                    className="text-xs flex items-center justify-between w-full text-[var(--text-muted)]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListChecks weight="duotone" className="w-4 h-4" />
                      <span>Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})</span>
                    </span>
                    {isExpanded ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      {milestones.map((ms) => (
                        <div key={ms.id} className="flex items-center justify-between gap-2 text-xs py-1">
                          <button
                            type="button"
                            onClick={() => onToggleMilestone(g.id, ms.id)}
                            className="flex items-center gap-2.5 text-left flex-1"
                          >
                            {ms.completed ? (
                              <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle weight="duotone" className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                            )}
                            <span className={ms.completed ? 'line-through opacity-50' : ''}>{ms.title}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMilestone(g.id, ms.id)}
                            className="opacity-40 hover:opacity-100 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add milestone step..."
                          value={milestoneInputs[g.id] || ''}
                          onChange={(e) => setMilestoneInputs((p) => ({ ...p, [g.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (milestoneInputs[g.id] || '').trim()) {
                              e.preventDefault();
                              onAddMilestone(g.id, milestoneInputs[g.id]);
                              setMilestoneInputs((p) => ({ ...p, [g.id]: '' }));
                            }
                          }}
                          className="flex-1 rounded-xl px-3 py-1.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if ((milestoneInputs[g.id] || '').trim()) {
                              onAddMilestone(g.id, milestoneInputs[g.id]);
                              setMilestoneInputs((p) => ({ ...p, [g.id]: '' }));
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Surface>
            );
          })}
        </div>
      </section>

      {/* 3. Weekly Class Context & Exams */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif italic text-2xl">Weekly Class Context</h3>
          <button
            type="button"
            onClick={() => onOpenAddClass(selectedDay)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-1"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" /> Add Class
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DAYS.map((day) => {
            const active = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={\`px-3 py-1.5 rounded-xl text-xs font-medium transition \${
                  active ? 'text-white' : 'text-[var(--text-muted)]'
                }\`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)]">
          {state.schedules
            .filter((s) => s.userId === currentMember.id && s.day === selectedDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime)).length === 0 ? (
            <p className="text-xs py-6 text-center text-[var(--text-muted)]">
              No classes scheduled on {selectedDay}.
            </p>
          ) : (
            state.schedules
              .filter((s) => s.userId === currentMember.id && s.day === selectedDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.details}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                      {item.startTime} – {item.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteClass(item)}
                      className="p-1 text-[var(--text-muted)] hover:text-rose-400"
                    >
                      <Trash weight="duotone" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic text-2xl">Upcoming Exams</h3>
          <button
            type="button"
            onClick={onOpenAddExam}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-1"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" /> Add Exam
          </button>
        </div>

        <div className="divide-y divide-[var(--border-subtle)] border-t border-b border-[var(--border-subtle)]">
          {state.exams.filter((ex) => ex.userId === currentMember.id).length === 0 ? (
            <p className="text-xs py-6 text-center text-[var(--text-muted)]">
              No upcoming exams listed for {currentMember.name}.
            </p>
          ) : (
            state.exams
              .filter((ex) => ex.userId === currentMember.id)
              .map((ex) => (
                <div key={ex.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{ex.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{ex.professor}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono text-xs">
                      <span className="font-semibold block" style={{ color: 'var(--accent)' }}>{ex.date}</span>
                      <span className="text-[var(--text-muted)]">{ex.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteExam(ex)}
                      className="p-1 text-[var(--text-muted)] hover:text-rose-400"
                    >
                      <Trash weight="duotone" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};
export default JourneyPage;
`,

  'src/features/sanctuary/SanctuaryPage.tsx': `import React, { useState } from 'react';
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
          label={activeCount > 0 ? \`\${activeCount} focusing in sanctuary\` : 'Shared space at rest'}
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
                        ? \`Focusing on \${m.presence?.targetTitle}\`
                        : stat?.streak
                        ? \`\${stat.streak} days building rhythm\`
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
                    className={\`h-7 rounded-lg border transition flex items-center justify-center text-[10px] font-mono \${mTokens.heatLevels[cell.level]}\`}
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
              const link = \`\${window.location.origin}\${window.location.pathname}?room=\${state.roomCode}\`;
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
`,

  'src/App.tsx': `import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  Compass, Timer, Target, UsersThree, SunDim, MoonStars,
  CloudCheck, CloudSlash, Plus, PencilSimple, Key
} from '@phosphor-icons/react';
import {
  AmbientSound, AppState, GoalItem, Member, SessionFeeling, TaskItem, ThemePalette, TimeLog
} from './types';
import {
  DEFAULT_CLOUD_DB_URL, CREATE_CUSTOM_SANCTUARY, CREATE_MEHRSAN_RONAK_PRESET
} from './initialData';
import { repository, migrateState } from './core/repository';
import { DAYS, getLocalDateStr, getTodayWeekday, uid, toMins } from './core/utils';
import { computeRhythmInsights } from './core/insights';
import { soundEngine } from './core/audio';
import { GET_THEME_TOKENS } from './theme/tokens';
import { Modal, RhythmSkeleton } from './components/ui/Primitives';
import { TodayPage } from './features/today/TodayPage';
import { FocusRoomPage } from './features/focus/FocusRoomPage';

// Lazy-loaded secondary views for optimal initial bundle size (Audit Point 68 & 69)
const JourneyPage = lazy(() => import('./features/journey/JourneyPage'));
const SanctuaryPage = lazy(() => import('./features/sanctuary/SanctuaryPage'));

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlRoom = urlParams.get('room');
  const urlDb = urlParams.get('db');

  const [syncUrl, setSyncUrl] = useState<string>(() => {
    if (urlDb) {
      localStorage.setItem('syncpulse_cloud_url', urlDb.trim());
      return urlDb.trim();
    }
    return localStorage.getItem('syncpulse_cloud_url') || DEFAULT_CLOUD_DB_URL;
  });

  const [state, setState] = useState<AppState>(() => {
    if (urlRoom) {
      const code = urlRoom.trim().toLowerCase();
      if (code === 'mr-1405' || code === 'mehrsan-ronak') {
        return CREATE_MEHRSAN_RONAK_PRESET('mr-1405');
      }
    }
    return repository.loadLocal();
  });

  useEffect(() => {
    if (urlRoom || urlDb) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [urlRoom, urlDb]);

  const [activeUser, setActiveUser] = useState<string>(() => state.members[0]?.id || 'mehrsan');
  const [isLatteMode, setIsLatteMode] = useState<boolean>(() => localStorage.getItem('syncpulse_latte') === 'true');
  const [activeView, setActiveView] = useState<'today' | 'focus' | 'journey' | 'sanctuary'>('today');
  const [focusTarget, setFocusTarget] = useState<{ title: string; goalId: string }>({ title: '', goalId: '' });
  const [ambientMode, setAmbientMode] = useState<AmbientSound>('off');
  const [syncState, setSyncState] = useState<'local' | 'synced' | 'offline'>('local');

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !state.isConfigured);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Forms
  const [quickIntention, setQuickIntention] = useState('');
  const [roomInput, setRoomInput] = useState('mr-1405');
  const [goalForm, setGoalForm] = useState({ title: '', category: 'Long-Term' as GoalItem['category'], targetHours: 50, deadline: 'Ongoing' });
  const [classForm, setClassForm] = useState({ day: getTodayWeekday(), title: '', startTime: '08:30', endTime: '10:30', details: '' });
  const [examForm, setExamForm] = useState({ title: '', date: '1405/11/01', time: '10:00', professor: '' });
  const [memberForm, setMemberForm] = useState({ name: '', tagline: '', theme: 'warm-sage' as ThemePalette });

  const currentMember = state.members.find((m) => m.id === activeUser) || state.members[0];
  const themeTokens = useMemo(
    () => GET_THEME_TOKENS(currentMember?.theme || 'warm-sage', isLatteMode),
    [currentMember?.theme, isLatteMode]
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeTokens.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem('syncpulse_latte', String(isLatteMode));
  }, [themeTokens, isLatteMode]);

  useEffect(() => {
    repository.saveLocal(state);
  }, [state]);

  const syncTimeoutRef = useRef<any>(null);
  const commitState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = { ...updater(prev), lastUpdatedMs: Date.now() };
        if (syncUrl && next.isConfigured) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(async () => {
            const ok = await repository.pushRemote(syncUrl, next);
            setSyncState(ok ? 'synced' : 'offline');
          }, 180);
        }
        return next;
      });
    },
    [syncUrl]
  );

  // Live SSE & Polling via Repository
  useEffect(() => {
    if (!syncUrl || !state.isConfigured) return;
    const endpoint = repository.buildEndpoint(syncUrl, state.roomCode);

    repository.pullRemote(syncUrl, state.roomCode).then((remote) => {
      if (remote) {
        setState((local) => (remote.lastUpdatedMs >= local.lastUpdatedMs ? remote : local));
        setSyncState('synced');
      } else {
        repository.pushRemote(syncUrl, state).then((ok) => setSyncState(ok ? 'synced' : 'offline'));
      }
    });

    let es: EventSource | null = null;
    try {
      es = new EventSource(endpoint);
      es.addEventListener('put', (e: any) => {
        try {
          const packet = JSON.parse(e.data);
          if (packet?.data?.members) {
            setState((local) =>
              (packet.data.lastUpdatedMs || 0) > (local.lastUpdatedMs || 0)
                ? migrateState(packet.data)
                : local
            );
            setSyncState('synced');
          }
        } catch {}
      });
    } catch {}

    const poll = setInterval(async () => {
      const remote = await repository.pullRemote(syncUrl, state.roomCode);
      if (remote) {
        setState((local) => (remote.lastUpdatedMs > local.lastUpdatedMs ? remote : local));
        setSyncState('synced');
      }
    }, 6000);

    return () => {
      if (es) es.close();
      clearInterval(poll);
    };
  }, [syncUrl, state.roomCode, state.isConfigured]);

  const todayStr = getLocalDateStr();

  const logSessionMinutes = (goalId: string | null, title: string, minutes: number, feeling?: SessionFeeling) => {
    if (minutes <= 0) return;
    // Dynamic lazy import of canvas-confetti only on completion (Audit Point 68)
    import('canvas-confetti').then((mod) => {
      mod.default({ particleCount: 28, spread: 50, origin: { y: 0.85 } });
    }).catch(() => {});

    const newLog: TimeLog = {
      id: uid('log'),
      userId: activeUser,
      goalId: goalId || undefined,
      targetTitle: title,
      minutes,
      date: todayStr,
      createdAtMs: Date.now(),
      feeling,
      cheeredBy: []
    };
    commitState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g)),
      logs: [newLog, ...prev.logs]
    }));
  };

  const memberMetrics = useMemo(() => {
    const map: Record<string, any> = {};
    state.members.forEach((m) => {
      const mLogs = state.logs.filter((l) => l.userId === m.id);
      const todayMins = mLogs.filter((l) => l.date === todayStr).reduce((a, b) => a + b.minutes, 0);
      const goalMins = state.goals.filter((g) => g.userId === m.id).reduce((a, b) => a + b.loggedMinutes, 0);
      const nonGoalMins = mLogs.filter((l) => l.sourceKey).reduce((a, b) => a + b.minutes, 0);
      const totalMins = goalMins + nonGoalMins;

      const activeDates = new Set(mLogs.filter((l) => l.minutes > 0).map((l) => l.date));
      let streak = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (activeDates.has(getLocalDateStr(d))) streak++;
        else if (i === 0) continue;
        else break;
      }

      const grid28 = Array.from({ length: 28 }, (_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (27 - idx));
        const dateStr = getLocalDateStr(d);
        const prettyDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const mins = mLogs.filter((l) => l.date === dateStr).reduce((a, b) => a + b.minutes, 0);
        const level = mins === 0 ? 0 : mins < 45 ? 1 : mins < 120 ? 2 : 3;
        return { dateStr, prettyDate, mins, level };
      });

      map[m.id] = {
        todayMins,
        totalHours: (totalMins / 60).toFixed(1),
        streak,
        level: Math.max(1, Math.floor((totalMins * 10) / 6000) + 1),
        grid28
      };
    });
    return map;
  }, [state.members, state.logs, state.goals, todayStr]);

  const activeInsights = useMemo(
    () => computeRhythmInsights(state.logs, currentMember.id, memberMetrics[currentMember.id]?.streak || 0),
    [state.logs, currentMember.id, memberMetrics]
  );

  const navItems = [
    { id: 'today', label: 'Today', Icon: Compass },
    { id: 'focus', label: 'Focus', Icon: Timer },
    { id: 'journey', label: 'Journey', Icon: Target },
    { id: 'sanctuary', label: 'Sanctuary', Icon: UsersThree }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row living-canvas">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex lg:flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-6 justify-between z-30">
        <div className="space-y-8">
          <div>
            <h1 className="font-serif italic text-2xl tracking-tight">{state.workspaceName}</h1>
            <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
              {syncState === 'synced' ? (
                <>
                  <CloudCheck weight="duotone" className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Synced • {state.roomCode}</span>
                </>
              ) : (
                <>
                  <CloudSlash weight="duotone" className="w-3.5 h-3.5 text-amber-400" />
                  <span>Saved locally</span>
                </>
              )}
            </span>
          </div>

          {/* Companions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Companions
              </span>
              {state.members.length < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMember(null);
                    setMemberForm({ name: '', tagline: '', theme: 'peach-terracotta' });
                    setShowMemberModal(true);
                  }}
                  className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus weight="bold" className="w-3 h-3" /> Add
                </button>
              )}
            </div>
            {state.members.map((m) => (
              <div
                key={m.id}
                className={\`rounded-2xl px-3 py-2 flex items-center justify-between group transition \${
                  m.id === activeUser ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)]'
                }\`}
              >
                <button
                  type="button"
                  onClick={() => setActiveUser(m.id)}
                  className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                >
                  <span
                    className="w-6 h-6 rounded-lg font-serif italic text-xs flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    {m.avatar}
                  </span>
                  <span className="text-xs truncate">{m.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={\`Edit \${m.name}\`}
                  onClick={() => {
                    setEditingMember(m);
                    setMemberForm({ name: m.name, tagline: m.tagline, theme: m.theme });
                    setShowMemberModal(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1"
                >
                  <PencilSimple weight="duotone" className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Experience Navigation */}
          <nav className="space-y-1" aria-label="Experience Navigation">
            {navItems.map((item) => {
              const Icon = item.Icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id as any)}
                  className={\`w-full px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-3 transition \${
                    active ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }\`}
                >
                  <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" style={active ? { color: 'var(--accent)' } : undefined} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quiet Actions */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <button type="button" onClick={() => setIsLatteMode(!isLatteMode)} className="flex items-center gap-1.5 hover:text-[var(--text-main)]">
            {isLatteMode ? <MoonStars weight="duotone" className="w-4 h-4" /> : <SunDim weight="duotone" className="w-4 h-4" />}
            <span>{isLatteMode ? 'Night' : 'Latte'}</span>
          </button>
          <button type="button" onClick={() => setShowOnboarding(true)} className="flex items-center gap-1 hover:text-[var(--text-main)]">
            <Key weight="duotone" className="w-4 h-4" /> Room
          </button>
        </div>
      </aside>

      {/* Main Single-Column Experience Canvas */}
      <div className="flex-1 min-w-0 pb-24 lg:pb-16">
        <main className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 sm:pt-14">
          {activeView === 'today' && (
            <TodayPage
              state={state}
              currentMember={currentMember}
              todayMins={memberMetrics[currentMember.id]?.todayMins || 0}
              streak={memberMetrics[currentMember.id]?.streak || 0}
              thisWeekSessions={activeInsights.thisWeekSessions}
              realTodayName={getTodayWeekday()}
              onUpdateIntention={(text) => {
                commitState((prev) => ({
                  ...prev,
                  members: prev.members.map((m) => (m.id === activeUser ? { ...m, todayIntention: text } : m))
                }));
              }}
              onStartFocusWithTarget={(title, goalId) => {
                setFocusTarget({ title, goalId: goalId || '' });
                setActiveView('focus');
              }}
              onToggleClass={(sched) => {
                const attended = sched.attendedDates.includes(todayStr);
                const sourceKey = \`class-\${sched.id}-\${todayStr}\`;
                const mins = Math.max(30, toMins(sched.endTime) - toMins(sched.startTime));
                commitState((prev) => ({
                  ...prev,
                  schedules: prev.schedules.map((s) =>
                    s.id !== sched.id
                      ? s
                      : { ...s, attendedDates: attended ? s.attendedDates.filter((d) => d !== todayStr) : [...s.attendedDates, todayStr] }
                  ),
                  logs: attended
                    ? prev.logs.filter((l) => l.sourceKey !== sourceKey)
                    : [{ id: uid('log'), sourceKey, userId: sched.userId, targetTitle: sched.title, minutes: mins, date: todayStr, createdAtMs: Date.now(), cheeredBy: [] }, ...prev.logs]
                }));
              }}
              onToggleTask={(task) => {
                const nextDone = !task.completed;
                const sourceKey = \`task-\${task.id}\`;
                commitState((prev) => ({
                  ...prev,
                  tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, completed: nextDone } : t)),
                  goals: task.goalId
                    ? prev.goals.map((g) =>
                        g.id === task.goalId
                          ? { ...g, loggedMinutes: Math.max(0, g.loggedMinutes + (nextDone ? task.estimatedMinutes : -task.estimatedMinutes)) }
                          : g
                      )
                    : prev.goals,
                  logs: nextDone
                    ? [{ id: uid('log'), sourceKey, userId: task.userId, goalId: task.goalId, targetTitle: task.title, minutes: task.estimatedMinutes, date: todayStr, createdAtMs: Date.now(), cheeredBy: [] }, ...prev.logs]
                    : prev.logs.filter((l) => l.sourceKey !== sourceKey)
                }));
              }}
              onAddTask={(day, title, reminderTime, estimatedMinutes, goalId) => {
                const t: TaskItem = { id: uid('task'), userId: activeUser, goalId, day, title, reminderTime, completed: false, estimatedMinutes, createdAt: todayStr };
                commitState((prev) => ({ ...prev, tasks: [t, ...prev.tasks] }));
              }}
              onDeleteTask={(task) => {
                commitState((prev) => ({
                  ...prev,
                  tasks: prev.tasks.filter((t) => t.id !== task.id),
                  logs: prev.logs.filter((l) => l.sourceKey !== \`task-\${task.id}\`)
                }));
              }}
            />
          )}

          {activeView === 'focus' && (
            <FocusRoomPage
              currentMember={currentMember}
              companions={state.members.filter((m) => m.id !== currentMember.id)}
              userGoals={state.goals.filter((g) => g.userId === currentMember.id)}
              initialTitle={focusTarget.title}
              initialGoalId={focusTarget.goalId}
              ambientMode={ambientMode}
              onChangeAmbient={(m) => {
                setAmbientMode(m);
                soundEngine.play(m);
              }}
              onPresenceChange={(isFocusing, targetTitle, durationPreset) => {
                commitState((prev) => ({
                  ...prev,
                  members: prev.members.map((m) =>
                    m.id === activeUser
                      ? { ...m, presence: isFocusing ? { isFocusing: true, targetTitle, durationPreset, startedAtMs: Date.now() } : null }
                      : m
                  )
                }));
              }}
              onCompleteSession={(gId, title, mins, feeling) => {
                logSessionMinutes(gId, title, mins, feeling);
              }}
              onBackToToday={() => setActiveView('today')}
            />
          )}

          {activeView === 'journey' && (
            <Suspense fallback={<RhythmSkeleton />}>
              <JourneyPage
                state={state}
                currentMember={currentMember}
                insights={activeInsights}
                onOpenNewGoal={() => {
                  setEditingGoal(null);
                  setGoalForm({ title: '', category: 'Long-Term', targetHours: 50, deadline: 'Ongoing' });
                  setShowGoalModal(true);
                }}
                onOpenEditGoal={(g) => {
                  setEditingGoal(g);
                  setGoalForm({ title: g.title, category: g.category, targetHours: g.targetHours, deadline: g.deadline });
                  setShowGoalModal(true);
                }}
                onDeleteGoal={(g) => {
                  if (window.confirm(\`Delete "\${g.title}"?\`)) {
                    commitState((prev) => ({ ...prev, goals: prev.goals.filter((x) => x.id !== g.id) }));
                  }
                }}
                onLogGoalMinutes={(gId, title, mins) => logSessionMinutes(gId, title, mins)}
                onAddMilestone={(gId, title) => {
                  commitState((prev) => ({
                    ...prev,
                    goals: prev.goals.map((g) =>
                      g.id === gId ? { ...g, milestones: [...(g.milestones || []), { id: uid('ms'), title, completed: false }] } : g
                    )
                  }));
                }}
                onToggleMilestone={(gId, msId) => {
                  commitState((prev) => ({
                    ...prev,
                    goals: prev.goals.map((g) =>
                      g.id === gId
                        ? { ...g, milestones: g.milestones.map((m) => (m.id === msId ? { ...m, completed: !m.completed } : m)) }
                        : g
                    )
                  }));
                }}
                onDeleteMilestone={(gId, msId) => {
                  commitState((prev) => ({
                    ...prev,
                    goals: prev.goals.map((g) =>
                      g.id === gId ? { ...g, milestones: g.milestones.filter((m) => m.id !== msId) } : g
                    )
                  }));
                }}
                onOpenAddClass={(day) => {
                  setClassForm({ ...classForm, day });
                  setShowClassModal(true);
                }}
                onDeleteClass={(item) => {
                  commitState((prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== item.id) }));
                }}
                onOpenAddExam={() => setShowExamModal(true)}
                onDeleteExam={(ex) => {
                  commitState((prev) => ({ ...prev, exams: prev.exams.filter((x) => x.id !== ex.id) }));
                }}
              />
            </Suspense>
          )}

          {activeView === 'sanctuary' && (
            <Suspense fallback={<RhythmSkeleton />}>
              <SanctuaryPage
                state={state}
                currentMember={currentMember}
                isLatteMode={isLatteMode}
                syncUrl={syncUrl}
                onChangeSyncUrl={(url) => {
                  setSyncUrl(url);
                  localStorage.setItem('syncpulse_cloud_url', url.trim());
                }}
                onChangeRoomCode={(code) => commitState((p) => ({ ...p, roomCode: code }))}
                memberMetrics={memberMetrics}
                onCheerLog={(logId) => {
                  commitState((prev) => ({
                    ...prev,
                    logs: prev.logs.map((l) => {
                      if (l.id !== logId || l.userId === activeUser) return l;
                      const has = l.cheeredBy.includes(activeUser);
                      return { ...l, cheeredBy: has ? l.cheeredBy.filter((x) => x !== activeUser) : [...l.cheeredBy, activeUser] };
                    })
                  }));
                }}
                onExportJSON={() => repository.exportJSONFile(state, todayStr)}
                onImportJSON={(file) => {
                  const r = new FileReader();
                  r.onload = (ev) => {
                    try {
                      commitState(() => migrateState(JSON.parse(String(ev.target?.result))));
                    } catch {}
                  };
                  r.readAsText(file);
                }}
                onResetZero={() => {
                  if (!window.confirm('Reset all logged hours and streaks back to 0.0h?')) return;
                  commitState((prev) => ({
                    ...prev,
                    schedules: prev.schedules.map((s) => ({ ...s, attendedDates: [] })),
                    goals: prev.goals.map((g) => ({
                      ...g,
                      loggedMinutes: 0,
                      milestones: (g.milestones || []).map((m) => ({ ...m, completed: false }))
                    })),
                    tasks: prev.tasks.map((t) => ({ ...t, completed: false })),
                    logs: []
                  }));
                }}
              />
            </Suspense>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] grid grid-cols-4 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.Icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id as any)}
                className={\`flex flex-col items-center justify-center py-1 rounded-xl text-xs font-medium \${
                  active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                }\`}
              >
                <Icon weight={active ? 'fill' : 'duotone'} className="w-5 h-5 mb-0.5" style={active ? { color: 'var(--accent)' } : undefined} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 60-Second Value-First Onboarding Modal (Audit Point 99 & 172) */}
      <Modal open={showOnboarding} title="Welcome to SyncPulse" onClose={() => state.isConfigured && setShowOnboarding(false)}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs text-[var(--text-muted)]">
              What are you working toward today? (Start a fresh space)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickIntention}
                onChange={(e) => setQuickIntention(e.target.value)}
                placeholder="e.g., Master Deep Learning / French B2"
                className="flex-1 rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              />
              <button
                type="button"
                onClick={() => {
                  const next = CREATE_CUSTOM_SANCTUARY('My Sanctuary', uid('room'), 'Me', 'Focused Learner', 'warm-sage');
                  if (quickIntention.trim()) {
                    next.goals[0].title = quickIntention.trim();
                    next.members[0].todayIntention = quickIntention.trim();
                  }
                  setState(next);
                  setActiveUser(next.members[0].id);
                  setShowOnboarding(false);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Start Now
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
            <label className="block text-xs text-[var(--text-muted)]">
              Or enter an existing Sanctuary Room Code (e.g. <b>mr-1405</b>)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="mr-1405"
                className="flex-1 rounded-xl px-3.5 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              />
              <button
                type="button"
                onClick={() => {
                  const code = roomInput.trim().toLowerCase();
                  const next =
                    code === 'mr-1405' || code === 'mehrsan-ronak'
                      ? CREATE_MEHRSAN_RONAK_PRESET('mr-1405')
                      : CREATE_CUSTOM_SANCTUARY(\`Sanctuary (\${code})\`, code || uid('room'), 'Companion', 'Focused Learner', 'warm-sage');
                  setState(next);
                  setActiveUser(next.members[0].id);
                  setShowOnboarding(false);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-xs font-semibold"
              >
                Enter Room
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showGoalModal} title={editingGoal ? 'Edit Direction' : 'New Direction'} onClose={() => setShowGoalModal(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!goalForm.title.trim()) return;
            commitState((prev) => ({
              ...prev,
              goals: editingGoal
                ? prev.goals.map((g) => (g.id === editingGoal.id ? { ...g, ...goalForm } : g))
                : [...prev.goals, { id: uid('goal'), userId: activeUser, ...goalForm, loggedMinutes: 0, milestones: [] }]
            }));
            setShowGoalModal(false);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Goal Title"
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min={1}
              value={goalForm.targetHours}
              onChange={(e) => setGoalForm({ ...goalForm, targetHours: Math.max(1, Number(e.target.value)) })}
              className="rounded-xl px-3 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
            <input
              type="text"
              placeholder="Horizon"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              className="rounded-xl px-3 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
            Save Direction
          </button>
        </form>
      </Modal>

      <Modal open={showClassModal} title="Add Class" onClose={() => setShowClassModal(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!classForm.title.trim()) return;
            commitState((prev) => ({
              ...prev,
              schedules: [
                ...prev.schedules,
                { id: uid('sched'), userId: activeUser, ...classForm, category: 'Core', attendedDates: [] }
              ]
            }));
            setShowClassModal(false);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Class Title"
            value={classForm.title}
            onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={classForm.day}
              onChange={(e) => setClassForm({ ...classForm, day: e.target.value })}
              className="rounded-xl px-2 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="time"
              value={classForm.startTime}
              onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
              className="rounded-xl px-2 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
            <input
              type="time"
              value={classForm.endTime}
              onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
              className="rounded-xl px-2 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>
          <input
            type="text"
            placeholder="Professor / Room"
            value={classForm.details}
            onChange={(e) => setClassForm({ ...classForm, details: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
            Save Class
          </button>
        </form>
      </Modal>

      <Modal open={showExamModal} title="Add Exam" onClose={() => setShowExamModal(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!examForm.title.trim()) return;
            commitState((prev) => ({
              ...prev,
              exams: [...prev.exams, { id: uid('ex'), userId: activeUser, ...examForm, type: 'Core' }]
            }));
            setShowExamModal(false);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Course / Exam Title"
            value={examForm.title}
            onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Date (e.g. 1405/11/10)"
              value={examForm.date}
              onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
              className="rounded-xl px-3 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
            <input
              type="time"
              value={examForm.time}
              onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
              className="rounded-xl px-3 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>
          <input
            type="text"
            placeholder="Professor"
            value={examForm.professor}
            onChange={(e) => setExamForm({ ...examForm, professor: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
            Save Exam
          </button>
        </form>
      </Modal>

      <Modal open={showMemberModal} title={editingMember ? 'Edit Profile' : 'Add Companion'} onClose={() => setShowMemberModal(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!memberForm.name.trim()) return;
            commitState((prev) => ({
              ...prev,
              members: editingMember
                ? prev.members.map((m) =>
                    m.id === editingMember.id
                      ? { ...m, name: memberForm.name.trim(), tagline: memberForm.tagline, avatar: memberForm.name.trim()[0].toUpperCase(), theme: memberForm.theme }
                      : m
                  )
                : [
                    ...prev.members,
                    { id: uid('member'), name: memberForm.name.trim(), tagline: memberForm.tagline, avatar: memberForm.name.trim()[0].toUpperCase(), theme: memberForm.theme, presence: null }
                  ]
            }));
            setShowMemberModal(false);
          }}
          className="space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Name"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <select
            value={memberForm.theme}
            onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
            className="w-full rounded-xl px-3 py-2.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <option value="warm-sage">Warm Stone & Sage</option>
            <option value="lavender-blush">Velvet Lavender</option>
            <option value="peach-terracotta">Warm Terracotta</option>
            <option value="matcha-cream">Matcha Mist</option>
          </select>
          <button type="submit" className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: 'var(--accent)' }}>
            Save Profile
          </button>
        </form>
      </Modal>
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('🚀 Production Module Updated:', filePath);
}

console.log('\n🎉 SyncPulse v8.0 (Production-Ready Architecture) generated successfully!');