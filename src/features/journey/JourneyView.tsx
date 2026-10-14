import React, { useState } from 'react';
import {
  Plus, PencilSimple, Trash, CheckCircle, Circle, CaretDown, CaretUp,
  ListChecks, X
} from '@phosphor-icons/react';
import { AppState, ExamItem, GoalItem, Member, ScheduleItem } from '../../types';
import { Surface } from '../../components/ui/Primitives';
import { DAYS, getLocalDateStr, getTodayWeekday } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
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

export const JourneyView: React.FC<Props> = ({
  state,
  currentMember,
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
      {/* 1. Story-Driven Goals Section */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif italic text-3xl">Your Journeys & Directions</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Long-term directions connected to your daily focus sessions
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewGoal}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-white flex items-center gap-1.5"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus weight="bold" className="w-3.5 h-3.5" /> New Direction
          </button>
        </div>

        <div className="space-y-4">
          {userGoals.map((g) => {
            const safeTarget = Math.max(1, g.targetHours);
            const hrs = +(g.loggedMinutes / 60).toFixed(1);
            const pct = Math.min(100, Math.round((hrs / safeTarget) * 100));
            const todayContribution = state.logs
              .filter((l) => l.userId === currentMember.id && l.date === todayStr && l.targetTitle === g.title)
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
                    <h3 className="font-semibold text-base mt-2">{g.title}</h3>
                    {nextMilestone && !isExpanded && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Next step: <span className="text-[var(--text-main)]">{nextMilestone.title}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${g.title}`}
                      onClick={() => onOpenEditGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <PencilSimple weight="duotone" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${g.title}`}
                      onClick={() => onDeleteGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-400"
                    >
                      <Trash weight="duotone" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Quick Contribution */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>
                      {hrs}h <span className="text-[var(--text-muted)]">of {safeTarget}h ({pct}%)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[15, 30, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => onLogGoalMinutes(g.id, g.title, mins)}
                          className="px-2.5 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[11px] hover:border-[var(--accent)]"
                        >
                          +{mins === 60 ? '1h' : `${mins}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--track-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                    />
                  </div>
                </div>

                {/* Milestones Drawer */}
                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setExpandedGoals((p) => ({ ...p, [g.id]: !p[g.id] }))}
                    className="text-xs flex items-center justify-between w-full text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListChecks weight="duotone" className="w-4 h-4" />
                      <span>
                        Milestones ({milestones.filter((m) => m.completed).length}/{milestones.length})
                      </span>
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
                            aria-label="Delete milestone"
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
                          placeholder="Add next milestone step..."
                          value={milestoneInputs[g.id] || ''}
                          onChange={(e) => setMilestoneInputs((p) => ({ ...p, [g.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (milestoneInputs[g.id] || '').trim()) {
                              e.preventDefault();
                              onAddMilestone(g.id, milestoneInputs[g.id]);
                              setMilestoneInputs((p) => ({ ...p, [g.id]: '' }));
                            }
                          }}
                          className="flex-1 rounded-xl px-3 py-1.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:outline-none"
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

      {/* 2. Weekly Context Schedule */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif italic text-2xl">Weekly Class Context</h3>
          <button
            type="button"
            onClick={() => onOpenAddClass(selectedDay)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-1.5"
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  active ? 'text-white' : 'text-[var(--text-muted)]'
                }`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                {day}
              </button>
            );
          })}
        </div>

        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {state.schedules
            .filter((s) => s.userId === currentMember.id && s.day === selectedDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime)).length === 0 ? (
            <p className="text-xs py-8 text-center text-[var(--text-muted)]">
              No classes scheduled on {selectedDay}.
            </p>
          ) : (
            state.schedules
              .filter((s) => s.userId === currentMember.id && s.day === selectedDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.details}</p>
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
        </Surface>
      </section>

      {/* 3. Upcoming Exams */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic text-2xl">Upcoming Exams</h3>
          <button
            type="button"
            onClick={onOpenAddExam}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-1.5"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" /> Add Exam
          </button>
        </div>

        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {state.exams.filter((ex) => ex.userId === currentMember.id).length === 0 ? (
            <p className="text-xs py-8 text-center text-[var(--text-muted)]">
              No upcoming exams listed for {currentMember.name}.
            </p>
          ) : (
            state.exams
              .filter((ex) => ex.userId === currentMember.id)
              .map((ex) => (
                <div key={ex.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{ex.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{ex.professor}</p>
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
        </Surface>
      </section>
    </div>
  );
};
