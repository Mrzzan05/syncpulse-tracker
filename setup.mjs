// setup.mjs - SyncPulse v2.0 (Dynamic Themes + 4-Player Squad + Interactive Tutorial + Share Card)
// Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'package.json': JSON.stringify({
    name: 'syncpulse-squad-tracker',
    private: true,
    version: '2.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'lucide-react': '^0.344.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'canvas-confetti': '^1.9.2'
    },
    devDependencies: {
      '@types/react': '^18.2.66',
      '@types/react-dom': '^18.2.22',
      '@vitejs/plugin-react': '^4.2.1',
      'autoprefixer': '^10.4.19',
      'postcss': '^8.4.38',
      'tailwindcss': '^3.4.3',
      'typescript': '^5.2.2',
      'vite': '^5.2.0'
    }
  }, null, 2),

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }
}

.theme-transition {
  transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.5s ease;
}

@keyframes floatSlow {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(25px, -20px) scale(1.08); }
}

.ambient-orb {
  animation: floatSlow 9s ease-in-out infinite;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #090d16;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 9999px;
}
`,

  'src/initialData.ts': `export type ThemePalette = 'cyber-cyan' | 'royal-violet' | 'sunset-coral' | 'emerald-mint';

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
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

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'Short-Term' | 'Long-Term' | 'Habit' | 'Career';
  targetHours: number;
  loggedMinutes: number;
  deadline: string;
}

export interface TaskItem {
  id: string;
  userId: string;
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
  type: 'Core' | 'General';
}

export interface TimeLog {
  id: string;
  userId: string;
  targetTitle: string;
  minutes: number;
  date: string;
  timestamp: string;
}

export interface AppState {
  members: Member[];
  schedules: ScheduleItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  exams: ExamItem[];
  logs: TimeLog[];
}

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_STATE: AppState = {
  members: [
    {
      id: 'mehrsan',
      name: 'Mehrsan',
      tagline: 'Computer Eng • AI & Web',
      avatar: 'M',
      theme: 'cyber-cyan'
    },
    {
      id: 'ronak',
      name: 'Ronak',
      tagline: 'French B2 • English & Uni',
      avatar: 'R',
      theme: 'royal-violet' // Her favorite purple/lavender aesthetic!
    }
  ],
  schedules: [
    // Mehrsan's Schedule
    { id: 'm-s1', userId: 'mehrsan', day: 'Saturday', title: 'Principles of Compiler Design', startTime: '08:30', endTime: '10:30', details: 'Prof. Morteza Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s2', userId: 'mehrsan', day: 'Saturday', title: 'Special Topics (Deep Learning)', startTime: '10:30', endTime: '12:30', details: 'Prof. Saleh Yousefi • Room 1205', category: 'Core', attendedDates: [] },
    { id: 'm-s3', userId: 'mehrsan', day: 'Saturday', title: 'Analytical History of Early Islam', startTime: '14:00', endTime: '16:00', details: 'Prof. Mohammad Karimi • Room 102 (Zaryab Khoyi)', category: 'General', attendedDates: [] },
    { id: 'm-s4', userId: 'mehrsan', day: 'Sunday', title: 'Special Topics (Deep Learning)', startTime: '08:30', endTime: '10:30', details: 'Prof. Saleh Yousefi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s5', userId: 'mehrsan', day: 'Sunday', title: 'Principles of Compiler Design', startTime: '14:00', endTime: '16:00', details: 'Prof. Morteza Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s6', userId: 'mehrsan', day: 'Monday', title: 'Fundamentals of Info Security', startTime: '12:30', endTime: '14:00', details: 'Prof. Mir Saman Tajbakhsh • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s7', userId: 'mehrsan', day: 'Tuesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Yaser Azimi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s8', userId: 'mehrsan', day: 'Tuesday', title: 'Electrical & Electronic Circuits Lab', startTime: '12:30', endTime: '14:00', details: 'Room 210', category: 'Lab', attendedDates: [] },
    { id: 'm-s9', userId: 'mehrsan', day: 'Wednesday', title: 'Fundamentals of Info Security', startTime: '08:30', endTime: '10:30', details: 'Prof. Mir Saman Tajbakhsh • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s10', userId: 'mehrsan', day: 'Wednesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Yaser Azimi • Room 102', category: 'Core', attendedDates: [] },

    // Ronak's Schedule
    { id: 'r-s1', userId: 'ronak', day: 'Saturday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s2', userId: 'ronak', day: 'Sunday', title: 'University Classes Block', startTime: '08:30', endTime: '12:30', details: 'Morning Campus Sessions', category: 'University', attendedDates: [] },
    { id: 'r-s3', userId: 'ronak', day: 'Monday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s4', userId: 'ronak', day: 'Monday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
    { id: 'r-s5', userId: 'ronak', day: 'Tuesday', title: 'University Classes Block', startTime: '08:30', endTime: '14:30', details: 'Full Campus Day', category: 'University', attendedDates: [] },
    { id: 'r-s6', userId: 'ronak', day: 'Wednesday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Live Session', category: 'Language', attendedDates: [] },
  ],
  goals: [
    { id: 'm-g1', userId: 'mehrsan', title: 'B.Sc. Final Project (3 Credits)', category: 'Long-Term', targetHours: 120, loggedMinutes: 1440, deadline: 'End of Semester' },
    { id: 'm-g2', userId: 'mehrsan', title: 'Master Deep Learning & Neural Nets', category: 'Long-Term', targetHours: 80, loggedMinutes: 960, deadline: '1405/11/14' },
    { id: 'm-g3', userId: 'mehrsan', title: 'Full-Stack Web Dev Projects', category: 'Short-Term', targetHours: 50, loggedMinutes: 720, deadline: 'Ongoing' },

    { id: 'r-g1', userId: 'ronak', title: 'Master French up to B2 Level', category: 'Long-Term', targetHours: 400, loggedMinutes: 3600, deadline: 'Until B.Sc. Graduation (~3 Years)' },
    { id: 'r-g2', userId: 'ronak', title: 'English Immersion (Movies, YouTube & Media)', category: 'Habit', targetHours: 150, loggedMinutes: 2100, deadline: 'Daily Routine' },
    { id: 'r-g3', userId: 'ronak', title: 'Launch English Teaching Career', category: 'Career', targetHours: 60, loggedMinutes: 600, deadline: 'This Year' },
  ],
  tasks: [
    { id: 'm-t1', userId: 'mehrsan', title: 'Review Compiler Design Lexical Analysis notes', reminderTime: '18:00', completed: false, estimatedMinutes: 45, createdAt: getTodayStr() },
    { id: 'm-t2', userId: 'mehrsan', title: 'Coordinate Final Project milestone with supervisor', reminderTime: '11:00', completed: true, estimatedMinutes: 30, createdAt: getTodayStr() },
    { id: 'r-t1', userId: 'ronak', title: 'Watch 1hr English YouTube / Movie', reminderTime: '20:00', completed: false, estimatedMinutes: 60, createdAt: getTodayStr() },
    { id: 'r-t2', userId: 'ronak', title: 'Review French grammar & vocab before 9 PM class', reminderTime: '19:30', completed: true, estimatedMinutes: 45, createdAt: getTodayStr() },
  ],
  exams: [
    { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Morteza Damanafshan', type: 'Core' },
    { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Mir Saman Tajbakhsh', type: 'Core' },
    { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Mohammad Karimi', type: 'General' },
    { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Yaser Azimi', type: 'Core' },
    { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Saleh Yousefi', type: 'Core' },
  ],
  logs: [
    { id: 'l-1', userId: 'mehrsan', targetTitle: 'Special Topics (Deep Learning)', minutes: 90, date: getPastDateStr(2), timestamp: '2 days ago' },
    { id: 'l-2', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 120, date: getPastDateStr(2), timestamp: '2 days ago' },
    { id: 'l-3', userId: 'mehrsan', targetTitle: 'Full-Stack Web Dev Projects', minutes: 110, date: getPastDateStr(1), timestamp: 'Yesterday' },
    { id: 'l-4', userId: 'ronak', targetTitle: 'English Immersion (Movies, YouTube & Media)', minutes: 95, date: getPastDateStr(1), timestamp: 'Yesterday' },
    { id: 'l-5', userId: 'mehrsan', targetTitle: 'B.Sc. Final Project (3 Credits)', minutes: 60, date: getTodayStr(), timestamp: 'Today, 10:15' },
    { id: 'l-6', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 75, date: getTodayStr(), timestamp: 'Today, 11:30' },
  ]
};
`,

  'src/App.tsx': `import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock, Target, Calendar, CheckCircle2, Plus, Trash2, Edit3,
  Play, Pause, RotateCcw, TrendingUp, Bell, Sparkles,
  Users, Cloud, Check, X, GraduationCap, Zap, HelpCircle,
  Share2, UserPlus, Copy, ChevronRight, ChevronLeft, Heart
} from 'lucide-react';
import {
  INITIAL_STATE, AppState, GoalItem, ScheduleItem, TaskItem, Member, ThemePalette
} from './initialData';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Theme Configurations for smooth dynamic transitions
const THEME_CONFIG: Record<ThemePalette, {
  name: string;
  orb1: string;
  orb2: string;
  pageBg: string;
  primaryBtn: string;
  softBadge: string;
  activeBorder: string;
  progressBar: string;
  accentText: string;
  barColor: string;
}> = {
  'cyber-cyan': {
    name: 'Cyber Cyan (Mehrsan)',
    orb1: 'bg-cyan-500/20',
    orb2: 'bg-blue-600/20',
    pageBg: 'bg-[#060b16]',
    primaryBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25',
    softBadge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    activeBorder: 'border-cyan-500/50 shadow-xl shadow-cyan-950/40',
    progressBar: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600',
    accentText: 'text-cyan-400',
    barColor: 'from-cyan-500 to-blue-400'
  },
  'royal-violet': {
    name: 'Amethyst Violet (Ronak 💜)',
    orb1: 'bg-purple-500/30',
    orb2: 'bg-fuchsia-500/25',
    pageBg: 'bg-[#12071f]',
    primaryBtn: 'bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 hover:from-purple-400 hover:to-fuchsia-400 text-white shadow-lg shadow-purple-500/30',
    softBadge: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
    activeBorder: 'border-purple-400/60 shadow-xl shadow-purple-950/60',
    progressBar: 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500',
    accentText: 'text-purple-300',
    barColor: 'from-purple-500 to-fuchsia-400'
  },
  'sunset-coral': {
    name: 'Sunset Rose',
    orb1: 'bg-rose-500/25',
    orb2: 'bg-amber-500/20',
    pageBg: 'bg-[#160910]',
    primaryBtn: 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-lg shadow-rose-500/25',
    softBadge: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
    activeBorder: 'border-rose-400/50 shadow-xl shadow-rose-950/50',
    progressBar: 'bg-gradient-to-r from-rose-400 to-amber-400',
    accentText: 'text-rose-300',
    barColor: 'from-rose-500 to-amber-400'
  },
  'emerald-mint': {
    name: 'Emerald Mint',
    orb1: 'bg-emerald-500/25',
    orb2: 'bg-teal-500/20',
    pageBg: 'bg-[#061411]',
    primaryBtn: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25',
    softBadge: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    activeBorder: 'border-emerald-400/50 shadow-xl shadow-emerald-950/50',
    progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    accentText: 'text-emerald-300',
    barColor: 'from-emerald-500 to-teal-400'
  }
};

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to SyncPulse Squad! ✨',
    subtitle: 'Your shared space for daily focus, classes & big dreams.',
    description: 'Everything here is designed to keep you and your friends motivated without feeling overwhelmed. Let’s take a 20-second tour!',
    highlight: 'Switch between Mehrsan, Ronak, or up to 4 friends at the top. Notice how the entire app theme transforms for each person! 💜💙'
  },
  {
    title: 'Step 1: Track Time & Build Momentum ⏱️',
    subtitle: 'Time invested is your biggest motivation.',
    description: 'Whenever you study or work on a goal, either run the Live Stopwatch at the top OR click the quick [+15m] [+30m] [+1h] buttons on any goal card.',
    highlight: 'Every minute you log fills your progress bar and appears in the Shared Squad Feed so your friends can cheer you on!'
  },
  {
    title: 'Step 2: Customize Goals, Tasks & Classes 🎯',
    subtitle: '100% Editable — Nothing is locked.',
    description: 'Have a new short-term or long-term goal? Click "+ New Goal" to add it, edit target hours, or delete old ones. In the Schedule tab, check-in to your university or language classes to earn +90m automatic credit!',
    highlight: 'Checking off daily tasks and classes triggers celebratory confetti and boosts your daily hours.'
  },
  {
    title: 'Step 3: Invite Friends & Share Status 🚀',
    subtitle: 'Up to 4 Squad Members + Instant Share Cards.',
    description: 'Click "+ Add Member" to bring a 3rd or 4th friend into this organization. Want to show your progress on Telegram or Instagram? Click "Share Status" to generate a sleek summary card!',
    highlight: 'You can reopen this guide anytime by clicking the "Tutorial" button in the top navigation bar.'
  }
];

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('syncpulse_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.members && parsed.members.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_STATE;
  });

  const [activeUser, setActiveUser] = useState<string>('mehrsan');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'goals' | 'schedule' | 'analytics'>('dashboard');
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(jsDay) ? jsDay : 'Saturday';
  });

  // Tutorial Modal State (auto-shows first time)
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return !localStorage.getItem('syncpulse_tutorial_seen');
  });
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Share Status Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Add Member Modal (Up to 4 Squad Members)
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    tagline: '',
    theme: 'sunset-coral' as ThemePalette
  });

  // Live Stopwatch
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
  const [newTaskTime, setNewTaskTime] = useState('18:00');
  const [newTaskMins, setNewTaskMins] = useState(30);

  // Cloud Sync
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncUrl, setSyncUrl] = useState(() => localStorage.getItem('syncpulse_cloud_url') || '');

  const currentMember = state.members.find((m) => m.id === activeUser) || state.members[0];
  const activeTheme = THEME_CONFIG[currentMember.theme] || THEME_CONFIG['cyber-cyan'];

  useEffect(() => {
    localStorage.setItem('syncpulse_v2', JSON.stringify(state));
  }, [state]);

  // Real-time Cloud Sync Polling
  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v2.json\`;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(cleanUrl);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.members) {
            setState(remoteData);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [syncUrl]);

  const pushToCloud = async (newState: AppState) => {
    setState(newState);
    if (!syncUrl) return;
    try {
      const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v2.json\`;
      await fetch(cleanUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
    } catch {}
  };

  // Stopwatch Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return \`\${String(hrs).padStart(2, '0')}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const logTime = (userId: string, goalId: string | null, title: string, minutes: number) => {
    if (minutes <= 0) return;
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: currentMember.theme === 'royal-violet' ? ['#c084fc', '#e879f9', '#f472b6'] : ['#38bdf8', '#818cf8', '#34d399']
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
      timestamp: \`Today, \${nowTime}\`
    };

    pushToCloud({
      ...state,
      goals: updatedGoals,
      logs: [newLog, ...state.logs]
    });
  };

  const handleSaveTimerSession = () => {
    const mins = Math.max(1, Math.round(timerSeconds / 60));
    const userGoals = state.goals.filter((g) => g.userId === activeUser);
    const targetGoal = userGoals.find((g) => g.id === selectedGoalId) || userGoals[0];
    logTime(
      activeUser,
      targetGoal ? targetGoal.id : null,
      targetGoal ? targetGoal.title : 'Deep Focus Session',
      mins
    );
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  // Add Squad Member (Max 4)
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || state.members.length >= 4) return;
    const id = memberForm.name.trim().toLowerCase().replace(/\\s+/g, '-') + '-' + Date.now().toString().slice(-3);
    const newMember: Member = {
      id,
      name: memberForm.name.trim(),
      tagline: memberForm.tagline.trim() || 'Squad Member',
      avatar: memberForm.name.trim()[0].toUpperCase(),
      theme: memberForm.theme
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
    setMemberForm({ name: '', tagline: '', theme: 'emerald-mint' });
    setShowMemberModal(false);
  };

  const removeMember = (id: string) => {
    if (id === 'mehrsan' || id === 'ronak') return; // Keep core duo safe
    const filtered = state.members.filter((m) => m.id !== id);
    pushToCloud({ ...state, members: filtered });
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
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.8 } });
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: 'log-' + Date.now(),
        userId: sched.userId,
        targetTitle: \`Attended: \${sched.title}\`,
        minutes: 90,
        date: todayStr,
        timestamp: \`Today, \${nowTime}\`
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
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.75 } });
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: 'log-' + Date.now(),
        userId: task.userId,
        targetTitle: \`Task: \${task.title}\`,
        minutes: task.estimatedMinutes,
        date: todayStr,
        timestamp: \`Today, \${nowTime}\`
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

  const closeTutorial = () => {
    localStorage.setItem('syncpulse_tutorial_seen', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const generateShareText = () => {
    const todayMins = getTodayMinutes(activeUser);
    const completedTasks = state.tasks.filter((t) => t.userId === activeUser && t.completed).length;
    const topGoals = state.goals
      .filter((g) => g.userId === activeUser)
      .slice(0, 3)
      .map((g) => \`• \${g.title}: \${(g.loggedMinutes / 60).toFixed(1)}h / \${g.targetHours}h\`)
      .join('\\n');

    return \`⚡ SyncPulse Daily Status — \${currentMember.name}\\n⏱️ Today's Focus: \${Math.floor(todayMins / 60)}h \${todayMins % 60}m\\n✅ Tasks Completed: \${completedTasks}\\n🏆 Total Banked Hours: \${getTotalHours(activeUser)} hrs\\n\\n🎯 Active Goals:\\n\${topGoals}\\n\\nSynced with our Squad on SyncPulse!\`;
  };

  const copyShareStatus = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // 7-Day Analytics Data across all squad members
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

  const userGoals = state.goals.filter((g) => g.userId === activeUser);
  const userTasks = state.tasks.filter((t) => t.userId === activeUser);

  return (
    <div className={\`min-h-screen pb-16 relative theme-transition \${activeTheme.pageBg} text-slate-100\`}>
      {/* Animated Floating Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={\`ambient-orb absolute -top-28 -left-28 w-[420px] h-[420px] rounded-full blur-[130px] theme-transition \${activeTheme.orb1}\`}
        />
        <div
          className={\`ambient-orb absolute top-1/4 -right-28 w-[460px] h-[460px] rounded-full blur-[140px] theme-transition \${activeTheme.orb2}\`}
          style={{ animationDelay: '-4s' }}
        />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-xl flex items-center justify-center theme-transition \${activeTheme.primaryBtn}\`}>
              {currentMember.theme === 'royal-violet' ? (
                <Heart className="w-5 h-5 text-white fill-white/20" />
              ) : (
                <Zap className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight text-white">
                  SyncPulse
                </h1>
                <span className={\`text-[11px] font-mono px-2.5 py-0.5 rounded-full border theme-transition \${activeTheme.softBadge}\`}>
                  {currentMember.name}'s Space
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Squad Productivity & Time Accountability ({state.members.length}/4 Members)
              </p>
            </div>
          </div>

          {/* Action Buttons: Tutorial, Share Status, Cloud Sync */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTutorialStep(0);
                setShowTutorial(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Tutorial</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className={\`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition \${activeTheme.primaryBtn}\`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Status</span>
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
              title="Real-Time Squad Sync"
            >
              <Cloud className={\`w-4 h-4 \${syncUrl ? 'text-emerald-400' : 'text-slate-400'}\`} />
              <span className="hidden md:inline">{syncUrl ? 'Synced' : 'Cloud Sync'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SQUAD BAR (SWITCH PROFILES & WATCH THE THEME TRANSFORM + ADD UP TO 4 MEMBERS) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Select Squad Member (Click a card to switch space & theme)
            </span>
            {state.members.length < 4 && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg border border-white/10 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add Friend ({state.members.length}/4)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {state.members.map((member) => {
              const isSelected = member.id === activeUser;
              const mTheme = THEME_CONFIG[member.theme] || THEME_CONFIG['cyber-cyan'];
              const todayMins = getTodayMinutes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => setActiveUser(member.id)}
                  className={\`cursor-pointer rounded-2xl p-4 border backdrop-blur-md transition-all duration-500 relative group \${
                    isSelected
                      ? \`bg-white/10 \${mTheme.activeBorder} scale-[1.01]\`
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }\`}
                >
                  {member.id !== 'mehrsan' && member.id !== 'ronak' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMember(member.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 absolute top-2.5 right-2.5 p-1 rounded-lg bg-black/40 text-slate-400 hover:text-rose-400"
                      title="Remove Member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-base border \${mTheme.softBadge}\`}>
                        {member.avatar}
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                          {member.name}
                          {member.id === 'ronak' && <span className="text-xs">💜</span>}
                        </h2>
                        <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {member.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">Today</span>
                      <span className={\`font-mono font-bold text-sm \${mTheme.accentText}\`}>
                        {Math.floor(todayMins / 60)}h {todayMins % 60}m
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                    <span>Banked: {getTotalHours(member.id)}h</span>
                    <span className={isSelected ? mTheme.accentText : 'text-slate-500'}>
                      {isSelected ? '● Active View' : 'Switch →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP-BY-STEP CLEAR NAVIGATION TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] border border-white/10 p-2 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'dashboard', label: '1. Today’s Focus & Tasks', icon: Sparkles },
              { id: 'goals', label: '2. Goals & Time Bank', icon: Target },
              { id: 'schedule', label: '3. Weekly Class Schedule', icon: Calendar },
              { id: 'analytics', label: '4. Squad Visual Charts', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={\`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all \${
                    active
                      ? activeTheme.primaryBtn
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: DASHBOARD (CLEAR 3-PART WORKFLOW) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero Live Focus Timer Banner */}
            <div className={\`rounded-2xl p-5 border backdrop-blur-xl bg-white/[0.04] theme-transition \${activeTheme.activeBorder}\`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 space-y-1">
                  <span className={\`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 \${activeTheme.softBadge}\`}>
                    <Clock className="w-3 h-3" /> Step 1 • Live Focus Stopwatch
                  </span>
                  <h3 className="font-display font-bold text-lg text-white pt-1">
                    Ready to invest time, {currentMember.name}?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pick a goal, start the timer while you study or practice, then click <b>Log Time</b> to save your minutes!
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="font-mono text-4xl font-bold tracking-wider text-white mb-2">
                    {formatTimer(timerSeconds)}
                  </div>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="w-full max-w-xs bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Credit Time to Goal --</option>
                    {userGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-3 flex items-center justify-center lg:justify-end gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={\`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition \${
                      isTimerRunning
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                        : activeTheme.primaryBtn
                    }\`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isTimerRunning ? 'Pause' : 'Start Timer'}
                  </button>
                  <button
                    onClick={handleSaveTimerSession}
                    disabled={timerSeconds === 0}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white flex items-center gap-1 transition"
                  >
                    <Check className="w-4 h-4" />
                    Log Time
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Goals Quick Log + Daily Checklist */}
              <div className="lg:col-span-7 space-y-6">
                {/* Goals & Quick Time Buttons */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <Target className={\`w-4 h-4 \${activeTheme.accentText}\`} />
                        {currentMember.name}'s Active Goals (Quick Time Log)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Forgot to run the stopwatch? Tap +15m, +30m, or +1h to log your effort instantly.
                      </p>
                    </div>
                    <button
                      onClick={openCreateGoal}
                      className={\`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 \${activeTheme.primaryBtn}\`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Goal
                    </button>
                  </div>

                  <div className="space-y-3">
                    {userGoals.map((goal) => {
                      const hoursDone = +(goal.loggedMinutes / 60).toFixed(1);
                      const pct = Math.min(100, Math.round((hoursDone / goal.targetHours) * 100));
                      return (
                        <div
                          key={goal.id}
                          className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <span className={\`text-[10px] font-mono uppercase px-2 py-0.5 rounded border mr-2 \${activeTheme.softBadge}\`}>
                                {goal.category}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Horizon: {goal.deadline}
                              </span>
                              <h4 className="font-semibold text-sm text-white mt-1">
                                {goal.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 15)}
                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-slate-200"
                              >
                                +15m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 30)}
                                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-slate-200"
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 60)}
                                className={\`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold \${activeTheme.softBadge}\`}
                              >
                                +1h
                              </button>
                              <button
                                onClick={() => openEditGoal(goal)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex justify-between text-xs font-mono mb-1">
                              <span className="text-slate-300">
                                {hoursDone} hrs invested of {goal.targetHours} hrs
                              </span>
                              <span className={\`font-bold \${activeTheme.accentText}\`}>{pct}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={\`h-full rounded-full transition-all duration-700 \${activeTheme.progressBar}\`}
                                style={{ width: \`\${pct}%\` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Checklist & Reminders */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-amber-400" />
                    {currentMember.name}'s Daily Tasks & Reminders
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Check off a task to automatically add its estimated minutes to your daily total!
                  </p>

                  <form onSubmit={addTask} className="flex flex-wrap gap-2 mb-4">
                    <input
                      type="text"
                      placeholder={\`Add a task for \${currentMember.name}...\`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 min-w-[180px] bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
                    />
                    <select
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200"
                    >
                      <option value={15}>+15m</option>
                      <option value={30}>+30m</option>
                      <option value={45}>+45m</option>
                      <option value={60}>+1h</option>
                      <option value={90}>+1.5h</option>
                    </select>
                    <button
                      type="submit"
                      className={\`px-4 py-2 rounded-xl font-semibold text-xs \${activeTheme.primaryBtn}\`}
                    >
                      Add Task
                    </button>
                  </form>

                  <div className="space-y-2">
                    {userTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTask(task)}
                            className={\`w-5 h-5 rounded-md flex items-center justify-center border transition \${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-500 hover:border-white'
                            }\`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <p
                              className={\`text-xs sm:text-sm font-medium \${
                                task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                              }\`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                              <span>⏰ {task.reminderTime}</span>
                              <span>•</span>
                              <span className={activeTheme.accentText}>+{task.estimatedMinutes}m credit</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Shared Squad Live Feed & Exam Countdown */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Users className={\`w-4 h-4 \${activeTheme.accentText}\`} />
                      Squad Live Activity Feed
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Updates
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {state.logs.slice(0, 14).map((log) => {
                      const logMember = state.members.find((m) => m.id === log.userId);
                      const mTheme = THEME_CONFIG[logMember?.theme || 'cyber-cyan'];
                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={\`w-7 h-7 rounded-lg font-display font-bold flex items-center justify-center border \${mTheme.softBadge}\`}
                            >
                              {logMember ? logMember.avatar : 'S'}
                            </span>
                            <div>
                              <p className="text-slate-100 font-medium">
                                <span className="font-bold">{logMember?.name}: </span>
                                {log.targetTitle}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {log.timestamp}
                              </span>
                            </div>
                          </div>
                          <span className={\`font-mono font-bold text-xs px-2.5 py-1 rounded-lg border \${mTheme.softBadge}\`}>
                            +{log.minutes}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Exam Dates */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-3">
                    <GraduationCap className={\`w-4 h-4 \${activeTheme.accentText}\`} />
                    Upcoming University Exams (1405)
                  </h3>
                  <div className="space-y-2.5">
                    {state.exams.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-100 block">
                            {ex.title}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Prof. {ex.professor}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={\`font-bold block \${activeTheme.accentText}\`}>{ex.date}</span>
                          <span className="text-slate-400 text-[11px]">⏰ {ex.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL SQUAD GOALS & TIME BANK */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] border border-white/10 p-5 rounded-2xl">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Squad Goals & Time Bank Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Every member can freely add, edit, or delete short-term and long-term goals.
                </p>
              </div>
              <button
                onClick={openCreateGoal}
                className={\`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 \${activeTheme.primaryBtn}\`}
              >
                <Plus className="w-4 h-4" />
                Add Goal for {currentMember.name}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.members.map((member) => {
                const mTheme = THEME_CONFIG[member.theme];
                return (
                  <div
                    key={member.id}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <span className={\`w-6 h-6 rounded-md text-xs flex items-center justify-center border \${mTheme.softBadge}\`}>
                          {member.avatar}
                        </span>
                        {member.name}'s Goals
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        Total Banked: {getTotalHours(member.id)} hrs
                      </span>
                    </div>

                    {state.goals
                      .filter((g) => g.userId === member.id)
                      .map((g) => {
                        const hrs = +(g.loggedMinutes / 60).toFixed(1);
                        const pct = Math.min(100, Math.round((hrs / g.targetHours) * 100));
                        return (
                          <div
                            key={g.id}
                            className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={\`text-[10px] font-mono uppercase px-2 py-0.5 rounded border \${mTheme.softBadge}\`}>
                                  {g.category}
                                </span>
                                <h5 className="font-semibold text-sm text-white mt-1">
                                  {g.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  Horizon: {g.deadline}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditGoal(g)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteGoal(g.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono pt-1">
                              <span>
                                {hrs}h / {g.targetHours}h ({pct}%)
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => logTime(member.id, g.id, g.title, 30)}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200"
                                >
                                  +30m
                                </button>
                                <button
                                  onClick={() => logTime(member.id, g.id, g.title, 60)}
                                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200"
                                >
                                  +1h
                                </button>
                              </div>
                            </div>

                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={\`h-full rounded-full \${mTheme.progressBar}\`}
                                style={{ width: \`\${pct}%\` }}
                              />
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

        {/* TAB 3: WEEKLY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={\`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition \${
                      selectedDay === day
                        ? activeTheme.primaryBtn
                        : 'bg-black/40 text-slate-400 hover:text-white'
                    }\`}
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
                className={\`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 \${activeTheme.primaryBtn}\`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Class for {currentMember.name}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.members.map((member) => {
                const mTheme = THEME_CONFIG[member.theme];
                const dayItems = state.schedules
                  .filter((s) => s.userId === member.id && s.day === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div
                    key={member.id}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3"
                  >
                    <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <span className={\`w-6 h-6 rounded-md text-xs flex items-center justify-center border \${mTheme.softBadge}\`}>
                        {member.avatar}
                      </span>
                      {member.name}'s {selectedDay} Classes
                    </h4>
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No fixed classes on {selectedDay}. Open for self-paced goals!
                      </p>
                    ) : (
                      dayItems.map((item) => {
                        const attendedToday = item.attendedDates.includes(todayStr);
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={\`font-mono text-xs font-bold \${mTheme.accentText}\`}>
                                  {item.startTime} - {item.endTime}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                  {item.category}
                                </span>
                              </div>
                              <h5 className="font-semibold text-sm text-white mt-1">
                                {item.title}
                              </h5>
                              <p className="text-xs text-slate-400">{item.details}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleClassAttendance(item)}
                                className={\`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition \${
                                  attendedToday
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-white/10 hover:bg-white/15 text-slate-200'
                                }\`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {attendedToday ? 'Attended' : 'Check-in'}
                              </button>
                              <button
                                onClick={() => deleteScheduleItem(item.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400"
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

        {/* TAB 4: SQUAD VISUAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  7-Day Squad Time Investment Chart
                </h3>
                <p className="text-xs text-slate-400">
                  Side-by-side daily minutes logged by every squad member
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                {state.members.map((m) => (
                  <span key={m.id} className={\`flex items-center gap-1.5 \${THEME_CONFIG[m.theme].accentText}\`}>
                    ● {m.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 items-end h-60 pt-8 px-2 border-b border-white/10">
              {last7Days.map((d) => (
                <div key={d.dateStr} className="flex flex-col items-center h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {d.memberTotals.map((mt) => {
                      const hPct = Math.round((mt.mins / maxChartMins) * 100);
                      const barGrad = THEME_CONFIG[mt.member.theme].barColor;
                      return (
                        <div
                          key={mt.member.id}
                          className={\`w-4 sm:w-6 bg-gradient-to-t \${barGrad} rounded-t-lg transition-all duration-500 relative group\`}
                          style={{ height: \`\${Math.max(6, hPct)}%\` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-black px-1.5 py-0.5 rounded border border-white/20 whitespace-nowrap z-20">
                            {mt.member.name[0]}: {mt.mins}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono text-slate-400 mt-2">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* INTERACTIVE ONBOARDING TUTORIAL MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={\`bg-slate-900 border rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl \${activeTheme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <span className={\`text-xs font-mono px-3 py-1 rounded-full border \${activeTheme.softBadge}\`}>
                Quick Guide • Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
              </span>
              <button
                onClick={closeTutorial}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                Skip ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-white">
                {TUTORIAL_STEPS[tutorialStep].title}
              </h3>
              <p className={\`text-xs font-semibold \${activeTheme.accentText}\`}>
                {TUTORIAL_STEPS[tutorialStep].subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {TUTORIAL_STEPS[tutorialStep].description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-200 leading-relaxed">
              💡 <b>Pro Tip:</b> {TUTORIAL_STEPS[tutorialStep].highlight}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
                disabled={tutorialStep === 0}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-semibold text-slate-300 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={() => setTutorialStep((s) => s + 1)}
                  className={\`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 \${activeTheme.primaryBtn}\`}
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={closeTutorial}
                  className={\`px-6 py-2.5 rounded-xl text-xs font-semibold \${activeTheme.primaryBtn}\`}
                >
                  Let's Go! 🚀
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE STATUS CARD MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share {currentMember.name}'s Status
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Snapshot Card */}
            <div className={\`p-5 rounded-2xl border bg-gradient-to-br from-black/80 to-slate-950 space-y-3 \${activeTheme.activeBorder}\`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={\`w-9 h-9 rounded-xl font-display font-bold flex items-center justify-center border \${activeTheme.softBadge}\`}>
                    {currentMember.avatar}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{currentMember.name}</h4>
                    <span className="text-[11px] text-slate-400">{currentMember.tagline}</span>
                  </div>
                </div>
                <span className={\`text-xs font-mono px-2.5 py-1 rounded-lg border \${activeTheme.softBadge}\`}>
                  Today: {Math.floor(getTodayMinutes(activeUser) / 60)}h {getTodayMinutes(activeUser) % 60}m
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                {userGoals.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex justify-between font-mono text-slate-300">
                    <span className="truncate max-w-[200px]">{g.title}</span>
                    <span className={activeTheme.accentText}>
                      {(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={copyShareStatus}
              className={\`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 \${activeTheme.primaryBtn}\`}
            >
              <Copy className="w-4 h-4" />
              {copiedShare ? 'Copied to Clipboard! ✅' : 'Copy Status Text for Telegram / Socials'}
            </button>
          </div>
        </div>
      )}

      {/* ADD SQUAD MEMBER MODAL (UP TO 4 PEOPLE) */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMember}
            className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Add Friend to Squad ({state.members.length}/4)
              </h3>
              <button type="button" onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Friend's Name</label>
              <input
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="e.g., Sara or Ali"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Main Focus / Tagline</label>
              <input
                type="text"
                value={memberForm.tagline}
                onChange={(e) => setMemberForm({ ...memberForm, tagline: e.target.value })}
                placeholder="e.g., Design & IELTS Prep"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Personal Theme Color</label>
              <select
                value={memberForm.theme}
                onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="sunset-coral">Sunset Rose & Coral</option>
                <option value="emerald-mint">Emerald Mint</option>
                <option value="royal-violet">Amethyst Violet 💜</option>
                <option value="cyber-cyan">Cyber Cyan 💙</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={\`px-4 py-2 rounded-xl text-xs font-semibold \${activeTheme.primaryBtn}\`}
              >
                Add to Squad
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD / EDIT GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveGoal}
            className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                {editingGoal ? 'Edit Goal' : \`New Goal for \${currentMember.name}\`}
              </h3>
              <button type="button" onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="e.g., Master French B2 / Finish Thesis"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as GoalItem['category'] })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Short-Term">Short-Term</option>
                  <option value="Long-Term">Long-Term</option>
                  <option value="Habit">Habit</option>
                  <option value="Career">Career</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Hours</label>
                <input
                  type="number"
                  min={1}
                  value={goalForm.targetHours}
                  onChange={(e) => setGoalForm({ ...goalForm, targetHours: Number(e.target.value) })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Deadline / Horizon</label>
              <input
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                placeholder="e.g., 6 Months / End of Semester"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={\`px-4 py-2 rounded-xl text-xs font-semibold \${activeTheme.primaryBtn}\`}
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveScheduleItem}
            className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Add Class / Session ({currentMember.name})
              </h3>
              <button type="button" onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="e.g., French Conversation Class"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Day</label>
                <select
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Details</label>
              <input
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
                placeholder="e.g., Room 102 / Online"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={\`px-4 py-2 rounded-xl text-xs font-semibold \${activeTheme.primaryBtn}\`}
              >
                Save Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Real-Time Squad Cloud Sync
              </h3>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste a free Firebase Realtime Database URL so all up to 4 Squad members stay synced in real-time across laptops and phones.
            </p>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com/"
              className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                  if (syncUrl.trim()) pushToCloud(state);
                }}
                className={\`px-4 py-2 rounded-xl text-xs font-semibold \${activeTheme.primaryBtn}\`}
              >
                Save & Sync Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('✨ Updated:', filePath);
}

console.log('\n💜 SyncPulse v2.0 (Amethyst Theme for Ronak + 4-Player Squad + Tutorial) is ready!');