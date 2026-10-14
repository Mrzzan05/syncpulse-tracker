import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Target, CalendarBlank, CheckCircle, Plus, Trash, PencilSimple,
  Play, Pause, ArrowCounterClockwise, Sparkle,
  CloudArrowUp, Check, X, GraduationCap, Question,
  ShareNetwork, UserPlus, Copy, Heart,
  SunDim, MoonStars, Coffee, CloudRain, SpeakerSlash,
  Compass, Fire, Medal, Trophy, DownloadSimple, UploadSimple,
  Timer, Waveform, Plant, Lightning, Crown, Buildings
} from '@phosphor-icons/react';
import {
  AppState, GoalItem, ScheduleItem, TaskItem, Member, ThemePalette, TimeLog
} from './types';
import { INITIAL_STATE } from './initialData';
import { GET_COZY_THEME } from './themes';
import {
  DAYS, getLocalDateStr, getTodayWeekday, uid, toMins, fromMins,
  formatRelativeTime, playGentleChime
} from './utils';

const migrateState = (raw: any): AppState => {
  if (!raw || !Array.isArray(raw.members) || raw.members.length === 0) {
    return INITIAL_STATE;
  }
  const todayDay = getTodayWeekday();
  return {
    version: 4,
    lastUpdatedMs: raw.lastUpdatedMs || Date.now(),
    members: raw.members,
    schedules: Array.isArray(raw.schedules) ? raw.schedules : INITIAL_STATE.schedules,
    goals: Array.isArray(raw.goals)
      ? raw.goals.map((g: any) => ({ ...g, targetHours: Math.max(1, Number(g.targetHours) || 10) }))
      : INITIAL_STATE.goals,
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.map((t: any) => ({ ...t, day: t.day || todayDay }))
      : INITIAL_STATE.tasks,
    exams: Array.isArray(raw.exams) ? raw.exams : INITIAL_STATE.exams,
    logs: Array.isArray(raw.logs)
      ? raw.logs.map((l: any) => ({
          ...l,
          createdAtMs: l.createdAtMs || Date.now() - 3600000,
          cheeredBy: Array.isArray(l.cheeredBy) ? l.cheeredBy : []
        }))
      : INITIAL_STATE.logs
  };
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const savedV4 = localStorage.getItem('syncpulse_v4');
    const savedV3 = localStorage.getItem('syncpulse_v3');
    const rawStr = savedV4 || savedV3;
    if (rawStr) {
      try {
        return migrateState(JSON.parse(rawStr));
      } catch {}
    }
    return INITIAL_STATE;
  });

  const [activeUser, setActiveUser] = useState<string>('mehrsan');
  const [isLatteMode, setIsLatteMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('syncpulse_latte');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'schedule' | 'analytics'>('dashboard');

  const realTodayName = getTodayWeekday();
  const [selectedDay, setSelectedDay] = useState<string>(realTodayName);
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);
  const [selectedHeatCell, setSelectedHeatCell] = useState<{ date: string; mins: number; member: string } | null>(null);

  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const notifiedTasksRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const mins = d.getHours() * 60 + d.getMinutes();
      setNowMinutes(mins);

      const nowHHMM = fromMins(mins);
      state.tasks.forEach((t) => {
        if (!t.completed && t.day === realTodayName && t.reminderTime === nowHHMM && !notifiedTasksRef.current.has(t.id)) {
          notifiedTasksRef.current.add(t.id);
          playGentleChime();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`SyncPulse Reminder: ${t.title}`, {
              body: `Scheduled for ${t.reminderTime} (+${t.estimatedMinutes}m)`
            });
          }
        }
      });
    }, 20000);
    return () => clearInterval(timer);
  }, [state.tasks, realTodayName]);

  // Web Audio API Cozy Ambient Sound Generator
  const [ambientMode, setAmbientMode] = useState<'off' | 'rain' | 'tone'>('off');
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (ambientMode === 'off') {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    if (ambientMode === 'rain') {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.12;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      whiteNoise.connect(filter);
      filter.connect(ctx.destination);
      whiteNoise.start(0);
    } else if (ambientMode === 'tone') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 216;
      osc2.frequency.value = 324;
      gain.gain.value = 0.025;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
    }

    return () => {
      ctx.close().catch(() => {});
    };
  }, [ambientMode]);

  // Modals & Escape Key Listener
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTutorial(false);
        setShowShareModal(false);
        setShowMemberModal(false);
        setShowGoalModal(false);
        setShowScheduleModal(false);
        setShowSyncModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistent Wall-Clock Timer
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro' | 'break'>(() => {
    return (localStorage.getItem('sp_timer_mode') as any) || 'stopwatch';
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    return localStorage.getItem('sp_timer_running') === 'true';
  });
  const [timerStartedAtMs, setTimerStartedAtMs] = useState<number | null>(() => {
    const s = localStorage.getItem('sp_timer_start');
    return s ? Number(s) : null;
  });
  const [timerAccumulatedSec, setTimerAccumulatedSec] = useState<number>(() => {
    return Number(localStorage.getItem('sp_timer_acc') || 0);
  });
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('sp_timer_mode', timerMode);
    localStorage.setItem('sp_timer_running', String(isTimerRunning));
    if (timerStartedAtMs) localStorage.setItem('sp_timer_start', String(timerStartedAtMs));
    else localStorage.removeItem('sp_timer_start');
    localStorage.setItem('sp_timer_acc', String(timerAccumulatedSec));
  }, [timerMode, isTimerRunning, timerStartedAtMs, timerAccumulatedSec]);

  useEffect(() => {
    const computeDisplay = () => {
      const activeElapsed =
        isTimerRunning && timerStartedAtMs
          ? Math.floor((Date.now() - timerStartedAtMs) / 1000)
          : 0;
      const totalElapsed = timerAccumulatedSec + activeElapsed;

      if (timerMode === 'stopwatch') {
        setDisplaySeconds(totalElapsed);
      } else {
        const target = timerMode === 'pomodoro' ? 25 * 60 : 5 * 60;
        const remaining = Math.max(0, target - totalElapsed);
        setDisplaySeconds(remaining);
        if (remaining === 0 && isTimerRunning) {
          setIsTimerRunning(false);
          setTimerStartedAtMs(null);
          setTimerAccumulatedSec(target);
          playGentleChime();
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(
              timerMode === 'pomodoro' ? '25m Focus Complete!' : 'Break Complete!',
              { body: timerMode === 'pomodoro' ? 'Click Log to bank your 25 minutes or take a 5m break.' : 'Ready for another focus session?' }
            );
          }
        }
      }
    };

    computeDisplay();
    const interval = setInterval(computeDisplay, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartedAtMs, timerAccumulatedSec, timerMode]);

  const toggleTimer = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    if (isTimerRunning) {
      const elapsed = timerStartedAtMs ? Math.floor((Date.now() - timerStartedAtMs) / 1000) : 0;
      setTimerAccumulatedSec((prev) => prev + elapsed);
      setTimerStartedAtMs(null);
      setIsTimerRunning(false);
      updatePresence(false);
    } else {
      setTimerStartedAtMs(Date.now());
      setIsTimerRunning(true);
      updatePresence(true);
    }
  };

  const resetTimer = (newMode: 'stopwatch' | 'pomodoro' | 'break' = timerMode) => {
    setIsTimerRunning(false);
    setTimerStartedAtMs(null);
    setTimerAccumulatedSec(0);
    setTimerMode(newMode);
    updatePresence(false);
  };

  const getElapsedTimerSeconds = (): number => {
    const activeElapsed =
      isTimerRunning && timerStartedAtMs
        ? Math.floor((Date.now() - timerStartedAtMs) / 1000)
        : 0;
    return timerAccumulatedSec + activeElapsed;
  };

  // Forms
  const [memberForm, setMemberForm] = useState({
    name: '',
    tagline: '',
    theme: 'peach-terracotta' as ThemePalette
  });
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    category: 'Short-Term' as GoalItem['category'],
    targetHours: 50,
    deadline: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    day: 'Saturday',
    title: '',
    startTime: '08:30',
    endTime: '10:30',
    details: '',
    category: 'Core' as ScheduleItem['category']
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('17:00');
  const [newTaskMins, setNewTaskMins] = useState(45);

  // Safe Debounced Cloud Sync
  const [syncUrl, setSyncUrl] = useState(() => localStorage.getItem('syncpulse_cloud_url') || '');
  const [syncError, setSyncError] = useState<string>('');
  const isTypingRef = useRef<boolean>(false);
  const syncTimeoutRef = useRef<any>(null);

  const currentMember = state.members.find((m) => m.id === activeUser) || state.members[0];
  const theme = GET_COZY_THEME(currentMember.theme, isLatteMode);

  useEffect(() => {
    localStorage.setItem('syncpulse_v4', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('syncpulse_latte', String(isLatteMode));
  }, [isLatteMode]);

  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : `${syncUrl.replace(/\/$/, '')}/syncpulse_v4.json`;
    const interval = setInterval(async () => {
      if (isTypingRef.current) return;
      try {
        const res = await fetch(cleanUrl);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && Array.isArray(remoteData.members)) {
            setState((local) => {
              if ((remoteData.lastUpdatedMs || 0) > (local.lastUpdatedMs || 0)) {
                return migrateState(remoteData);
              }
              return local;
            });
            setSyncError('');
          }
        }
      } catch {
        setSyncError('Offline (Saved locally)');
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [syncUrl]);

  const commitState = (updater: (prev: AppState) => AppState, debounceMs = 200) => {
    setState((prev) => {
      const next = { ...updater(prev), lastUpdatedMs: Date.now() };
      if (syncUrl) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
          try {
            const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : `${syncUrl.replace(/\/$/, '')}/syncpulse_v4.json`;
            await fetch(cleanUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next),
            });
            setSyncError('');
          } catch {
            setSyncError('Sync delayed');
          }
        }, debounceMs);
      }
      return next;
    });
  };

  const updatePresence = (isFocusing: boolean) => {
    const userGoals = state.goals.filter((g) => g.userId === activeUser);
    const g = userGoals.find((x) => x.id === selectedGoalId) || userGoals[0];
    commitState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === activeUser
          ? {
              ...m,
              presence: isFocusing
                ? {
                    isFocusing: true,
                    targetTitle: g ? g.title : 'Deep Focus',
                    startedAtMs: Date.now(),
                    mode: timerMode
                  }
                : null
            }
          : m
      )
    }));
  };

  const todayStr = getLocalDateStr();

  const triggerConfetti = () => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: currentMember.theme === 'lavender-blush' ? ['#C084FC', '#F472B6', '#FDE68A'] : ['#84A98C', '#E09F5A', '#FDE68A']
    });
  };

  const logGoalMinutes = (userId: string, goalId: string | null, title: string, minutes: number) => {
    if (minutes <= 0) return;
    triggerConfetti();
    const newLog: TimeLog = {
      id: uid('log'),
      userId,
      targetTitle: title,
      minutes,
      date: todayStr,
      createdAtMs: Date.now(),
      cheeredBy: []
    };

    commitState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g
      ),
      logs: [newLog, ...prev.logs]
    }));
  };

  const toggleCheerLog = (logId: string) => {
    commitState((prev) => ({
      ...prev,
      logs: prev.logs.map((l) => {
        if (l.id !== logId || l.userId === activeUser) return l;
        const already = l.cheeredBy.includes(activeUser);
        return {
          ...l,
          cheeredBy: already
            ? l.cheeredBy.filter((id) => id !== activeUser)
            : [...l.cheeredBy, activeUser]
        };
      })
    }));
  };

  const handleSaveTimerSession = () => {
    const elapsedSec = getElapsedTimerSeconds();
    const elapsedMins = Math.floor(elapsedSec / 60);
    if (elapsedMins < 1) return;

    const userGoals = state.goals.filter((g) => g.userId === activeUser);
    const targetGoal = userGoals.find((g) => g.id === selectedGoalId) || userGoals[0];
    logGoalMinutes(
      activeUser,
      targetGoal ? targetGoal.id : null,
      targetGoal ? targetGoal.title : 'Focus Session',
      elapsedMins
    );
    resetTimer(timerMode === 'pomodoro' ? 'break' : 'stopwatch');
  };

  const updateMemberStatus = (note: string) => {
    isTypingRef.current = true;
    commitState(
      (prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.id === activeUser ? { ...m, statusNote: note } : m))
      }),
      1200
    );
    setTimeout(() => {
      isTypingRef.current = false;
    }, 1500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || state.members.length >= 4) return;
    const id = uid(memberForm.name.trim().toLowerCase().replace(/\s+/g, '-'));
    const newMember: Member = {
      id,
      name: memberForm.name.trim(),
      tagline: memberForm.tagline.trim() || 'Squad Companion',
      avatar: memberForm.name.trim()[0].toUpperCase(),
      theme: memberForm.theme,
      statusNote: 'Excited to grow together ✨',
      presence: null
    };
    const starterGoal: GoalItem = {
      id: uid('goal'),
      userId: id,
      title: 'Personal Growth & Study',
      category: 'Short-Term',
      targetHours: 40,
      loggedMinutes: 0,
      deadline: 'Ongoing'
    };
    commitState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
      goals: [...prev.goals, starterGoal]
    }));
    setActiveUser(id);
    setMemberForm({ name: '', tagline: '', theme: 'matcha-cream' });
    setShowMemberModal(false);
  };

  const removeMember = (id: string, name: string) => {
    if (id === 'mehrsan' || id === 'ronak') return;
    if (!window.confirm(`Remove ${name} and all their goals/logs from the sanctuary?`)) return;
    commitState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      goals: prev.goals.filter((g) => g.userId !== id),
      schedules: prev.schedules.filter((s) => s.userId !== id),
      tasks: prev.tasks.filter((t) => t.userId !== id),
      logs: prev.logs.filter((l) => l.userId !== id)
    }));
    setActiveUser('mehrsan');
  };

  const openCreateGoal = () => {
    setEditingGoal(null);
    setGoalForm({ title: '', category: 'Short-Term', targetHours: 40, deadline: 'Ongoing' });
    setShowGoalModal(true);
  };

  const openEditGoal = (g: GoalItem) => {
    setEditingGoal(g);
    setGoalForm({
      title: g.title,
      category: g.category,
      targetHours: g.targetHours,
      deadline: g.deadline
    });
    setShowGoalModal(true);
  };

  const saveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    const safeTarget = Math.max(1, Number(goalForm.targetHours) || 20);
    if (editingGoal) {
      commitState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === editingGoal.id ? { ...g, ...goalForm, targetHours: safeTarget } : g
        )
      }));
    } else {
      const created: GoalItem = {
        id: uid('goal'),
        userId: activeUser,
        title: goalForm.title.trim(),
        category: goalForm.category,
        targetHours: safeTarget,
        loggedMinutes: 0,
        deadline: goalForm.deadline || 'Ongoing'
      };
      commitState((prev) => ({ ...prev, goals: [...prev.goals, created] }));
    }
    setShowGoalModal(false);
  };

  const deleteGoal = (goal: GoalItem) => {
    if (!window.confirm(`Delete goal "${goal.title}"?`)) return;
    commitState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== goal.id) }));
  };

  const toggleClassAttendance = (sched: ScheduleItem) => {
    const attended = sched.attendedDates.includes(todayStr);
    const sourceKey = `class-${sched.id}-${todayStr}`;
    const duration = Math.max(30, toMins(sched.endTime) - toMins(sched.startTime));

    if (!attended) triggerConfetti();

    commitState((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id !== sched.id
          ? s
          : {
              ...s,
              attendedDates: attended
                ? s.attendedDates.filter((d) => d !== todayStr)
                : [...s.attendedDates, todayStr]
            }
      ),
      logs: attended
        ? prev.logs.filter((l) => l.sourceKey !== sourceKey)
        : [
            {
              id: uid('log'),
              sourceKey,
              userId: sched.userId,
              targetTitle: `Class: ${sched.title}`,
              minutes: duration,
              date: todayStr,
              createdAtMs: Date.now(),
              cheeredBy: []
            },
            ...prev.logs.filter((l) => l.sourceKey !== sourceKey)
          ]
    }));
  };

  const saveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return;
    if (toMins(scheduleForm.endTime) <= toMins(scheduleForm.startTime)) {
      setScheduleError('End time must be after start time.');
      return;
    }
    setScheduleError('');
    const newItem: ScheduleItem = {
      id: uid('sched'),
      userId: activeUser,
      day: scheduleForm.day,
      title: scheduleForm.title.trim(),
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      details: scheduleForm.details || 'Scheduled Block',
      category: scheduleForm.category,
      attendedDates: []
    };
    commitState((prev) => ({ ...prev, schedules: [...prev.schedules, newItem] }));
    setShowScheduleModal(false);
  };

  const deleteScheduleItem = (item: ScheduleItem) => {
    if (!window.confirm(`Remove "${item.title}" from ${item.day} schedule?`)) return;
    commitState((prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== item.id) }));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const t: TaskItem = {
      id: uid('task'),
      userId: activeUser,
      day: timelineDay,
      title: newTaskTitle.trim(),
      reminderTime: newTaskTime,
      completed: false,
      estimatedMinutes: Number(newTaskMins) || 30,
      createdAt: todayStr
    };
    commitState((prev) => ({ ...prev, tasks: [t, ...prev.tasks] }));
    setNewTaskTitle('');
  };

  const toggleTask = (task: TaskItem) => {
    const becomingCompleted = !task.completed;
    const sourceKey = `task-${task.id}`;
    if (becomingCompleted) triggerConfetti();

    commitState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, completed: becomingCompleted } : t)),
      logs: becomingCompleted
        ? [
            {
              id: uid('log'),
              sourceKey,
              userId: task.userId,
              targetTitle: `Task: ${task.title}`,
              minutes: task.estimatedMinutes,
              date: todayStr,
              createdAtMs: Date.now(),
              cheeredBy: []
            },
            ...prev.logs.filter((l) => l.sourceKey !== sourceKey)
          ]
        : prev.logs.filter((l) => l.sourceKey !== sourceKey)
    }));
  };

  const deleteTask = (task: TaskItem) => {
    const sourceKey = `task-${task.id}`;
    commitState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== task.id),
      logs: prev.logs.filter((l) => l.sourceKey !== sourceKey)
    }));
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syncpulse-backup-${todayStr}.json`;
    a.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        commitState(() => migrateState(parsed));
        alert('Backup restored successfully! ✨');
        setShowSyncModal(false);
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const memberMetrics = useMemo(() => {
    const map: Record<string, {
      todayMins: number;
      totalMins: number;
      totalHours: string;
      streak: number;
      level: number;
      title: string;
      totalXP: number;
      currentLevelXP: number;
      xpPerLevel: number;
      progressPct: number;
      grid28: { dateStr: string; prettyDate: string; weekdayShort: string; mins: number; level: number }[];
    }> = {};

    state.members.forEach((m) => {
      const mLogs = state.logs.filter((l) => l.userId === m.id);
      const todayMins = mLogs.filter((l) => l.date === todayStr).reduce((a, b) => a + b.minutes, 0);

      const goalMins = state.goals.filter((g) => g.userId === m.id).reduce((a, b) => a + b.loggedMinutes, 0);
      const nonGoalLogMins = mLogs.filter((l) => l.sourceKey).reduce((a, b) => a + b.minutes, 0);
      const totalMins = goalMins + nonGoalLogMins;
      const totalHours = (totalMins / 60).toFixed(1);

      const activeDates = new Set(mLogs.filter((l) => l.minutes > 0).map((l) => l.date));
      let streak = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = getLocalDateStr(d);
        if (activeDates.has(dStr)) streak++;
        else if (i === 0) continue;
        else break;
      }

      const totalXP = totalMins * 10;
      const xpPerLevel = 6000;
      const level = Math.max(1, Math.floor(totalXP / xpPerLevel) + 1);
      const currentLevelXP = totalXP % xpPerLevel;
      const progressPct = Math.min(100, Math.round((currentLevelXP / xpPerLevel) * 100));
      const title =
        level >= 8 ? 'Grandmaster Luminary' : level >= 5 ? 'Master Scholar' : level >= 3 ? 'Steady Seeker' : 'Rising Star';

      const grid28 = Array.from({ length: 28 }, (_, idx) => {
        const daysAgo = 27 - idx;
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const dateStr = getLocalDateStr(d);
        const prettyDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'narrow' });
        const mins = mLogs.filter((l) => l.date === dateStr).reduce((a, b) => a + b.minutes, 0);
        const lv = mins === 0 ? 0 : mins < 45 ? 1 : mins < 120 ? 2 : 3;
        return { dateStr, prettyDate, weekdayShort, mins, level: lv };
      });

      map[m.id] = {
        todayMins,
        totalMins,
        totalHours,
        streak,
        level,
        title,
        totalXP,
        currentLevelXP,
        xpPerLevel,
        progressPct,
        grid28
      };
    });

    return map;
  }, [state.members, state.logs, state.goals, todayStr]);

  const activeStats = memberMetrics[activeUser] || memberMetrics[state.members[0].id];
  const userGoals = state.goals.filter((g) => g.userId === activeUser);
  const userDayTasks = state.tasks.filter((t) => t.userId === activeUser && t.day === timelineDay);

  const activeBadges = useMemo(() => {
    const userLogs = state.logs.filter((l) => l.userId === activeUser);
    const totalHrs = Number(activeStats.totalHours);
    const hasDeepSession = userLogs.some((l) => l.minutes >= 90);
    const othersCheeredCount = userLogs.reduce(
      (acc, l) => acc + l.cheeredBy.filter((uid) => uid !== activeUser).length,
      0
    );

    return [
      { id: 'spark', Icon: Plant, name: 'First Spark', desc: 'Logged your first focus session', unlocked: userLogs.length > 0 },
      { id: 'flame', Icon: Fire, name: '3-Day Flame', desc: 'Maintained a 3+ day focus streak', unlocked: activeStats.streak >= 3 },
      { id: 'deep', Icon: Lightning, name: 'Deep Diver', desc: 'Completed a 90+ min focus block', unlocked: hasDeepSession },
      { id: 'beloved', Icon: Heart, name: 'Warm Spirit', desc: 'Received cheers from companions', unlocked: othersCheeredCount >= 2 },
      { id: 'club10', Icon: Buildings, name: '10-Hour Club', desc: 'Banked over 10 total hours', unlocked: totalHrs >= 10 },
      { id: 'legend50', Icon: Crown, name: '50-Hour Legend', desc: 'Banked over 50 total hours', unlocked: totalHrs >= 50 }
    ];
  }, [state.logs, activeUser, activeStats]);

  const generateShareText = () => {
    const topGoals = userGoals
      .slice(0, 3)
      .map((g) => `• ${g.title}: ${(g.loggedMinutes / 60).toFixed(1)}h / ${g.targetHours}h`)
      .join('\n');

    return `🌿 SyncPulse Cozy Log — ${currentMember.name}\n🔥 Streak: ${activeStats.streak} Days | ⭐ Lv.${activeStats.level} (${activeStats.totalXP} XP)\n⏱️ Today's Focus: ${Math.floor(activeStats.todayMins / 60)}h ${activeStats.todayMins % 60}m\n🏆 Total Banked: ${activeStats.totalHours} hrs\n\n🎯 Active Goals:\n${topGoals}`;
  };

  const handleShareStatus = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${currentMember.name}'s SyncPulse`, text });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      alert('Copy failed—please select the text manually.');
    }
  };

  const dailyStream = useMemo(() => {
    const dayClasses = state.schedules.filter(
      (s) => s.userId === activeUser && s.day === timelineDay
    );

    const base: any[] = [];
    dayClasses.forEach((c) => {
      const sM = toMins(c.startTime);
      const eM = Math.max(sM + 30, toMins(c.endTime));
      base.push({
        id: c.id,
        kind: 'class',
        title: c.title,
        subtitle: c.details,
        badge: c.category,
        startMins: sM,
        endMins: eM,
        startTime: c.startTime,
        endTime: c.endTime,
        durationMins: eM - sM,
        completed: c.attendedDates.includes(todayStr),
        rawClass: c
      });
    });

    userDayTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const eM = sM + (t.estimatedMinutes || 30);
      base.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: `Scheduled Intention • +${t.estimatedMinutes * 10} XP`,
        badge: 'Intention',
        startMins: sM,
        endMins: eM,
        startTime: t.reminderTime,
        endTime: fromMins(eM),
        durationMins: t.estimatedMinutes || 30,
        completed: t.completed,
        rawTask: t
      });
    });

    base.sort((a, b) => a.startMins - b.startMins);

    const out: any[] = [];
    for (let i = 0; i < base.length; i++) {
      const cur = base[i];
      const prev = i > 0 ? base[i - 1] : null;
      cur.overlaps = prev ? cur.startMins < prev.endMins : false;
      out.push(cur);

      if (i < base.length - 1) {
        const next = base[i + 1];
        const gapMins = next.startMins - cur.endMins;
        if (gapMins >= 45) {
          out.push({
            id: `gap-${cur.id}-${next.id}`,
            kind: 'gap',
            title: 'Free Focus Window',
            subtitle: `Open breathing room before ${next.title}`,
            startMins: cur.endMins,
            endMins: next.startMins,
            startTime: fromMins(cur.endMins),
            endTime: fromMins(next.startMins),
            durationMins: gapMins,
            completed: false
          });
        }
      }
    }
    return out;
  }, [state.schedules, activeUser, timelineDay, userDayTasks, todayStr]);

  const nextUpcomingItem = dailyStream.find(
    (item) => item.kind !== 'gap' && !item.completed && item.endMins > nowMinutes
  );

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = getLocalDateStr(d);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const memberTotals = state.members.map((m) => ({
        member: m,
        mins: state.logs
          .filter((l) => l.userId === m.id && l.date === dateStr)
          .reduce((a, b) => a + b.minutes, 0)
      }));
      return { dateStr, label, memberTotals };
    });
  }, [state.members, state.logs]);

  const maxChartMins = Math.max(
    120,
    ...last7Days.flatMap((d) => d.memberTotals.map((mt) => mt.mins))
  );

  const navItems = [
    { id: 'dashboard', label: 'Today’s Flow', icon: Compass, badge: `${dailyStream.filter(i => i.kind !== 'gap' && !i.completed).length}` },
    { id: 'goals', label: 'Goals & Time Bank', icon: Target, badge: `${userGoals.length}` },
    { id: 'schedule', label: 'Weekly Classes', icon: CalendarBlank },
    { id: 'analytics', label: 'Heatmaps & Badges', icon: Trophy, badge: `${activeBadges.filter(b => b.unlocked).length}/6` },
  ];

  const elapsedSecForLog = getElapsedTimerSeconds();
  const canLogSession = elapsedSecForLog >= 60;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row relative cozy-transition paper-grain ${theme.pageBg} ${theme.textMain} ${theme.selectionCls}`}>
      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`cozy-orb absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[110px] cozy-transition ${theme.orb1}`} />
        <div className={`cozy-orb absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full blur-[120px] cozy-transition ${theme.orb2}`} style={{ animationDelay: '-5s' }} />
      </div>

      {/* MOBILE COMPACT TOP BAR */}
      <div className={`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b backdrop-blur-xl ${theme.sidebarBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${theme.primaryBtn}`}>
            {currentMember.theme === 'lavender-blush' ? <Heart weight="fill" className="w-4 h-4 text-white" /> : <Coffee weight="fill" className="w-4 h-4 text-white" />}
          </div>
          <span className="font-serif italic text-xl">SyncPulse</span>
        </div>

        <div className="flex items-center gap-1.5">
          {state.members.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveUser(m.id)}
              aria-label={`Switch to ${m.name}`}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                m.id === activeUser ? theme.primaryBtn : `${theme.cardBg} ${theme.textMuted}`
              }`}
            >
              {m.name}
            </button>
          ))}
          <button
            onClick={() => setIsLatteMode(!isLatteMode)}
            aria-label="Toggle Day/Night Mode"
            className={`p-1.5 rounded-xl border ${theme.cardBg}`}
          >
            {isLatteMode ? <MoonStars weight="duotone" className="w-4 h-4 text-purple-600" /> : <SunDim weight="duotone" className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* DESKTOP LEFT SIDEBAR */}
      <aside className={`hidden lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex lg:flex-col border-r backdrop-blur-2xl z-30 p-5 justify-between overflow-y-auto cozy-transition ${theme.sidebarBg}`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center cozy-transition ${theme.primaryBtn}`}>
              {currentMember.theme === 'lavender-blush' ? (
                <Heart weight="duotone" className="w-5 h-5 text-white" />
              ) : (
                <Coffee weight="duotone" className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-serif italic text-2xl leading-none">SyncPulse</h1>
              <span className={`text-xs font-mono ${theme.textMuted}`}>Cozy Sanctuary</span>
            </div>
          </div>

          {/* Squad Companions Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-mono uppercase tracking-wider ${theme.textMuted}`}>
                Companions ({state.members.length}/4)
              </span>
              {state.members.length < 4 && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className={`text-xs font-semibold flex items-center gap-1 hover:underline ${theme.accentText}`}
                >
                  <UserPlus weight="duotone" className="w-3.5 h-3.5" /> Add
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {state.members.map((member) => {
                const isSelected = member.id === activeUser;
                const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                const mStat = memberMetrics[member.id];
                return (
                  <div
                    key={member.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveUser(member.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveUser(member.id)}
                    className={`w-full text-left cursor-pointer rounded-2xl p-2.5 border transition-all flex items-center justify-between group ${
                      isSelected
                        ? `${mStyle.activeNav} shadow-sm`
                        : 'border-transparent hover:bg-black/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 relative ${mStyle.softBadge}`}>
                        {member.avatar}
                        {member.presence?.isFocusing && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black absolute -bottom-0.5 -right-0.5" title="Focusing Live!" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold flex items-center gap-1 truncate">
                          {member.name}
                          {member.id === 'ronak' && <Heart weight="fill" className="w-3 h-3 text-purple-400 inline" />}
                        </p>
                        <p className={`text-xs font-mono ${theme.textMuted}`}>
                          {Math.floor(mStat.todayMins / 60)}h {mStat.todayMins % 60}m today
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 ${theme.streakBadge}`} title="Active Streak">
                        <Fire weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                        {mStat.streak}
                      </span>
                      {member.id !== 'mehrsan' && member.id !== 'ronak' && (
                        <button
                          type="button"
                          aria-label={`Remove ${member.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member.id, member.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400"
                        >
                          <X weight="bold" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Views (Phosphor Duotone when idle, Fill when active!) */}
          <nav className="space-y-1" aria-label="Main Navigation">
            <span className={`px-1 text-xs font-mono uppercase tracking-wider block mb-1.5 ${theme.textMuted}`}>
              Workspace Views
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    active ? theme.activeNav : `border-transparent ${theme.textMuted} hover:opacity-100`
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cozy Soundscape Widget */}
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${theme.innerCardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain weight="duotone" className="w-4 h-4" /> Cozy Ambience
              </span>
              {ambientMode !== 'off' && (
                <button
                  onClick={() => setAmbientMode('off')}
                  aria-label="Mute Ambient Audio"
                  className="text-xs font-mono text-rose-400 flex items-center gap-0.5"
                >
                  <SpeakerSlash weight="duotone" className="w-3.5 h-3.5" /> Mute
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setAmbientMode(ambientMode === 'rain' ? 'off' : 'rain')}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition ${
                  ambientMode === 'rain' ? theme.primaryBtn : `${theme.cardBg} ${theme.textMuted}`
                }`}
              >
                <CloudRain weight={ambientMode === 'rain' ? 'fill' : 'duotone'} className="w-4 h-4" />
                Soft Rain
              </button>
              <button
                onClick={() => setAmbientMode(ambientMode === 'tone' ? 'off' : 'tone')}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition ${
                  ambientMode === 'tone' ? theme.primaryBtn : `${theme.cardBg} ${theme.textMuted}`
                }`}
              >
                <Waveform weight={ambientMode === 'tone' ? 'bold' : 'duotone'} className="w-4 h-4" />
                Warm Tone
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className={`pt-4 border-t ${theme.divider} space-y-2`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLatteMode(!isLatteMode)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${theme.cardBg}`}
            >
              {isLatteMode ? (
                <MoonStars weight="duotone" className="w-4 h-4 text-purple-600" />
              ) : (
                <SunDim weight="duotone" className="w-4 h-4 text-amber-400" />
              )}
              {isLatteMode ? 'Night' : 'Latte'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${theme.primaryBtn}`}
            >
              <ShareNetwork weight="duotone" className="w-4 h-4" />
              Share
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              onClick={() => setShowSyncModal(true)}
              className={`flex items-center gap-1.5 ${theme.textMuted} hover:underline`}
            >
              <CloudArrowUp weight="duotone" className={`w-4 h-4 ${syncUrl ? 'text-emerald-500' : ''}`} />
              {syncUrl ? 'Sync & Backup' : 'Backup / Sync'}
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className={`flex items-center gap-1 ${theme.textMuted} hover:underline`}
            >
              <Question weight="duotone" className="w-4 h-4" /> Guide
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 min-w-0 relative z-10 pb-36">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
          {/* Live Companion Presence Alert */}
          {state.members.some((m) => m.presence?.isFocusing) && (
            <div className={`px-4 py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${theme.doneBadge}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {state.members
                    .filter((m) => m.presence?.isFocusing)
                    .map((m) => `${m.name} is focusing on "${m.presence?.targetTitle}"`)
                    .join(' • ')}
                </span>
              </div>
              <span className="font-mono text-xs flex items-center gap-1">
                <Sparkle weight="fill" className="w-3.5 h-3.5" /> Co-Op Live
              </span>
            </div>
          )}

          {/* Header Banner */}
          {activeTab === 'dashboard' ? (
            <section className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-md space-y-4 cozy-transition ${theme.cardBg}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 ${theme.streakBadge}`}>
                      <Fire weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                      {activeStats.streak} Day Streak
                    </span>
                    <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${theme.softBadge}`}>
                      <Sparkle weight="duotone" className="w-3.5 h-3.5" />
                      Lv.{activeStats.level} • {activeStats.title}
                    </span>
                    {nextUpcomingItem && (
                      <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${theme.innerCardBg}`}>
                        <Timer weight="duotone" className="w-3.5 h-3.5" />
                        Next: <b>{nextUpcomingItem.title}</b> ({nextUpcomingItem.startTime})
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight pt-1">
                    Flow through your day, {currentMember.name}.
                  </h2>
                  <label htmlFor="status-note-input" className="sr-only">Personal status note</label>
                  <input
                    id="status-note-input"
                    type="text"
                    value={currentMember.statusNote || ''}
                    onChange={(e) => updateMemberStatus(e.target.value)}
                    placeholder="Write a personal intention or status note..."
                    className={`text-xs bg-transparent border-b border-transparent focus:border-current focus:outline-none w-full max-w-md italic ${theme.textMuted}`}
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className={`px-4 py-2.5 rounded-2xl border text-right ${theme.innerCardBg}`}>
                    <span className={`text-xs font-mono uppercase block ${theme.textMuted}`}>Today</span>
                    <span className={`font-mono font-bold text-lg sm:text-xl ${theme.accentText}`}>
                      {Math.floor(activeStats.todayMins / 60)}h {activeStats.todayMins % 60}m
                    </span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl border text-right ${theme.innerCardBg}`}>
                    <span className={`text-xs font-mono uppercase block ${theme.textMuted}`}>Total Banked</span>
                    <span className="font-mono font-bold text-lg sm:text-xl">
                      {activeStats.totalHours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* RPG XP Progress Bar */}
              <div className={`pt-3 border-t ${theme.divider}`}>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Trophy weight="duotone" className={`w-4 h-4 ${theme.accentText}`} />
                    <span>Experience: <b>{activeStats.totalXP.toLocaleString()} XP</b></span>
                  </span>
                  <span className={theme.textMuted}>
                    {activeStats.currentLevelXP} / {activeStats.xpPerLevel} XP to Lv.{activeStats.level + 1} ({activeStats.progressPct}%)
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme.trackBg}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
                    style={{ width: `${activeStats.progressPct}%` }}
                  />
                </div>
              </div>
            </section>
          ) : (
            <div className={`px-5 py-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${theme.cardBg}`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-xl font-serif italic text-base flex items-center justify-center border ${theme.softBadge}`}>
                  {currentMember.avatar}
                </span>
                <span className="font-bold text-sm">{currentMember.name}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${theme.streakBadge}`}>
                  <Fire weight="fill" className="w-3.5 h-3.5 text-amber-500" /> {activeStats.streak}d
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                  Lv.{activeStats.level} ({activeStats.totalHours}h)
                </span>
              </div>
              <button
                onClick={() => setShowSyncModal(true)}
                className={`text-xs font-mono flex items-center gap-1.5 ${theme.textMuted} hover:underline`}
              >
                <DownloadSimple weight="duotone" className="w-4 h-4" /> Backup / Sync
              </button>
            </div>
          )}

          {/* VIEW 1: TODAY'S FLOW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Visual Daily Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <div className={`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-serif italic text-2xl flex items-center gap-2">
                        <Compass weight="duotone" className={`w-5 h-5 ${theme.accentText}`} />
                        Visual Daily Timeline ({timelineDay})
                      </h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Classes, tasks for {timelineDay}, and free focus windows
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setScheduleForm({ ...scheduleForm, day: timelineDay });
                        setScheduleError('');
                        setShowScheduleModal(true);
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1 border ${theme.softBadge}`}
                    >
                      <Plus weight="bold" className="w-3.5 h-3.5" /> Add Class
                    </button>
                  </div>

                  {/* Day Switcher */}
                  <div className={`flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b ${theme.divider}`}>
                    {DAYS.map((d) => {
                      const isToday = d === realTodayName;
                      const active = d === timelineDay;
                      return (
                        <button
                          key={d}
                          onClick={() => setTimelineDay(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 shrink-0 ${
                            active ? theme.primaryBtn : `${theme.innerCardBg} ${theme.textMuted}`
                          }`}
                        >
                          <span>{d.slice(0, 3)}</span>
                          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-current" title="Today" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Task for Selected Day */}
                  <form onSubmit={addTask} className="flex flex-wrap gap-2 mb-6">
                    <label htmlFor="new-task-title" className="sr-only">Task title</label>
                    <input
                      id="new-task-title"
                      type="text"
                      placeholder={`Plot task on ${timelineDay} (e.g., Practice French)...`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className={`flex-1 min-w-[160px] border rounded-2xl px-3.5 py-2 text-xs focus:outline-none ${theme.innerCardBg}`}
                    />
                    <label htmlFor="new-task-time" className="sr-only">Task time</label>
                    <input
                      id="new-task-time"
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={`border rounded-2xl px-2.5 py-2 text-xs font-mono ${theme.innerCardBg}`}
                    />
                    <label htmlFor="new-task-mins" className="sr-only">Task duration</label>
                    <select
                      id="new-task-mins"
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className={`border rounded-2xl px-2 py-2 text-xs font-mono ${theme.innerCardBg}`}
                    >
                      <option value={15}>15m</option>
                      <option value={30}>30m</option>
                      <option value={45}>45m</option>
                      <option value={60}>1h</option>
                      <option value={90}>1.5h</option>
                    </select>
                    <button
                      type="submit"
                      className={`px-4 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1 ${theme.primaryBtn}`}
                    >
                      <Plus weight="bold" className="w-3.5 h-3.5" /> Plot
                    </button>
                  </form>

                  {/* Timeline Stream */}
                  {dailyStream.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme.innerCardBg}`}>
                      <p className="font-serif italic text-xl">An open, unhurried {timelineDay}</p>
                      <p className={`text-xs ${theme.textMuted}`}>
                        No fixed classes or tasks plotted for {timelineDay}. Plot a task above or launch the focus timer!
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-2 sm:pl-4 space-y-4">
                      <div className={`absolute top-3 bottom-3 left-[68px] sm:left-[80px] border-l-2 border-dashed ${theme.timelineLine}`} />

                      {dailyStream.map((entry) => {
                        const isHappeningNow =
                          timelineDay === realTodayName &&
                          nowMinutes >= entry.startMins &&
                          nowMinutes <= entry.endMins;
                        const isNextUp = nextUpcomingItem?.id === entry.id && !isHappeningNow;
                        const minsUntilStart = entry.startMins - nowMinutes;
                        const countdownLabel =
                          minsUntilStart > 0
                            ? minsUntilStart >= 60
                              ? `in ${Math.floor(minsUntilStart / 60)}h ${minsUntilStart % 60}m`
                              : `in ${minsUntilStart}m`
                            : '';

                        if (entry.kind === 'gap') {
                          return (
                            <div key={entry.id} className="relative flex items-center gap-3 sm:gap-4">
                              <div className={`w-14 text-right font-mono text-xs shrink-0 ${theme.textMuted}`}>
                                {entry.startTime}
                              </div>
                              <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 shrink-0 ${theme.pageBg} ${theme.timelineLine}`} />
                              <div className={`flex-1 px-4 py-2.5 rounded-2xl border border-dashed flex flex-wrap items-center justify-between gap-2 text-xs ${theme.innerCardBg}`}>
                                <span className="font-medium flex items-center gap-1.5">
                                  <Sparkle weight="duotone" className={`w-4 h-4 ${theme.accentText}`} />
                                  {entry.title} ({Math.floor(entry.durationMins / 60) > 0 ? `${Math.floor(entry.durationMins / 60)}h ` : ''}{entry.durationMins % 60}m)
                                </span>
                                <button
                                  onClick={() => {
                                    resetTimer('pomodoro');
                                    setTimerStartedAtMs(Date.now());
                                    setIsTimerRunning(true);
                                    updatePresence(true);
                                  }}
                                  className={`text-xs font-mono px-2.5 py-1 rounded-xl border flex items-center gap-1 ${theme.softBadge}`}
                                >
                                  <Play weight="fill" className="w-3 h-3" /> Start 25m
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={entry.id} className="relative flex items-start gap-3 sm:gap-4">
                            <div className="w-14 text-right font-mono shrink-0 pt-2">
                              <span className="text-xs font-bold block">{entry.startTime}</span>
                              <span className={`text-xs block ${theme.textMuted}`}>{entry.endTime}</span>
                            </div>

                            <button
                              aria-label={`Mark ${entry.title} as completed`}
                              onClick={() => {
                                if (entry.kind === 'class' && entry.rawClass) toggleClassAttendance(entry.rawClass);
                                else if (entry.kind === 'task' && entry.rawTask) toggleTask(entry.rawTask);
                              }}
                              className={`mt-2.5 w-4 h-4 rounded-full border-2 z-10 shrink-0 flex items-center justify-center transition ${
                                entry.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : isHappeningNow
                                  ? 'bg-amber-400 border-amber-300 animate-ping'
                                  : `${theme.pageBg} border-current`
                              }`}
                            >
                              {entry.completed && <Check weight="bold" className="w-2.5 h-2.5" />}
                            </button>

                            <div
                              className={`flex-1 p-4 rounded-2xl border transition-all ${
                                isHappeningNow
                                  ? `${theme.cardBg} ${theme.activeBorder}`
                                  : entry.completed
                                  ? `${theme.innerCardBg} opacity-65`
                                  : theme.innerCardBg
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${theme.softBadge}`}>
                                    {entry.kind === 'class' ? (
                                      <GraduationCap weight="duotone" className="w-3.5 h-3.5" />
                                    ) : (
                                      <Sparkle weight="duotone" className="w-3.5 h-3.5" />
                                    )}
                                    {entry.kind === 'class' ? entry.badge : 'Intention'}
                                  </span>
                                  {entry.overlaps && (
                                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
                                      Time Overlap
                                    </span>
                                  )}
                                  {isHappeningNow && (
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border font-bold ${theme.streakBadge}`}>
                                      ● Now
                                    </span>
                                  )}
                                  {isNextUp && countdownLabel && (
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                                      {countdownLabel}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-xs font-mono ${theme.textMuted}`}>
                                  +{entry.durationMins * 10} XP
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div>
                                  <h4 className={`font-semibold text-sm ${entry.completed ? 'line-through' : ''}`}>
                                    {entry.title}
                                  </h4>
                                  <p className={`text-xs mt-0.5 ${theme.textMuted}`}>{entry.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      if (entry.kind === 'class' && entry.rawClass) toggleClassAttendance(entry.rawClass);
                                      else if (entry.kind === 'task' && entry.rawTask) toggleTask(entry.rawTask);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${
                                      entry.completed ? theme.doneBadge : theme.cardBg
                                    }`}
                                  >
                                    <CheckCircle weight={entry.completed ? 'fill' : 'duotone'} className="w-4 h-4" />
                                    {entry.completed ? 'Done' : `+${entry.durationMins}m`}
                                  </button>
                                  {entry.kind === 'task' && entry.rawTask && (
                                    <button
                                      aria-label={`Delete ${entry.title}`}
                                      onClick={() => deleteTask(entry.rawTask!)}
                                      className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
                                    >
                                      <Trash weight="duotone" className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 5 Cols: Shared Squad Feed + Upcoming Exams */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Heart weight="duotone" className={`w-5 h-5 ${theme.accentText}`} />
                      Shared Squad Feed
                    </h3>
                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${theme.softBadge}`}>
                      Live Activity
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {state.logs.slice(0, 15).map((log) => {
                      const logMember = state.members.find((m) => m.id === log.userId);
                      if (!logMember) return null;
                      const mStyle = GET_COZY_THEME(logMember.theme, isLatteMode);
                      const isOwnLog = log.userId === activeUser;
                      const hasCheered = log.cheeredBy.includes(activeUser);
                      return (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs ${theme.innerCardBg}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 ${mStyle.softBadge}`}>
                              {logMember.avatar}
                            </span>
                            <div className="truncate">
                              <p className="font-medium truncate">
                                <span className="font-bold">{logMember.name}</span> • {log.targetTitle}
                              </p>
                              <span className={`text-xs font-mono ${theme.textMuted}`}>
                                {formatRelativeTime(log.createdAtMs, log.date)} (+{log.minutes}m)
                              </span>
                            </div>
                          </div>

                          <button
                            disabled={isOwnLog}
                            onClick={() => toggleCheerLog(log.id)}
                            aria-label={isOwnLog ? 'Your activity log' : 'Cheer companion'}
                            title={isOwnLog ? 'Companions can cheer your log!' : 'Send a warm cheer'}
                            className={`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1 transition shrink-0 ${
                              hasCheered ? theme.primaryBtn : mStyle.softBadge
                            } ${isOwnLog ? 'opacity-70 cursor-default' : 'hover:scale-105'}`}
                          >
                            <Heart weight={hasCheered || log.cheeredBy.length > 0 ? 'fill' : 'duotone'} className="w-3.5 h-3.5" />
                            <span>{log.cheeredBy.length}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Exam Dates */}
                <div className={`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <h3 className="font-serif italic text-2xl flex items-center gap-2 mb-3">
                    <GraduationCap weight="duotone" className={`w-5 h-5 ${theme.accentText}`} />
                    University Exams (1405)
                  </h3>
                  <div className="space-y-2.5">
                    {state.exams.map((ex) => (
                      <div
                        key={ex.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${theme.innerCardBg}`}
                      >
                        <div>
                          <span className="font-semibold block">{ex.title}</span>
                          <span className={`text-xs ${theme.textMuted}`}>Prof. {ex.professor}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={`font-bold block ${theme.accentText}`}>{ex.date}</span>
                          <span className={`text-xs ${theme.textMuted}`}>{ex.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: GOALS & TIME BANK */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className={`flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border ${theme.cardBg}`}>
                <div>
                  <h3 className="font-serif italic text-2xl">Shared Dreams & Time Bank</h3>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Log quick study blocks (+15m, +30m, +1h) or customize short & long-term goals.
                  </p>
                </div>
                <button
                  onClick={openCreateGoal}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${theme.primaryBtn}`}
                >
                  <Plus weight="bold" className="w-4 h-4" />
                  New Goal for {currentMember.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  const mStat = memberMetrics[member.id];
                  return (
                    <div key={member.id} className={`rounded-3xl p-6 border space-y-4 ${theme.cardBg}`}>
                      <div className={`flex items-center justify-between border-b pb-3 ${theme.divider}`}>
                        <h4 className="font-serif italic text-2xl flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center border ${mStyle.softBadge}`}>
                            {member.avatar}
                          </span>
                          {member.name}'s Goals
                        </h4>
                        <span className={`text-xs font-mono ${theme.textMuted}`}>
                          {mStat.totalHours} hrs total
                        </span>
                      </div>

                      {state.goals
                        .filter((g) => g.userId === member.id)
                        .map((g) => {
                          const safeTarget = Math.max(1, g.targetHours);
                          const hrs = +(g.loggedMinutes / 60).toFixed(1);
                          const pct = Math.min(100, Math.round((hrs / safeTarget) * 100));
                          return (
                            <div key={g.id} className={`p-4 rounded-2xl border space-y-2.5 ${theme.innerCardBg}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-full border ${mStyle.softBadge}`}>
                                    {g.category}
                                  </span>
                                  <h5 className="font-semibold text-sm mt-1">{g.title}</h5>
                                  <p className={`text-xs font-mono ${theme.textMuted}`}>
                                    Horizon: {g.deadline}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    aria-label={`Edit ${g.title}`}
                                    onClick={() => openEditGoal(g)}
                                    className="p-1.5 opacity-60 hover:opacity-100"
                                  >
                                    <PencilSimple weight="duotone" className="w-4 h-4" />
                                  </button>
                                  <button
                                    aria-label={`Delete ${g.title}`}
                                    onClick={() => deleteGoal(g)}
                                    className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
                                  >
                                    <Trash weight="duotone" className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs font-mono pt-1">
                                <span>{hrs}h / {safeTarget}h ({pct}%)</span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 15)}
                                    className={`px-2 py-1 rounded-lg border ${theme.cardBg}`}
                                  >
                                    +15m
                                  </button>
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 30)}
                                    className={`px-2 py-1 rounded-lg border ${theme.cardBg}`}
                                  >
                                    +30m
                                  </button>
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 60)}
                                    className={`px-2 py-1 rounded-lg border font-bold ${mStyle.softBadge}`}
                                  >
                                    +1h
                                  </button>
                                </div>
                              </div>

                              <div className={`w-full h-2.5 rounded-full overflow-hidden ${theme.trackBg}`}>
                                <div className={`h-full rounded-full ${mStyle.progressBar}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: WEEKLY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-5">
              <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border ${theme.cardBg}`}>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition ${
                        selectedDay === day ? theme.primaryBtn : `${theme.innerCardBg} ${theme.textMuted}`
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setScheduleForm({ ...scheduleForm, day: selectedDay });
                    setScheduleError('');
                    setShowScheduleModal(true);
                  }}
                  className={`px-4 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 ${theme.primaryBtn}`}
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" />
                  Add Class for {currentMember.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  const dayItems = state.schedules
                    .filter((s) => s.userId === member.id && s.day === selectedDay)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  return (
                    <div key={member.id} className={`rounded-3xl p-6 border space-y-3 ${theme.cardBg}`}>
                      <h4 className="font-serif italic text-2xl flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center border ${mStyle.softBadge}`}>
                          {member.avatar}
                        </span>
                        {member.name}'s {selectedDay}
                      </h4>
                      {dayItems.length === 0 ? (
                        <p className={`text-xs py-6 text-center italic ${theme.textMuted}`}>
                          A free, unhurried {selectedDay}
                        </p>
                      ) : (
                        dayItems.map((item) => {
                          const attendedToday = item.attendedDates.includes(todayStr);
                          const isSelectedDayToday = selectedDay === realTodayName;
                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${theme.innerCardBg}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono text-xs font-bold ${mStyle.accentText}`}>
                                    {item.startTime} - {item.endTime}
                                  </span>
                                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${mStyle.softBadge}`}>
                                    {item.category}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-sm mt-1">{item.title}</h5>
                                <p className={`text-xs ${theme.textMuted}`}>{item.details}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isSelectedDayToday && (
                                  <button
                                    onClick={() => toggleClassAttendance(item)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                                      attendedToday ? theme.doneBadge : theme.cardBg
                                    }`}
                                  >
                                    <CheckCircle weight={attendedToday ? 'fill' : 'duotone'} className="w-4 h-4" />
                                    {attendedToday ? 'Attended' : 'Check-in'}
                                  </button>
                                )}
                                <button
                                  aria-label={`Delete ${item.title}`}
                                  onClick={() => deleteScheduleItem(item)}
                                  className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
                                >
                                  <Trash weight="duotone" className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: HEATMAPS, BADGES & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  const mStat = memberMetrics[member.id];
                  return (
                    <div key={member.id} className={`rounded-3xl p-6 border space-y-4 ${theme.cardBg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border ${mStyle.softBadge}`}>
                            {member.avatar}
                          </span>
                          <div>
                            <h4 className="font-serif italic text-2xl leading-none">
                              {member.name}'s 28-Day Heatmap
                            </h4>
                            <span className={`text-xs font-mono ${theme.textMuted}`}>
                              Tap any square to inspect minutes
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border font-bold flex items-center gap-1 ${theme.streakBadge}`}>
                          <Fire weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                          {mStat.streak}d
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-2 pt-1">
                        {mStat.grid28.map((cell) => (
                          <button
                            key={cell.dateStr}
                            type="button"
                            onClick={() => setSelectedHeatCell({ date: cell.prettyDate, mins: cell.mins, member: member.name })}
                            aria-label={`${member.name} on ${cell.prettyDate}: ${cell.mins} minutes`}
                            className={`h-8 rounded-xl border transition-all flex items-center justify-center text-[10px] font-mono ${mStyle.heatLevels[cell.level]}`}
                          >
                            {cell.mins > 0 ? `${cell.mins}m` : ''}
                          </button>
                        ))}
                      </div>

                      {selectedHeatCell && selectedHeatCell.member === member.name && (
                        <div className={`text-xs font-mono px-3 py-1.5 rounded-xl border flex justify-between ${theme.innerCardBg}`}>
                          <span>{selectedHeatCell.date}</span>
                          <span className="font-bold">{selectedHeatCell.mins} minutes logged</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Badges with Phosphor Duotone Vector Icons */}
              <div className={`rounded-3xl p-6 border ${theme.cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Medal weight="duotone" className={`w-6 h-6 ${theme.accentText}`} />
                      {currentMember.name}'s Sanctuary Badges
                    </h3>
                  </div>
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${theme.softBadge}`}>
                    {activeBadges.filter((b) => b.unlocked).length} / {activeBadges.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBadges.map((b) => {
                    const BadgeIcon = b.Icon;
                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                          b.unlocked ? `${theme.innerCardBg} ${theme.activeBorder}` : `${theme.innerCardBg} opacity-45 grayscale`
                        }`}
                      >
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${theme.softBadge}`}>
                          <BadgeIcon weight={b.unlocked ? 'duotone' : 'regular'} className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs sm:text-sm">{b.name}</h5>
                            {b.unlocked && <CheckCircle weight="fill" className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <p className={`text-xs ${theme.textMuted}`}>{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7-Day Chart */}
              <div className={`rounded-3xl p-6 border ${theme.cardBg}`}>
                <h3 className="font-serif italic text-2xl mb-4">7-Day Consistency Rhythm (Minutes)</h3>
                <div className={`grid grid-cols-7 gap-3 items-end h-56 pt-6 px-2 border-b ${theme.divider}`}>
                  {last7Days.map((d) => (
                    <div key={d.dateStr} className="flex flex-col items-center h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        {d.memberTotals.map((mt) => {
                          const hPct = Math.round((mt.mins / maxChartMins) * 100);
                          const barGrad = GET_COZY_THEME(mt.member.theme, isLatteMode).barColor;
                          return (
                            <div
                              key={mt.member.id}
                              title={`${mt.member.name}: ${mt.mins}m`}
                              className={`w-4 sm:w-6 bg-gradient-to-t ${barGrad} rounded-t-xl transition-all duration-500 flex items-start justify-center`}
                              style={{ height: `${Math.max(10, hPct)}%` }}
                            >
                              {mt.mins > 0 && (
                                <span className="text-[10px] font-mono -mt-5">{mt.mins}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <span className={`text-xs font-mono mt-2 ${theme.textMuted}`}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* COMPACT FLOATING FOCUS DOCK */}
        <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 lg:left-72 z-30 px-3 sm:px-4 pointer-events-none">
          <div className={`max-w-2xl mx-auto rounded-3xl p-2.5 sm:px-4 border backdrop-blur-2xl pointer-events-auto flex items-center justify-between gap-2 cozy-transition ${theme.dockBg}`}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button
                onClick={() =>
                  resetTimer(
                    timerMode === 'stopwatch' ? 'pomodoro' : timerMode === 'pomodoro' ? 'break' : 'stopwatch'
                  )
                }
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border shrink-0 flex items-center gap-1 transition ${theme.softBadge}`}
                title="Switch Timer Mode (Stopwatch / 25m Focus / 5m Break)"
              >
                <Timer weight="duotone" className="w-4 h-4" />
                {timerMode === 'pomodoro' ? '25m' : timerMode === 'break' ? '5m' : 'Free'}
              </button>
              <label htmlFor="dock-goal-select" className="sr-only">Select Goal</label>
              <select
                id="dock-goal-select"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none truncate ${theme.innerCardBg}`}
              >
                <option value="">Goal ({currentMember.name})</option>
                {userGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider px-2 shrink-0">
              {String(Math.floor(displaySeconds / 60)).padStart(2, '0')}:
              {String(displaySeconds % 60).padStart(2, '0')}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleTimer}
                className={`px-3.5 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1 transition ${theme.primaryBtn}`}
              >
                {isTimerRunning ? <Pause weight="fill" className="w-3.5 h-3.5" /> : <Play weight="fill" className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              {timerMode !== 'break' && (
                <button
                  onClick={handleSaveTimerSession}
                  disabled={!canLogSession}
                  title={canLogSession ? 'Log elapsed minutes' : 'Focus at least 1 minute to log'}
                  className={`px-3 py-2 rounded-2xl font-semibold text-xs border flex items-center gap-1 transition disabled:opacity-40 ${theme.softBadge}`}
                >
                  <Check weight="bold" className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log</span>
                </button>
              )}
              <button
                onClick={() => resetTimer()}
                aria-label="Reset Timer"
                className={`p-2 rounded-xl border ${theme.innerCardBg}`}
              >
                <ArrowCounterClockwise weight="duotone" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE THUMB-FRIENDLY BOTTOM NAVIGATION BAR (Phosphor Duotone -> Fill) */}
        <nav
          aria-label="Mobile Navigation"
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-2xl grid grid-cols-4 px-2 py-1.5 ${theme.sidebarBg}`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-xs font-medium ${
                  active ? theme.accentText : theme.textMuted
                }`}
              >
                <Icon weight={active ? 'fill' : 'duotone'} className="w-5 h-5 mb-0.5" />
                <span className="text-[11px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BACKUP & CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Data Backup & Cloud Sync</h3>
              <button aria-label="Close modal" onClick={() => setShowSyncModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2.5 ${theme.innerCardBg}`}>
              <p className="text-xs font-semibold">Local JSON Backup (Safe & Offline)</p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${theme.primaryBtn}`}
                >
                  <DownloadSimple weight="duotone" className="w-4 h-4" /> Export Backup
                </button>
                <label className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${theme.cardBg}`}>
                  <UploadSimple weight="duotone" className="w-4 h-4" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sync-url-input" className={`block text-xs ${theme.textMuted}`}>
                Optional Real-Time REST Database URL
              </label>
              <input
                id="sync-url-input"
                type="url"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                placeholder="https://your-project-default-rtdb.firebaseio.com/"
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
              />
              {syncError && <p className="text-xs text-amber-400">{syncError}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE STATUS MODAL */}
      {showShareModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Share {currentMember.name}'s Snapshot</h3>
              <button aria-label="Close modal" onClick={() => setShowShareModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <pre className={`p-4 rounded-2xl border text-xs font-mono whitespace-pre-wrap leading-relaxed ${theme.innerCardBg}`}>
              {generateShareText()}
            </pre>

            <button
              onClick={handleShareStatus}
              className={`w-full py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 ${theme.primaryBtn}`}
            >
              <Copy weight="duotone" className="w-4 h-4" />
              {copiedShare ? 'Copied to Clipboard!' : 'Share / Copy Status Text'}
            </button>
          </div>
        </div>
      )}

      {/* ADD COMPANION MODAL */}
      {showMemberModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddMember} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Invite Companion ({state.members.length}/4)</h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowMemberModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="member-name" className={`block text-xs mb-1 ${theme.textMuted}`}>Name</label>
              <input
                id="member-name"
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div>
              <label htmlFor="member-tagline" className={`block text-xs mb-1 ${theme.textMuted}`}>Focus / Tagline</label>
              <input
                id="member-tagline"
                type="text"
                value={memberForm.tagline}
                onChange={(e) => setMemberForm({ ...memberForm, tagline: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div>
              <label htmlFor="member-theme" className={`block text-xs mb-1 ${theme.textMuted}`}>Cozy Palette</label>
              <select
                id="member-theme"
                value={memberForm.theme}
                onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
                className={`w-full border rounded-2xl px-3 py-2.5 text-xs ${theme.innerCardBg}`}
              >
                <option value="peach-terracotta">Warm Terracotta & Peach</option>
                <option value="matcha-cream">Matcha Oat Milk</option>
                <option value="lavender-blush">Velvet Lavender & Rose</option>
                <option value="warm-sage">Espresso & Warm Sage</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowMemberModal(false)} className={`px-4 py-2 rounded-2xl border text-xs ${theme.cardBg}`}>
                Cancel
              </button>
              <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}>
                Add Companion
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD / EDIT GOAL MODAL */}
      {showGoalModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveGoal} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                {editingGoal ? 'Edit Goal' : `New Goal for ${currentMember.name}`}
              </h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowGoalModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="goal-title" className={`block text-xs mb-1 ${theme.textMuted}`}>Goal Title</label>
              <input
                id="goal-title"
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-cat" className={`block text-xs mb-1 ${theme.textMuted}`}>Category</label>
                <select
                  id="goal-cat"
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as GoalItem['category'] })}
                  className={`w-full border rounded-2xl px-3 py-2.5 text-xs ${theme.innerCardBg}`}
                >
                  <option value="Short-Term">Short-Term</option>
                  <option value="Long-Term">Long-Term</option>
                  <option value="Habit">Habit</option>
                  <option value="Career">Career</option>
                </select>
              </div>
              <div>
                <label htmlFor="goal-hrs" className={`block text-xs mb-1 ${theme.textMuted}`}>Target Hours (Min 1)</label>
                <input
                  id="goal-hrs"
                  type="number"
                  min={1}
                  required
                  value={goalForm.targetHours}
                  onChange={(e) => setGoalForm({ ...goalForm, targetHours: Math.max(1, Number(e.target.value)) })}
                  className={`w-full border rounded-2xl px-3 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal-deadline" className={`block text-xs mb-1 ${theme.textMuted}`}>Horizon / Deadline</label>
              <input
                id="goal-deadline"
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowGoalModal(false)} className={`px-4 py-2 rounded-2xl border text-xs ${theme.cardBg}`}>
                Cancel
              </button>
              <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {showScheduleModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveScheduleItem} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Add Class ({currentMember.name})</h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowScheduleModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="sched-title" className={`block text-xs mb-1 ${theme.textMuted}`}>Title</label>
              <input
                id="sched-title"
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="sched-day" className={`block text-xs mb-1 ${theme.textMuted}`}>Day</label>
                <select
                  id="sched-day"
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                  className={`w-full border rounded-2xl px-2.5 py-2.5 text-xs ${theme.innerCardBg}`}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sched-start" className={`block text-xs mb-1 ${theme.textMuted}`}>Start</label>
                <input
                  id="sched-start"
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className={`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
              <div>
                <label htmlFor="sched-end" className={`block text-xs mb-1 ${theme.textMuted}`}>End</label>
                <input
                  id="sched-end"
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className={`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
            </div>

            {scheduleError && <p className="text-xs text-rose-400">{scheduleError}</p>}

            <div>
              <label htmlFor="sched-details" className={`block text-xs mb-1 ${theme.textMuted}`}>Details</label>
              <input
                id="sched-details"
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowScheduleModal(false)} className={`px-4 py-2 rounded-2xl border text-xs ${theme.cardBg}`}>
                Cancel
              </button>
              <button type="submit" className={`px-5 py-2 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK GUIDE MODAL */}
      {showTutorial && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-7 space-y-4 shadow-2xl ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${theme.softBadge}`}>
                SyncPulse v4.1 Guide
              </span>
              <button aria-label="Close guide" onClick={() => setShowTutorial(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-serif italic text-3xl">Your Cozy Co-Op Sanctuary</h3>
            <ul className={`text-xs space-y-2 leading-relaxed ${theme.textMuted}`}>
              <li>• <b>Visual Timeline:</b> Plots your classes and tasks for the selected day and highlights Free Focus Windows.</li>
              <li>• <b>Persistent Timer:</b> Runs accurately even if you refresh the page or lock your phone. Supports Stopwatch, 25m Pomodoro, and 5m Breaks.</li>
              <li>• <b>Fair XP & Streaks:</b> Every minute logged earns +10 XP. Unchecking a task cleanly reverses its XP.</li>
              <li>• <b>Backup & PWA:</b> Export/Import JSON backups anytime, or install SyncPulse as an app from your browser menu!</li>
            </ul>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowTutorial(false)} className={`px-5 py-2.5 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
