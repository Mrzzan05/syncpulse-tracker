// setup.mjs - SyncPulse v3.0 (Warm Minimalism, Cozy Night & Latte Modes, Soundscape & Squad Cheers)
// Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'package.json': JSON.stringify({
    name: 'syncpulse-squad-tracker',
    private: true,
    version: '3.0.0',
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

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SyncPulse — Cozy Shared Space for Mehrsan & Ronak</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body class="antialiased selection:bg-purple-400/30">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
`,

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow-x: hidden;
  }
}

.cozy-transition {
  transition: background-color 0.9s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.9s cubic-bezier(0.22, 1, 0.36, 1),
              color 0.6s ease,
              box-shadow 0.9s ease;
}

/* Subtle organic paper grain overlay */
.paper-grain {
  background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
  background-size: 24px 24px;
}

@keyframes breathe {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.75; }
  50% { transform: translate(18px, -18px) scale(1.07); opacity: 1; }
}

.cozy-orb {
  animation: breathe 11s ease-in-out infinite;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 9999px;
}
`,

  'src/initialData.ts': `export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
  statusNote?: string;
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
  cheers?: number;
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
      tagline: 'Computer Eng • Deep Learning & Web',
      avatar: 'M',
      theme: 'warm-sage',
      statusNote: 'Building steady habits, one focused hour at a time ☕'
    },
    {
      id: 'ronak',
      name: 'Ronak',
      tagline: 'French B2 Journey • English & Uni',
      avatar: 'R',
      theme: 'lavender-blush',
      statusNote: 'Dreaming in French & leveling up every single day 💜✨'
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
    { id: 'l-1', userId: 'mehrsan', targetTitle: 'Special Topics (Deep Learning)', minutes: 90, date: getPastDateStr(2), timestamp: '2 days ago', cheers: 2 },
    { id: 'l-2', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 120, date: getPastDateStr(2), timestamp: '2 days ago', cheers: 4 },
    { id: 'l-3', userId: 'mehrsan', targetTitle: 'Full-Stack Web Dev Projects', minutes: 110, date: getPastDateStr(1), timestamp: 'Yesterday', cheers: 3 },
    { id: 'l-4', userId: 'ronak', targetTitle: 'English Immersion (Movies, YouTube & Media)', minutes: 95, date: getPastDateStr(1), timestamp: 'Yesterday', cheers: 5 },
    { id: 'l-5', userId: 'mehrsan', targetTitle: 'B.Sc. Final Project (3 Credits)', minutes: 60, date: getTodayStr(), timestamp: 'Today, 10:15', cheers: 2 },
    { id: 'l-6', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 75, date: getTodayStr(), timestamp: 'Today, 11:30', cheers: 6 },
  ]
};
`,

  'src/App.tsx': `import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock, Target, Calendar, CheckCircle2, Plus, Trash2, Edit3,
  Play, Pause, RotateCcw, TrendingUp, Bell, Sparkles,
  Users, Cloud, Check, X, GraduationCap, HelpCircle,
  Share2, UserPlus, Copy, ChevronRight, ChevronLeft, Heart,
  Sun, Moon, Coffee, CloudRain, VolumeX, Flame, Award
} from 'lucide-react';
import {
  INITIAL_STATE, AppState, GoalItem, ScheduleItem, TaskItem, Member, ThemePalette
} from './initialData';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Warm, Calm & Cozy Theme System (Supports both Cozy Night & Warm Latte Day modes)
interface CozyStyle {
  name: string;
  pageBg: string;
  cardBg: string;
  innerCardBg: string;
  textMain: string;
  textMuted: string;
  orb1: string;
  orb2: string;
  primaryBtn: string;
  softBadge: string;
  activeBorder: string;
  progressBar: string;
  accentText: string;
  barColor: string;
}

const GET_COZY_THEME = (palette: ThemePalette, isLatte: boolean): CozyStyle => {
  if (palette === 'lavender-blush') {
    // Ronak's Warm Lavender, Soft Plum & Dusty Rose Palette 💜
    return isLatte
      ? {
          name: 'Lavender Oat Latte 💜',
          pageBg: 'bg-[#FAF5FF]',
          cardBg: 'bg-white/85 border-purple-200/80 shadow-sm shadow-purple-950/5',
          innerCardBg: 'bg-[#F5EEFC]/80 border-purple-200/60',
          textMain: 'text-[#2E1B3B]',
          textMuted: 'text-[#735A85]',
          orb1: 'bg-purple-300/45',
          orb2: 'bg-pink-300/40',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B47AEA] to-[#D685B8] hover:opacity-95 text-white shadow-md shadow-purple-500/20',
          softBadge: 'bg-purple-100 text-purple-800 border-purple-300/70',
          activeBorder: 'border-purple-400/80 shadow-lg shadow-purple-300/30',
          progressBar: 'bg-gradient-to-r from-[#9D65C9] via-[#C084FC] to-[#F472B6]',
          accentText: 'text-[#8B47C2]',
          barColor: 'from-[#9D65C9] to-[#E879F9]'
        }
      : {
          name: 'Cozy Velvet Lavender 💜',
          pageBg: 'bg-[#191124]',
          cardBg: 'bg-[#251A34]/75 border-purple-300/15 shadow-xl shadow-black/30',
          innerCardBg: 'bg-[#150E1E]/75 border-purple-300/10',
          textMain: 'text-[#F7F1FF]',
          textMuted: 'text-[#B9A5CC]',
          orb1: 'bg-[#9D65C9]/25',
          orb2: 'bg-[#E879F9]/20',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B779E2] to-[#D977B4] hover:opacity-95 text-white shadow-lg shadow-purple-950/50',
          softBadge: 'bg-purple-400/15 text-purple-200 border-purple-300/30',
          activeBorder: 'border-purple-400/50 shadow-xl shadow-purple-950/60',
          progressBar: 'bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#F472B6]',
          accentText: 'text-[#DFB6FF]',
          barColor: 'from-[#A855F7] to-[#F472B6]'
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta Latte',
          pageBg: 'bg-[#FDF8F5]',
          cardBg: 'bg-white/85 border-orange-200/80 shadow-sm',
          innerCardBg: 'bg-[#FAF0EA]/80 border-orange-200/60',
          textMain: 'text-[#362019]',
          textMuted: 'text-[#856256]',
          orb1: 'bg-amber-300/40',
          orb2: 'bg-rose-300/35',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-md shadow-orange-500/20',
          softBadge: 'bg-orange-100 text-orange-900 border-orange-300/70',
          activeBorder: 'border-orange-400/80 shadow-lg shadow-orange-200/40',
          progressBar: 'bg-gradient-to-r from-[#D97757] to-[#F59E0B]',
          accentText: 'text-[#C85A32]',
          barColor: 'from-[#D97757] to-[#F59E0B]'
        }
      : {
          name: 'Fireside Terracotta',
          pageBg: 'bg-[#1D1513]',
          cardBg: 'bg-[#2B1F1D]/75 border-orange-300/15',
          innerCardBg: 'bg-[#16100E]/75 border-orange-300/10',
          textMain: 'text-[#FDF4F0]',
          textMuted: 'text-[#C4A89E]',
          orb1: 'bg-orange-500/20',
          orb2: 'bg-amber-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-lg',
          softBadge: 'bg-orange-400/15 text-orange-200 border-orange-300/30',
          activeBorder: 'border-orange-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#EA580C] to-[#FBBF24]',
          accentText: 'text-[#FDBA8C]',
          barColor: 'from-[#EA580C] to-[#FBBF24]'
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Oat Milk',
          pageBg: 'bg-[#F6F9F4]',
          cardBg: 'bg-white/85 border-emerald-200/80 shadow-sm',
          innerCardBg: 'bg-[#ECF3E8]/80 border-emerald-200/60',
          textMain: 'text-[#1B2E22]',
          textMuted: 'text-[#5A7864]',
          orb1: 'bg-emerald-300/35',
          orb2: 'bg-lime-300/30',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-md',
          softBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300/70',
          activeBorder: 'border-emerald-400/80 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#4E8C6F] to-[#84CC16]',
          accentText: 'text-[#387558]',
          barColor: 'from-[#4E8C6F] to-[#84CC16]'
        }
      : {
          name: 'Forest Matcha Night',
          pageBg: 'bg-[#111B16]',
          cardBg: 'bg-[#1A2821]/75 border-emerald-300/15',
          innerCardBg: 'bg-[#0D1411]/75 border-emerald-300/10',
          textMain: 'text-[#F0FAF4]',
          textMuted: 'text-[#9CBAA8]',
          orb1: 'bg-emerald-500/20',
          orb2: 'bg-teal-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-lg',
          softBadge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
          activeBorder: 'border-emerald-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#10B981] to-[#84CC16]',
          accentText: 'text-[#86EFAC]',
          barColor: 'from-[#10B981] to-[#84CC16]'
        };
  }

  // Default: 'warm-sage' (Mehrsan's Cozy Espresso, Warm Sage & Soft Amber)
  return isLatte
    ? {
        name: 'Warm Oat & Sage ☕',
        pageBg: 'bg-[#FBF9F5]',
        cardBg: 'bg-white/85 border-[#E6DFD3] shadow-sm shadow-stone-900/5',
        innerCardBg: 'bg-[#F4EFE6]/85 border-[#E2D9C8]',
        textMain: 'text-[#292524]',
        textMuted: 'text-[#78716C]',
        orb1: 'bg-amber-200/50',
        orb2: 'bg-teal-200/45',
        primaryBtn: 'bg-gradient-to-r from-[#4A6B65] via-[#5B7F78] to-[#B87D4B] hover:opacity-95 text-white shadow-md shadow-stone-500/15',
        softBadge: 'bg-[#EFECE6] text-[#4A6B65] border-[#D6CFC2]',
        activeBorder: 'border-[#5B7F78]/70 shadow-lg shadow-stone-300/40',
        progressBar: 'bg-gradient-to-r from-[#4A6B65] via-[#66968C] to-[#D99B52]',
        accentText: 'text-[#4A6B65]',
        barColor: 'from-[#4A6B65] to-[#D99B52]'
      }
    : {
        name: 'Cozy Espresso & Amber ☕',
        pageBg: 'bg-[#161514]',
        cardBg: 'bg-[#22201E]/80 border-[#383430] shadow-xl shadow-black/30',
        innerCardBg: 'bg-[#181615]/85 border-[#2E2A27]',
        textMain: 'text-[#F5F2EB]',
        textMuted: 'text-[#A8A29E]',
        orb1: 'bg-[#D99B52]/18',
        orb2: 'bg-[#5B7F78]/22',
        primaryBtn: 'bg-gradient-to-r from-[#5B7F78] to-[#C88A4B] hover:opacity-95 text-white shadow-lg shadow-black/40',
        softBadge: 'bg-[#2D2A26] text-[#E6CBA8] border-[#443F3A]',
        activeBorder: 'border-[#C88A4B]/50 shadow-xl shadow-black/50',
        progressBar: 'bg-gradient-to-r from-[#5B7F78] via-[#84A98C] to-[#E09F5A]',
        accentText: 'text-[#E6B88A]',
        barColor: 'from-[#5B7F78] to-[#E09F5A]'
      };
};

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Your Cozy Sanctuary ☕✨',
    subtitle: 'Designed with Warm Minimalism for calm, stress-free productivity.',
    description: 'We replaced harsh neon colors with soothing, organic tones. Switch between Cozy Night 🌙 and Warm Latte ☀️ anytime at the top!',
    highlight: 'Click Ronak’s card to see the entire room softly glow in warm Lavender & Dusty Rose 💜, or Mehrsan’s for Cozy Espresso & Sage.'
  },
  {
    title: 'Focus with Built-in Ambient Sounds 🌧️',
    subtitle: 'Cozy Pomodoro + Soft Rain & Zen Audio.',
    description: 'Use the top sound bar to play soothing Soft Rain or Warm Zen frequencies while your timer runs—no external app needed!',
    highlight: 'When you finish studying, click "Log Time" or use the quick [+15m] [+30m] [+1h] buttons on any goal.'
  },
  {
    title: 'Cheer Each Other On & Share Joy 💜👏',
    subtitle: 'Up to 4 Squad Members + Heart Reactions.',
    description: 'In the Shared Squad Activity Feed, tap the heart button next to any logged session to send warm encouragement to your partner!',
    highlight: 'Everything—goals, classes, tasks, and personal status notes—can be added, edited, or deleted anytime.'
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
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return DAYS.includes(jsDay) ? jsDay : 'Saturday';
  });

  // Web Audio API Cozy Ambient Sound Generator (No external MP3 needed!)
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
      // Warm Pink/Brown Noise for soothing rain sound
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.12; // Gentle volume
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
      // Warm 432Hz + 216Hz harmonic drone
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

  // Tutorial Modal State
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return !localStorage.getItem('syncpulse_v3_tutorial_seen');
  });
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  // Share Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Add Member Modal
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [memberForm, setMemberForm] = useState({
    name: '',
    tagline: '',
    theme: 'peach-terracotta' as ThemePalette
  });

  // Timer (Supports Stopwatch & 25m Cozy Pomodoro)
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
  const [newTaskTime, setNewTaskTime] = useState('18:00');
  const [newTaskMins, setNewTaskMins] = useState(30);

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

  // Cloud Sync Polling
  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v3.json\`;
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
      const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v3.json\`;
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
      return \`\${String(hrs).padStart(2, '0')}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
    }
    return \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const logTime = (userId: string, goalId: string | null, title: string, minutes: number) => {
    if (minutes <= 0) return;
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.75 },
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
      timestamp: \`Today, \${nowTime}\`,
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

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || state.members.length >= 4) return;
    const id = memberForm.name.trim().toLowerCase().replace(/\\s+/g, '-') + '-' + Date.now().toString().slice(-3);
    const newMember: Member = {
      id,
      name: memberForm.name.trim(),
      tagline: memberForm.tagline.trim() || 'Squad Member',
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
      const newLog = {
        id: 'log-' + Date.now(),
        userId: sched.userId,
        targetTitle: \`Attended: \${sched.title}\`,
        minutes: 90,
        date: todayStr,
        timestamp: \`Today, \${nowTime}\`,
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
        targetTitle: \`Completed: \${task.title}\`,
        minutes: task.estimatedMinutes,
        date: todayStr,
        timestamp: \`Today, \${nowTime}\`,
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
    localStorage.setItem('syncpulse_v3_tutorial_seen', 'true');
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

    return \`🌿 SyncPulse Cozy Log — \${currentMember.name}\\n⏱️ Today's Focus: \${Math.floor(todayMins / 60)}h \${todayMins % 60}m\\n✅ Tasks Done: \${completedTasks}\\n🏆 Total Banked: \${getTotalHours(activeUser)} hrs\\n\\n🎯 Current Goals:\\n\${topGoals}\`;
  };

  const copyShareStatus = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

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
  const levelInfo = getLevelInfo(activeUser);

  return (
    <div className={\`min-h-screen pb-20 relative cozy-transition paper-grain \${theme.pageBg} \${theme.textMain}\`}>
      {/* Soft Breathing Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={\`cozy-orb absolute -top-24 -left-24 w-[450px] h-[450px] rounded-full blur-[135px] cozy-transition \${theme.orb1}\`}
        />
        <div
          className={\`cozy-orb absolute top-1/3 -right-24 w-[480px] h-[480px] rounded-full blur-[145px] cozy-transition \${theme.orb2}\`}
          style={{ animationDelay: '-5s' }}
        />
      </div>

      {/* Cozy Top Header */}
      <header className="sticky top-0 z-30 border-b border-current/10 backdrop-blur-xl bg-opacity-70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center cozy-transition \${theme.primaryBtn}\`}>
              {currentMember.theme === 'lavender-blush' ? (
                <Heart className="w-5 h-5 text-white fill-white/25" />
              ) : (
                <Coffee className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif italic text-2xl tracking-wide">
                  SyncPulse
                </h1>
                <span className={\`text-[11px] font-mono px-2.5 py-0.5 rounded-full border cozy-transition \${theme.softBadge}\`}>
                  {theme.name}
                </span>
              </div>
              <p className={\`text-xs \${theme.textMuted}\`}>
                Cozy Shared Space • Lv.{levelInfo.level} {levelInfo.title}
              </p>
            </div>
          </div>

          {/* Right Controls: Ambient Sound, Latte/Night Mode, Tutorial, Share */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Built-in Cozy Soundscape Pill */}
            <div className={\`flex items-center rounded-2xl p-1 border cozy-transition \${theme.cardBg}\`}>
              <button
                onClick={() => setAmbientMode(ambientMode === 'rain' ? 'off' : 'rain')}
                className={\`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 transition \${
                  ambientMode === 'rain' ? theme.primaryBtn : theme.textMuted
                }\`}
                title="Play Soothing Rain Sound"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rain</span>
              </button>
              <button
                onClick={() => setAmbientMode(ambientMode === 'zen' ? 'off' : 'zen')}
                className={\`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 transition \${
                  ambientMode === 'zen' ? theme.primaryBtn : theme.textMuted
                }\`}
                title="Play Warm 432Hz Zen Sound"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zen</span>
              </button>
              {ambientMode !== 'off' && (
                <button
                  onClick={() => setAmbientMode('off')}
                  className="px-1.5 text-rose-400 hover:text-rose-500"
                  title="Mute Sound"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Warm Latte (Day) / Cozy Night Toggle */}
            <button
              onClick={() => setIsLatteMode(!isLatteMode)}
              className={\`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 cozy-transition \${theme.cardBg}\`}
              title="Switch between Warm Latte Day Mode and Cozy Night Mode"
            >
              {isLatteMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600" />
                  <span>Night</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                  <span>Latte</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setTutorialStep(0);
                setShowTutorial(true);
              }}
              className={\`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 cozy-transition \${theme.cardBg}\`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Guide</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className={\`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition \${theme.primaryBtn}\`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className={\`p-2 rounded-2xl border text-xs cozy-transition \${theme.cardBg}\`}
              title="Cloud Sync Settings"
            >
              <Cloud className={\`w-4 h-4 \${syncUrl ? 'text-emerald-500' : theme.textMuted}\`} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-7 space-y-7">
        {/* EDITORIAL WARM GREETING BANNER */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className={\`text-xs font-mono uppercase tracking-widest \${theme.accentText}\`}>
              ✨ {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <h2 className="font-serif italic text-3xl sm:text-4xl mt-1 tracking-tight">
              Take a deep breath and enjoy your pace, {currentMember.name}.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentMember.statusNote || ''}
              onChange={(e) => updateMemberStatus(e.target.value)}
              placeholder="Write your cozy status note..."
              className={\`text-xs px-3.5 py-2 rounded-2xl border w-full md:w-72 focus:outline-none cozy-transition \${theme.cardBg}\`}
            />
          </div>
        </section>

        {/* SQUAD CARDS (UP TO 4 MEMBERS) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={\`text-xs font-medium flex items-center gap-1.5 \${theme.textMuted}\`}>
              <Users className="w-3.5 h-3.5" />
              Our Cozy Circle (Click a companion to enter their space & theme)
            </span>
            {state.members.length < 4 && (
              <button
                onClick={() => setShowMemberModal(true)}
                className={\`text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-2xl border cozy-transition \${theme.cardBg}\`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Invite Companion ({state.members.length}/4)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.members.map((member) => {
              const isSelected = member.id === activeUser;
              const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
              const todayMins = getTodayMinutes(member.id);
              const mLv = getLevelInfo(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => setActiveUser(member.id)}
                  className={\`cursor-pointer rounded-3xl p-5 border backdrop-blur-md cozy-transition relative group \${
                    isSelected
                      ? \`\${mStyle.cardBg} \${mStyle.activeBorder} scale-[1.01]\`
                      : \`\${theme.cardBg} opacity-80 hover:opacity-100\`
                  }\`}
                >
                  {member.id !== 'mehrsan' && member.id !== 'ronak' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMember(member.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 rounded-full hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={\`w-11 h-11 rounded-2xl flex items-center justify-center font-serif italic text-xl border \${mStyle.softBadge}\`}>
                        {member.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1">
                          {member.name}
                          {member.id === 'ronak' && <span>💜</span>}
                        </h3>
                        <p className={\`text-[11px] truncate max-w-[130px] \${theme.textMuted}\`}>
                          {member.tagline}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={\`text-[10px] font-mono uppercase block \${theme.textMuted}\`}>Today</span>
                      <span className={\`font-mono font-bold text-sm \${mStyle.accentText}\`}>
                        {Math.floor(todayMins / 60)}h {todayMins % 60}m
                      </span>
                    </div>
                  </div>

                  {member.statusNote && (
                    <p className={\`text-[11px] italic mb-3 line-clamp-1 \${theme.textMuted}\`}>
                      "{member.statusNote}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2.5 border-t border-current/10">
                    <span>Lv.{mLv.level} • {getTotalHours(member.id)}h banked</span>
                    <span className={isSelected ? mStyle.accentText : theme.textMuted}>
                      {isSelected ? '● Here' : 'Visit →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PILL NAVIGATION TABS */}
        <div className={\`flex flex-wrap items-center justify-between gap-2 p-2 rounded-3xl border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'dashboard', label: '1. Cozy Focus & Daily Flow', icon: Coffee },
              { id: 'goals', label: '2. Dreams & Time Bank', icon: Target },
              { id: 'schedule', label: '3. Weekly Classes', icon: Calendar },
              { id: 'analytics', label: '4. Visual Progress', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={\`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all \${
                    active ? theme.primaryBtn : \`\${theme.textMuted} hover:opacity-100\`
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* COZY POMODORO & FOCUS TIMER */}
            <div className={\`rounded-3xl p-6 border backdrop-blur-xl cozy-transition \${theme.cardBg} \${theme.activeBorder}\`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => switchTimerMode('stopwatch')}
                      className={\`text-xs font-mono px-3 py-1 rounded-full border transition \${
                        timerMode === 'stopwatch' ? theme.softBadge : 'border-transparent opacity-60'
                      }\`}
                    >
                      ⏱️ Open Stopwatch
                    </button>
                    <button
                      onClick={() => switchTimerMode('pomodoro')}
                      className={\`text-xs font-mono px-3 py-1 rounded-full border transition \${
                        timerMode === 'pomodoro' ? theme.softBadge : 'border-transparent opacity-60'
                      }\`}
                    >
                      🍅 25m Cozy Pomodoro
                    </button>
                  </div>
                  <h3 className="font-serif italic text-2xl pt-1">
                    Mindful Time Investment
                  </h3>
                  <p className={\`text-xs leading-relaxed \${theme.textMuted}\`}>
                    Select what you’re nurturing right now. When you finish, click <b>Log Session</b> to credit the minutes to your goal!
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center">
                  <div className="font-mono text-4xl sm:text-5xl font-semibold tracking-wider mb-3">
                    {formatTimer(timerSeconds)}
                  </div>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className={\`w-full max-w-xs border rounded-2xl px-3.5 py-2 text-xs focus:outline-none cozy-transition \${theme.innerCardBg}\`}
                  >
                    <option value="">-- Choose Goal to Nourish --</option>
                    {userGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-3 flex items-center justify-center lg:justify-end gap-2.5">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={\`px-5 py-3 rounded-2xl font-semibold text-xs flex items-center gap-1.5 transition \${theme.primaryBtn}\`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isTimerRunning ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={handleSaveTimerSession}
                    className={\`px-4 py-3 rounded-2xl font-semibold text-xs border flex items-center gap-1 transition \${theme.softBadge}\`}
                  >
                    <Check className="w-4 h-4" />
                    Log Session
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(timerMode === 'pomodoro' ? 25 * 60 : 0);
                    }}
                    className={\`p-3 rounded-2xl border \${theme.innerCardBg}\`}
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 cols: Active Goals + Gentle Checklist */}
              <div className="lg:col-span-7 space-y-6">
                <div className={\`rounded-3xl p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif italic text-2xl flex items-center gap-2">
                        <Target className={\`w-5 h-5 \${theme.accentText}\`} />
                        {currentMember.name}'s Goals & Time Bank
                      </h3>
                      <p className={\`text-xs \${theme.textMuted}\`}>
                        Tap +15m, +30m, or +1h anytime to gently log your progress
                      </p>
                    </div>
                    <button
                      onClick={openCreateGoal}
                      className={\`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 \${theme.primaryBtn}\`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Goal
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {userGoals.map((goal) => {
                      const hoursDone = +(goal.loggedMinutes / 60).toFixed(1);
                      const pct = Math.min(100, Math.round((hoursDone / goal.targetHours) * 100));
                      return (
                        <div
                          key={goal.id}
                          className={\`p-4 rounded-2xl border cozy-transition \${theme.innerCardBg}\`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2.5">
                            <div>
                              <span className={\`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border mr-2 \${theme.softBadge}\`}>
                                {goal.category}
                              </span>
                              <span className={\`text-[11px] font-mono \${theme.textMuted}\`}>
                                {goal.deadline}
                              </span>
                              <h4 className="font-semibold text-sm mt-1">
                                {goal.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 15)}
                                className={\`px-2.5 py-1 rounded-xl border text-[11px] font-mono hover:opacity-80 \${theme.cardBg}\`}
                              >
                                +15m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 30)}
                                className={\`px-2.5 py-1 rounded-xl border text-[11px] font-mono hover:opacity-80 \${theme.cardBg}\`}
                              >
                                +30m
                              </button>
                              <button
                                onClick={() => logTime(activeUser, goal.id, goal.title, 60)}
                                className={\`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold \${theme.softBadge}\`}
                              >
                                +1h
                              </button>
                              <button
                                onClick={() => openEditGoal(goal)}
                                className={\`p-1.5 rounded-xl opacity-60 hover:opacity-100\`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1.5 rounded-xl opacity-60 hover:text-rose-400 hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-mono mb-1.5">
                              <span className={theme.textMuted}>
                                {hoursDone} hrs invested of {goal.targetHours} hrs
                              </span>
                              <span className={\`font-bold \${theme.accentText}\`}>{pct}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-current/10 overflow-hidden">
                              <div
                                className={\`h-full rounded-full transition-all duration-700 \${theme.progressBar}\`}
                                style={{ width: \`\${pct}%\` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Daily Gentle Checklist */}
                <div className={\`rounded-3xl p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <h3 className="font-serif italic text-2xl flex items-center gap-2 mb-1">
                    <Bell className={\`w-5 h-5 \${theme.accentText}\`} />
                    Today's Gentle Intentions & Reminders
                  </h3>
                  <p className={\`text-xs mb-4 \${theme.textMuted}\`}>
                    Small daily wins build big confidence. Check off an item to earn its time credit!
                  </p>

                  <form onSubmit={addTask} className="flex flex-wrap gap-2 mb-4">
                    <input
                      type="text"
                      placeholder={\`Add a gentle task for \${currentMember.name}...\`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className={\`flex-1 min-w-[180px] border rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none \${theme.innerCardBg}\`}
                    />
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={\`border rounded-2xl px-3 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                    />
                    <select
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className={\`border rounded-2xl px-2.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                    >
                      <option value={15}>+15m</option>
                      <option value={30}>+30m</option>
                      <option value={45}>+45m</option>
                      <option value={60}>+1h</option>
                    </select>
                    <button
                      type="submit"
                      className={\`px-4 py-2.5 rounded-2xl font-semibold text-xs \${theme.primaryBtn}\`}
                    >
                      Add
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {userTasks.map((task) => (
                      <div
                        key={task.id}
                        className={\`flex items-center justify-between p-3.5 rounded-2xl border \${theme.innerCardBg}\`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTask(task)}
                            className={\`w-5 h-5 rounded-lg flex items-center justify-center border transition \${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-current/30'
                            }\`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={\`text-xs sm:text-sm font-medium \${task.completed ? 'line-through opacity-50' : ''}\`}>
                              {task.title}
                            </p>
                            <div className={\`flex items-center gap-2 text-[11px] font-mono mt-0.5 \${theme.textMuted}\`}>
                              <span>⏰ {task.reminderTime}</span>
                              <span>•</span>
                              <span className={theme.accentText}>+{task.estimatedMinutes}m</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 opacity-50 hover:text-rose-400 hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 cols: Shared Squad Feed with Heart Cheers + Exams */}
              <div className="lg:col-span-5 space-y-6">
                <div className={\`rounded-3xl p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Heart className={\`w-5 h-5 \${theme.accentText}\`} />
                      Shared Warmth & Activity
                    </h3>
                    <span className={\`text-[11px] font-mono px-2.5 py-0.5 rounded-full border \${theme.softBadge}\`}>
                      Live Moments
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {state.logs.slice(0, 14).map((log) => {
                      const logMember = state.members.find((m) => m.id === log.userId);
                      const mStyle = GET_COZY_THEME(logMember?.theme || 'warm-sage', isLatteMode);
                      return (
                        <div
                          key={log.id}
                          className={\`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs \${theme.innerCardBg}\`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={\`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border \${mStyle.softBadge}\`}
                            >
                              {logMember ? logMember.avatar : 'S'}
                            </span>
                            <div>
                              <p className="font-medium">
                                <span className="font-bold">{logMember?.name}</span> • {log.targetTitle}
                              </p>
                              <span className={\`text-[11px] font-mono \${theme.textMuted}\`}>
                                {log.timestamp} (+{log.minutes}m)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => cheerLog(log.id)}
                            className={\`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1 hover:scale-105 transition \${mStyle.softBadge}\`}
                            title="Send a warm cheer!"
                          >
                            <span>💜</span>
                            <span>{log.cheers || 1}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Exam Dates */}
                <div className={\`rounded-3xl p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <h3 className="font-serif italic text-2xl flex items-center gap-2 mb-3">
                    <GraduationCap className={\`w-5 h-5 \${theme.accentText}\`} />
                    Upcoming University Exams (1405)
                  </h3>
                  <div className="space-y-2.5">
                    {state.exams.map((ex) => (
                      <div
                        key={ex.id}
                        className={\`p-3.5 rounded-2xl border flex items-center justify-between text-xs \${theme.innerCardBg}\`}
                      >
                        <div>
                          <span className="font-semibold block">{ex.title}</span>
                          <span className={\`text-[11px] \${theme.textMuted}\`}>Prof. {ex.professor}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={\`font-bold block \${theme.accentText}\`}>{ex.date}</span>
                          <span className={\`text-[11px] \${theme.textMuted}\`}>⏰ {ex.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOALS & TIME BANK */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className={\`flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border \${theme.cardBg}\`}>
              <div>
                <h3 className="font-serif italic text-2xl">
                  Shared Dreams & Time Bank
                </h3>
                <p className={\`text-xs \${theme.textMuted}\`}>
                  Add, edit, or refine short-term and long-term milestones for anyone in the circle.
                </p>
              </div>
              <button
                onClick={openCreateGoal}
                className={\`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 \${theme.primaryBtn}\`}
              >
                <Plus className="w-4 h-4" />
                New Goal for {currentMember.name}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {state.members.map((member) => {
                const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                return (
                  <div
                    key={member.id}
                    className={\`rounded-3xl p-6 border space-y-4 \${theme.cardBg}\`}
                  >
                    <div className="flex items-center justify-between border-b border-current/10 pb-3">
                      <h4 className="font-serif italic text-2xl flex items-center gap-2">
                        <span className={\`w-7 h-7 rounded-xl text-sm flex items-center justify-center border \${mStyle.softBadge}\`}>
                          {member.avatar}
                        </span>
                        {member.name}'s Goals
                      </h4>
                      <span className={\`text-xs font-mono \${theme.textMuted}\`}>
                        {getTotalHours(member.id)} hrs banked
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
                            className={\`p-4 rounded-2xl border space-y-2 \${theme.innerCardBg}\`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={\`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border \${mStyle.softBadge}\`}>
                                  {g.category}
                                </span>
                                <h5 className="font-semibold text-sm mt-1">{g.title}</h5>
                                <p className={\`text-[11px] font-mono \${theme.textMuted}\`}>
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
                                  className={\`px-2 py-0.5 rounded-lg border \${theme.cardBg}\`}
                                >
                                  +30m
                                </button>
                                <button
                                  onClick={() => logTime(member.id, g.id, g.title, 60)}
                                  className={\`px-2 py-0.5 rounded-lg border \${mStyle.softBadge}\`}
                                >
                                  +1h
                                </button>
                              </div>
                            </div>

                            <div className="w-full h-2 rounded-full bg-current/10 overflow-hidden">
                              <div className={\`h-full rounded-full \${mStyle.progressBar}\`} style={{ width: \`\${pct}%\` }} />
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
            <div className={\`flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border \${theme.cardBg}\`}>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={\`px-3.5 py-2 rounded-2xl text-xs font-semibold transition \${
                      selectedDay === day ? theme.primaryBtn : \`\${theme.innerCardBg} \${theme.textMuted}\`
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
                className={\`px-4 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1.5 \${theme.primaryBtn}\`}
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
                  <div key={member.id} className={\`rounded-3xl p-6 border space-y-3 \${theme.cardBg}\`}>
                    <h4 className="font-serif italic text-2xl flex items-center gap-2">
                      <span className={\`w-7 h-7 rounded-xl text-sm flex items-center justify-center border \${mStyle.softBadge}\`}>
                        {member.avatar}
                      </span>
                      {member.name}'s {selectedDay}
                    </h4>
                    {dayItems.length === 0 ? (
                      <p className={\`text-xs py-6 text-center italic \${theme.textMuted}\`}>
                        A free, unhurried {selectedDay} — wonderful for self-paced goals ☕
                      </p>
                    ) : (
                      dayItems.map((item) => {
                        const attendedToday = item.attendedDates.includes(todayStr);
                        return (
                          <div
                            key={item.id}
                            className={\`p-4 rounded-2xl border flex items-center justify-between gap-3 \${theme.innerCardBg}\`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={\`font-mono text-xs font-bold \${mStyle.accentText}\`}>
                                  {item.startTime} - {item.endTime}
                                </span>
                                <span className={\`text-[10px] font-mono px-2 py-0.5 rounded-full border \${mStyle.softBadge}\`}>
                                  {item.category}
                                </span>
                              </div>
                              <h5 className="font-semibold text-sm mt-1">{item.title}</h5>
                              <p className={\`text-xs \${theme.textMuted}\`}>{item.details}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleClassAttendance(item)}
                                className={\`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition \${
                                  attendedToday ? mStyle.softBadge : theme.cardBg
                                }\`}
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

        {/* TAB 4: VISUAL PROGRESS */}
        {activeTab === 'analytics' && (
          <div className={\`rounded-3xl p-6 border \${theme.cardBg}\`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-serif italic text-2xl">
                  7-Day Gentle Consistency Rhythm
                </h3>
                <p className={\`text-xs \${theme.textMuted}\`}>
                  Comparing daily focused minutes side-by-side across your circle
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                {state.members.map((m) => (
                  <span key={m.id} className={\`flex items-center gap-1.5 \${GET_COZY_THEME(m.theme, isLatteMode).accentText}\`}>
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
                          className={\`w-4 sm:w-6 bg-gradient-to-t \${barGrad} rounded-t-xl transition-all duration-500 relative group\`}
                          style={{ height: \`\${Math.max(8, hPct)}%\` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-stone-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                            {mt.member.name[0]}: {mt.mins}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className={\`text-xs font-mono mt-2 \${theme.textMuted}\`}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* TUTORIAL MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={\`border rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <span className={\`text-xs font-mono px-3 py-1 rounded-full border \${theme.softBadge}\`}>
                Cozy Tour • {tutorialStep + 1} / {TUTORIAL_STEPS.length}
              </span>
              <button onClick={closeTutorial} className={\`text-xs font-mono \${theme.textMuted}\`}>
                Close ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif italic text-3xl">
                {TUTORIAL_STEPS[tutorialStep].title}
              </h3>
              <p className={\`text-xs font-semibold \${theme.accentText}\`}>
                {TUTORIAL_STEPS[tutorialStep].subtitle}
              </p>
              <p className={\`text-xs sm:text-sm leading-relaxed pt-1 \${theme.textMuted}\`}>
                {TUTORIAL_STEPS[tutorialStep].description}
              </p>
            </div>

            <div className={\`p-4 rounded-2xl border text-xs leading-relaxed \${theme.innerCardBg}\`}>
              🌿 <b>Note:</b> {TUTORIAL_STEPS[tutorialStep].highlight}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
                disabled={tutorialStep === 0}
                className={\`px-4 py-2 rounded-2xl border disabled:opacity-30 text-xs font-semibold flex items-center gap-1 \${theme.cardBg}\`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={() => setTutorialStep((s) => s + 1)}
                  className={\`px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 \${theme.primaryBtn}\`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={closeTutorial}
                  className={\`px-6 py-2.5 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}
                >
                  Enter Cozy Space ✨
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHARE STATUS MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                Share {currentMember.name}'s Cozy Snapshot
              </h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={\`p-5 rounded-2xl border space-y-3 \${theme.innerCardBg}\`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={\`w-10 h-10 rounded-2xl font-serif italic text-xl flex items-center justify-center border \${theme.softBadge}\`}>
                    {currentMember.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{currentMember.name}</h4>
                    <span className={\`text-[11px] \${theme.textMuted}\`}>{currentMember.tagline}</span>
                  </div>
                </div>
                <span className={\`text-xs font-mono px-2.5 py-1 rounded-xl border \${theme.softBadge}\`}>
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
              className={\`w-full py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 \${theme.primaryBtn}\`}
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
            className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}
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
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Name</label>
              <input
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="e.g., Sara"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div>
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Focus / Tagline</label>
              <input
                type="text"
                value={memberForm.tagline}
                onChange={(e) => setMemberForm({ ...memberForm, tagline: e.target.value })}
                placeholder="e.g., Art & Literature"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div>
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Cozy Aesthetic Palette</label>
              <select
                value={memberForm.theme}
                onChange={(e) => setMemberForm({ ...memberForm, theme: e.target.value as ThemePalette })}
                className={\`w-full border rounded-2xl px-3 py-2.5 text-xs \${theme.innerCardBg}\`}
              >
                <option value="peach-terracotta">Warm Terracotta & Peach 🍑</option>
                <option value="matcha-cream">Matcha Oat Milk 🍵</option>
                <option value="lavender-blush">Velvet Lavender & Rose 💜</option>
                <option value="warm-sage">Espresso & Warm Sage ☕</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowMemberModal(false)} className={\`px-4 py-2 rounded-2xl border text-xs \${theme.cardBg}\`}>
                Cancel
              </button>
              <button type="submit" className={\`px-5 py-2 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}>
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
            className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                {editingGoal ? 'Edit Goal' : \`New Goal for \${currentMember.name}\`}
              </h3>
              <button type="button" onClick={() => setShowGoalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Goal Title</label>
              <input
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="e.g., Master French B2"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Category</label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as GoalItem['category'] })}
                  className={\`w-full border rounded-2xl px-3 py-2.5 text-xs \${theme.innerCardBg}\`}
                >
                  <option value="Short-Term">Short-Term</option>
                  <option value="Long-Term">Long-Term</option>
                  <option value="Habit">Habit</option>
                  <option value="Career">Career</option>
                </select>
              </div>
              <div>
                <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Target Hours</label>
                <input
                  type="number"
                  min={1}
                  value={goalForm.targetHours}
                  onChange={(e) => setGoalForm({ ...goalForm, targetHours: Number(e.target.value) })}
                  className={\`w-full border rounded-2xl px-3 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
            </div>

            <div>
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Horizon / Deadline</label>
              <input
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                placeholder="e.g., This Semester"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowGoalModal(false)} className={\`px-4 py-2 rounded-2xl border text-xs \${theme.cardBg}\`}>
                Cancel
              </button>
              <button type="submit" className={\`px-5 py-2 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}>
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
            className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}
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
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Title</label>
              <input
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="e.g., French Conversation"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Day</label>
                <select
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                  className={\`w-full border rounded-2xl px-2.5 py-2.5 text-xs \${theme.innerCardBg}\`}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Start</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className={\`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
              <div>
                <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>End</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className={\`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
            </div>

            <div>
              <label className={\`block text-xs mb-1 \${theme.textMuted}\`}>Details</label>
              <input
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
                placeholder="e.g., Room 102"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowScheduleModal(false)} className={\`px-4 py-2 rounded-2xl border text-xs \${theme.cardBg}\`}>
                Cancel
              </button>
              <button type="submit" className={\`px-5 py-2 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}>
                Save Class
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                Real-Time Cloud Sync
              </h3>
              <button onClick={() => setShowSyncModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className={\`text-xs leading-relaxed \${theme.textMuted}\`}>
              Paste a free Firebase Realtime Database URL to keep everyone’s logs, cheers, and goals synced live across devices.
            </p>
            <input
              type="url"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com/"
              className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                  if (syncUrl.trim()) pushToCloud(state);
                }}
                className={\`px-5 py-2.5 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}
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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('🌿 Updated:', filePath);
}

console.log('\n☕ SyncPulse v3.0 (Warm Minimalism, Latte/Night Modes & Cozy Soundscape) is ready!');