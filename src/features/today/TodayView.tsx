import React, { useState, useMemo } from 'react';
import {
  Play, CheckCircle, Circle, Plus, Trash, Sparkle, ArrowRight
} from '@phosphor-icons/react';
import { AppState, Member, ScheduleItem, TaskItem } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { DAYS, getTimeOfDayGreeting, toMins, fromMins, getLocalDateStr } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  todayMins: number;
  realTodayName: string;
  onEnterFocusRoom: (goalId?: string) => void;
  onToggleClass: (sched: ScheduleItem) => void;
  onToggleTask: (task: TaskItem) => void;
  onAddTask: (day: string, title: string, time: string, mins: number) => void;
  onDeleteTask: (task: TaskItem) => void;
  onSwitchMember: (id: string) => void;
}

export const TodayView: React.FC<Props> = ({
  state,
  currentMember,
  todayMins,
  realTodayName,
  onEnterFocusRoom,
  onToggleClass,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSwitchMember
}) => {
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('17:00');
  const [newTaskMins, setNewTaskMins] = useState(45);

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
        endMins: eM,
        startTime: c.startTime,
        durationMins: eM - sM,
        completed: c.attendedDates.includes(todayStr),
        rawClass: c
      });
    });

    dayTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const eM = sM + (t.estimatedMinutes || 30);
      items.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: `≈ ${t.estimatedMinutes} min intention`,
        startMins: sM,
        endMins: eM,
        startTime: t.reminderTime,
        durationMins: t.estimatedMinutes || 30,
        completed: t.completed,
        rawTask: t
      });
    });

    items.sort((a, b) => a.startMins - b.startMins);
    return items;
  }, [state.schedules, state.tasks, currentMember.id, timelineDay, todayStr]);

  const nextStep = dailyStream.find((item) => !item.completed);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(timelineDay, newTaskTitle.trim(), newTaskTime, newTaskMins);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-10">
      {/* 1. Experience-Driven Greeting Header */}
      <section className="space-y-2">
        <PulseLine
          active={Boolean(currentMember.presence?.isFocusing)}
          label={
            todayMins > 0
              ? `${Math.floor(todayMins / 60)}h ${todayMins % 60}m focused today`
              : 'Your sanctuary is quiet'
          }
        />
        <h2 className="font-serif italic text-4xl sm:text-5xl tracking-tight pt-1">
          {getTimeOfDayGreeting()}, {currentMember.name}.
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {nextStep
            ? `Next meaningful step: ${nextStep.title} at ${nextStep.startTime}`
            : primaryGoal
            ? `Current direction: ${primaryGoal.title}`
            : 'Ready to begin your first mindful session?'}
        </p>
      </section>

      {/* 2. Primary Surface: Hero Focus Invitation */}
      <Surface variant="primary" className="p-7 sm:p-9 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <span
              className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Sparkle weight="fill" className="w-3.5 h-3.5" />
              Today’s Focus Sanctuary
            </span>
            <h3 className="font-serif italic text-2xl sm:text-3xl pt-1">
              {nextStep ? nextStep.title : primaryGoal ? primaryGoal.title : 'Deep Focus Session'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Step into a quiet space with ambient soundscapes and a persistent focus timer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEnterFocusRoom(primaryGoal?.id)}
            className="px-6 py-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2.5 shadow-md transition transform hover:scale-[1.02] shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Play weight="fill" className="w-4 h-4" />
            <span>Enter Focus Room</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </Surface>

      {/* 3. Ambient Surface: Sanctuary Companion Pulse */}
      <section className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Sanctuary Pulse
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {state.members.map((m) => {
            const isFocusing = Boolean(m.presence?.isFocusing);
            const mTodayMins = state.logs
              .filter((l) => l.userId === m.id && l.date === todayStr)
              .reduce((a, b) => a + b.minutes, 0);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSwitchMember(m.id)}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                  m.id === currentMember.id
                    ? 'bg-[var(--bg-surface)] border-[var(--accent)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isFocusing ? '#10b981' : 'var(--text-muted)',
                      boxShadow: isFocusing ? '0 0 8px #10b981' : 'none'
                    }}
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {isFocusing
                        ? `Focusing on ${m.presence?.targetTitle}`
                        : mTodayMins > 0
                        ? `${Math.floor(mTodayMins / 60)}h ${mTodayMins % 60}m today`
                        : 'Resting'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  {m.id === currentMember.id ? 'Active' : 'Switch'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Secondary Surface: Today's Rhythm (Timeline Flow) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif italic text-2xl">Today’s Rhythm</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {DAYS.map((d) => {
              const active = d === timelineDay;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTimelineDay(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  {d.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {dailyStream.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <p className="text-sm font-medium">Your space is clear for {timelineDay}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Add a small intention below or step directly into the Focus Room.
              </p>
            </div>
          ) : (
            dailyStream.map((entry) => (
              <div
                key={entry.id}
                className="px-5 py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    aria-label={`Toggle ${entry.title}`}
                    onClick={() => {
                      if (entry.kind === 'class' && entry.rawClass) onToggleClass(entry.rawClass);
                      else if (entry.kind === 'task' && entry.rawTask) onToggleTask(entry.rawTask);
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
                    <p className={`text-sm font-medium truncate ${entry.completed ? 'line-through opacity-50' : ''}`}>
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
                      aria-label={`Delete ${entry.title}`}
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

          <form onSubmit={handleSubmitTask} className="px-5 py-3.5 flex flex-wrap items-center gap-2.5">
            <Plus weight="bold" className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={`What moves you forward on ${timelineDay}?`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[160px] bg-transparent text-xs py-1 focus:outline-none"
            />
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
              <option value={15}>≈ 15m</option>
              <option value={30}>≈ 30m</option>
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
                Add Step
              </button>
            )}
          </form>
        </Surface>
      </section>
    </div>
  );
};
