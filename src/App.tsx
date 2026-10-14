import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock, Target, Calendar, CheckCircle2, Plus, Trash2, Edit3,
  Play, Pause, RotateCcw, TrendingUp, Bell, Sparkles,
  Users, Cloud, Check, X, GraduationCap, HelpCircle,
  Share2, UserPlus, Copy, ChevronRight, ChevronLeft, Heart,
  Sun, Moon, Coffee, CloudRain, VolumeX, LayoutDashboard, Menu,
  Compass, ArrowRight
} from 'lucide-react';
import {
  INITIAL_STATE, AppState, GoalItem, ScheduleItem, TaskItem, Member, ThemePalette
} from './initialData';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface CozyStyle {
  name: string;
  pageBg: string;
  sidebarBg: string;
  cardBg: string;
  innerCardBg: string;
  dockBg: string;
  textMain: string;
  textMuted: string;
  orb1: string;
  orb2: string;
  primaryBtn: string;
  softBadge: string;
  activeNav: string;
  activeBorder: string;
  progressBar: string;
  accentText: string;
  barColor: string;
  timelineLine: string;
}

const GET_COZY_THEME = (palette: ThemePalette, isLatte: boolean): CozyStyle => {
  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Lavender Oat Latte 💜',
          pageBg: 'bg-[#FAF5FF]',
          sidebarBg: 'bg-[#F3E8FF]/90 border-purple-200/80',
          cardBg: 'bg-white/85 border-purple-200/80 shadow-sm shadow-purple-950/5',
          innerCardBg: 'bg-[#F6EEFC]/85 border-purple-200/60',
          dockBg: 'bg-white/95 border-purple-300/80 shadow-2xl shadow-purple-950/10',
          textMain: 'text-[#2E1B3B]',
          textMuted: 'text-[#735A85]',
          orb1: 'bg-purple-300/45',
          orb2: 'bg-pink-300/40',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B47AEA] to-[#D685B8] hover:opacity-95 text-white shadow-md shadow-purple-500/20',
          softBadge: 'bg-purple-100 text-purple-800 border-purple-300/70',
          activeNav: 'bg-purple-200/75 text-[#2E1B3B] font-bold border-purple-300',
          activeBorder: 'border-purple-400/80 shadow-lg shadow-purple-300/30',
          progressBar: 'bg-gradient-to-r from-[#9D65C9] via-[#C084FC] to-[#F472B6]',
          accentText: 'text-[#8B47C2]',
          barColor: 'from-[#9D65C9] to-[#E879F9]',
          timelineLine: 'border-purple-300'
        }
      : {
          name: 'Cozy Velvet Lavender 💜',
          pageBg: 'bg-[#170F21]',
          sidebarBg: 'bg-[#120B1B]/90 border-purple-300/15',
          cardBg: 'bg-[#231832]/80 border-purple-300/15 shadow-xl shadow-black/30',
          innerCardBg: 'bg-[#160F20]/80 border-purple-300/10',
          dockBg: 'bg-[#1E142B]/95 border-purple-400/30 shadow-2xl shadow-black/70',
          textMain: 'text-[#F7F1FF]',
          textMuted: 'text-[#B9A5CC]',
          orb1: 'bg-[#9D65C9]/25',
          orb2: 'bg-[#E879F9]/20',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B779E2] to-[#D977B4] hover:opacity-95 text-white shadow-lg shadow-purple-950/50',
          softBadge: 'bg-purple-400/15 text-purple-200 border-purple-300/30',
          activeNav: 'bg-purple-500/20 text-white border-purple-400/40',
          activeBorder: 'border-purple-400/50 shadow-xl shadow-purple-950/60',
          progressBar: 'bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#F472B6]',
          accentText: 'text-[#DFB6FF]',
          barColor: 'from-[#A855F7] to-[#F472B6]',
          timelineLine: 'border-purple-400/30'
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta Latte',
          pageBg: 'bg-[#FDF8F5]',
          sidebarBg: 'bg-[#F9EFEA]/90 border-orange-200/80',
          cardBg: 'bg-white/85 border-orange-200/80 shadow-sm',
          innerCardBg: 'bg-[#FAF0EA]/80 border-orange-200/60',
          dockBg: 'bg-white/95 border-orange-300/80 shadow-2xl',
          textMain: 'text-[#362019]',
          textMuted: 'text-[#856256]',
          orb1: 'bg-amber-300/40',
          orb2: 'bg-rose-300/35',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-md',
          softBadge: 'bg-orange-100 text-orange-900 border-orange-300/70',
          activeNav: 'bg-orange-200/70 text-[#362019] border-orange-300',
          activeBorder: 'border-orange-400/80 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#D97757] to-[#F59E0B]',
          accentText: 'text-[#C85A32]',
          barColor: 'from-[#D97757] to-[#F59E0B]',
          timelineLine: 'border-orange-300'
        }
      : {
          name: 'Fireside Terracotta',
          pageBg: 'bg-[#1B1311]',
          sidebarBg: 'bg-[#140E0C]/90 border-orange-300/15',
          cardBg: 'bg-[#291D1B]/80 border-orange-300/15',
          innerCardBg: 'bg-[#16100E]/80 border-orange-300/10',
          dockBg: 'bg-[#241917]/95 border-orange-400/30 shadow-2xl',
          textMain: 'text-[#FDF4F0]',
          textMuted: 'text-[#C4A89E]',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-amber-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-lg',
          softBadge: 'bg-orange-400/15 text-orange-200 border-orange-300/30',
          activeNav: 'bg-orange-500/20 text-white border-orange-400/40',
          activeBorder: 'border-orange-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#EA580C] to-[#FBBF24]',
          accentText: 'text-[#FDBA8C]',
          barColor: 'from-[#EA580C] to-[#FBBF24]',
          timelineLine: 'border-orange-400/30'
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Oat Milk',
          pageBg: 'bg-[#F6F9F4]',
          sidebarBg: 'bg-[#EBF2E6]/90 border-emerald-200/80',
          cardBg: 'bg-white/85 border-emerald-200/80 shadow-sm',
          innerCardBg: 'bg-[#ECF3E8]/80 border-emerald-200/60',
          dockBg: 'bg-white/95 border-emerald-300/80 shadow-2xl',
          textMain: 'text-[#1B2E22]',
          textMuted: 'text-[#5A7864]',
          orb1: 'bg-emerald-300/35',
          orb2: 'bg-lime-300/30',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-md',
          softBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300/70',
          activeNav: 'bg-emerald-200/70 text-[#1B2E22] border-emerald-300',
          activeBorder: 'border-emerald-400/80 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#4E8C6F] to-[#84CC16]',
          accentText: 'text-[#387558]',
          barColor: 'from-[#4E8C6F] to-[#84CC16]',
          timelineLine: 'border-emerald-300'
        }
      : {
          name: 'Forest Matcha Night',
          pageBg: 'bg-[#101914]',
          sidebarBg: 'bg-[#0B120E]/90 border-emerald-300/15',
          cardBg: 'bg-[#18261F]/80 border-emerald-300/15',
          innerCardBg: 'bg-[#0D1411]/80 border-emerald-300/10',
          dockBg: 'bg-[#15221B]/95 border-emerald-400/30 shadow-2xl',
          textMain: 'text-[#F0FAF4]',
          textMuted: 'text-[#9CBAA8]',
          orb1: 'bg-emerald-500/20',
          orb2: 'bg-teal-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-lg',
          softBadge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
          activeNav: 'bg-emerald-500/20 text-white border-emerald-400/40',
          activeBorder: 'border-emerald-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#10B981] to-[#84CC16]',
          accentText: 'text-[#86EFAC]',
          barColor: 'from-[#10B981] to-[#84CC16]',
          timelineLine: 'border-emerald-400/30'
        };
  }

  return isLatte
    ? {
        name: 'Warm Oat & Sage ☕',
        pageBg: 'bg-[#FBF9F5]',
        sidebarBg: 'bg-[#F3EFE6]/90 border-[#E2D9C8]',
        cardBg: 'bg-white/85 border-[#E6DFD3] shadow-sm shadow-stone-900/5',
        innerCardBg: 'bg-[#F4EFE6]/85 border-[#E2D9C8]',
        dockBg: 'bg-white/95 border-[#D6CFC2] shadow-2xl shadow-stone-900/10',
        textMain: 'text-[#292524]',
        textMuted: 'text-[#78716C]',
        orb1: 'bg-amber-200/50',
        orb2: 'bg-teal-200/45',
        primaryBtn: 'bg-gradient-to-r from-[#4A6B65] via-[#5B7F78] to-[#B87D4B] hover:opacity-95 text-white shadow-md',
        softBadge: 'bg-[#EFECE6] text-[#4A6B65] border-[#D6CFC2]',
        activeNav: 'bg-[#E5DEC9]/80 text-[#292524] border-[#C8BFA8]',
        activeBorder: 'border-[#5B7F78]/70 shadow-lg',
        progressBar: 'bg-gradient-to-r from-[#4A6B65] via-[#66968C] to-[#D99B52]',
        accentText: 'text-[#4A6B65]',
        barColor: 'from-[#4A6B65] to-[#D99B52]',
        timelineLine: 'border-[#D6CFC2]'
      }
    : {
        name: 'Cozy Espresso & Amber ☕',
        pageBg: 'bg-[#151413]',
        sidebarBg: 'bg-[#100F0E]/90 border-[#2E2A27]',
        cardBg: 'bg-[#211F1D]/80 border-[#36322E] shadow-xl shadow-black/30',
        innerCardBg: 'bg-[#171514]/85 border-[#2C2825]',
        dockBg: 'bg-[#1E1C1A]/95 border-[#443E38] shadow-2xl shadow-black/80',
        textMain: 'text-[#F5F2EB]',
        textMuted: 'text-[#A8A29E]',
        orb1: 'bg-[#D99B52]/18',
        orb2: 'bg-[#5B7F78]/22',
        primaryBtn: 'bg-gradient-to-r from-[#5B7F78] to-[#C88A4B] hover:opacity-95 text-white shadow-lg',
        softBadge: 'bg-[#2D2A26] text-[#E6CBA8] border-[#443F3A]',
        activeNav: 'bg-[#2D2A26] text-white border-[#5B7F78]/50',
        activeBorder: 'border-[#C88A4B]/50 shadow-xl',
        progressBar: 'bg-gradient-to-r from-[#5B7F78] via-[#84A98C] to-[#E09F5A]',
        accentText: 'text-[#E6B88A]',
        barColor: 'from-[#5B7F78] to-[#E09F5A]',
        timelineLine: 'border-[#383430]'
      };
};

// Helper: Convert "HH:MM" to minutes from midnight
const toMins = (timeStr: string): number => {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Helper: Convert minutes from midnight back to "HH:MM"
const fromMins = (total: number): string => {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const TUTORIAL_STEPS = [
  {
    title: 'Phase 2: Visual Daily Timeline ⏳✨',
    subtitle: 'Inspired by Structured & Amie Calendar.',
    description: 'Your classes and daily tasks are now woven together into a single chronological river! You can see what’s happening right now, what’s coming up next, and how much time is left.',
    highlight: 'Look for the pulsing "HAPPENING NOW" or "UP NEXT" badges on your timeline—and switch days anytime to preview tomorrow!'
  },
  {
    title: 'Smart "Free Focus Windows" 🌿',
    subtitle: 'Turn gaps between classes into progress.',
    description: 'Whenever you have a gap of 45+ minutes between two scheduled items, SyncPulse automatically detects a "Free Focus Window" and lets you launch your focus timer with 1 click!',
    highlight: 'Check-in to classes or complete tasks right inside the timeline to trigger confetti and log minutes automatically.'
  },
  {
    title: 'Sidebar + Persistent Timer Dock 🎧',
    subtitle: 'Everything in its right place.',
    description: 'Switch between Mehrsan ☕ and Ronak 💜 on the left sidebar, turn on soothing Rain audio, and use the bottom floating timer dock across any tab.',
    highlight: 'Next up in Phase 3: 30-Day GitHub/Duolingo Habit Heatmap & Streak Badges!'
  }
];

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('syncpulse_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.members && parsed.members.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_STATE;
  });

  const [activeUser, setActiveUser] = useState<string>('mehrsan');
  const [isLatteMode, setIsLatteMode] = useState<boolean>(() => {
    return localStorage.getItem('syncpulse_latte') === 'true';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'schedule' | 'analytics'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const realTodayName = (() => {
    const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(jsDay) ? jsDay : 'Saturday';
  })();

  const [selectedDay, setSelectedDay] = useState<string>(realTodayName);
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);

  // Live Current Clock for Timeline "NOW" Indicator
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Cozy Ambient Sound Generator
  const [ambientMode, setAmbientMode] = useState<'off' | 'rain' | 'zen'>('off');
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (ambientMode === 'off') {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
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
    } else if (ambientMode === 'zen') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 216;
      osc2.frequency.value = 324;
      gain.gain.value = 0.03;
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
    }

    return () => {
      ctx.close();
    };
  }, [ambientMode]);

  // Modals
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return !localStorage.getItem('syncpulse_phase2_seen');
  });
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    tagline: '',
    theme: 'peach-terracotta' as ThemePalette
  });

  // Floating Timer Dock State
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // CRUD Modals
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    category: 'Short-Term' as GoalItem['category'],
    targetHours: 50,
    deadline: ''
  });

  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
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

  // Cloud Sync
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncUrl, setSyncUrl] = useState(() => localStorage.getItem('syncpulse_cloud_url') || '');

  const currentMember = state.members.find((m) => m.id === activeUser) || state.members[0];
  const theme = GET_COZY_THEME(currentMember.theme, isLatteMode);

  useEffect(() => {
    localStorage.setItem('syncpulse_v3', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('syncpulse_latte', String(isLatteMode));
  }, [isLatteMode]);

  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : `${syncUrl.replace(/\/$/, '')}/syncpulse_v3.json`;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(cleanUrl);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.members) setState(remoteData);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [syncUrl]);

  const pushToCloud = async (newState: AppState) => {
    setState(newState);
    if (!syncUrl) return;
    try {
      const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : `${syncUrl.replace(/\/$/, '')}/syncpulse_v3.json`;
      await fetch(cleanUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
    } catch {}
  };

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (timerMode === 'pomodoro') {
            if (prev <= 1) {
              setIsTimerRunning(false);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMode]);

  const switchTimerMode = (mode: 'stopwatch' | 'pomodoro') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds(mode === 'pomodoro' ? 25 * 60 : 0);
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const logTime = (userId: string, goalId: string | null, title: string, minutes: number) => {
    if (minutes <= 0) return;
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.8 },
      colors: currentMember.theme === 'lavender-blush' ? ['#C084FC', '#F472B6', '#FDE68A'] : ['#84A98C', '#E09F5A', '#FDE68A']
    });
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedGoals = state.goals.map((g) =>
      g.id === goalId ? { ...g, loggedMinutes: g.loggedMinutes + minutes } : g
    );

    const newLog = {
      id: 'log-' + Date.now(),
      userId,
      targetTitle: title,
      minutes,
      date: todayStr,
      timestamp: `Today, ${nowTime}`,
      cheers: 1
    };

    pushToCloud({
      ...state,
      goals: updatedGoals,
      logs: [newLog, ...state.logs]
    });
  };

  const cheerLog = (logId: string) => {
    const updatedLogs = state.logs.map((l) =>
      l.id === logId ? { ...l, cheers: (l.cheers || 0) + 1 } : l
    );
    pushToCloud({ ...state, logs: updatedLogs });
  };

  const handleSaveTimerSession = () => {
    const elapsedMins =
      timerMode === 'pomodoro'
        ? Math.max(1, Math.round((25 * 60 - timerSeconds) / 60))
        : Math.max(1, Math.round(timerSeconds / 60));
    const userGoals = state.goals.filter((g) => g.userId === activeUser);
    const targetGoal = userGoals.find((g) => g.id === selectedGoalId) || userGoals[0];
    logTime(
      activeUser,
      targetGoal ? targetGoal.id : null,
      targetGoal ? targetGoal.title : 'Cozy Focus Session',
      elapsedMins
    );
    setIsTimerRunning(false);
    setTimerSeconds(timerMode === 'pomodoro' ? 25 * 60 : 0);
  };

  const updateMemberStatus = (note: string) => {
    const updated = state.members.map((m) =>
      m.id === activeUser ? { ...m, statusNote: note } : m
    );
    pushToCloud({ ...state, members: updated });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || state.members.length >= 4) return;
    const id = memberForm.name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-3);
    const newMember: Member = {
      id,
      name: memberForm.name.trim(),
      tagline: memberForm.tagline.trim() || 'Squad Companion',
      avatar: memberForm.name.trim()[0].toUpperCase(),
      theme: memberForm.theme,
      statusNote: 'Excited to grow together ✨'
    };
    const starterGoal: GoalItem = {
      id: 'g-' + Date.now(),
      userId: id,
      title: 'Personal Growth & Study',
      category: 'Short-Term',
      targetHours: 40,
      loggedMinutes: 0,
      deadline: 'Ongoing'
    };
    pushToCloud({
      ...state,
      members: [...state.members, newMember],
      goals: [...state.goals, starterGoal]
    });
    setActiveUser(id);
    setMemberForm({ name: '', tagline: '', theme: 'matcha-cream' });
    setShowMemberModal(false);
  };

  const removeMember = (id: string) => {
    if (id === 'mehrsan' || id === 'ronak') return;
    pushToCloud({ ...state, members: state.members.filter((m) => m.id !== id) });
    setActiveUser('mehrsan');
  };

  // Goal CRUD
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
    if (editingGoal) {
      const updated = state.goals.map((g) =>
        g.id === editingGoal.id
          ? { ...g, ...goalForm, targetHours: Number(goalForm.targetHours) }
          : g
      );
      pushToCloud({ ...state, goals: updated });
    } else {
      const created: GoalItem = {
        id: 'g-' + Date.now(),
        userId: activeUser,
        title: goalForm.title.trim(),
        category: goalForm.category,
        targetHours: Number(goalForm.targetHours) || 20,
        loggedMinutes: 0,
        deadline: goalForm.deadline || 'Ongoing'
      };
      pushToCloud({ ...state, goals: [...state.goals, created] });
    }
    setShowGoalModal(false);
  };

  const deleteGoal = (id: string) => {
    pushToCloud({ ...state, goals: state.goals.filter((g) => g.id !== id) });
  };

  // Schedule CRUD
  const toggleClassAttendance = (sched: ScheduleItem) => {
    const attended = sched.attendedDates.includes(todayStr);
    const updatedSchedules = state.schedules.map((s) => {
      if (s.id !== sched.id) return s;
      return {
        ...s,
        attendedDates: attended
          ? s.attendedDates.filter((d) => d !== todayStr)
          : [...s.attendedDates, todayStr]
      };
    });

    if (!attended) {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newDuration = Math.max(30, toMins(sched.endTime) - toMins(sched.startTime));
      const newLog = {
        id: 'log-' + Date.now(),
        userId: sched.userId,
        targetTitle: `Attended: ${sched.title}`,
        minutes: newDuration,
        date: todayStr,
        timestamp: `Today, ${nowTime}`,
        cheers: 1
      };
      pushToCloud({ ...state, schedules: updatedSchedules, logs: [newLog, ...state.logs] });
    } else {
      pushToCloud({ ...state, schedules: updatedSchedules });
    }
  };

  const saveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return;
    const newItem: ScheduleItem = {
      id: 's-' + Date.now(),
      userId: activeUser,
      day: scheduleForm.day,
      title: scheduleForm.title.trim(),
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      details: scheduleForm.details || 'Custom Session',
      category: scheduleForm.category,
      attendedDates: []
    };
    pushToCloud({ ...state, schedules: [...state.schedules, newItem] });
    setShowScheduleModal(false);
  };

  const deleteScheduleItem = (id: string) => {
    pushToCloud({ ...state, schedules: state.schedules.filter((s) => s.id !== id) });
  };

  // Task CRUD
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const t: TaskItem = {
      id: 't-' + Date.now(),
      userId: activeUser,
      title: newTaskTitle.trim(),
      reminderTime: newTaskTime,
      completed: false,
      estimatedMinutes: Number(newTaskMins) || 30,
      createdAt: todayStr
    };
    pushToCloud({ ...state, tasks: [t, ...state.tasks] });
    setNewTaskTitle('');
  };

  const toggleTask = (task: TaskItem) => {
    const becomingCompleted = !task.completed;
    const updatedTasks = state.tasks.map((t) =>
      t.id === task.id ? { ...t, completed: becomingCompleted } : t
    );
    if (becomingCompleted) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.75 } });
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: 'log-' + Date.now(),
        userId: task.userId,
        targetTitle: `Completed: ${task.title}`,
        minutes: task.estimatedMinutes,
        date: todayStr,
        timestamp: `Today, ${nowTime}`,
        cheers: 1
      };
      pushToCloud({ ...state, tasks: updatedTasks, logs: [newLog, ...state.logs] });
    } else {
      pushToCloud({ ...state, tasks: updatedTasks });
    }
  };

  const deleteTask = (id: string) => {
    pushToCloud({ ...state, tasks: state.tasks.filter((t) => t.id !== id) });
  };

  const getTodayMinutes = (uid: string) =>
    state.logs
      .filter((l) => l.userId === uid && l.date === todayStr)
      .reduce((acc, cur) => acc + cur.minutes, 0);

  const getTotalHours = (uid: string) => {
    const goalMins = state.goals
      .filter((g) => g.userId === uid)
      .reduce((acc, g) => acc + g.loggedMinutes, 0);
    return (goalMins / 60).toFixed(1);
  };

  const getLevelInfo = (uid: string) => {
    const totalHrs = Number(getTotalHours(uid));
    const level = Math.max(1, Math.floor(totalHrs / 15) + 1);
    return { level, title: level >= 5 ? 'Master Scholar ✨' : level >= 3 ? 'Steady Seeker 🌿' : 'Rising Star 🌱' };
  };

  const closeTutorial = () => {
    localStorage.setItem('syncpulse_phase2_seen', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const generateShareText = () => {
    const todayMins = getTodayMinutes(activeUser);
    const completedTasks = state.tasks.filter((t) => t.userId === activeUser && t.completed).length;
    const topGoals = state.goals
      .filter((g) => g.userId === activeUser)
      .slice(0, 3)
      .map((g) => `• ${g.title}: ${(g.loggedMinutes / 60).toFixed(1)}h / ${g.targetHours}h`)
      .join('\n');

    return `🌿 SyncPulse Cozy Log — ${currentMember.name}\n⏱️ Today's Focus: ${Math.floor(todayMins / 60)}h ${todayMins % 60}m\n✅ Tasks Done: ${completedTasks}\n🏆 Total Banked: ${getTotalHours(activeUser)} hrs\n\n🎯 Current Goals:\n${topGoals}`;
  };

  const copyShareStatus = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const userGoals = state.goals.filter((g) => g.userId === activeUser);
  const userTasks = state.tasks.filter((t) => t.userId === activeUser);
  const levelInfo = getLevelInfo(activeUser);

  // ============================================================================
  // PHASE 2: BUILD UNIFIED VISUAL DAILY TIMELINE (STRUCTURED / AMIE STYLE)
  // ============================================================================
  interface TimelineEntry {
    id: string;
    kind: 'class' | 'task' | 'gap';
    title: string;
    subtitle: string;
    badge: string;
    startMins: number;
    endMins: number;
    startTime: string;
    endTime: string;
    durationMins: number;
    completed: boolean;
    rawClass?: ScheduleItem;
    rawTask?: TaskItem;
  }

  const buildDailyStream = (): TimelineEntry[] => {
    const dayClasses = state.schedules.filter(
      (s) => s.userId === activeUser && s.day === timelineDay
    );

    const baseEntries: TimelineEntry[] = [];

    dayClasses.forEach((c) => {
      const sM = toMins(c.startTime);
      const eM = Math.max(sM + 30, toMins(c.endTime));
      baseEntries.push({
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

    userTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const eM = sM + (t.estimatedMinutes || 30);
      baseEntries.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: `Scheduled Task • +${t.estimatedMinutes}m credit`,
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

    baseEntries.sort((a, b) => a.startMins - b.startMins);

    // Insert Smart "Free Focus Windows" when gap between events >= 45 mins
    const streamWithGaps: TimelineEntry[] = [];
    for (let i = 0; i < baseEntries.length; i++) {
      const current = baseEntries[i];
      streamWithGaps.push(current);

      if (i < baseEntries.length - 1) {
        const next = baseEntries[i + 1];
        const gapMins = next.startMins - current.endMins;
        if (gapMins >= 45) {
          streamWithGaps.push({
            id: `gap-${current.id}-${next.id}`,
            kind: 'gap',
            title: 'Free Focus Window ✨',
            subtitle: `Unscheduled breathing room before ${next.title}`,
            badge: 'Open Slot',
            startMins: current.endMins,
            endMins: next.startMins,
            startTime: fromMins(current.endMins),
            endTime: fromMins(next.startMins),
            durationMins: gapMins,
            completed: false
          });
        }
      }
    }

    return streamWithGaps;
  };

  const dailyStream = buildDailyStream();
  const nextUpcomingItem = dailyStream.find(
    (item) => item.kind !== 'gap' && !item.completed && item.endMins > nowMinutes
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const memberTotals = state.members.map((m) => ({
      member: m,
      mins: state.logs
        .filter((l) => l.userId === m.id && l.date === dateStr)
        .reduce((a, b) => a + b.minutes, 0)
    }));
    return { dateStr, label, memberTotals };
  });

  const maxChartMins = Math.max(
    120,
    ...last7Days.flatMap((d) => d.memberTotals.map((mt) => mt.mins))
  );

  const navItems = [
    { id: 'dashboard', label: 'Today’s Timeline', icon: Compass, badge: `${dailyStream.filter(i => i.kind !== 'gap' && !i.completed).length}` },
    { id: 'goals', label: 'Goals & Time Bank', icon: Target, badge: `${userGoals.length}` },
    { id: 'schedule', label: 'Weekly Classes', icon: Calendar },
    { id: 'analytics', label: 'Squad Analytics', icon: TrendingUp },
  ];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row relative cozy-transition paper-grain ${theme.pageBg} ${theme.textMain}`}>
      {/* Soft Breathing Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`cozy-orb absolute -top-24 -left-24 w-[450px] h-[450px] rounded-full blur-[135px] cozy-transition ${theme.orb1}`}
        />
        <div
          className={`cozy-orb absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full blur-[145px] cozy-transition ${theme.orb2}`}
          style={{ animationDelay: '-5s' }}
        />
      </div>

      {/* MOBILE HEADER BAR */}
      <div className={`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl ${theme.sidebarBg}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme.primaryBtn}`}>
            {currentMember.theme === 'lavender-blush' ? <Heart className="w-4 h-4 text-white" /> : <Coffee className="w-4 h-4 text-white" />}
          </div>
          <span className="font-serif italic text-xl">SyncPulse</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
            {currentMember.name}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-xl border ${theme.cardBg}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* NOTION / LINEAR INSPIRED LEFT SIDEBAR */}
      <aside
        className={`${
          mobileMenuOpen ? 'fixed inset-0 z-40 block' : 'hidden'
        } lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex lg:flex-col border-r backdrop-blur-2xl z-30 p-5 justify-between overflow-y-auto cozy-transition ${theme.sidebarBg}`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center cozy-transition ${theme.primaryBtn}`}>
                {currentMember.theme === 'lavender-blush' ? (
                  <Heart className="w-5 h-5 text-white fill-white/25" />
                ) : (
                  <Coffee className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="font-serif italic text-2xl leading-none">SyncPulse</h1>
                <span className={`text-[11px] font-mono ${theme.textMuted}`}>
                  Cozy Sanctuary
                </span>
              </div>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Squad Companions Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-mono uppercase tracking-wider ${theme.textMuted}`}>
                Companions ({state.members.length}/4)
              </span>
              {state.members.length < 4 && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className={`text-[11px] font-semibold flex items-center gap-1 hover:underline ${theme.accentText}`}
                >
                  <UserPlus className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {state.members.map((member) => {
                const isSelected = member.id === activeUser;
                const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                const todayMins = getTodayMinutes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => {
                      setActiveUser(member.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`cursor-pointer rounded-2xl p-2.5 border transition-all flex items-center justify-between group ${
                      isSelected
                        ? `${mStyle.activeNav} shadow-sm`
                        : 'border-transparent hover:bg-current/5 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 ${mStyle.softBadge}`}>
                        {member.avatar}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold flex items-center gap-1 truncate">
                          {member.name}
                          {member.id === 'ronak' && <span>💜</span>}
                        </p>
                        <p className={`text-[10px] font-mono ${theme.textMuted}`}>
                          Today: {Math.floor(todayMins / 60)}h {todayMins % 60}m
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${mStyle.softBadge}`}>
                        {getTotalHours(member.id)}h
                      </span>
                      {member.id !== 'mehrsan' && member.id !== 'ronak' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Navigation Views */}
          <div className="space-y-1">
            <span className={`px-1 text-[11px] font-mono uppercase tracking-wider block mb-1.5 ${theme.textMuted}`}>
              Workspace Views
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between border transition-all ${
                    active
                      ? theme.activeNav
                      : `border-transparent ${theme.textMuted} hover:bg-current/5`
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cozy Soundscape Widget */}
          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${theme.innerCardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5" /> Cozy Ambience
              </span>
              {ambientMode !== 'off' && (
                <button
                  onClick={() => setAmbientMode('off')}
                  className="text-[10px] font-mono text-rose-400 flex items-center gap-0.5"
                >
                  <VolumeX className="w-3 h-3" /> Mute
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
                🌧️ Rain
              </button>
              <button
                onClick={() => setAmbientMode(ambientMode === 'zen' ? 'off' : 'zen')}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition ${
                  ambientMode === 'zen' ? theme.primaryBtn : `${theme.cardBg} ${theme.textMuted}`
                }`}
              >
                ✨ 432Hz
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="pt-4 border-t border-current/10 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLatteMode(!isLatteMode)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${theme.cardBg}`}
            >
              {isLatteMode ? <Moon className="w-3.5 h-3.5 text-purple-600" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
              {isLatteMode ? 'Night' : 'Latte'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${theme.primaryBtn}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              onClick={() => setShowSyncModal(true)}
              className={`flex items-center gap-1.5 ${theme.textMuted} hover:underline`}
            >
              <Cloud className={`w-3.5 h-3.5 ${syncUrl ? 'text-emerald-400' : ''}`} />
              {syncUrl ? 'Cloud Connected' : 'Cloud Sync'}
            </button>
            <button
              onClick={() => {
                setTutorialStep(0);
                setShowTutorial(true);
              }}
              className={`flex items-center gap-1 ${theme.textMuted} hover:underline`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Guide
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 min-w-0 relative z-10 pb-32">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-7 space-y-7">
          {/* Top Personal Greeting + Live Next Up Banner */}
          <section className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 cozy-transition ${theme.cardBg}`}>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${theme.softBadge}`}>
                  Lv.{levelInfo.level} • {levelInfo.title}
                </span>
                <span className={`text-xs font-mono ${theme.textMuted}`}>
                  🕐 {fromMins(nowMinutes)} • {realTodayName}
                </span>
                {nextUpcomingItem && (
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${theme.innerCardBg}`}>
                    <Sparkles className="w-3 h-3" />
                    Next: <b>{nextUpcomingItem.title}</b> ({nextUpcomingItem.startTime})
                  </span>
                )}
              </div>
              <h2 className="font-serif italic text-3xl sm:text-4xl tracking-tight pt-1">
                Flow through your day, {currentMember.name}.
              </h2>
              <input
                type="text"
                value={currentMember.statusNote || ''}
                onChange={(e) => updateMemberStatus(e.target.value)}
                placeholder="Write a personal intention or status note..."
                className={`text-xs bg-transparent border-b border-transparent focus:border-current/30 focus:outline-none w-full max-w-md italic ${theme.textMuted}`}
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className={`px-4 py-3 rounded-2xl border text-right ${theme.innerCardBg}`}>
                <span className={`text-[10px] font-mono uppercase block ${theme.textMuted}`}>Today's Focus</span>
                <span className={`font-mono font-bold text-xl ${theme.accentText}`}>
                  {Math.floor(getTodayMinutes(activeUser) / 60)}h {getTodayMinutes(activeUser) % 60}m
                </span>
              </div>
              <div className={`px-4 py-3 rounded-2xl border text-right ${theme.innerCardBg}`}>
                <span className={`text-[10px] font-mono uppercase block ${theme.textMuted}`}>Total Banked</span>
                <span className="font-mono font-bold text-xl">
                  {getTotalHours(activeUser)}h
                </span>
              </div>
            </div>
          </section>

          {/* VIEW 1: STRUCTURED-STYLE VISUAL DAILY TIMELINE + QUICK LOG */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Visual Daily Timeline Stream */}
              <div className="lg:col-span-7 space-y-6">
                <div className={`rounded-3xl p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  {/* Timeline Header & Day Switcher */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-serif italic text-2xl flex items-center gap-2">
                        <Compass className={`w-5 h-5 ${theme.accentText}`} />
                        Visual Daily Timeline
                      </h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Classes, scheduled intentions & free focus windows in one stream
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setScheduleForm({ ...scheduleForm, day: timelineDay });
                        setShowScheduleModal(true);
                      }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1 border ${theme.softBadge}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Class
                    </button>
                  </div>

                  {/* Mini Day Selector Pill Bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-current/10">
                    {DAYS.map((d) => {
                      const isToday = d === realTodayName;
                      const active = d === timelineDay;
                      return (
                        <button
                          key={d}
                          onClick={() => setTimelineDay(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 shrink-0 ${
                            active
                              ? theme.primaryBtn
                              : `${theme.innerCardBg} ${theme.textMuted} hover:opacity-100`
                          }`}
                        >
                          <span>{d.slice(0, 3)}</span>
                          {isToday && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Add Scheduled Task to Timeline */}
                  <form onSubmit={addTask} className="flex flex-wrap gap-2 mb-6">
                    <input
                      type="text"
                      placeholder={`Add task to timeline (e.g., Practice French / Code)...`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className={`flex-1 min-w-[160px] border rounded-2xl px-3.5 py-2 text-xs focus:outline-none ${theme.innerCardBg}`}
                    />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={`border rounded-2xl px-2.5 py-2 text-xs font-mono ${theme.innerCardBg}`}
                      title="Start Time"
                    />
                    <select
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
                      className={`px-4 py-2 rounded-2xl font-semibold text-xs ${theme.primaryBtn}`}
                    >
                      + Plot
                    </button>
                  </form>

                  {/* CHRONOLOGICAL VERTICAL STREAM (STRUCTURED STYLE) */}
                  {dailyStream.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center space-y-2 ${theme.innerCardBg}`}>
                      <p className="font-serif italic text-xl">An open, unhurried canvas ✨</p>
                      <p className={`text-xs ${theme.textMuted}`}>
                        No fixed classes or tasks plotted for {timelineDay} yet. Add an intention above or start a focus session below!
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-3 sm:pl-5 space-y-4">
                      {/* Vertical Timeline Spine */}
                      <div
                        className={`absolute top-3 bottom-3 left-[74px] sm:left-[86px] border-l-2 border-dashed ${theme.timelineLine}`}
                      />

                      {dailyStream.map((entry) => {
                        const isHappeningNow =
                          timelineDay === realTodayName &&
                          nowMinutes >= entry.startMins &&
                          nowMinutes <= entry.endMins;
                        const isPast =
                          timelineDay === realTodayName && nowMinutes > entry.endMins;
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
                            <div key={entry.id} className="relative flex items-center gap-3 sm:gap-4 group">
                              <div className={`w-14 sm:w-16 text-right font-mono text-[11px] shrink-0 ${theme.textMuted}`}>
                                {entry.startTime}
                              </div>
                              <div className={`w-3.5 h-3.5 rounded-full border-2 z-10 shrink-0 ${theme.pageBg} ${theme.timelineLine}`} />
                              <div
                                className={`flex-1 px-4 py-2.5 rounded-2xl border border-dashed flex flex-wrap items-center justify-between gap-2 text-xs transition opacity-75 hover:opacity-100 ${theme.innerCardBg}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className={`w-3.5 h-3.5 ${theme.accentText}`} />
                                  <span className="font-medium">
                                    {entry.title} ({Math.floor(entry.durationMins / 60) > 0 ? `${Math.floor(entry.durationMins / 60)}h ` : ''}{entry.durationMins % 60}m free)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    switchTimerMode('pomodoro');
                                    setIsTimerRunning(true);
                                  }}
                                  className={`text-[11px] font-mono px-2.5 py-1 rounded-xl border flex items-center gap-1 ${theme.softBadge}`}
                                >
                                  <Play className="w-3 h-3" /> Start 25m Focus
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={entry.id} className="relative flex items-start gap-3 sm:gap-4">
                            {/* Left Time Column */}
                            <div className="w-14 sm:w-16 text-right font-mono shrink-0 pt-2">
                              <span className="text-xs font-bold block">{entry.startTime}</span>
                              <span className={`text-[10px] block ${theme.textMuted}`}>{entry.endTime}</span>
                            </div>

                            {/* Center Timeline Node */}
                            <button
                              onClick={() => {
                                if (entry.kind === 'class' && entry.rawClass) {
                                  toggleClassAttendance(entry.rawClass);
                                } else if (entry.kind === 'task' && entry.rawTask) {
                                  toggleTask(entry.rawTask);
                                }
                              }}
                              className={`mt-2.5 w-4 h-4 rounded-full border-2 z-10 shrink-0 flex items-center justify-center transition ${
                                entry.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : isHappeningNow
                                  ? 'bg-amber-400 border-amber-300 animate-ping'
                                  : `${theme.pageBg} border-current`
                              }`}
                              title="Click to check-off"
                            >
                              {entry.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            {/* Right Event Card */}
                            <div
                              className={`flex-1 p-4 rounded-2xl border transition-all ${
                                isHappeningNow
                                  ? `${theme.cardBg} ${theme.activeBorder} ring-2 ring-amber-400/40`
                                  : entry.completed
                                  ? `${theme.innerCardBg} opacity-60`
                                  : theme.innerCardBg
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                                    {entry.kind === 'class' ? `🎓 ${entry.badge}` : '✨ Intention'}
                                  </span>
                                  {isHappeningNow && (
                                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                                      ● Happening Now
                                    </span>
                                  )}
                                  {isNextUp && countdownLabel && (
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.softBadge}`}>
                                      ⏳ Up Next ({countdownLabel})
                                    </span>
                                  )}
                                </div>

                                <span className={`text-[11px] font-mono ${theme.textMuted}`}>
                                  {entry.durationMins}m
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div>
                                  <h4 className={`font-semibold text-sm ${entry.completed ? 'line-through' : ''}`}>
                                    {entry.title}
                                  </h4>
                                  <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                                    {entry.subtitle}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      if (entry.kind === 'class' && entry.rawClass) {
                                        toggleClassAttendance(entry.rawClass);
                                      } else if (entry.kind === 'task' && entry.rawTask) {
                                        toggleTask(entry.rawTask);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition ${
                                      entry.completed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : theme.cardBg
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {entry.completed ? 'Done' : `+${entry.durationMins}m`}
                                  </button>
                                  {entry.kind === 'task' && entry.rawTask && (
                                    <button
                                      onClick={() => deleteTask(entry.rawTask!.id)}
                                      className="p-1.5 opacity-50 hover:text-rose-400 hover:opacity-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
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

                {/* Active Goals Quick Time Bank */}
                <div className={`rounded-3xl p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif italic text-2xl flex items-center gap-2">
                        <Target className={`w-5 h-5 ${theme.accentText}`} />
                        Active Goals & Quick Time Log
                      </h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Tap +15m, +30m, or +1h to bank extra study time directly into a goal
                      </p>
                    </div>
                    <button
                      onClick={openCreateGoal}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 ${theme.primaryBtn}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Goal
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {userGoals.map((goal) => {
                      const hoursDone = +(goal.loggedMinutes / 60).toFixed(1);
                      const pct = Math.min(100, Math.round((hoursDone / goal.targetHours) * 100));
                      return (
                        <div
                          key={goal.id}
                          className={`p-4 rounded-2xl border cozy-transition ${theme.innerCardBg}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                            <div>
                              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border mr-2 ${theme.softBadge}`}>
                                {goal.category}
                              </span>
                              <span className={`text-[11px] font-mono ${theme.textMuted}`}>
                                {goal.deadline}
                              </span>
                              <h4 className="font-semibold text-sm mt-1">{goal.title}</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 15)}
                                className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono hover:opacity-80 ${theme.cardBg}`}
                              >
                                +15m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 30)}
                                className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono hover:opacity-80 ${theme.cardBg}`}
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 60)}
                                className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold ${theme.softBadge}`}
                              >
                                +1h
                              </button>
                              <button onClick={() => openEditGoal(goal)} className="p-1.5 opacity-60 hover:opacity-100">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteGoal(goal.id)} className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1.5">
                              <span className={theme.textMuted}>
                                {hoursDone} hrs invested of {goal.targetHours} hrs
                              </span>
                              <span className={`font-bold ${theme.accentText}`}>{pct}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-current/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${theme.progressBar}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Shared Squad Feed + Exams */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`rounded-3xl p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Heart className={`w-5 h-5 ${theme.accentText}`} />
                      Shared Squad Moments
                    </h3>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${theme.softBadge}`}>
                      Live Feed
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {state.logs.slice(0, 14).map((log) => {
                      const logMember = state.members.find((m) => m.id === log.userId);
                      const mStyle = GET_COZY_THEME(logMember?.theme || 'warm-sage', isLatteMode);
                      return (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs ${theme.innerCardBg}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 ${mStyle.softBadge}`}
                            >
                              {logMember ? logMember.avatar : 'S'}
                            </span>
                            <div>
                              <p className="font-medium">
                                <span className="font-bold">{logMember?.name}</span> • {log.targetTitle}
                              </p>
                              <span className={`text-[11px] font-mono ${theme.textMuted}`}>
                                {log.timestamp} (+{log.minutes}m)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => cheerLog(log.id)}
                            className={`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1 hover:scale-105 transition shrink-0 ${mStyle.softBadge}`}
                          >
                            <span>💜</span>
                            <span>{log.cheers || 1}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`rounded-3xl p-6 border backdrop-blur-md cozy-transition ${theme.cardBg}`}>
                  <h3 className="font-serif italic text-2xl flex items-center gap-2 mb-3">
                    <GraduationCap className={`w-5 h-5 ${theme.accentText}`} />
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
                          <span className={`text-[11px] ${theme.textMuted}`}>Prof. {ex.professor}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={`font-bold block ${theme.accentText}`}>{ex.date}</span>
                          <span className={`text-[11px] ${theme.textMuted}`}>⏰ {ex.time}</span>
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
                    Add, edit, or refine short-term and long-term milestones for anyone in the circle.
                  </p>
                </div>
                <button
                  onClick={openCreateGoal}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${theme.primaryBtn}`}
                >
                  <Plus className="w-4 h-4" />
                  New Goal for {currentMember.name}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  return (
                    <div key={member.id} className={`rounded-3xl p-6 border space-y-4 ${theme.cardBg}`}>
                      <div className="flex items-center justify-between border-b border-current/10 pb-3">
                        <h4 className="font-serif italic text-2xl flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center border ${mStyle.softBadge}`}>
                            {member.avatar}
                          </span>
                          {member.name}'s Goals
                        </h4>
                        <span className={`text-xs font-mono ${theme.textMuted}`}>
                          {getTotalHours(member.id)} hrs banked
                        </span>
                      </div>

                      {state.goals
                        .filter((g) => g.userId === member.id)
                        .map((g) => {
                          const hrs = +(g.loggedMinutes / 60).toFixed(1);
                          const pct = Math.min(100, Math.round((hrs / g.targetHours) * 100));
                          return (
                            <div key={g.id} className={`p-4 rounded-2xl border space-y-2 ${theme.innerCardBg}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${mStyle.softBadge}`}>
                                    {g.category}
                                  </span>
                                  <h5 className="font-semibold text-sm mt-1">{g.title}</h5>
                                  <p className={`text-[11px] font-mono ${theme.textMuted}`}>
                                    Horizon: {g.deadline}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openEditGoal(g)} className="p-1.5 opacity-60 hover:opacity-100">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => deleteGoal(g.id)} className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs font-mono pt-1">
                                <span>{hrs}h / {g.targetHours}h ({pct}%)</span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => logTime(member.id, g.id, g.title, 30)}
                                    className={`px-2 py-0.5 rounded-lg border ${theme.cardBg}`}
                                  >
                                    +30m
                                  </button>
                                  <button
                                    onClick={() => logTime(member.id, g.id, g.title, 60)}
                                    className={`px-2 py-0.5 rounded-lg border ${mStyle.softBadge}`}
                                  >
                                    +1h
                                  </button>
                                </div>
                              </div>

                              <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
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
                    setShowScheduleModal(true);
                  }}
                  className={`px-4 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 ${theme.primaryBtn}`}
                >
                  <Plus className="w-3.5 h-3.5" />
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
                          A free, unhurried {selectedDay} — wonderful for self-paced goals ☕
                        </p>
                      ) : (
                        dayItems.map((item) => {
                          const attendedToday = item.attendedDates.includes(todayStr);
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
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${mStyle.softBadge}`}>
                                    {item.category}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-sm mt-1">{item.title}</h5>
                                <p className={`text-xs ${theme.textMuted}`}>{item.details}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleClassAttendance(item)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                                    attendedToday ? mStyle.softBadge : theme.cardBg
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {attendedToday ? 'Attended' : 'Check-in'}
                                </button>
                                <button
                                  onClick={() => deleteScheduleItem(item.id)}
                                  className="p-1.5 opacity-50 hover:text-rose-400 hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
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

          {/* VIEW 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className={`rounded-3xl p-6 border ${theme.cardBg}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-serif italic text-2xl">7-Day Gentle Consistency Rhythm</h3>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Comparing daily focused minutes side-by-side across your circle
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  {state.members.map((m) => (
                    <span key={m.id} className={`flex items-center gap-1.5 ${GET_COZY_THEME(m.theme, isLatteMode).accentText}`}>
                      ● {m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 items-end h-60 pt-8 px-2 border-b border-current/10">
                {last7Days.map((d) => (
                  <div key={d.dateStr} className="flex flex-col items-center h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {d.memberTotals.map((mt) => {
                        const hPct = Math.round((mt.mins / maxChartMins) * 100);
                        const barGrad = GET_COZY_THEME(mt.member.theme, isLatteMode).barColor;
                        return (
                          <div
                            key={mt.member.id}
                            className={`w-4 sm:w-6 bg-gradient-to-t ${barGrad} rounded-t-xl transition-all duration-500 relative group`}
                            style={{ height: `${Math.max(8, hPct)}%` }}
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-stone-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                              {mt.member.name[0]}: {mt.mins}m
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <span className={`text-xs font-mono mt-2 ${theme.textMuted}`}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* PERSISTENT FLOATING FOCUS TIMER DOCK */}
        <div className="fixed bottom-4 left-0 right-0 lg:left-72 z-30 px-4 pointer-events-none">
          <div
            className={`max-w-3xl mx-auto rounded-3xl p-3 sm:px-5 border backdrop-blur-2xl pointer-events-auto flex flex-wrap items-center justify-between gap-3 cozy-transition ${theme.dockBg}`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <button
                onClick={() => switchTimerMode(timerMode === 'stopwatch' ? 'pomodoro' : 'stopwatch')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono border shrink-0 transition ${theme.softBadge}`}
                title="Click to switch between Open Stopwatch and 25m Pomodoro"
              >
                {timerMode === 'pomodoro' ? '🍅 25m' : '⏱️ Timer'}
              </button>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className={`w-full border rounded-xl px-3 py-1.5 text-xs focus:outline-none truncate ${theme.innerCardBg}`}
              >
                <option value="">-- Focus on Goal ({currentMember.name}) --</option>
                {userGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider px-2">
              {formatTimer(timerSeconds)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition ${theme.primaryBtn}`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={handleSaveTimerSession}
                className={`px-3.5 py-2 rounded-2xl font-semibold text-xs border flex items-center gap-1 transition ${theme.softBadge}`}
                title="Save and credit elapsed time"
              >
                <Check className="w-3.5 h-3.5" />
                Log
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(timerMode === 'pomodoro' ? 25 * 60 : 0);
                }}
                className={`p-2 rounded-xl border ${theme.innerCardBg}`}
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TUTORIAL MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono px-3 py-1 rounded-full border ${theme.softBadge}`}>
                Phase 2 Update • {tutorialStep + 1} / {TUTORIAL_STEPS.length}
              </span>
              <button onClick={closeTutorial} className={`text-xs font-mono ${theme.textMuted}`}>
                Close ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif italic text-3xl">
                {TUTORIAL_STEPS[tutorialStep].title}
              </h3>
              <p className={`text-xs font-semibold ${theme.accentText}`}>
                {TUTORIAL_STEPS[tutorialStep].subtitle}
              </p>
              <p className={`text-xs sm:text-sm leading-relaxed pt-1 ${theme.textMuted}`}>
                {TUTORIAL_STEPS[tutorialStep].description}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${theme.innerCardBg}`}>
              🌿 <b>Tip:</b> {TUTORIAL_STEPS[tutorialStep].highlight}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
                disabled={tutorialStep === 0}
                className={`px-4 py-2 rounded-2xl border disabled:opacity-30 text-xs font-semibold flex items-center gap-1 ${theme.cardBg}`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={() => setTutorialStep((s) => s + 1)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 ${theme.primaryBtn}`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={closeTutorial}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}
                >
                  Explore Timeline ✨
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE STATUS MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                Share {currentMember.name}'s Snapshot
              </h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${theme.innerCardBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl font-serif italic text-xl flex items-center justify-center border ${theme.softBadge}`}>
                    {currentMember.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{currentMember.name}</h4>
                    <span className={`text-[11px] ${theme.textMuted}`}>{currentMember.tagline}</span>
                  </div>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-xl border ${theme.softBadge}`}>
                  Today: {Math.floor(getTodayMinutes(activeUser) / 60)}h {getTodayMinutes(activeUser) % 60}m
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-current/10 text-xs">
                {userGoals.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex justify-between font-mono">
                    <span className="truncate max-w-[200px]">{g.title}</span>
                    <span className={theme.accentText}>
                      {(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={copyShareStatus}
              className={`w-full py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 ${theme.primaryBtn}`}
            >
              <Copy className="w-4 h-4" />
              {copiedShare ? 'Copied to Clipboard! ✨' : 'Copy Snapshot for Telegram / Stories'}
            </button>
          </div>
        </div>
      )}

      {/* ADD COMPANION MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                Invite Companion ({state.members.length}/4)
              </h3>
              <button type="button" onClick={() => setShowMemberModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Name</label>
              <input
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="e.g., Sara"
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Focus / Tagline</label>
              <input
                type="text"
                value={memberForm.tagline}
                onChange={(e) => setMemberForm({ ...memberForm, tagline: e.target.value })}
                placeholder="e.g., Art & Literature"
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Cozy Aesthetic Palette</label>
              <select
                value={memberForm.theme}
                onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
                className={`w-full border rounded-2xl px-3 py-2.5 text-xs ${theme.innerCardBg}`}
              >
                <option value="peach-terracotta">Warm Terracotta & Peach 🍑</option>
                <option value="matcha-cream">Matcha Oat Milk 🍵</option>
                <option value="lavender-blush">Velvet Lavender & Rose 💜</option>
                <option value="warm-sage">Espresso & Warm Sage ☕</option>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveGoal}
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                {editingGoal ? 'Edit Goal' : `New Goal for ${currentMember.name}`}
              </h3>
              <button type="button" onClick={() => setShowGoalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Goal Title</label>
              <input
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="e.g., Master French B2"
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>Category</label>
                <select
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
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>Target Hours</label>
                <input
                  type="number"
                  min={1}
                  value={goalForm.targetHours}
                  onChange={(e) => setGoalForm({ ...goalForm, targetHours: Number(e.target.value) })}
                  className={`w-full border rounded-2xl px-3 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Horizon / Deadline</label>
              <input
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                placeholder="e.g., This Semester"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveScheduleItem}
            className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                Add Class / Session ({currentMember.name})
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Title</label>
              <input
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="e.g., French Conversation"
                className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs ${theme.innerCardBg}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>Day</label>
                <select
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
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>Start</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className={`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 ${theme.textMuted}`}>End</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className={`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${theme.textMuted}`}>Details</label>
              <input
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
                placeholder="e.g., Room 102"
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

      {/* CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-md w-full p-6 space-y-4 ${theme.pageBg} ${theme.activeBorder}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Real-Time Cloud Sync</h3>
              <button onClick={() => setShowSyncModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
              Paste a free Firebase Realtime Database URL to keep everyone’s logs, cheers, and goals synced live across devices.
            </p>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com/"
              className={`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono ${theme.innerCardBg}`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                  if (syncUrl.trim()) pushToCloud(state);
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold ${theme.primaryBtn}`}
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
