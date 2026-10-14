import React, { useState, useMemo } from 'react';
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
          ? `→ ${linkedGoal.title} • ≈ ${t.estimatedMinutes}m`
          : `≈ ${t.estimatedMinutes} min intention`,
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
              ? `${companionsFocusing.map((c) => c.name).join(' & ')} focusing nearby`
              : todayMins > 0
              ? `${Math.floor(todayMins / 60)}h ${todayMins % 60}m focused today`
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
                ? `Move "${nextAction.title}" forward...`
                : primaryGoal
                ? `Make progress on ${primaryGoal.title}...`
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
                ? `Scheduled for ${nextAction.startTime} (≈ ${nextAction.durationMins}m)`
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
                    aria-label={`Complete ${entry.title}`}
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
                      aria-label={`Remove ${entry.title}`}
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
              placeholder={`Add an action for ${timelineDay}...`}
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
            ? `${streak} days building your rhythm`
            : 'Start a session today to begin your rhythm'}
        </span>
        <span className="font-mono">
          {thisWeekSessions} focused {thisWeekSessions === 1 ? 'session' : 'sessions'} this week
        </span>
      </footer>
    </div>
  );
};
