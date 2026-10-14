import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Compass, Timer, Target, UsersThree, SunDim, MoonStars,
  CloudCheck, CloudArrowUp, Plus, PencilSimple, LinkSimple,
  DownloadSimple, UploadSimple, Key
} from '@phosphor-icons/react';
import {
  AmbientSound, AppState, ExamItem, GoalItem, Member, ScheduleItem,
  SessionFeeling, TaskItem, ThemePalette, TimeLog
} from './types';
import {
  DEFAULT_CLOUD_DB_URL, CREATE_CUSTOM_SANCTUARY, CREATE_MEHRSAN_RONAK_PRESET
} from './initialData';
import {
  loadLocalState, saveLocalState, migrateState, buildCloudEndpoint
} from './core/sync';
import { DAYS, getLocalDateStr, getTodayWeekday, uid, toMins } from './core/utils';
import { soundEngine } from './core/audio';
import { GET_THEME_TOKENS } from './theme/tokens';
import { Modal } from './components/ui/Primitives';
import { useFocusTimer, TimerMode } from './features/focus/useFocusTimer';
import { TodayView } from './features/today/TodayView';
import { FocusRoomView } from './features/focus/FocusRoomView';
import { JourneyView } from './features/journey/JourneyView';
import { SanctuaryView } from './features/sanctuary/SanctuaryView';

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
    return loadLocalState();
  });

  useEffect(() => {
    if (urlRoom || urlDb) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [urlRoom, urlDb]);

  const [activeUser, setActiveUser] = useState<string>(() => state.members[0]?.id || 'mehrsan');
  const [isLatteMode, setIsLatteMode] = useState<boolean>(() => localStorage.getItem('syncpulse_latte') === 'true');
  const [activeView, setActiveView] = useState<'today' | 'focus' | 'journey' | 'sanctuary'>('today');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [ambientMode, setAmbientMode] = useState<AmbientSound>('off');
  const [syncState, setSyncState] = useState<'local' | 'live'>('local');

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !state.isConfigured);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [showClassModal, setShowClassModal] = useState<boolean>(false);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Forms
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

  // Inject CSS Variables onto document root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeTokens.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    localStorage.setItem('syncpulse_latte', String(isLatteMode));
  }, [themeTokens, isLatteMode]);

  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  const syncTimeoutRef = useRef<any>(null);
  const commitState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = { ...updater(prev), lastUpdatedMs: Date.now() };
        if (syncUrl && next.isConfigured) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(async () => {
            try {
              const endpoint = buildCloudEndpoint(syncUrl, next.roomCode);
              const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(next)
              });
              if (res.ok) setSyncState('live');
            } catch {}
          }, 150);
        }
        return next;
      });
    },
    [syncUrl]
  );

  // Real-time Firebase SSE + Poll
  useEffect(() => {
    if (!syncUrl || !state.isConfigured) return;
    const endpoint = buildCloudEndpoint(syncUrl, state.roomCode);
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
            setSyncState('live');
          }
        } catch {}
      });
    } catch {}

    const poll = setInterval(async () => {
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const remote = await res.json();
          if (remote?.members) {
            setState((local) =>
              (remote.lastUpdatedMs || 0) > (local.lastUpdatedMs || 0) ? migrateState(remote) : local
            );
            setSyncState('live');
          }
        }
      } catch {}
    }, 5000);

    return () => {
      if (es) es.close();
      clearInterval(poll);
    };
  }, [syncUrl, state.roomCode, state.isConfigured]);

  const handlePresenceChange = useCallback(
    (isRunning: boolean, mode: TimerMode) => {
      const userGoals = state.goals.filter((g) => g.userId === activeUser);
      const g = userGoals.find((x) => x.id === selectedGoalId) || userGoals[0];
      commitState((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === activeUser
            ? {
                ...m,
                presence: isRunning
                  ? { isFocusing: true, targetTitle: g ? g.title : 'Deep Focus', startedAtMs: Date.now(), mode }
                  : null
              }
            : m
        )
      }));
    },
    [activeUser, selectedGoalId, state.goals, commitState]
  );

  const timer = useFocusTimer(handlePresenceChange);

  const handleChangeAmbient = (mode: AmbientSound) => {
    setAmbientMode(mode);
    soundEngine.play(mode);
  };

  const todayStr = getLocalDateStr();

  const logSessionMinutes = (goalId: string | null, title: string, minutes: number, feeling?: SessionFeeling) => {
    if (minutes <= 0) return;
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    const newLog: TimeLog = {
      id: uid('log'),
      userId: activeUser,
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

  const navItems = [
    { id: 'today', label: 'Today', Icon: Compass },
    { id: 'focus', label: 'Focus Room', Icon: Timer },
    { id: 'journey', label: 'Journey', Icon: Target },
    { id: 'sanctuary', label: 'Sanctuary', Icon: UsersThree }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row living-canvas">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-6 justify-between z-30">
        <div className="space-y-8">
          <div>
            <h1 className="font-serif italic text-2xl tracking-tight">{state.workspaceName}</h1>
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5 mt-1 hover:text-[var(--text-main)]"
            >
              {syncState === 'live' ? (
                <>
                  <CloudCheck weight="duotone" className="w-4 h-4 text-emerald-500" />
                  <span>Live • {state.roomCode}</span>
                </>
              ) : (
                <>
                  <CloudArrowUp weight="duotone" className="w-4 h-4" />
                  <span>Sync Settings</span>
                </>
              )}
            </button>
          </div>

          {/* Companions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Sanctuary
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
                className={`rounded-2xl px-3 py-2 flex items-center justify-between group transition ${
                  m.id === activeUser ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)]'
                }`}
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
                  aria-label={`Edit ${m.name}`}
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
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-between transition ${
                    active ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" style={active ? { color: 'var(--accent)' } : undefined} />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'focus' && timer.isRunning && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
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
        <main className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 sm:pt-12">
          {activeView === 'today' && (
            <TodayView
              state={state}
              currentMember={currentMember}
              todayMins={memberMetrics[currentMember.id]?.todayMins || 0}
              realTodayName={getTodayWeekday()}
              onEnterFocusRoom={(gId) => {
                if (gId) setSelectedGoalId(gId);
                setActiveView('focus');
              }}
              onToggleClass={(sched) => {
                const attended = sched.attendedDates.includes(todayStr);
                const sourceKey = `class-${sched.id}-${todayStr}`;
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
                const sourceKey = `task-${task.id}`;
                commitState((prev) => ({
                  ...prev,
                  tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, completed: nextDone } : t)),
                  logs: nextDone
                    ? [{ id: uid('log'), sourceKey, userId: task.userId, targetTitle: task.title, minutes: task.estimatedMinutes, date: todayStr, createdAtMs: Date.now(), cheeredBy: [] }, ...prev.logs]
                    : prev.logs.filter((l) => l.sourceKey !== sourceKey)
                }));
              }}
              onAddTask={(day, title, reminderTime, estimatedMinutes) => {
                const t: TaskItem = { id: uid('task'), userId: activeUser, day, title, reminderTime, completed: false, estimatedMinutes, createdAt: todayStr };
                commitState((prev) => ({ ...prev, tasks: [t, ...prev.tasks] }));
              }}
              onDeleteTask={(task) => {
                commitState((prev) => ({
                  ...prev,
                  tasks: prev.tasks.filter((t) => t.id !== task.id),
                  logs: prev.logs.filter((l) => l.sourceKey !== `task-${task.id}`)
                }));
              }}
              onSwitchMember={setActiveUser}
            />
          )}

          {activeView === 'focus' && (
            <FocusRoomView
              currentMember={currentMember}
              companions={state.members.filter((m) => m.id !== currentMember.id)}
              userGoals={state.goals.filter((g) => g.userId === currentMember.id)}
              selectedGoalId={selectedGoalId}
              onSelectGoal={setSelectedGoalId}
              timer={timer}
              ambientMode={ambientMode}
              onChangeAmbient={handleChangeAmbient}
              onCompleteSession={(mins, feeling) => {
                const userGoals = state.goals.filter((g) => g.userId === activeUser);
                const g = userGoals.find((x) => x.id === selectedGoalId) || userGoals[0];
                logSessionMinutes(g ? g.id : null, g ? g.title : 'Focus Session', mins, feeling);
                timer.reset(timer.mode === 'pomodoro' ? 'break' : 'stopwatch');
              }}
            />
          )}

          {activeView === 'journey' && (
            <JourneyView
              state={state}
              currentMember={currentMember}
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
                if (window.confirm(`Delete "${g.title}"?`)) {
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
          )}

          {activeView === 'sanctuary' && (
            <SanctuaryView
              state={state}
              currentMember={currentMember}
              isLatteMode={isLatteMode}
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
            />
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
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-xs font-medium ${
                  active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <Icon weight={active ? 'fill' : 'duotone'} className="w-5 h-5 mb-0.5" style={active ? { color: 'var(--accent)' } : undefined} />
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Modals */}
      <Modal open={showOnboarding} title="Welcome to SyncPulse" onClose={() => state.isConfigured && setShowOnboarding(false)}>
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Enter your private room code (use <b>mr-1405</b> for Mehrsan & Ronak) or start a new space.
          </p>
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="mr-1405"
            className="w-full rounded-xl px-4 py-2.5 text-sm font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          />
          <button
            type="button"
            onClick={() => {
              const code = roomInput.trim().toLowerCase();
              const next =
                code === 'mr-1405' || code === 'mehrsan-ronak'
                  ? CREATE_MEHRSAN_RONAK_PRESET('mr-1405')
                  : CREATE_CUSTOM_SANCTUARY(`Sanctuary (${code || 'new'})`, code || uid('room'), 'Companion 1', 'Focused Learner', 'warm-sage');
              setState(next);
              setActiveUser(next.members[0].id);
              setShowOnboarding(false);
            }}
            className="w-full py-3 rounded-xl text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Enter Sanctuary
          </button>
        </div>
      </Modal>

      <Modal open={showSyncModal} title="Live Sync & Backup" onClose={() => setShowSyncModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Room Code</label>
            <input
              type="text"
              value={state.roomCode}
              onChange={(e) => commitState((p) => ({ ...p, roomCode: e.target.value }))}
              className="w-full rounded-xl px-3.5 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">Firebase Realtime DB URL</label>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => {
                setSyncUrl(e.target.value);
                localStorage.setItem('syncpulse_cloud_url', e.target.value.trim());
              }}
              className="w-full rounded-xl px-3.5 py-2 text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            />
          </div>
          <button
            type="button"
            onClick={async () => {
              const link = `${window.location.origin}${window.location.pathname}?room=${state.roomCode}`;
              await navigator.clipboard.writeText(link);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2500);
            }}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <LinkSimple weight="bold" className="w-4 h-4" />
            <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Magic Invite Link'}</span>
          </button>
          <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `syncpulse-${state.roomCode}.json`;
                a.click();
              }}
              className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs flex items-center justify-center gap-1.5"
            >
              <DownloadSimple className="w-4 h-4" /> Export
            </button>
            <label className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <UploadSimple className="w-4 h-4" /> Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const r = new FileReader();
                  r.onload = (ev) => {
                    try {
                      commitState(() => migrateState(JSON.parse(String(ev.target?.result))));
                      setShowSyncModal(false);
                    } catch {}
                  };
                  r.readAsText(file);
                }}
              />
            </label>
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
