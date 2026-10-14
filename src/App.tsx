import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Target, CalendarBlank, CheckCircle, Circle, Plus, Trash, PencilSimple,
  Play, Pause, ArrowCounterClockwise, Sparkle,
  CloudArrowUp, CloudCheck, CloudSlash, Check, X, GraduationCap,
  ShareNetwork, UserPlus, Copy, Heart,
  SunDim, MoonStars, Coffee, CloudRain, SpeakerSlash,
  Compass, Fire, Medal, Trophy, DownloadSimple, UploadSimple,
  Timer, Waveform, Plant, Lightning, Crown, Buildings,
  ArrowsOutSimple, ArrowsInSimple, ListChecks, Key, UsersThree,
  MagicWand, CaretDown, CaretUp, LinkSimple
} from '@phosphor-icons/react';
import {
  AppState, GoalItem, ScheduleItem, TaskItem, Member, ThemePalette, TimeLog, ExamItem
} from './types';
import {
  INITIAL_STATE, DEFAULT_CLOUD_DB_URL, CREATE_DEMO_STATE,
  CREATE_CUSTOM_SANCTUARY, CREATE_MEHRSAN_RONAK_PRESET
} from './initialData';
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
    version: 6,
    isConfigured: raw.isConfigured !== undefined ? Boolean(raw.isConfigured) : true,
    workspaceName: raw.workspaceName || 'Sanctuary',
    roomCode: raw.roomCode || 'default-room',
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

const buildCloudEndpoint = (baseUrl: string, roomCode: string): string => {
  const safeRoom = (roomCode || 'default-room')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const trimmed = baseUrl.trim().replace(/\/$/, '').replace(/\.json$/, '');
  return `${trimmed}/sanctuaries/${safeRoom}.json`;
};

export default function App() {
  // Check URL parameters first for Magic Invite Link (?room=...&db=...)
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
    const savedV6 = localStorage.getItem('syncpulse_v6');
    if (savedV6) {
      try {
        return migrateState(JSON.parse(savedV6));
      } catch {}
    }
    return INITIAL_STATE;
  });

  // Clean URL query params after reading so address bar stays tidy
  useEffect(() => {
    if (urlRoom || urlDb) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [urlRoom, urlDb]);

  const [activeUser, setActiveUser] = useState<string>(() => state.members[0]?.id || 'mehrsan');
  const [isLatteMode, setIsLatteMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('syncpulse_latte');
    if (saved !== null) return saved === 'true';
    return false;
  });
  const [activeTab, setActiveTab] = useState<'today' | 'goals' | 'schedule' | 'together'>('today');
  const [isFocusRoomOpen, setIsFocusRoomOpen] = useState<boolean>(false);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  // Onboarding Wizard
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !state.isConfigured);
  const [onboardingMode, setOnboardingMode] = useState<'code' | 'create'>('code');
  const [setupForm, setSetupForm] = useState({
    workspaceName: 'Our Sanctuary',
    roomCode: '',
    p1Name: '',
    p1Tagline: '',
    p1Theme: 'warm-sage' as ThemePalette,
    p2Name: '',
    p2Tagline: '',
    p2Theme: 'lavender-blush' as ThemePalette,
    secretUnlockCode: 'mr-1405'
  });

  useEffect(() => {
    if (!state.members.some((m) => m.id === activeUser) && state.members[0]) {
      setActiveUser(state.members[0].id);
    }
  }, [state.members, activeUser]);

  const realTodayName = getTodayWeekday();
  const [selectedDay, setSelectedDay] = useState<string>(realTodayName);
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);
  const [selectedHeatCell, setSelectedHeatCell] = useState<{ date: string; mins: number; member: string } | null>(null);
  const [milestoneInputs, setMilestoneInputs] = useState<Record<string, string>>({});

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
        output[i] *= 0.1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

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
      gain.gain.value = 0.02;
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

  // Modals
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [copiedMagicLink, setCopiedMagicLink] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusRoomOpen(false);
        setShowShareModal(false);
        setShowMemberModal(false);
        setShowGoalModal(false);
        setShowScheduleModal(false);
        setShowExamModal(false);
        setShowSyncModal(false);
        if (state.isConfigured) setShowOnboarding(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isConfigured]);

  // Persistent Wall-Clock Timer
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro' | 'break'>(() => {
    return (localStorage.getItem('sp_timer_mode') as any) || 'pomodoro';
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
  const [displaySeconds, setDisplaySeconds] = useState<number>(25 * 60);
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
        }
      }
    };

    computeDisplay();
    const interval = setInterval(computeDisplay, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartedAtMs, timerAccumulatedSec, timerMode]);

  const toggleTimer = () => {
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
    category: 'Long-Term' as GoalItem['category'],
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
  const [examForm, setExamForm] = useState({
    title: '',
    date: '1405/11/01',
    time: '10:00',
    professor: '',
    type: 'Core' as ExamItem['type']
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('17:00');
  const [newTaskMins, setNewTaskMins] = useState(45);

  // ============================================================================
  // REAL-TIME LIVE DATABASE ENGINE (Server-Sent Events + REST Fallback)
  // ============================================================================
  const [syncState, setSyncState] = useState<'local' | 'live' | 'error'>('local');
  const isTypingRef = useRef<boolean>(false);
  const syncTimeoutRef = useRef<any>(null);

  const currentMember = state.members.find((m) => m.id === activeUser) || state.members[0];
  const theme = GET_COZY_THEME(currentMember?.theme || 'warm-sage', isLatteMode);

  useEffect(() => {
    localStorage.setItem('syncpulse_v6', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('syncpulse_latte', String(isLatteMode));
  }, [isLatteMode]);

  useEffect(() => {
    if (!syncUrl || !state.isConfigured) {
      setSyncState('local');
      return;
    }
    const endpoint = buildCloudEndpoint(syncUrl, state.roomCode);

    // 1. Initial Pull or Push
    const initSync = async () => {
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const remote = await res.json();
          if (remote && Array.isArray(remote.members)) {
            setState((local) =>
              (remote.lastUpdatedMs || 0) >= (local.lastUpdatedMs || 0)
                ? migrateState(remote)
                : local
            );
          } else {
            // Room doesn't exist on cloud yet -> push local state to initialize cloud room
            await fetch(endpoint, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(state)
            });
          }
          setSyncState('live');
        }
      } catch {
        setSyncState('error');
      }
    };
    initSync();

    // 2. Real-Time Server-Sent Events (SSE) stream for instant updates (<100ms)
    let es: EventSource | null = null;
    try {
      es = new EventSource(endpoint);
      es.addEventListener('put', (e: any) => {
        if (isTypingRef.current) return;
        try {
          const packet = JSON.parse(e.data);
          if (packet && packet.data && Array.isArray(packet.data.members)) {
            setState((local) => {
              if ((packet.data.lastUpdatedMs || 0) > (local.lastUpdatedMs || 0)) {
                return migrateState(packet.data);
              }
              return local;
            });
            setSyncState('live');
          }
        } catch {}
      });
    } catch {}

    // 3. Fallback Poll every 5s
    const interval = setInterval(async () => {
      if (isTypingRef.current) return;
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && Array.isArray(remoteData.members)) {
            setState((local) => {
              if ((remoteData.lastUpdatedMs || 0) > (local.lastUpdatedMs || 0)) {
                return migrateState(remoteData);
              }
              return local;
            });
            setSyncState('live');
          }
        }
      } catch {
        setSyncState('error');
      }
    }, 5000);

    return () => {
      if (es) es.close();
      clearInterval(interval);
    };
  }, [syncUrl, state.roomCode, state.isConfigured]);

  const commitState = (updater: (prev: AppState) => AppState, debounceMs = 120) => {
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
              body: JSON.stringify(next),
            });
            if (res.ok) setSyncState('live');
          } catch {
            setSyncState('error');
          }
        }, debounceMs);
      }
      return next;
    });
  };

  const handleResetAllStatsToZero = () => {
    if (!window.confirm('Reset all logged hours, streaks, and completed logs back to 0.0h? (Your classes, exams, and goal titles will be kept)')) return;
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
    setShowSyncModal(false);
  };

  const copyMagicInviteLink = async () => {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('room', state.roomCode);
    if (syncUrl.trim()) params.set('db', syncUrl.trim());
    const fullLink = `${base}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopiedMagicLink(true);
      setTimeout(() => setCopiedMagicLink(false), 3000);
    } catch {}
  };

  // Onboarding Handlers
  const handleCreateCustomWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupForm.p1Name.trim()) return;
    const newState = CREATE_CUSTOM_SANCTUARY(
      setupForm.workspaceName,
      setupForm.roomCode || uid('room'),
      setupForm.p1Name,
      setupForm.p1Tagline,
      setupForm.p1Theme,
      setupForm.p2Name,
      setupForm.p2Tagline,
      setupForm.p2Theme
    );
    setState(newState);
    setActiveUser(newState.members[0].id);
    setShowOnboarding(false);
  };

  const handleUnlockByRoomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = setupForm.secretUnlockCode.trim().toLowerCase();
    if (!code) return;

    if (code === 'mr-1405' || code === 'mehrsan-ronak' || code === 'mehrsan' || code === 'ronak') {
      const preset = CREATE_MEHRSAN_RONAK_PRESET('mr-1405');
      setState(preset);
      setActiveUser('mehrsan');
      setShowOnboarding(false);
      return;
    }

    const customRoomState = CREATE_CUSTOM_SANCTUARY(
      `Sanctuary (${code})`,
      code,
      'Companion 1',
      'Focused Learner',
      'warm-sage'
    );
    setState(customRoomState);
    setActiveUser(customRoomState.members[0].id);
    setShowOnboarding(false);
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
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 }
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

  // Member CRUD
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberForm({ name: '', tagline: '', theme: 'peach-terracotta' });
    setShowMemberModal(true);
  };

  const openEditMemberModal = (m: Member) => {
    setEditingMember(m);
    setMemberForm({ name: m.name, tagline: m.tagline, theme: m.theme });
    setShowMemberModal(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim()) return;

    if (editingMember) {
      commitState((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                name: memberForm.name.trim(),
                tagline: memberForm.tagline.trim() || 'Companion',
                avatar: memberForm.name.trim()[0].toUpperCase(),
                theme: memberForm.theme
              }
            : m
        )
      }));
      setShowMemberModal(false);
      return;
    }

    if (state.members.length >= 4) return;
    const id = uid(memberForm.name.trim().toLowerCase().replace(/\s+/g, '-'));
    const newMember: Member = {
      id,
      name: memberForm.name.trim(),
      tagline: memberForm.tagline.trim() || 'Companion',
      avatar: memberForm.name.trim()[0].toUpperCase(),
      theme: memberForm.theme,
      statusNote: 'Focused and steady',
      presence: null
    };
    commitState((prev) => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    setActiveUser(id);
    setShowMemberModal(false);
  };

  const removeMember = (id: string, name: string) => {
    if (state.members.length <= 1) return;
    if (!window.confirm(`Remove ${name} from this sanctuary?`)) return;
    commitState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      goals: prev.goals.filter((g) => g.userId !== id),
      schedules: prev.schedules.filter((s) => s.userId !== id),
      tasks: prev.tasks.filter((t) => t.userId !== id),
      exams: prev.exams.filter((ex) => ex.userId !== id),
      logs: prev.logs.filter((l) => l.userId !== id)
    }));
  };

  // Goal & Milestone CRUD
  const openCreateGoal = () => {
    setEditingGoal(null);
    setGoalForm({ title: '', category: 'Long-Term', targetHours: 50, deadline: 'Ongoing' });
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
        deadline: goalForm.deadline || 'Ongoing',
        milestones: []
      };
      commitState((prev) => ({ ...prev, goals: [...prev.goals, created] }));
    }
    setShowGoalModal(false);
  };

  const deleteGoal = (goal: GoalItem) => {
    if (!window.confirm(`Delete goal "${goal.title}"?`)) return;
    commitState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== goal.id) }));
  };

  const addMilestone = (goalId: string) => {
    const text = (milestoneInputs[goalId] || '').trim();
    if (!text) return;
    commitState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: [...(g.milestones || []), { id: uid('ms'), title: text, completed: false }]
            }
          : g
      )
    }));
    setMilestoneInputs((prev) => ({ ...prev, [goalId]: '' }));
  };

  const toggleMilestone = (goalId: string, msId: string) => {
    commitState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          milestones: (g.milestones || []).map((m) =>
            m.id === msId ? { ...m, completed: !m.completed } : m
          )
        };
      })
    }));
  };

  const deleteMilestone = (goalId: string, msId: string) => {
    commitState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: (g.milestones || []).filter((m) => m.id !== msId) }
          : g
      )
    }));
  };

  // Exam CRUD
  const saveExamItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.title.trim()) return;
    const newEx: ExamItem = {
      id: uid('exam'),
      userId: activeUser,
      title: examForm.title.trim(),
      date: examForm.date.trim() || '1405/11/01',
      time: examForm.time || '10:00',
      professor: examForm.professor.trim() || 'Exam',
      type: examForm.type
    };
    commitState((prev) => ({ ...prev, exams: [...prev.exams, newEx] }));
    setExamForm({ title: '', date: '1405/11/01', time: '10:00', professor: '', type: 'Core' });
    setShowExamModal(false);
  };

  const deleteExamItem = (ex: ExamItem) => {
    if (!window.confirm(`Remove exam "${ex.title}"?`)) return;
    commitState((prev) => ({ ...prev, exams: prev.exams.filter((item) => item.id !== ex.id) }));
  };

  // Schedule CRUD
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
              targetTitle: sched.title,
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
      details: scheduleForm.details || 'Session',
      category: scheduleForm.category,
      attendedDates: []
    };
    commitState((prev) => ({ ...prev, schedules: [...prev.schedules, newItem] }));
    setShowScheduleModal(false);
  };

  const deleteScheduleItem = (item: ScheduleItem) => {
    if (!window.confirm(`Remove "${item.title}" from ${item.day}?`)) return;
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
              targetTitle: task.title,
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
    a.download = `syncpulse-${state.roomCode}-${todayStr}.json`;
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
        setShowSyncModal(false);
        setShowOnboarding(false);
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
      totalXP: number;
      grid28: { dateStr: string; prettyDate: string; mins: number; level: number }[];
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
      const level = Math.max(1, Math.floor(totalXP / 6000) + 1);

      const grid28 = Array.from({ length: 28 }, (_, idx) => {
        const daysAgo = 27 - idx;
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const dateStr = getLocalDateStr(d);
        const prettyDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const mins = mLogs.filter((l) => l.date === dateStr).reduce((a, b) => a + b.minutes, 0);
        const lv = mins === 0 ? 0 : mins < 45 ? 1 : mins < 120 ? 2 : 3;
        return { dateStr, prettyDate, mins, level: lv };
      });

      map[m.id] = {
        todayMins,
        totalMins,
        totalHours,
        streak,
        level,
        totalXP,
        grid28
      };
    });

    return map;
  }, [state.members, state.logs, state.goals, todayStr]);

  const activeStats = memberMetrics[activeUser] || {
    todayMins: 0, totalMins: 0, totalHours: '0.0', streak: 0, level: 1, totalXP: 0, grid28: []
  };
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
      { id: 'spark', Icon: Plant, name: 'First Spark', desc: 'Log your first focus session', unlocked: userLogs.length > 0 },
      { id: 'flame', Icon: Fire, name: '3-Day Streak', desc: '3 consecutive days of focus', unlocked: activeStats.streak >= 3 },
      { id: 'deep', Icon: Lightning, name: 'Deep Diver', desc: 'Complete a 90+ minute session', unlocked: hasDeepSession },
      { id: 'beloved', Icon: Heart, name: 'Warm Spirit', desc: 'Receive cheers from companions', unlocked: othersCheeredCount >= 2 },
      { id: 'club10', Icon: Buildings, name: '10-Hour Milestone', desc: 'Invest 10 total hours', unlocked: totalHrs >= 10 },
      { id: 'legend50', Icon: Crown, name: '50-Hour Mastery', desc: 'Invest 50 total hours', unlocked: totalHrs >= 50 }
    ];
  }, [state.logs, activeUser, activeStats]);

  const generateShareText = () => {
    const topGoals = userGoals
      .slice(0, 3)
      .map((g) => `â€¢ ${g.title}: ${(g.loggedMinutes / 60).toFixed(1)}h / ${g.targetHours}h`)
      .join('\n');

    return `${state.workspaceName} â€” ${currentMember.name}\nToday's Focus: ${Math.floor(activeStats.todayMins / 60)}h ${activeStats.todayMins % 60}m | Total: ${activeStats.totalHours}h\nStreak: ${activeStats.streak}d | Lv.${activeStats.level}\n\nGoals:\n${topGoals}`;
  };

  const handleShareStatus = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  // Clean, uncluttered chronological list for Today (Things 3 style)
  const dailyStream = useMemo(() => {
    const dayClasses = state.schedules.filter(
      (s) => s.userId === activeUser && s.day === timelineDay
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
        endTime: c.endTime,
        durationMins: eM - sM,
        completed: c.attendedDates.includes(todayStr),
        rawClass: c
      });
    });

    userDayTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const eM = sM + (t.estimatedMinutes || 30);
      items.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: `${t.estimatedMinutes}m intention`,
        startMins: sM,
        endMins: eM,
        startTime: t.reminderTime,
        endTime: fromMins(eM),
        durationMins: t.estimatedMinutes || 30,
        completed: t.completed,
        rawTask: t
      });
    });

    items.sort((a, b) => a.startMins - b.startMins);
    return items;
  }, [state.schedules, activeUser, timelineDay, userDayTasks, todayStr]);

  const navItems = [
    { id: 'today', label: 'Today', icon: Compass },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'schedule', label: 'Schedule', icon: CalendarBlank },
    { id: 'together', label: 'Together', icon: UsersThree },
  ];

  const elapsedSecForLog = getElapsedTimerSeconds();
  const canLogSession = elapsedSecForLog >= 60;

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row calm-transition ${theme.pageBg} ${theme.textMain}`}>
      {/* MOBILE COMPACT TOP BAR */}
      <div className={`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b ${theme.sidebarBg}`}>
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-xl">{state.workspaceName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {state.members.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveUser(m.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                m.id === activeUser ? theme.primaryBtn : `${theme.subtleBg} ${theme.textMuted}`
              }`}
            >
              {m.name}
            </button>
          ))}
          <button
            onClick={() => setShowSyncModal(true)}
            aria-label="Live Sync Settings"
            className={`p-1.5 rounded-xl border ${theme.surfaceBg}`}
          >
            {syncState === 'live' ? (
              <CloudCheck weight="duotone" className="w-4 h-4 text-emerald-500" />
            ) : (
              <CloudArrowUp weight="duotone" className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP MINIMALIST SIDEBAR (THINGS 3 / NOTION INSPIRED) */}
      <aside className={`hidden lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col border-r z-30 p-6 justify-between calm-transition ${theme.sidebarBg}`}>
        <div className="space-y-8">
          {/* Brand & Live Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif italic text-2xl tracking-tight leading-none">
                {state.workspaceName}
              </h1>
              <button
                onClick={() => setShowSyncModal(true)}
                className={`text-[11px] font-mono flex items-center gap-1.5 mt-1.5 hover:underline ${theme.textMuted}`}
              >
                {syncState === 'live' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Live â€¢ {state.roomCode}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUp weight="duotone" className="w-3.5 h-3.5" />
                    <span>Connect Live Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Companions Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-medium uppercase tracking-wider ${theme.textMuted}`}>
                Companions
              </span>
              {state.members.length < 4 && (
                <button
                  onClick={openAddMemberModal}
                  className={`text-xs flex items-center gap-1 hover: opacity-80 ${theme.accentText}`}
                >
                  <Plus weight="bold" className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            <div className="space-y-1">
              {state.members.map((member) => {
                const isSelected = member.id === activeUser;
                const mStat = memberMetrics[member.id];
                return (
                  <div
                    key={member.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveUser(member.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveUser(member.id)}
                    className={`w-full cursor-pointer rounded-xl px-3 py-2 transition-all flex items-center justify-between group ${
                      isSelected ? theme.activeNav : `${theme.textMuted} hover:opacity-100`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg font-serif italic text-sm flex items-center justify-center border shrink-0 relative ${theme.softBadge}`}>
                        {member.avatar}
                        {member.presence?.isFocusing && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>
                      <span className="text-xs truncate">{member.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[11px] font-mono ${theme.textMuted}`}>
                        {Math.floor((mStat?.todayMins || 0) / 60)}h {(mStat?.todayMins || 0) % 60}m
                      </span>
                      <button
                        type="button"
                        aria-label={`Edit ${member.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMemberModal(member);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5"
                      >
                        <PencilSimple weight="duotone" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calm Navigation */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center gap-3 transition-all ${
                    active ? theme.activeNav : `${theme.textMuted} hover:opacity-100`
                  }`}
                >
                  <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsFocusRoomOpen(true)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center gap-3 transition-all ${theme.textMuted} hover:opacity-100`}
            >
              <ArrowsOutSimple weight="duotone" className="w-4 h-4" />
              <span>Zen Focus Room</span>
            </button>
          </nav>
        </div>

        {/* Bottom Quiet Controls */}
        <div className={`pt-4 border-t ${theme.divider} space-y-3`}>
          {/* Ambient Audio Toggle */}
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={() => setAmbientMode(ambientMode === 'rain' ? 'off' : 'rain')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5 border transition ${
                ambientMode === 'rain' ? theme.primaryBtn : `${theme.subtleBg} ${theme.textMuted}`
              }`}
            >
              <CloudRain weight="duotone" className="w-3.5 h-3.5" /> Rain
            </button>
            <button
              onClick={() => setAmbientMode(ambientMode === 'tone' ? 'off' : 'tone')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5 border transition ${
                ambientMode === 'tone' ? theme.primaryBtn : `${theme.subtleBg} ${theme.textMuted}`
              }`}
            >
              <Waveform weight="duotone" className="w-3.5 h-3.5" /> Tone
            </button>
            <button
              onClick={() => setIsLatteMode(!isLatteMode)}
              aria-label="Toggle Light/Dark Mode"
              className={`p-1.5 rounded-lg border ${theme.subtleBg} ${theme.textMuted}`}
            >
              {isLatteMode ? <MoonStars weight="duotone" className="w-4 h-4" /> : <SunDim weight="duotone" className="w-4 h-4" />}
            </button>
          </div>

          <div className={`flex items-center justify-between text-[11px] px-1 ${theme.textMuted}`}>
            <button onClick={() => setShowSyncModal(true)} className="hover:underline flex items-center gap-1">
              <CloudArrowUp weight="duotone" className="w-3.5 h-3.5" /> Live Sync
            </button>
            <button onClick={() => setShowShareModal(true)} className="hover:underline flex items-center gap-1">
              <ShareNetwork weight="duotone" className="w-3.5 h-3.5" /> Share
            </button>
            <button onClick={() => setShowOnboarding(true)} className="hover:underline flex items-center gap-1">
              <Key weight="duotone" className="w-3.5 h-3.5" /> Room
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================================
          SERENE SINGLE-COLUMN CENTERED WORKSPACE (BREATHING ROOM & ZERO CLUTTER)
      ============================================================================ */}
      <div className="flex-1 min-w-0 pb-24 lg:pb-16">
        <main className="max-w-3xl mx-auto px-5 sm:px-10 pt-8 sm:pt-12 space-y-10">
          {/* Whisper-Quiet Top Header */}
          <header className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight">
                {currentMember.name}â€™s Sanctuary
              </h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' â€¢ '}
                Today: <span className={`font-mono font-semibold ${theme.accentText}`}>
                  {Math.floor(activeStats.todayMins / 60)}h {activeStats.todayMins % 60}m
                </span>
              </p>
            </div>

            {/* Subtle Companion Live Status Pill */}
            <div className="flex items-center gap-2">
              {state.members
                .filter((m) => m.id !== activeUser)
                .map((companion) => {
                  const cStat = memberMetrics[companion.id];
                  return (
                    <button
                      key={companion.id}
                      onClick={() => setActiveUser(companion.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs flex items-center gap-2 transition ${theme.surfaceBg}`}
                      title={`Switch to ${companion.name}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          companion.presence?.isFocusing ? 'bg-emerald-500 animate-ping' : 'bg-stone-400/50'
                        }`}
                      />
                      <span className="font-medium">{companion.name}</span>
                      <span className={`font-mono text-[11px] ${theme.textMuted}`}>
                        {companion.presence?.isFocusing
                          ? 'Focusing now'
                          : `${Math.floor((cStat?.todayMins || 0) / 60)}h ${(cStat?.todayMins || 0) % 60}m`}
                      </span>
                    </button>
                  );
                })}
            </div>
          </header>

          {/* ========================================================================
              VIEW 1: TODAY (CALM FOCUS CARD + THINGS-3 STYLE SCHEDULE LIST)
          ======================================================================== */}
          {activeTab === 'today' && (
            <div className="space-y-10">
              {/* Calm Focus Timer Card */}
              <section className={`p-6 sm:p-8 rounded-3xl border calm-transition ${theme.surfaceBg}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-1.5">
                    {(['pomodoro', 'stopwatch', 'break'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => resetTimer(m)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                          timerMode === m ? theme.softBadge : `${theme.textMuted} hover:opacity-100`
                        }`}
                      >
                        {m === 'pomodoro' ? '25m Focus' : m === 'stopwatch' ? 'Stopwatch' : '5m Break'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsFocusRoomOpen(true)}
                    className={`text-xs flex items-center gap-1.5 ${theme.textMuted} hover:opacity-100`}
                  >
                    <ArrowsOutSimple weight="duotone" className="w-4 h-4" /> Fullscreen Room
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="font-mono text-5xl sm:text-6xl font-semibold tracking-tight">
                      {String(Math.floor(displaySeconds / 60)).padStart(2, '0')}:
                      {String(displaySeconds % 60).padStart(2, '0')}
                    </div>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${theme.subtleBg}`}
                    >
                      <option value="">Select goal to credit time...</option>
                      {userGoals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={toggleTimer}
                      className={`px-6 py-3.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition ${theme.primaryBtn}`}
                    >
                      {isTimerRunning ? <Pause weight="fill" className="w-4 h-4" /> : <Play weight="fill" className="w-4 h-4" />}
                      <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                    </button>

                    {timerMode !== 'break' && canLogSession && (
                      <button
                        onClick={handleSaveTimerSession}
                        className={`px-4 py-3.5 rounded-2xl font-semibold text-xs border flex items-center gap-1.5 transition ${theme.softBadge}`}
                      >
                        <Check weight="bold" className="w-4 h-4" />
                        <span>Log +{Math.floor(elapsedSecForLog / 60)}m</span>
                      </button>
                    )}

                    <button
                      onClick={() => resetTimer()}
                      aria-label="Reset Timer"
                      className={`p-3.5 rounded-2xl border ${theme.subtleBg} ${theme.textMuted}`}
                    >
                      <ArrowCounterClockwise weight="duotone" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Today's Flow (Things 3 Style Clean List) */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif italic text-2xl">
                    Daily Flow
                  </h3>

                  {/* Quiet Day Selector */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {DAYS.map((d) => {
                      const active = d === timelineDay;
                      return (
                        <button
                          key={d}
                          onClick={() => setTimelineDay(d)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition ${
                            active ? theme.softBadge : `${theme.textMuted} hover:opacity-100`
                          }`}
                        >
                          {d.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minimalist List Surface */}
                <div className={`rounded-3xl border divide-y ${theme.surfaceBg} ${theme.divider}`}>
                  {dailyStream.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className={`text-xs ${theme.textMuted}`}>
                        No classes or intentions scheduled for {timelineDay}.
                      </p>
                    </div>
                  ) : (
                    dailyStream.map((entry) => {
                      const isHappeningNow =
                        timelineDay === realTodayName &&
                        nowMinutes >= entry.startMins &&
                        nowMinutes <= entry.endMins;

                      return (
                        <div
                          key={entry.id}
                          className="px-5 py-4 flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (entry.kind === 'class' && entry.rawClass) toggleClassAttendance(entry.rawClass);
                                else if (entry.kind === 'task' && entry.rawTask) toggleTask(entry.rawTask);
                              }}
                              className="shrink-0"
                            >
                              {entry.completed ? (
                                <CheckCircle weight="fill" className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle weight="duotone" className={`w-5 h-5 ${theme.textMuted}`} />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium truncate ${entry.completed ? 'line-through opacity-50' : ''}`}>
                                  {entry.title}
                                </p>
                                {isHappeningNow && (
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                                    Now
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs truncate ${theme.textMuted}`}>
                                {entry.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-mono ${theme.textMuted}`}>
                              {entry.startTime}
                            </span>
                            {entry.kind === 'task' && entry.rawTask && (
                              <button
                                onClick={() => deleteTask(entry.rawTask!)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition"
                              >
                                <Trash weight="duotone" className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Quiet Inline Add Intention Input */}
                  <form onSubmit={addTask} className="px-5 py-3 flex flex-wrap items-center gap-2">
                    <Plus weight="bold" className={`w-4 h-4 ${theme.textMuted}`} />
                    <input
                      type="text"
                      placeholder={`Add an intention for ${timelineDay}...`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 min-w-[160px] bg-transparent text-xs py-1.5 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={`text-xs font-mono bg-transparent ${theme.textMuted}`}
                    />
                    <select
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className={`text-xs font-mono bg-transparent ${theme.textMuted}`}
                    >
                      <option value={15}>15m</option>
                      <option value={30}>30m</option>
                      <option value={45}>45m</option>
                      <option value={60}>1h</option>
                      <option value={90}>1.5h</option>
                    </select>
                    {newTaskTitle.trim() && (
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-xl text-xs font-medium ${theme.primaryBtn}`}
                      >
                        Add
                      </button>
                    )}
                  </form>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================
              VIEW 2: GOALS (CLEAN CARDS + COLLAPSIBLE MILESTONES)
          ======================================================================== */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif italic text-2xl">Goals & Time Bank</h3>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Total invested: {activeStats.totalHours} hours
                  </p>
                </div>
                <button
                  onClick={openCreateGoal}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 ${theme.primaryBtn}`}
                >
                  <Plus weight="bold" className="w-3.5 h-3.5" /> New Goal
                </button>
              </div>

              <div className="space-y-4">
                {userGoals.map((g) => {
                  const safeTarget = Math.max(1, g.targetHours);
                  const hrs = +(g.loggedMinutes / 60).toFixed(1);
                  const pct = Math.min(100, Math.round((hrs / safeTarget) * 100));
                  const milestones = g.milestones || [];
                  const doneMsCount = milestones.filter((m) => m.completed).length;
                  const isExpanded = Boolean(expandedGoals[g.id]);

                  return (
                    <div key={g.id} className={`p-6 rounded-3xl border space-y-4 ${theme.surfaceBg}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${theme.softBadge}`}>
                              {g.category}
                            </span>
                            <span className={`text-xs ${theme.textMuted}`}>{g.deadline}</span>
                          </div>
                          <h4 className="font-semibold text-base mt-2">{g.title}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditGoal(g)}
                            className={`p-1.5 rounded-lg ${theme.textMuted} hover:opacity-100`}
                          >
                            <PencilSimple weight="duotone" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGoal(g)}
                            className={`p-1.5 rounded-lg ${theme.textMuted} hover:text-rose-400`}
                          >
                            <Trash weight="duotone" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Thin Calm Progress Bar & Quick Log */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span>
                            {hrs}h <span className={theme.textMuted}>/ {safeTarget}h ({pct}%)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => logGoalMinutes(activeUser, g.id, g.title, 15)}
                              className={`px-2.5 py-1 rounded-xl border text-[11px] ${theme.subtleBg}`}
                            >
                              +15m
                            </button>
                            <button
                              onClick={() => logGoalMinutes(activeUser, g.id, g.title, 30)}
                              className={`px-2.5 py-1 rounded-xl border text-[11px] ${theme.subtleBg}`}
                            >
                              +30m
                            </button>
                            <button
                              onClick={() => logGoalMinutes(activeUser, g.id, g.title, 60)}
                              className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold ${theme.softBadge}`}
                            >
                              +1h
                            </button>
                          </div>
                        </div>

                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme.trackBg}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Collapsible Milestones (Zero Clutter) */}
                      <div className={`pt-3 border-t ${theme.divider}`}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGoals((prev) => ({ ...prev, [g.id]: !prev[g.id] }))
                          }
                          className={`text-xs flex items-center justify-between w-full ${theme.textMuted} hover:opacity-100`}
                        >
                          <span className="flex items-center gap-1.5">
                            <ListChecks weight="duotone" className="w-4 h-4" />
                            <span>Milestones ({doneMsCount}/{milestones.length})</span>
                          </span>
                          {isExpanded ? <CaretUp className="w-3.5 h-3.5" /> : <CaretDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2 pl-1">
                            {milestones.map((ms) => (
                              <div key={ms.id} className="flex items-center justify-between gap-2 text-xs py-1">
                                <button
                                  type="button"
                                  onClick={() => toggleMilestone(g.id, ms.id)}
                                  className="flex items-center gap-2.5 text-left flex-1"
                                >
                                  {ms.completed ? (
                                    <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle weight="duotone" className={`w-4 h-4 shrink-0 ${theme.textMuted}`} />
                                  )}
                                  <span className={ms.completed ? 'line-through opacity-50' : ''}>
                                    {ms.title}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteMilestone(g.id, ms.id)}
                                  className={`opacity-40 hover:opacity-100 hover:text-rose-400`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Add a milestone step..."
                                value={milestoneInputs[g.id] || ''}
                                onChange={(e) =>
                                  setMilestoneInputs((prev) => ({ ...prev, [g.id]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone(g.id))}
                                className={`flex-1 border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${theme.subtleBg}`}
                              />
                              <button
                                type="button"
                                onClick={() => addMilestone(g.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${theme.softBadge}`}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================
              VIEW 3: SCHEDULE & EXAMS (CLEAN WEEKLY CLASSES + EXAMS IN ONE PLACE)
          ======================================================================== */}
          {activeTab === 'schedule' && (
            <div className="space-y-10">
              {/* Weekly Classes */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-serif italic text-2xl">Weekly Classes</h3>
                  <button
                    onClick={() => {
                      setScheduleForm({ ...scheduleForm, day: selectedDay });
                      setScheduleError('');
                      setShowScheduleModal(true);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 ${theme.primaryBtn}`}
                  >
                    <Plus weight="bold" className="w-3.5 h-3.5" /> Add Class
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                        selectedDay === day ? theme.softBadge : `${theme.textMuted} hover:opacity-100`
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className={`rounded-3xl border divide-y ${theme.surfaceBg} ${theme.divider}`}>
                  {state.schedules
                    .filter((s) => s.userId === activeUser && s.day === selectedDay)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime)).length === 0 ? (
                    <p className={`text-xs py-8 text-center ${theme.textMuted}`}>
                      No classes scheduled on {selectedDay}.
                    </p>
                  ) : (
                    state.schedules
                      .filter((s) => s.userId === activeUser && s.day === selectedDay)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((item) => (
                        <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className={`text-xs mt-0.5 ${theme.textMuted}`}>{item.details}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-mono ${theme.accentText}`}>
                              {item.startTime} â€“ {item.endTime}
                            </span>
                            <button
                              onClick={() => deleteScheduleItem(item)}
                              className={`p-1 ${theme.textMuted} hover:text-rose-400`}
                            >
                              <Trash weight="duotone" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>

              {/* Upcoming Exams */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif italic text-2xl">Upcoming Exams & Deadlines</h3>
                  <button
                    onClick={() => setShowExamModal(true)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium border flex items-center gap-1 ${theme.softBadge}`}
                  >
                    <Plus weight="bold" className="w-3.5 h-3.5" /> Add Exam
                  </button>
                </div>

                <div className={`rounded-3xl border divide-y ${theme.surfaceBg} ${theme.divider}`}>
                  {state.exams.filter((ex) => ex.userId === activeUser).length === 0 ? (
                    <p className={`text-xs py-8 text-center ${theme.textMuted}`}>
                      No upcoming exams listed for {currentMember.name}.
                    </p>
                  ) : (
                    state.exams
                      .filter((ex) => ex.userId === activeUser)
                      .map((ex) => (
                        <div key={ex.id} className="px-5 py-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">{ex.title}</p>
                            <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                              {ex.professor} â€¢ {ex.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right font-mono text-xs">
                              <span className={`font-semibold block ${theme.accentText}`}>{ex.date}</span>
                              <span className={theme.textMuted}>{ex.time}</span>
                            </div>
                            <button
                              onClick={() => deleteExamItem(ex)}
                              className={`p-1 ${theme.textMuted} hover:text-rose-400`}
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
          )}

          {/* ========================================================================
              VIEW 4: TOGETHER (CO-OP COMPANION PULSE, 28-DAY HEATMAPS & MOMENTS)
          ======================================================================== */}
          {activeTab === 'together' && (
            <div className="space-y-10">
              {/* Side-by-Side Companion Overview & 28-Day Heatmaps */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  const mStat = memberMetrics[member.id];
                  return (
                    <div key={member.id} className={`p-6 rounded-3xl border space-y-5 ${theme.surfaceBg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-serif italic text-lg flex items-center justify-center border ${mStyle.softBadge}`}>
                            {member.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{member.name}</h4>
                            <span className={`text-xs font-mono ${theme.textMuted}`}>
                              Lv.{mStat?.level || 1} â€¢ {mStat?.totalHours || '0.0'}h total
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border flex items-center gap-1 ${mStyle.softBadge}`}>
                          <Fire weight="duotone" className="w-3.5 h-3.5" />
                          {mStat?.streak || 0}d
                        </span>
                      </div>

                      {/* Calm 28-Day Grid */}
                      <div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {(mStat?.grid28 || []).map((cell) => (
                            <button
                              key={cell.dateStr}
                              type="button"
                              onClick={() => setSelectedHeatCell({ date: cell.prettyDate, mins: cell.mins, member: member.name })}
                              className={`h-7 rounded-lg border transition-all flex items-center justify-center text-[10px] font-mono ${mStyle.heatLevels[cell.level]}`}
                            >
                              {cell.mins > 0 ? `${cell.mins}` : ''}
                            </button>
                          ))}
                        </div>
                        {selectedHeatCell && selectedHeatCell.member === member.name && (
                          <p className={`text-[11px] font-mono mt-2 ${theme.textMuted}`}>
                            {selectedHeatCell.date}: {selectedHeatCell.mins} minutes focused
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Shared Moments Feed */}
              <section className="space-y-4">
                <h3 className="font-serif italic text-2xl">Shared Focus Moments</h3>
                <div className={`rounded-3xl border divide-y ${theme.surfaceBg} ${theme.divider}`}>
                  {state.logs.length === 0 ? (
                    <p className={`text-xs py-8 text-center ${theme.textMuted}`}>
                      No focus sessions logged yet. Start your first session today to share your progress!
                    </p>
                  ) : (
                    state.logs.slice(0, 12).map((log) => {
                      const logMember = state.members.find((m) => m.id === log.userId);
                      if (!logMember) return null;
                      const isOwnLog = log.userId === activeUser;
                      const hasCheered = log.cheeredBy.includes(activeUser);
                      return (
                        <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-semibold">{logMember.name}</span>
                            <span className={`truncate ${theme.textMuted}`}>{log.targetTitle}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-mono ${theme.textMuted}`}>
                              +{log.minutes}m â€¢ {formatRelativeTime(log.createdAtMs, log.date)}
                            </span>
                            <button
                              disabled={isOwnLog}
                              onClick={() => toggleCheerLog(log.id)}
                              className={`px-2 py-1 rounded-lg border flex items-center gap-1 transition ${
                                hasCheered ? theme.primaryBtn : theme.subtleBg
                              }`}
                            >
                              <Heart weight={hasCheered || log.cheeredBy.length > 0 ? 'fill' : 'duotone'} className="w-3.5 h-3.5" />
                              <span>{log.cheeredBy.length}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Milestones Badges */}
              <section className="space-y-4">
                <h3 className="font-serif italic text-2xl">{currentMember.name}â€™s Milestones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {activeBadges.map((b) => {
                    const BadgeIcon = b.Icon;
                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border flex items-center gap-3 transition ${
                          b.unlocked ? theme.surfaceBg : `${theme.subtleBg} opacity-40`
                        }`}
                      >
                        <BadgeIcon weight={b.unlocked ? 'duotone' : 'regular'} className={`w-6 h-6 shrink-0 ${theme.accentText}`} />
                        <div>
                          <p className="text-xs font-semibold">{b.name}</p>
                          <p className={`text-[11px] ${theme.textMuted}`}>{b.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* MOBILE BOTTOM BAR */}
        <nav
          aria-label="Mobile Navigation"
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t grid grid-cols-4 px-2 py-2 ${theme.sidebarBg}`}
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
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ============================================================================
          FULLSCREEN ZEN FOCUS ROOM
      ============================================================================ */}
      {isFocusRoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto calm-transition ${theme.pageBg} ${theme.textMain}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-serif italic text-2xl">{currentMember.name}â€™s Focus Sanctuary</span>
            <button
              onClick={() => setIsFocusRoomOpen(false)}
              className={`px-4 py-2 rounded-2xl border text-xs font-medium flex items-center gap-1.5 ${theme.surfaceBg}`}
            >
              <ArrowsInSimple weight="duotone" className="w-4 h-4" /> Exit (Esc)
            </button>
          </div>

          <div className="max-w-xl mx-auto w-full text-center space-y-8 my-auto py-8">
            <div className="font-mono text-7xl sm:text-8xl md:text-9xl font-semibold tracking-tight select-none">
              {String(Math.floor(displaySeconds / 60)).padStart(2, '0')}:
              {String(displaySeconds % 60).padStart(2, '0')}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-8 py-4 rounded-2xl font-semibold text-sm flex items-center gap-2 transition ${theme.primaryBtn}`}
              >
                {isTimerRunning ? <Pause weight="fill" className="w-5 h-5" /> : <Play weight="fill" className="w-5 h-5" />}
                <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              {canLogSession && (
                <button
                  onClick={handleSaveTimerSession}
                  className={`px-6 py-4 rounded-2xl font-semibold text-sm border flex items-center gap-2 ${theme.softBadge}`}
                >
                  <Check weight="bold" className="w-5 h-5" />
                  <span>Log +{Math.floor(elapsedSecForLog / 60)}m</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAmbientMode(ambientMode === 'rain' ? 'off' : 'rain')}
                className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border ${
                  ambientMode === 'rain' ? theme.primaryBtn : theme.surfaceBg
                }`}
              >
                <CloudRain weight="duotone" className="w-4 h-4" /> Soft Rain
              </button>
              <button
                onClick={() => setAmbientMode(ambientMode === 'tone' ? 'off' : 'tone')}
                className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border ${
                  ambientMode === 'tone' ? theme.primaryBtn : theme.surfaceBg
                }`}
              >
                <Waveform weight="duotone" className="w-4 h-4" /> Warm Tone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          LIVE DATABASE & MAGIC INVITE LINK MODAL
      ============================================================================ */}
      {showSyncModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-5 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Live Database & Backup</h3>
              <button onClick={() => setShowSyncModal(false)}>
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>
                  Room Code (Shared between you and your companion)
                </label>
                <input
                  type="text"
                  value={state.roomCode}
                  onChange={(e) => commitState((prev) => ({ ...prev, roomCode: e.target.value }))}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono ${theme.subtleBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>
                  Firebase Realtime Database URL (Enables instant live sync)
                </label>
                <input
                  type="url"
                  value={syncUrl}
                  onChange={(e) => {
                    setSyncUrl(e.target.value);
                    localStorage.setItem('syncpulse_cloud_url', e.target.value.trim());
                  }}
                  placeholder="https://your-project-default-rtdb.firebaseio.com/"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono ${theme.subtleBg}`}
                />
              </div>

              {/* Magic 1-Click Invite Link for Companion */}
              <button
                type="button"
                onClick={copyMagicInviteLink}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${theme.softBadge}`}
              >
                <LinkSimple weight="bold" className="w-4 h-4" />
                {copiedMagicLink
                  ? 'Magic Invite Link Copied!'
                  : 'Copy Magic Invite Link for Companion'}
              </button>
            </div>

            <div className={`pt-3 border-t ${theme.divider} space-y-2`}>
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${theme.subtleBg}`}
                >
                  <DownloadSimple weight="duotone" className="w-4 h-4" /> Export JSON
                </button>
                <label className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${theme.subtleBg}`}>
                  <UploadSimple weight="duotone" className="w-4 h-4" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={handleResetAllStatsToZero}
                className="w-full py-2 text-xs text-rose-400 hover:underline"
              >
                Reset All Logged Hours & Stats to Zero (0.0h)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================
          ONBOARDING / ROOM UNLOCK MODAL
      ============================================================================ */}
      {showOnboarding && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif italic text-3xl">Welcome to SyncPulse</h2>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>
                  A calm, distraction-free sanctuary for daily focus.
                </p>
              </div>
              {state.isConfigured && (
                <button onClick={() => setShowOnboarding(false)}>
                  <X weight="bold" className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border">
              <button
                type="button"
                onClick={() => setOnboardingMode('code')}
                className={`py-2 rounded-lg text-xs font-medium transition ${
                  onboardingMode === 'code' ? theme.primaryBtn : theme.textMuted
                }`}
              >
                Enter Room Code
              </button>
              <button
                type="button"
                onClick={() => setOnboardingMode('create')}
                className={`py-2 rounded-lg text-xs font-medium transition ${
                  onboardingMode === 'create' ? theme.primaryBtn : theme.textMuted
                }`}
              >
                New Sanctuary
              </button>
            </div>

            {onboardingMode === 'code' ? (
              <form onSubmit={handleUnlockByRoomCode} className="space-y-4">
                <div>
                  <label className={`block text-xs mb-1.5 ${theme.textMuted}`}>
                    Private Room Code (Use <b>mr-1405</b> for Mehrsan & Ronak)
                  </label>
                  <input
                    type="text"
                    required
                    value={setupForm.secretUnlockCode}
                    onChange={(e) => setSetupForm({ ...setupForm, secretUnlockCode: e.target.value })}
                    placeholder="mr-1405"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono ${theme.subtleBg}`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}
                >
                  Enter Sanctuary
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateCustomWorkspace} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Sanctuary Name"
                  value={setupForm.workspaceName}
                  onChange={(e) => setSetupForm({ ...setupForm, workspaceName: e.target.value })}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs ${theme.subtleBg}`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={setupForm.p1Name}
                    onChange={(e) => setSetupForm({ ...setupForm, p1Name: e.target.value })}
                    className={`border rounded-xl px-3 py-2 text-xs ${theme.subtleBg}`}
                  />
                  <input
                    type="text"
                    placeholder="Companion Name (Optional)"
                    value={setupForm.p2Name}
                    onChange={(e) => setSetupForm({ ...setupForm, p2Name: e.target.value })}
                    className={`border rounded-xl px-3 py-2 text-xs ${theme.subtleBg}`}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}
                >
                  Create Clean Sanctuary
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* OTHER MODALS (GOAL, SCHEDULE, EXAM, MEMBER, SHARE) */}
      {showGoalModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveGoal} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">{editingGoal ? 'Edit Goal' : 'New Goal'}</h3>
              <button type="button" onClick={() => setShowGoalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Goal Title"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={goalForm.category}
                onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as GoalItem['category'] })}
                className={`border rounded-xl px-3 py-2.5 text-xs ${theme.subtleBg}`}
              >
                <option value="Short-Term">Short-Term</option>
                <option value="Long-Term">Long-Term</option>
                <option value="Habit">Habit</option>
                <option value="Career">Career</option>
              </select>
              <input
                type="number"
                min={1}
                required
                value={goalForm.targetHours}
                onChange={(e) => setGoalForm({ ...goalForm, targetHours: Math.max(1, Number(e.target.value)) })}
                className={`border rounded-xl px-3 py-2.5 text-xs font-mono ${theme.subtleBg}`}
              />
            </div>
            <input
              type="text"
              placeholder="Horizon / Deadline"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="flex justify-end gap-2">
              <button type="submit" className={`px-5 py-2 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {showScheduleModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveScheduleItem} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Add Class</h3>
              <button type="button" onClick={() => setShowScheduleModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Class Title"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={scheduleForm.day}
                onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                className={`border rounded-xl px-2.5 py-2 text-xs ${theme.subtleBg}`}
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className={`border rounded-xl px-2.5 py-2 text-xs font-mono ${theme.subtleBg}`}
              />
              <input
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className={`border rounded-xl px-2.5 py-2 text-xs font-mono ${theme.subtleBg}`}
              />
            </div>
            {scheduleError && <p className="text-xs text-rose-400">{scheduleError}</p>}
            <input
              type="text"
              placeholder="Room / Professor"
              value={scheduleForm.details}
              onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="flex justify-end">
              <button type="submit" className={`px-5 py-2 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save Class
              </button>
            </div>
          </form>
        </div>
      )}

      {showExamModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveExamItem} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Add Exam</h3>
              <button type="button" onClick={() => setShowExamModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Exam Title"
              value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Date (e.g. 1405/11/10)"
                value={examForm.date}
                onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                className={`border rounded-xl px-3 py-2 text-xs font-mono ${theme.subtleBg}`}
              />
              <input
                type="time"
                value={examForm.time}
                onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                className={`border rounded-xl px-3 py-2 text-xs font-mono ${theme.subtleBg}`}
              />
            </div>
            <input
              type="text"
              placeholder="Professor / Details"
              value={examForm.professor}
              onChange={(e) => setExamForm({ ...examForm, professor: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <div className="flex justify-end">
              <button type="submit" className={`px-5 py-2 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save Exam
              </button>
            </div>
          </form>
        </div>
      )}

      {showMemberModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMember} className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">{editingMember ? 'Edit Profile' : 'Add Companion'}</h3>
              <button type="button" onClick={() => setShowMemberModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Name"
              value={memberForm.name}
              onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs ${theme.subtleBg}`}
            />
            <select
              value={memberForm.theme}
              onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
              className={`w-full border rounded-xl px-3 py-2.5 text-xs ${theme.subtleBg}`}
            >
              <option value="warm-sage">Warm Stone & Sage</option>
              <option value="lavender-blush">Soft Lavender</option>
              <option value="peach-terracotta">Warm Terracotta</option>
              <option value="matcha-cream">Matcha Mist</option>
            </select>
            <div className="flex justify-end">
              <button type="submit" className={`px-5 py-2 rounded-xl text-xs font-semibold ${theme.primaryBtn}`}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {showShareModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.divider}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Share Progress</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className={`p-4 rounded-2xl border text-xs font-mono whitespace-pre-wrap ${theme.subtleBg}`}>
              {generateShareText()}
            </pre>
            <button
              onClick={handleShareStatus}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${theme.primaryBtn}`}
            >
              <Copy weight="duotone" className="w-4 h-4" />
              {copiedShare ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
