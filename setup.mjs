// setup.mjs - Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'package.json': JSON.stringify({
    name: 'syncpulse-mehrsan-ronak',
    private: true,
    version: '1.0.0',
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

  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
});
`,

  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
`,

  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

  '.gitignore': `node_modules
dist
dist-ssr
*.local
.DS_Store
`,

  'index.html': `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SyncPulse — Mehrsan & Ronak Co-Op Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-violet-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-image: 
      radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.14) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 50%);
    background-attachment: fixed;
  }
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
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
`,

  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,

  'src/initialData.ts': `export type UserId = 'mehrsan' | 'ronak';

export interface ScheduleItem {
  id: string;
  userId: UserId;
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
  userId: UserId;
  title: string;
  category: 'Short-Term' | 'Long-Term' | 'Habit' | 'Career';
  targetHours: number;
  loggedMinutes: number;
  deadline: string;
}

export interface TaskItem {
  id: string;
  userId: UserId;
  title: string;
  reminderTime: string;
  completed: boolean;
  estimatedMinutes: number;
  createdAt: string;
}

export interface ExamItem {
  id: string;
  userId: UserId;
  title: string;
  date: string;
  time: string;
  professor: string;
  type: 'Core' | 'General';
}

export interface TimeLog {
  id: string;
  userId: UserId;
  targetTitle: string;
  minutes: number;
  date: string; // YYYY-MM-DD
  timestamp: string;
}

export interface AppState {
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
  schedules: [
    // Mehrsan's Schedule (From Image)
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
    // Mehrsan's Initial Editable Goals
    { id: 'm-g1', userId: 'mehrsan', title: 'B.Sc. Final Project (3 Credits)', category: 'Long-Term', targetHours: 120, loggedMinutes: 1440, deadline: 'End of Semester' },
    { id: 'm-g2', userId: 'mehrsan', title: 'Master Deep Learning & Neural Nets', category: 'Long-Term', targetHours: 80, loggedMinutes: 960, deadline: '1405/11/14' },
    { id: 'm-g3', userId: 'mehrsan', title: 'Full-Stack Web Dev Projects', category: 'Short-Term', targetHours: 50, loggedMinutes: 720, deadline: 'Ongoing' },

    // Ronak's Goals
    { id: 'r-g1', userId: 'ronak', title: 'Master French up to B2 Level', category: 'Long-Term', targetHours: 400, loggedMinutes: 3600, deadline: 'Until B.Sc. Graduation (~3 Years)' },
    { id: 'r-g2', userId: 'ronak', title: 'English Immersion (Movies, YouTube & Media)', category: 'Habit', targetHours: 150, loggedMinutes: 2100, deadline: 'Daily Routine' },
    { id: 'r-g3', userId: 'ronak', title: 'Launch English Teaching Career', category: 'Career', targetHours: 60, loggedMinutes: 600, deadline: 'This Year' },
  ],
  tasks: [
    { id: 'm-t1', userId: 'mehrsan', title: 'Review Compiler Design Lexical Analysis notes', reminderTime: '18:00', completed: false, estimatedMinutes: 45, createdAt: getTodayStr() },
    { id: 'm-t2', userId: 'mehrsan', title: 'Coordinate Final Project milestone with supervisor', reminderTime: '11:00', completed: true, estimatedMinutes: 30, createdAt: getTodayStr() },
    { id: 'r-t1', userId: 'ronak', title: 'Watch 1hr English YouTube / Movie without subtitles', reminderTime: '20:00', completed: false, estimatedMinutes: 60, createdAt: getTodayStr() },
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
  Flame, Clock, Target, Calendar, CheckCircle2, Plus, Trash2, Edit3,
  Play, Pause, RotateCcw, Award, TrendingUp, Bell, Sparkles, BookOpen,
  Users, Cloud, Check, X, GraduationCap, Zap
} from 'lucide-react';
import {
  INITIAL_STATE, AppState, UserId, GoalItem, ScheduleItem, TaskItem
} from './initialData';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('syncpulse_v1');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [activeUser, setActiveUser] = useState<UserId>('mehrsan');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'goals' | 'analytics'>('dashboard');
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(jsDay) ? jsDay : 'Saturday';
  });

  // Live Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');

  // Modals for CRUD
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

  // Cloud Sync Modal (Optional REST Sync URL for live cross-device sharing)
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncUrl, setSyncUrl] = useState(() => localStorage.getItem('syncpulse_cloud_url') || '');
  const [syncStatus, setSyncStatus] = useState<'local' | 'synced' | 'syncing'>('local');

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('syncpulse_v1', JSON.stringify(state));
  }, [state]);

  // Listen across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'syncpulse_v1' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Optional Cloud Polling if Firebase Realtime DB URL provided
  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse.json\`;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(cleanUrl);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.logs) {
            setState(remoteData);
            setSyncStatus('synced');
          }
        }
      } catch {
        // ignore network errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [syncUrl]);

  const pushToCloud = async (newState: AppState) => {
    setState(newState);
    if (!syncUrl) return;
    try {
      setSyncStatus('syncing');
      const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse.json\`;
      await fetch(cleanUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('local');
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
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

  // Log time helper
  const logTime = (userId: UserId, goalId: string | null, title: string, minutes: number) => {
    if (minutes <= 0) return;
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.7 } });
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

  // Schedule CRUD & Check-in
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
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
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

  // Stats Calculation
  const getTodayMinutes = (uid: UserId) =>
    state.logs
      .filter((l) => l.userId === uid && l.date === todayStr)
      .reduce((acc, cur) => acc + cur.minutes, 0);

  const getTotalHours = (uid: UserId) => {
    const goalMins = state.goals
      .filter((g) => g.userId === uid)
      .reduce((acc, g) => acc + g.loggedMinutes, 0);
    return (goalMins / 60).toFixed(1);
  };

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mehrsanMins = state.logs
      .filter((l) => l.userId === 'mehrsan' && l.date === dateStr)
      .reduce((a, b) => a + b.minutes, 0);
    const ronakMins = state.logs
      .filter((l) => l.userId === 'ronak' && l.date === dateStr)
      .reduce((a, b) => a + b.minutes, 0);
    return { dateStr, label, mehrsanMins, ronakMins };
  });

  const maxChartMins = Math.max(
    120,
    ...last7Days.map((d) => Math.max(d.mehrsanMins, d.ronakMins))
  );

  const userGoals = state.goals.filter((g) => g.userId === activeUser);
  const userTasks = state.tasks.filter((t) => t.userId === activeUser);

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight text-white">
                  SyncPulse
                </h1>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Co-Op Arena
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mehrsan & Ronak • Time & Goal Accountability
              </p>
            </div>
          </div>

          {/* Active Profile Switcher */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveUser('mehrsan')}
                className={\`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 \${
                  activeUser === 'mehrsan'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                <span className="w-2 h-2 rounded-full bg-violet-300 animate-pulse" />
                Mehrsan
              </button>
              <button
                onClick={() => setActiveUser('ronak')}
                className={\`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 \${
                  activeUser === 'ronak'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Ronak
              </button>
            </div>

            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
              title="Configure Real-Time Cloud Sync"
            >
              <Cloud className={\`w-4 h-4 \${syncUrl ? 'text-emerald-400' : 'text-slate-400'}\`} />
              <span className="hidden sm:inline">
                {syncUrl ? 'Live Cloud On' : 'Cloud Sync'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* LIVE DUO ARENA + STOPWATCH BAR */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Mehrsan Live Card */}
          <div className={\`lg:col-span-4 rounded-2xl p-5 border transition-all \${
            activeUser === 'mehrsan'
              ? 'bg-slate-900/90 border-violet-500/50 shadow-xl shadow-violet-950/30'
              : 'bg-slate-900/50 border-slate-800/80'
          }\`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center font-display font-bold text-lg text-violet-300">
                  M
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                    Mehrsan
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                      CS & AI
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Compiler • Deep Learning • Web</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Today's Focus</span>
                <span className="font-mono font-bold text-lg text-violet-400">
                  {Math.floor(getTodayMinutes('mehrsan') / 60)}h {getTodayMinutes('mehrsan') % 60}m
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-slate-400 block">Total Goal Hours</span>
                <span className="font-mono font-bold text-sm text-white mt-0.5 block">
                  {getTotalHours('mehrsan')} hrs
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-slate-400 block">Active Goals</span>
                <span className="font-mono font-bold text-sm text-white mt-0.5 block">
                  {state.goals.filter((g) => g.userId === 'mehrsan').length} Goals
                </span>
              </div>
            </div>
          </div>

          {/* Center Live Focus Stopwatch */}
          <div className="lg:col-span-4 rounded-2xl p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Live Time Tracker ({activeUser === 'mehrsan' ? 'Mehrsan' : 'Ronak'})
              </span>
              <span className="text-[11px] font-mono text-slate-400">Every minute counts</span>
            </div>

            <div className="my-3 text-center">
              <div className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-white">
                {formatTimer(timerSeconds)}
              </div>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="">-- Select Goal to Credit Time --</option>
                {userGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({Math.round(g.loggedMinutes / 60)}h / {g.targetHours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={\`flex-1 py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition \${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }\`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTimerRunning ? 'Pause' : 'Start Focus'}
              </button>
              <button
                onClick={handleSaveTimerSession}
                disabled={timerSeconds === 0}
                className="py-2 px-3 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Log Time
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(0);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Ronak Live Card */}
          <div className={\`lg:col-span-4 rounded-2xl p-5 border transition-all \${
            activeUser === 'ronak'
              ? 'bg-slate-900/90 border-emerald-500/50 shadow-xl shadow-emerald-950/30'
              : 'bg-slate-900/50 border-slate-800/80'
          }\`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-display font-bold text-lg text-emerald-300">
                  R
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                    Ronak
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Languages & Uni
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">French B2 • English • Teaching</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Today's Focus</span>
                <span className="font-mono font-bold text-lg text-emerald-400">
                  {Math.floor(getTodayMinutes('ronak') / 60)}h {getTodayMinutes('ronak') % 60}m
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-slate-400 block">Total Goal Hours</span>
                <span className="font-mono font-bold text-sm text-white mt-0.5 block">
                  {getTotalHours('ronak')} hrs
                </span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
                <span className="text-slate-400 block">Active Goals</span>
                <span className="font-mono font-bold text-sm text-white mt-0.5 block">
                  {state.goals.filter((g) => g.userId === 'ronak').length} Goals
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview & Daily Tasks', icon: Sparkles },
            { id: 'goals', label: 'Goals & Time Invested (CRUD)', icon: Target },
            { id: 'schedule', label: 'Weekly University & Class Schedule', icon: Calendar },
            { id: 'analytics', label: 'Visual Progress & Charts', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={\`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition \${
                  activeTab === tab.id
                    ? 'bg-white text-slate-950 shadow'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-900'
                }\`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Goals Quick Time Logger + Tasks */}
            <div className="lg:col-span-7 space-y-6">
              {/* Goals & Quick Time Log */}
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-violet-400" />
                      {activeUser === 'mehrsan' ? "Mehrsan's" : "Ronak's"} Active Goals & Time Bank
                    </h3>
                    <p className="text-xs text-slate-400">
                      Log time directly or edit/add your short & long-term goals
                    </p>
                  </div>
                  <button
                    onClick={openCreateGoal}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5"
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
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 mr-2">
                              {goal.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Target: {goal.deadline}
                            </span>
                            <h4 className="font-semibold text-sm text-white mt-1">
                              {goal.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => logTime(activeUser, goal.id, goal.title, 15)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200"
                            >
                              +15m
                            </button>
                            <button
                              onClick={() => logTime(activeUser, goal.id, goal.title, 30)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200"
                            >
                              +30m
                            </button>
                            <button
                              onClick={() => logTime(activeUser, goal.id, goal.title, 60)}
                              className="px-2 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-[11px] font-mono text-violet-200"
                            >
                              +1h
                            </button>
                            <button
                              onClick={() => openEditGoal(goal)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit Goal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete Goal"
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
                            <span className="text-emerald-400 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={\`h-full rounded-full transition-all duration-500 \${
                                activeUser === 'mehrsan'
                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-400'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                              }\`}
                              style={{ width: \`\${pct}%\` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Tasks & Reminders */}
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Daily Tasks & Smart Reminders
                </h3>

                <form onSubmit={addTask} className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add a task for today..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 min-w-[180px] bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300"
                    title="Reminder Time"
                  />
                  <select
                    value={newTaskMins}
                    onChange={(e) => setNewTaskMins(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-300"
                  >
                    <option value={15}>15m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                    <option value={60}>1h</option>
                    <option value={90}>1.5h</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white text-slate-950 font-semibold text-xs hover:bg-slate-200 transition"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-2">
                  {userTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTask(task)}
                          className={\`w-5 h-5 rounded-md flex items-center justify-center border transition \${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-600 hover:border-violet-400'
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
                            <span>+{task.estimatedMinutes}m credit</span>
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

            {/* Right 5 cols: Shared Live Activity Feed & Exams */}
            <div className="lg:col-span-5 space-y-6">
              {/* Co-Op Live Activity Feed */}
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Shared Live Activity Feed
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Real-Time Log
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {state.logs.slice(0, 12).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={\`w-7 h-7 rounded-lg font-display font-bold flex items-center justify-center \${
                            log.userId === 'mehrsan'
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }\`}
                        >
                          {log.userId === 'mehrsan' ? 'M' : 'R'}
                        </span>
                        <div>
                          <p className="text-slate-200 font-medium">{log.targetTitle}</p>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-slate-800">
                        +{log.minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mehrsan's University Exam Schedule */}
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  University Exam Dates (1405)
                </h3>
                <div className="space-y-2.5">
                  {state.exams.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
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
                        <span className="text-violet-300 font-bold block">{ex.date}</span>
                        <span className="text-slate-400 text-[11px]">⏰ {ex.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOALS & TIME INVESTED (FULL CRUD) */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Goals & Time Bank Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Add, edit, or remove short-term and long-term goals for both Mehrsan and Ronak.
                </p>
              </div>
              <button
                onClick={openCreateGoal}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30"
              >
                <Plus className="w-4 h-4" />
                Add Goal for {activeUser === 'mehrsan' ? 'Mehrsan' : 'Ronak'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['mehrsan', 'ronak'] as UserId[]).map((uid) => (
                <div
                  key={uid}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="font-display font-bold text-base text-white capitalize flex items-center gap-2">
                      <span
                        className={\`w-2.5 h-2.5 rounded-full \${
                          uid === 'mehrsan' ? 'bg-violet-400' : 'bg-emerald-400'
                        }\`}
                      />
                      {uid}'s Goals
                    </h4>
                    <span className="text-xs font-mono text-slate-400">
                      Total: {getTotalHours(uid)} hrs
                    </span>
                  </div>

                  {state.goals
                    .filter((g) => g.userId === uid)
                    .map((g) => {
                      const hrs = +(g.loggedMinutes / 60).toFixed(1);
                      const pct = Math.min(100, Math.round((hrs / g.targetHours) * 100));
                      return (
                        <div
                          key={g.id}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
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
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteGoal(g.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span>
                              {hrs}h / {g.targetHours}h
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => logTime(uid, g.id, g.title, 30)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => logTime(uid, g.id, g.title, 60)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                              >
                                +1h
                              </button>
                            </div>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={\`h-full rounded-full \${
                                uid === 'mehrsan' ? 'bg-violet-500' : 'bg-emerald-500'
                              }\`}
                              style={{ width: \`\${pct}%\` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WEEKLY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={\`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition \${
                      selectedDay === day
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
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
                className="px-3.5 py-2 rounded-xl bg-white text-slate-950 font-semibold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Class / Block
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['mehrsan', 'ronak'] as UserId[]).map((uid) => {
                const dayItems = state.schedules
                  .filter((s) => s.userId === uid && s.day === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div
                    key={uid}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3"
                  >
                    <h4 className="font-display font-bold text-base text-white capitalize">
                      {uid}'s {selectedDay} Schedule
                    </h4>
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No fixed classes scheduled for {selectedDay}. Great day for deep goal focus!
                      </p>
                    ) : (
                      dayItems.map((item) => {
                        const attendedToday = item.attendedDates.includes(todayStr);
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-amber-300">
                                  {item.startTime} - {item.endTime}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
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
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
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

        {/* TAB 4: VISUAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    7-Day Time Investment Comparison (Mehrsan vs. Ronak)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Daily logged minutes across classes, focus sessions, and completed tasks
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-violet-300">
                    <span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Mehrsan
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Ronak
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 items-end h-56 pt-6 px-2 border-b border-slate-800">
                {last7Days.map((d) => {
                  const mHeight = Math.round((d.mehrsanMins / maxChartMins) * 100);
                  const rHeight = Math.round((d.ronakMins / maxChartMins) * 100);
                  return (
                    <div key={d.dateStr} className="flex flex-col items-center h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        <div
                          className="w-5 sm:w-7 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500 relative group"
                          style={{ height: \`\${Math.max(6, mHeight)}%\` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                            {d.mehrsanMins}m
                          </span>
                        </div>
                        <div
                          className="w-5 sm:w-7 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 relative group"
                          style={{ height: \`\${Math.max(6, rHeight)}%\` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                            {d.ronakMins}m
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 mt-2">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT GOAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveGoal}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                {editingGoal ? 'Edit Goal' : \`New Goal for \${activeUser === 'mehrsan' ? 'Mehrsan' : 'Ronak'}\`}
              </h3>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white"
              >
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
                placeholder="e.g., Master React & TypeScript"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={goalForm.category}
                  onChange={(e) =>
                    setGoalForm({ ...goalForm, category: e.target.value as GoalItem['category'] })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Deadline / Horizon</label>
              <input
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                placeholder="e.g., End of 1405 / 6 Months"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD SCHEDULE */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveScheduleItem}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Add Class / Study Block ({activeUser === 'mehrsan' ? 'Mehrsan' : 'Ronak'})
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
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
                placeholder="e.g., Deep Learning Study Session"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Day</label>
                <select
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">End</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Details (Room / Professor)</label>
              <input
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
                placeholder="e.g., Room 102 • Prof. Yousefi"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
              >
                Save to Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CLOUD SYNC */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-white">
                Real-Time Co-Op Cloud Sync
              </h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste a free Firebase Realtime Database URL (e.g.{' '}
              <code className="text-violet-300">https://your-app.firebaseio.com/</code>) so Mehrsan
              and Ronak stay synced in real-time across different laptops and phones.
            </p>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com/"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                  if (syncUrl.trim()) pushToCloud(state);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
              >
                Save & Sync Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`,

  'README.md': `# ⚡ SyncPulse — Mehrsan & Ronak Co-Op Productivity & Time Tracker

A sleek dark-mode co-op dashboard built with **React + TypeScript + Tailwind CSS + Vite**.
Designed for **Mehrsan** & **Ronak** to track university classes, stopwatch focus sessions, short/long-term goals, and daily progress side-by-side.

## 🚀 Run Locally
\`\`\`bash
npm install
npm run dev
\`\`\`
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('✅ Created:', filePath);
}

console.log('\n🎉 SyncPulse project generated successfully!');