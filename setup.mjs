// setup.mjs - SyncPulse v4.0 (Full Claude Audit Fix + Modular Architecture + PWA + JSON Backup)
// Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'public/manifest.json': JSON.stringify({
    name: 'SyncPulse — Cozy Co-Op Sanctuary',
    short_name: 'SyncPulse',
    description: 'Warm-minimalist shared productivity, timeline, and habit tracker.',
    start_url: './',
    display: 'standalone',
    background_color: '#151413',
    theme_color: '#5B7F78',
    icons: [
      {
        src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2615.png',
        sizes: '72x72',
        type: 'image/png'
      },
      {
        src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2615.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ]
  }, null, 2),

  'public/sw.js': `const CACHE_NAME = 'syncpulse-v4-cache';
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
`,

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#151413" />
    <meta name="description" content="SyncPulse — Cozy Co-Op Productivity, Visual Timeline & Habit Tracker for Mehrsan & Ronak" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon" type="image/svg+xml" href="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2615.svg" />
    <title>SyncPulse — Cozy Shared Sanctuary</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
      }
    </script>
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
  transition: background-color 0.35s ease,
              border-color 0.35s ease,
              color 0.25s ease,
              box-shadow 0.35s ease;
}

.paper-grain {
  background-image: radial-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 0);
  background-size: 24px 24px;
}

@keyframes breathe {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
  50% { transform: translate(14px, -14px) scale(1.05); opacity: 0.95; }
}

.cozy-orb {
  animation: breathe 12s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cozy-orb, .animate-ping, .animate-pulse {
    animation: none !important;
  }
  .cozy-transition {
    transition: none !important;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 9999px;
}
`,

  'src/types.ts': `export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';

export interface ActivePresence {
  isFocusing: boolean;
  targetTitle: string;
  startedAtMs: number;
  mode: 'stopwatch' | 'pomodoro' | 'break';
}

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
  statusNote?: string;
  presence?: ActivePresence | null;
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
  day: string; // Bound to specific day of week so tasks don't repeat on all days
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
  sourceKey?: string; // Prevents duplicate XP farming when toggling tasks/classes
  userId: string;
  targetTitle: string;
  minutes: number;
  date: string; // Local YYYY-MM-DD
  createdAtMs: number;
  cheeredBy: string[]; // Array of member IDs who cheered (no self-cheer farming)
}

export interface AppState {
  version: number;
  lastUpdatedMs: number;
  members: Member[];
  schedules: ScheduleItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  exams: ExamItem[];
  logs: TimeLog[];
}
`,

  'src/utils.ts': `export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Fixes UTC bug in Iran/Türkiye: Always returns local YYYY-MM-DD
export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
};

export const getPastLocalDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getLocalDateStr(d);
};

export const getTodayWeekday = (): string => {
  const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return DAYS.includes(jsDay) ? jsDay : 'Saturday';
};

export const uid = (prefix = 'id'): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return \`\${prefix}-\${crypto.randomUUID().slice(0, 8)}\`;
  }
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}\`;
};

export const toMins = (timeStr: string): number => {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const fromMins = (total: number): string => {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
};

export const formatRelativeTime = (createdAtMs: number, dateStr: string): string => {
  const today = getLocalDateStr();
  const yesterday = getPastLocalDateStr(1);
  const diffSec = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return \`\${Math.floor(diffSec / 60)}m ago\`;
  const timeFormatted = new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateStr === today) return \`Today, \${timeFormatted}\`;
  if (dateStr === yesterday) return \`Yesterday, \${timeFormatted}\`;
  return dateStr;
};

// Gentle Web Audio Chime when Pomodoro or Reminder triggers
export const playGentleChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 warm chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + idx * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 1.25);
    });
  } catch {}
};
`,

  'src/themes.ts': `import { ThemePalette } from './types';

export interface CozyStyle {
  name: string;
  pageBg: string;
  sidebarBg: string;
  cardBg: string;
  innerCardBg: string;
  dockBg: string;
  textMain: string;
  textMuted: string;
  divider: string;
  trackBg: string;
  orb1: string;
  orb2: string;
  primaryBtn: string;
  softBadge: string;
  streakBadge: string;
  doneBadge: string;
  activeNav: string;
  activeBorder: string;
  progressBar: string;
  accentText: string;
  barColor: string;
  timelineLine: string;
  selectionCls: string;
  heatLevels: [string, string, string, string];
}

export const GET_COZY_THEME = (palette: ThemePalette, isLatte: boolean): CozyStyle => {
  const streakBadge = isLatte
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

  const doneBadge = isLatte
    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Lavender Oat Latte 💜',
          pageBg: 'bg-[#FAF5FF]',
          sidebarBg: 'bg-[#F3E8FF]/95 border-purple-200',
          cardBg: 'bg-white/90 border-purple-200/90 shadow-sm shadow-purple-950/5',
          innerCardBg: 'bg-[#F6EEFC]/90 border-purple-200/75',
          dockBg: 'bg-white/95 border-purple-300 shadow-2xl shadow-purple-950/10',
          textMain: 'text-[#2E1B3B]',
          textMuted: 'text-[#6A517D]',
          divider: 'border-purple-200/80',
          trackBg: 'bg-purple-200/70',
          orb1: 'bg-purple-300/40',
          orb2: 'bg-pink-300/35',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B47AEA] to-[#D685B8] hover:opacity-95 text-white shadow-md shadow-purple-500/20',
          softBadge: 'bg-purple-100 text-purple-900 border-purple-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-purple-200/80 text-[#2E1B3B] font-bold border-purple-300',
          activeBorder: 'border-purple-400 shadow-lg shadow-purple-300/30',
          progressBar: 'bg-gradient-to-r from-[#9D65C9] via-[#C084FC] to-[#F472B6]',
          accentText: 'text-[#7E3AF2]',
          barColor: 'from-[#9D65C9] to-[#E879F9]',
          timelineLine: 'border-purple-300',
          selectionCls: 'selection:bg-purple-300/50',
          heatLevels: ['bg-purple-100 border-purple-200', 'bg-purple-300 border-purple-400', 'bg-purple-500 border-purple-600', 'bg-fuchsia-600 border-fuchsia-700']
        }
      : {
          name: 'Cozy Velvet Lavender 💜',
          pageBg: 'bg-[#170F21]',
          sidebarBg: 'bg-[#120B1B]/95 border-purple-300/15',
          cardBg: 'bg-[#231832]/85 border-purple-300/15 shadow-xl shadow-black/30',
          innerCardBg: 'bg-[#160F20]/85 border-purple-300/15',
          dockBg: 'bg-[#1E142B]/95 border-purple-400/30 shadow-2xl shadow-black/70',
          textMain: 'text-[#F7F1FF]',
          textMuted: 'text-[#C4B2D6]',
          divider: 'border-purple-300/15',
          trackBg: 'bg-purple-950/80',
          orb1: 'bg-[#9D65C9]/20',
          orb2: 'bg-[#E879F9]/15',
          primaryBtn: 'bg-gradient-to-r from-[#9D65C9] via-[#B779E2] to-[#D977B4] hover:opacity-95 text-white shadow-lg shadow-purple-950/50',
          softBadge: 'bg-purple-400/15 text-purple-200 border-purple-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-purple-500/25 text-white border-purple-400/40',
          activeBorder: 'border-purple-400/50 shadow-xl shadow-purple-950/60',
          progressBar: 'bg-gradient-to-r from-[#A855F7] via-[#D946EF] to-[#F472B6]',
          accentText: 'text-[#DFB6FF]',
          barColor: 'from-[#A855F7] to-[#F472B6]',
          timelineLine: 'border-purple-400/30',
          selectionCls: 'selection:bg-purple-500/40',
          heatLevels: ['bg-purple-950/70 border-purple-800/40', 'bg-purple-700/70 border-purple-500/50', 'bg-purple-500 border-purple-400', 'bg-fuchsia-400 border-pink-300']
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta Latte',
          pageBg: 'bg-[#FDF8F5]',
          sidebarBg: 'bg-[#F9EFEA]/95 border-orange-200',
          cardBg: 'bg-white/90 border-orange-200/90 shadow-sm',
          innerCardBg: 'bg-[#FAF0EA]/90 border-orange-200/75',
          dockBg: 'bg-white/95 border-orange-300 shadow-2xl',
          textMain: 'text-[#362019]',
          textMuted: 'text-[#7C584C]',
          divider: 'border-orange-200/80',
          trackBg: 'bg-orange-200/70',
          orb1: 'bg-amber-300/35',
          orb2: 'bg-rose-300/30',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-md',
          softBadge: 'bg-orange-100 text-orange-900 border-orange-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-orange-200/75 text-[#362019] border-orange-300',
          activeBorder: 'border-orange-400 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#D97757] to-[#F59E0B]',
          accentText: 'text-[#B84A24]',
          barColor: 'from-[#D97757] to-[#F59E0B]',
          timelineLine: 'border-orange-300',
          selectionCls: 'selection:bg-orange-300/50',
          heatLevels: ['bg-orange-100 border-orange-200', 'bg-orange-300 border-orange-400', 'bg-orange-500 border-orange-600', 'bg-amber-600 border-amber-700']
        }
      : {
          name: 'Fireside Terracotta',
          pageBg: 'bg-[#1B1311]',
          sidebarBg: 'bg-[#140E0C]/95 border-orange-300/15',
          cardBg: 'bg-[#291D1B]/85 border-orange-300/15',
          innerCardBg: 'bg-[#16100E]/85 border-orange-300/15',
          dockBg: 'bg-[#241917]/95 border-orange-400/30 shadow-2xl',
          textMain: 'text-[#FDF4F0]',
          textMuted: 'text-[#CBB2A8]',
          divider: 'border-orange-300/15',
          trackBg: 'bg-orange-950/80',
          orb1: 'bg-orange-500/15',
          orb2: 'bg-amber-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#D97757] to-[#E09F67] text-white shadow-lg',
          softBadge: 'bg-orange-400/15 text-orange-200 border-orange-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-orange-500/20 text-white border-orange-400/40',
          activeBorder: 'border-orange-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#EA580C] to-[#FBBF24]',
          accentText: 'text-[#FDBA8C]',
          barColor: 'from-[#EA580C] to-[#FBBF24]',
          timelineLine: 'border-orange-400/30',
          selectionCls: 'selection:bg-orange-500/40',
          heatLevels: ['bg-orange-950/60 border-orange-900/40', 'bg-orange-700/60 border-orange-600/40', 'bg-orange-500 border-orange-400', 'bg-amber-400 border-yellow-300']
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Oat Milk',
          pageBg: 'bg-[#F6F9F4]',
          sidebarBg: 'bg-[#EBF2E6]/95 border-emerald-200',
          cardBg: 'bg-white/90 border-emerald-200/90 shadow-sm',
          innerCardBg: 'bg-[#ECF3E8]/90 border-emerald-200/75',
          dockBg: 'bg-white/95 border-emerald-300 shadow-2xl',
          textMain: 'text-[#1B2E22]',
          textMuted: 'text-[#4F6D59]',
          divider: 'border-emerald-200/80',
          trackBg: 'bg-emerald-200/70',
          orb1: 'bg-emerald-300/30',
          orb2: 'bg-lime-300/25',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-md',
          softBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          streakBadge,
          doneBadge,
          activeNav: 'bg-emerald-200/75 text-[#1B2E22] border-emerald-300',
          activeBorder: 'border-emerald-400 shadow-lg',
          progressBar: 'bg-gradient-to-r from-[#4E8C6F] to-[#84CC16]',
          accentText: 'text-[#2D6A4F]',
          barColor: 'from-[#4E8C6F] to-[#84CC16]',
          timelineLine: 'border-emerald-300',
          selectionCls: 'selection:bg-emerald-300/50',
          heatLevels: ['bg-emerald-100 border-emerald-200', 'bg-emerald-300 border-emerald-400', 'bg-emerald-500 border-emerald-600', 'bg-teal-600 border-teal-700']
        }
      : {
          name: 'Forest Matcha Night',
          pageBg: 'bg-[#101914]',
          sidebarBg: 'bg-[#0B120E]/95 border-emerald-300/15',
          cardBg: 'bg-[#18261F]/85 border-emerald-300/15',
          innerCardBg: 'bg-[#0D1411]/85 border-emerald-300/15',
          dockBg: 'bg-[#15221B]/95 border-emerald-400/30 shadow-2xl',
          textMain: 'text-[#F0FAF4]',
          textMuted: 'text-[#A7C4B3]',
          divider: 'border-emerald-300/15',
          trackBg: 'bg-emerald-950/80',
          orb1: 'bg-emerald-500/15',
          orb2: 'bg-teal-500/15',
          primaryBtn: 'bg-gradient-to-r from-[#4E8C6F] to-[#68A889] text-white shadow-lg',
          softBadge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/30',
          streakBadge,
          doneBadge,
          activeNav: 'bg-emerald-500/20 text-white border-emerald-400/40',
          activeBorder: 'border-emerald-400/50 shadow-xl',
          progressBar: 'bg-gradient-to-r from-[#10B981] to-[#84CC16]',
          accentText: 'text-[#86EFAC]',
          barColor: 'from-[#10B981] to-[#84CC16]',
          timelineLine: 'border-emerald-400/30',
          selectionCls: 'selection:bg-emerald-500/40',
          heatLevels: ['bg-emerald-950/60 border-emerald-900/40', 'bg-emerald-700/60 border-emerald-600/40', 'bg-emerald-500 border-emerald-400', 'bg-lime-400 border-emerald-300']
        };
  }

  // Default: 'warm-sage' (Mehrsan)
  return isLatte
    ? {
        name: 'Warm Oat & Sage ☕',
        pageBg: 'bg-[#FBF9F5]',
        sidebarBg: 'bg-[#F3EFE6]/95 border-[#DDD3C0]',
        cardBg: 'bg-white/90 border-[#E2D9C8] shadow-sm shadow-stone-900/5',
        innerCardBg: 'bg-[#F4EFE6]/90 border-[#DDD3C0]',
        dockBg: 'bg-white/95 border-[#C8BFA8] shadow-2xl shadow-stone-900/10',
        textMain: 'text-[#292524]',
        textMuted: 'text-[#68625D]',
        divider: 'border-[#E2D9C8]',
        trackBg: 'bg-[#E5DEC9]',
        orb1: 'bg-amber-200/45',
        orb2: 'bg-teal-200/40',
        primaryBtn: 'bg-gradient-to-r from-[#4A6B65] via-[#5B7F78] to-[#B87D4B] hover:opacity-95 text-white shadow-md',
        softBadge: 'bg-[#EFECE6] text-[#3B5752] border-[#CFC6B4]',
        streakBadge,
        doneBadge,
        activeNav: 'bg-[#E5DEC9] text-[#292524] font-bold border-[#C8BFA8]',
        activeBorder: 'border-[#5B7F78] shadow-lg',
        progressBar: 'bg-gradient-to-r from-[#4A6B65] via-[#66968C] to-[#D99B52]',
        accentText: 'text-[#3F5E58]',
        barColor: 'from-[#4A6B65] to-[#D99B52]',
        timelineLine: 'border-[#CFC6B4]',
        selectionCls: 'selection:bg-[#D99B52]/30',
        heatLevels: ['bg-[#EBE5D9] border-[#DCD3C2]', 'bg-[#94B0A7] border-[#7A9A90]', 'bg-[#5B7F78] border-[#4A6B65]', 'bg-[#C88A4B] border-[#B0753B]']
      }
    : {
        name: 'Cozy Espresso & Amber ☕',
        pageBg: 'bg-[#151413]',
        sidebarBg: 'bg-[#100F0E]/95 border-[#2E2A27]',
        cardBg: 'bg-[#211F1D]/85 border-[#36322E] shadow-xl shadow-black/30',
        innerCardBg: 'bg-[#171514]/90 border-[#2C2825]',
        dockBg: 'bg-[#1E1C1A]/95 border-[#443E38] shadow-2xl shadow-black/80',
        textMain: 'text-[#F5F2EB]',
        textMuted: 'text-[#B5AFA9]',
        divider: 'border-[#332F2B]',
        trackBg: 'bg-[#2C2825]',
        orb1: 'bg-[#D99B52]/15',
        orb2: 'bg-[#5B7F78]/20',
        primaryBtn: 'bg-gradient-to-r from-[#5B7F78] to-[#C88A4B] hover:opacity-95 text-white shadow-lg',
        softBadge: 'bg-[#2D2A26] text-[#E6CBA8] border-[#443F3A]',
        streakBadge,
        doneBadge,
        activeNav: 'bg-[#2D2A26] text-white border-[#5B7F78]/60',
        activeBorder: 'border-[#C88A4B]/50 shadow-xl',
        progressBar: 'bg-gradient-to-r from-[#5B7F78] via-[#84A98C] to-[#E09F5A]',
        accentText: 'text-[#E6B88A]',
        barColor: 'from-[#5B7F78] to-[#E09F5A]',
        timelineLine: 'border-[#383430]',
        selectionCls: 'selection:bg-amber-500/30',
        heatLevels: ['bg-[#262320] border-[#332F2B]', 'bg-[#3F5E57] border-[#527870]', 'bg-[#66968C] border-[#84A98C]', 'bg-[#E09F5A] border-[#F3B978]']
      };
};
`,

  'src/initialData.ts': `import { AppState } from './types';
import { getLocalDateStr, getPastLocalDateStr, getTodayWeekday } from './utils';

const now = Date.now();
const today = getLocalDateStr();
const todayDay = getTodayWeekday();

export const INITIAL_STATE: AppState = {
  version: 4,
  lastUpdatedMs: now,
  members: [
    {
      id: 'mehrsan',
      name: 'Mehrsan',
      tagline: 'Computer Eng • Deep Learning & Web',
      avatar: 'M',
      theme: 'warm-sage',
      statusNote: 'Building steady habits, one focused hour at a time ☕',
      presence: null
    },
    {
      id: 'ronak',
      name: 'Ronak',
      tagline: 'French B2 Journey • English & Uni',
      avatar: 'R',
      theme: 'lavender-blush',
      statusNote: 'Dreaming in French & leveling up every single day 💜✨',
      presence: null
    }
  ],
  schedules: [
    { id: 'm-s1', userId: 'mehrsan', day: 'Saturday', title: 'Principles of Compiler Design', startTime: '08:30', endTime: '10:30', details: 'Prof. Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s2', userId: 'mehrsan', day: 'Saturday', title: 'Special Topics (Deep Learning)', startTime: '10:30', endTime: '12:30', details: 'Prof. Yousefi • Room 1205', category: 'Core', attendedDates: [] },
    { id: 'm-s3', userId: 'mehrsan', day: 'Saturday', title: 'Analytical History of Early Islam', startTime: '14:00', endTime: '16:00', details: 'Prof. Karimi • Room 102', category: 'General', attendedDates: [] },
    { id: 'm-s4', userId: 'mehrsan', day: 'Sunday', title: 'Special Topics (Deep Learning)', startTime: '08:30', endTime: '10:30', details: 'Prof. Yousefi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s5', userId: 'mehrsan', day: 'Sunday', title: 'Principles of Compiler Design', startTime: '14:00', endTime: '16:00', details: 'Prof. Damanafshan • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s6', userId: 'mehrsan', day: 'Monday', title: 'Fundamentals of Info Security', startTime: '12:30', endTime: '14:00', details: 'Prof. Tajbakhsh • Room 101', category: 'Core', attendedDates: [] },
    { id: 'm-s7', userId: 'mehrsan', day: 'Tuesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s8', userId: 'mehrsan', day: 'Tuesday', title: 'Electrical & Electronic Circuits Lab', startTime: '12:30', endTime: '14:00', details: 'Room 210', category: 'Lab', attendedDates: [] },
    { id: 'm-s9', userId: 'mehrsan', day: 'Wednesday', title: 'Fundamentals of Info Security', startTime: '08:30', endTime: '10:30', details: 'Prof. Tajbakhsh • Room 102', category: 'Core', attendedDates: [] },
    { id: 'm-s10', userId: 'mehrsan', day: 'Wednesday', title: 'Web Programming', startTime: '10:30', endTime: '12:30', details: 'Prof. Azimi • Room 102', category: 'Core', attendedDates: [] },

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
    { id: 'm-t1', userId: 'mehrsan', day: todayDay, title: 'Review Compiler Design Lexical Analysis notes', reminderTime: '18:00', completed: false, estimatedMinutes: 45, createdAt: today },
    { id: 'r-t1', userId: 'ronak', day: todayDay, title: 'Watch 1hr English YouTube / Movie', reminderTime: '20:00', completed: false, estimatedMinutes: 60, createdAt: today },
  ],
  exams: [
    { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Damanafshan', type: 'Core' },
    { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Tajbakhsh', type: 'Core' },
    { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Karimi', type: 'General' },
    { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Azimi', type: 'Core' },
    { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Yousefi', type: 'Core' },
  ],
  logs: [
    { id: 'l-1', userId: 'mehrsan', targetTitle: 'Special Topics (Deep Learning)', minutes: 90, date: getPastLocalDateStr(2), createdAtMs: now - 172800000, cheeredBy: ['ronak'] },
    { id: 'l-2', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 120, date: getPastLocalDateStr(2), createdAtMs: now - 170000000, cheeredBy: ['mehrsan'] },
    { id: 'l-3', userId: 'mehrsan', targetTitle: 'Full-Stack Web Dev Projects', minutes: 110, date: getPastLocalDateStr(1), createdAtMs: now - 86400000, cheeredBy: ['ronak'] },
    { id: 'l-4', userId: 'ronak', targetTitle: 'English Immersion (Movies, YouTube & Media)', minutes: 95, date: getPastLocalDateStr(1), createdAtMs: now - 82000000, cheeredBy: ['mehrsan'] },
    { id: 'l-5', userId: 'mehrsan', targetTitle: 'B.Sc. Final Project (3 Credits)', minutes: 60, date: today, createdAtMs: now - 7200000, cheeredBy: ['ronak'] },
    { id: 'l-6', userId: 'ronak', targetTitle: 'Master French up to B2 Level', minutes: 75, date: today, createdAtMs: now - 3600000, cheeredBy: ['mehrsan'] },
  ]
};
`,

  'src/components/ErrorBoundary.tsx': `import React from 'react';
import { INITIAL_STATE } from '../initialData';

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  handleExportRaw = () => {
    const raw = localStorage.getItem('syncpulse_v4') || localStorage.getItem('syncpulse_v3') || '{}';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syncpulse-emergency-backup.json';
    a.click();
  };

  handleSafeReset = () => {
    localStorage.setItem('syncpulse_v4', JSON.stringify(INITIAL_STATE));
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#151413] text-[#F5F2EB] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#211F1D] border border-[#36322E] rounded-3xl p-7 space-y-4">
            <h1 className="font-serif italic text-3xl">Sanctuary Recovery Mode 🌿</h1>
            <p className="text-xs text-[#B5AFA9] leading-relaxed">
              We detected corrupted or incompatible state data ({this.state.errorMsg}). Your data is still in local storage—you can download a backup before resetting.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={this.handleExportRaw}
                className="px-4 py-2.5 rounded-2xl bg-[#2D2A26] border border-[#443F3A] text-xs font-semibold"
              >
                Download Raw Backup (.json)
              </button>
              <button
                onClick={this.handleSafeReset}
                className="px-4 py-2.5 rounded-2xl bg-[#5B7F78] text-white text-xs font-semibold"
              >
                Restore Clean Sanctuary
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
`,

  'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
`,

  'src/App.tsx': `import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Target, Calendar, CheckCircle2, Plus, Trash2, Edit3,
  Play, Pause, RotateCcw, Bell, Sparkles,
  Cloud, Check, X, GraduationCap, HelpCircle,
  Share2, UserPlus, Copy, ChevronRight, ChevronLeft, Heart,
  Sun, Moon, Coffee, CloudRain, VolumeX,
  Compass, Flame, Award, Trophy, Download, Upload
} from 'lucide-react';
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

  // Check clock & trigger task reminders
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
            new Notification(\`🌿 SyncPulse Reminder (\${t.title})\`, {
              body: \`Scheduled for \${t.reminderTime} (+\${t.estimatedMinutes}m)\`
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

  // Persistent Wall-Clock Timer (Never loses time on refresh or phone lock!)
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
              timerMode === 'pomodoro' ? '🍅 25m Focus Complete!' : '☕ Break Complete!',
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

  // Safe Cloud Polling (Only applies remote if newer & user isn't actively typing)
  useEffect(() => {
    if (!syncUrl) return;
    const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v4.json\`;
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
            const cleanUrl = syncUrl.endsWith('.json') ? syncUrl : \`\${syncUrl.replace(/\\/$/, '')}/syncpulse_v4.json\`;
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

  // Prevent self-cheering & multiple cheers per person
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
    if (elapsedMins < 1) return; // Prevents 0s -> 1m XP exploit

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
      1200 // 1.2s debounce while typing
    );
    setTimeout(() => {
      isTypingRef.current = false;
    }, 1500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || state.members.length >= 4) return;
    const id = uid(memberForm.name.trim().toLowerCase().replace(/\\s+/g, '-'));
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

  // Clean cascade delete when removing a companion
  const removeMember = (id: string, name: string) => {
    if (id === 'mehrsan' || id === 'ronak') return;
    if (!window.confirm(\`Remove \${name} and all their goals/logs from the sanctuary?\`)) return;
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
    if (!window.confirm(\`Delete goal "\${goal.title}"?\`)) return;
    commitState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== goal.id) }));
  };

  // Idempotent Class Check-in (Unchecking removes the log so XP cannot be farmed!)
  const toggleClassAttendance = (sched: ScheduleItem) => {
    const attended = sched.attendedDates.includes(todayStr);
    const sourceKey = \`class-\${sched.id}-\${todayStr}\`;
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
              targetTitle: \`Class: \${sched.title}\`,
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
    if (!window.confirm(\`Remove "\${item.title}" from \${item.day} schedule?\`)) return;
    commitState((prev) => ({ ...prev, schedules: prev.schedules.filter((s) => s.id !== item.id) }));
  };

  // Idempotent Task Toggle (Bound to timelineDay + removes log on uncheck)
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
    const sourceKey = \`task-\${task.id}\`;
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
              targetTitle: \`Task: \${task.title}\`,
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
    const sourceKey = \`task-\${task.id}\`;
    commitState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== task.id),
      logs: prev.logs.filter((l) => l.sourceKey !== sourceKey)
    }));
  };

  // JSON Export & Import Backup
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`syncpulse-backup-\${todayStr}.json\`;
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

  // Unified Metrics (Memoized for fast performance)
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

      // Unified total minutes: Goal banked minutes + class/task logs
      const goalMins = state.goals.filter((g) => g.userId === m.id).reduce((a, b) => a + b.loggedMinutes, 0);
      const nonGoalLogMins = mLogs.filter((l) => l.sourceKey).reduce((a, b) => a + b.minutes, 0);
      const totalMins = goalMins + nonGoalLogMins;
      const totalHours = (totalMins / 60).toFixed(1);

      // Local Date Streak
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
        level >= 8 ? 'Grandmaster Luminary 👑' : level >= 5 ? 'Master Scholar ✨' : level >= 3 ? 'Steady Seeker 🌿' : 'Rising Star 🌱';

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
      { id: 'spark', icon: '🌱', name: 'First Spark', desc: 'Logged your first focus session', unlocked: userLogs.length > 0 },
      { id: 'flame', icon: '🔥', name: '3-Day Flame', desc: 'Maintained a 3+ day focus streak', unlocked: activeStats.streak >= 3 },
      { id: 'deep', icon: '⚡', name: 'Deep Diver', desc: 'Completed a 90+ min focus block', unlocked: hasDeepSession },
      { id: 'beloved', icon: '💜', name: 'Warm Spirit', desc: 'Received cheers from companions', unlocked: othersCheeredCount >= 2 },
      { id: 'club10', icon: '🏛️', name: '10-Hour Club', desc: 'Banked over 10 total hours', unlocked: totalHrs >= 10 },
      { id: 'legend50', icon: '👑', name: '50-Hour Legend', desc: 'Banked over 50 total hours', unlocked: totalHrs >= 50 }
    ];
  }, [state.logs, activeUser, activeStats]);

  // Share Handler with Web Share API + Try/Catch Clipboard Fallback
  const generateShareText = () => {
    const topGoals = userGoals
      .slice(0, 3)
      .map((g) => \`• \${g.title}: \${(g.loggedMinutes / 60).toFixed(1)}h / \${g.targetHours}h\`)
      .join('\\n');

    return \`🌿 SyncPulse Cozy Log — \${currentMember.name}\\n🔥 Streak: \${activeStats.streak} Days | ⭐ Lv.\${activeStats.level} (\${activeStats.totalXP} XP)\\n⏱️ Today's Focus: \${Math.floor(activeStats.todayMins / 60)}h \${activeStats.todayMins % 60}m\\n🏆 Total Banked: \${activeStats.totalHours} hrs\\n\\n🎯 Active Goals:\\n\${topGoals}\`;
  };

  const handleShareStatus = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: \`\${currentMember.name}'s SyncPulse\`, text });
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

  // Chronological Visual Daily Timeline with Overlap Detection
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
        subtitle: \`Scheduled Intention • +\${t.estimatedMinutes * 10} XP\`,
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
            id: \`gap-\${cur.id}-\${next.id}\`,
            kind: 'gap',
            title: 'Free Focus Window ✨',
            subtitle: \`Open breathing room before \${next.title}\`,
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
    { id: 'dashboard', label: 'Today’s Flow', icon: Compass, badge: \`\${dailyStream.filter(i => i.kind !== 'gap' && !i.completed).length}\` },
    { id: 'goals', label: 'Goals & Time Bank', icon: Target, badge: \`\${userGoals.length}\` },
    { id: 'schedule', label: 'Weekly Classes', icon: Calendar },
    { id: 'analytics', label: 'Heatmaps & Badges', icon: Trophy, badge: \`\${activeBadges.filter(b => b.unlocked).length}/6\` },
  ];

  const elapsedSecForLog = getElapsedTimerSeconds();
  const canLogSession = elapsedSecForLog >= 60;

  return (
    <div className={\`min-h-screen flex flex-col lg:flex-row relative cozy-transition paper-grain \${theme.pageBg} \${theme.textMain} \${theme.selectionCls}\`}>
      {/* Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={\`cozy-orb absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[110px] cozy-transition \${theme.orb1}\`} />
        <div className={\`cozy-orb absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full blur-[120px] cozy-transition \${theme.orb2}\`} style={{ animationDelay: '-5s' }} />
      </div>

      {/* MOBILE COMPACT TOP BAR */}
      <div className={\`lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b backdrop-blur-xl \${theme.sidebarBg}\`}>
        <div className="flex items-center gap-2">
          <div className={\`w-7 h-7 rounded-xl flex items-center justify-center \${theme.primaryBtn}\`}>
            {currentMember.theme === 'lavender-blush' ? <Heart className="w-3.5 h-3.5 text-white" /> : <Coffee className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="font-serif italic text-xl">SyncPulse</span>
        </div>

        {/* Mobile Companion Quick Pills */}
        <div className="flex items-center gap-1.5">
          {state.members.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveUser(m.id)}
              aria-label={\`Switch to \${m.name}\`}
              className={\`px-2.5 py-1 rounded-xl text-xs font-semibold border transition \${
                m.id === activeUser ? theme.primaryBtn : \`\${theme.cardBg} \${theme.textMuted}\`
              }\`}
            >
              {m.name}
            </button>
          ))}
          <button
            onClick={() => setIsLatteMode(!isLatteMode)}
            aria-label="Toggle Day/Night Mode"
            className={\`p-1.5 rounded-xl border \${theme.cardBg}\`}
          >
            {isLatteMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* DESKTOP LEFT SIDEBAR */}
      <aside className={\`hidden lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex lg:flex-col border-r backdrop-blur-2xl z-30 p-5 justify-between overflow-y-auto cozy-transition \${theme.sidebarBg}\`}>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-2xl flex items-center justify-center cozy-transition \${theme.primaryBtn}\`}>
              {currentMember.theme === 'lavender-blush' ? (
                <Heart className="w-5 h-5 text-white fill-white/25" />
              ) : (
                <Coffee className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-serif italic text-2xl leading-none">SyncPulse</h1>
              <span className={\`text-xs font-mono \${theme.textMuted}\`}>Cozy Sanctuary v4</span>
            </div>
          </div>

          {/* Squad Companions Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={\`text-xs font-mono uppercase tracking-wider \${theme.textMuted}\`}>
                Companions ({state.members.length}/4)
              </span>
              {state.members.length < 4 && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className={\`text-xs font-semibold flex items-center gap-1 hover:underline \${theme.accentText}\`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
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
                    className={\`w-full text-left cursor-pointer rounded-2xl p-2.5 border transition-all flex items-center justify-between group \${
                      isSelected
                        ? \`\${mStyle.activeNav} shadow-sm\`
                        : 'border-transparent hover:bg-black/5 opacity-80 hover:opacity-100'
                    }\`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={\`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 relative \${mStyle.softBadge}\`}>
                        {member.avatar}
                        {member.presence?.isFocusing && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black absolute -bottom-0.5 -right-0.5" title="Focusing Live!" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold flex items-center gap-1 truncate">
                          {member.name}
                          {member.id === 'ronak' && <span>💜</span>}
                        </p>
                        <p className={\`text-xs font-mono \${theme.textMuted}\`}>
                          {Math.floor(mStat.todayMins / 60)}h {mStat.todayMins % 60}m today
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={\`text-xs font-mono px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 \${theme.streakBadge}\`} title="Active Streak">
                        🔥{mStat.streak}
                      </span>
                      {member.id !== 'mehrsan' && member.id !== 'ronak' && (
                        <button
                          type="button"
                          aria-label={\`Remove \${member.name}\`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member.id, member.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="space-y-1" aria-label="Main Navigation">
            <span className={\`px-1 text-xs font-mono uppercase tracking-wider block mb-1.5 \${theme.textMuted}\`}>
              Workspace Views
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={\`w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between border transition-all \${
                    active ? theme.activeNav : \`border-transparent \${theme.textMuted} hover:opacity-100\`
                  }\`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${theme.softBadge}\`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cozy Soundscape Widget */}
          <div className={\`p-3.5 rounded-2xl border space-y-2.5 \${theme.innerCardBg}\`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5" /> Cozy Ambience
              </span>
              {ambientMode !== 'off' && (
                <button
                  onClick={() => setAmbientMode('off')}
                  aria-label="Mute Ambient Audio"
                  className="text-xs font-mono text-rose-400 flex items-center gap-0.5"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Mute
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setAmbientMode(ambientMode === 'rain' ? 'off' : 'rain')}
                className={\`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition \${
                  ambientMode === 'rain' ? theme.primaryBtn : \`\${theme.cardBg} \${theme.textMuted}\`
                }\`}
              >
                🌧️ Soft Rain
              </button>
              <button
                onClick={() => setAmbientMode(ambientMode === 'tone' ? 'off' : 'tone')}
                className={\`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition \${
                  ambientMode === 'tone' ? theme.primaryBtn : \`\${theme.cardBg} \${theme.textMuted}\`
                }\`}
              >
                ✨ Warm Tone
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className={\`pt-4 border-t \${theme.divider} space-y-2\`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLatteMode(!isLatteMode)}
              className={\`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 \${theme.cardBg}\`}
            >
              {isLatteMode ? <Moon className="w-3.5 h-3.5 text-purple-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {isLatteMode ? 'Night' : 'Latte'}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className={\`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 \${theme.primaryBtn}\`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <button
              onClick={() => setShowSyncModal(true)}
              className={\`flex items-center gap-1.5 \${theme.textMuted} hover:underline\`}
            >
              <Cloud className={\`w-3.5 h-3.5 \${syncUrl ? 'text-emerald-500' : ''}\`} />
              {syncUrl ? 'Sync & Backup' : 'Backup / Sync'}
            </button>
            <button
              onClick={() => setShowTutorial(true)}
              className={\`flex items-center gap-1 \${theme.textMuted} hover:underline\`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Guide
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT AREA */}
      <div className="flex-1 min-w-0 relative z-10 pb-36">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
          {/* Live Companion Presence Alert if someone is focusing */}
          {state.members.some((m) => m.presence?.isFocusing) && (
            <div className={\`px-4 py-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs \${theme.doneBadge}\`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {state.members
                    .filter((m) => m.presence?.isFocusing)
                    .map((m) => \`\${m.name} is focusing on "\${m.presence?.targetTitle}"\`)
                    .join(' • ')}
                </span>
              </div>
              <span className="font-mono text-xs">Co-Op Live ✨</span>
            </div>
          )}

          {/* Header Banner: Full on Dashboard, Compact on other tabs */}
          {activeTab === 'dashboard' ? (
            <section className={\`p-5 sm:p-6 rounded-3xl border backdrop-blur-md space-y-4 cozy-transition \${theme.cardBg}\`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={\`text-xs font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 \${theme.streakBadge}\`}>
                      🔥 {activeStats.streak} Day Streak
                    </span>
                    <span className={\`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border \${theme.softBadge}\`}>
                      Lv.{activeStats.level} • {activeStats.title}
                    </span>
                    {nextUpcomingItem && (
                      <span className={\`text-xs font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1 \${theme.innerCardBg}\`}>
                        <Sparkles className="w-3.5 h-3.5" />
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
                    className={\`text-xs bg-transparent border-b border-transparent focus:border-current focus:outline-none w-full max-w-md italic \${theme.textMuted}\`}
                  />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className={\`px-4 py-2.5 rounded-2xl border text-right \${theme.innerCardBg}\`}>
                    <span className={\`text-xs font-mono uppercase block \${theme.textMuted}\`}>Today</span>
                    <span className={\`font-mono font-bold text-lg sm:text-xl \${theme.accentText}\`}>
                      {Math.floor(activeStats.todayMins / 60)}h {activeStats.todayMins % 60}m
                    </span>
                  </div>
                  <div className={\`px-4 py-2.5 rounded-2xl border text-right \${theme.innerCardBg}\`}>
                    <span className={\`text-xs font-mono uppercase block \${theme.textMuted}\`}>Total Banked</span>
                    <span className="font-mono font-bold text-lg sm:text-xl">
                      {activeStats.totalHours}h
                    </span>
                  </div>
                </div>
              </div>

              {/* RPG XP Progress Bar */}
              <div className={\`pt-3 border-t \${theme.divider}\`}>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Trophy className={\`w-3.5 h-3.5 \${theme.accentText}\`} />
                    <span>Experience: <b>{activeStats.totalXP.toLocaleString()} XP</b></span>
                  </span>
                  <span className={theme.textMuted}>
                    {activeStats.currentLevelXP} / {activeStats.xpPerLevel} XP to Lv.{activeStats.level + 1} ({activeStats.progressPct}%)
                  </span>
                </div>
                <div className={\`w-full h-2 rounded-full overflow-hidden \${theme.trackBg}\`}>
                  <div
                    className={\`h-full rounded-full transition-all duration-500 \${theme.progressBar}\`}
                    style={{ width: \`\${activeStats.progressPct}%\` }}
                  />
                </div>
              </div>
            </section>
          ) : (
            <div className={\`px-5 py-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 \${theme.cardBg}\`}>
              <div className="flex items-center gap-2.5">
                <span className={\`w-7 h-7 rounded-xl font-serif italic text-base flex items-center justify-center border \${theme.softBadge}\`}>
                  {currentMember.avatar}
                </span>
                <span className="font-bold text-sm">{currentMember.name}</span>
                <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${theme.streakBadge}\`}>
                  🔥 {activeStats.streak}d
                </span>
                <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${theme.softBadge}\`}>
                  Lv.{activeStats.level} ({activeStats.totalHours}h)
                </span>
              </div>
              <button
                onClick={() => setShowSyncModal(true)}
                className={\`text-xs font-mono flex items-center gap-1.5 \${theme.textMuted} hover:underline\`}
              >
                <Download className="w-3.5 h-3.5" /> Backup / Sync
              </button>
            </div>
          )}

          {/* VIEW 1: TODAY'S FLOW (VISUAL DAILY TIMELINE + LIVE SQUAD FEED) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Structured-Style Visual Daily Timeline */}
              <div className="lg:col-span-7 space-y-6">
                <div className={\`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-serif italic text-2xl flex items-center gap-2">
                        <Compass className={\`w-5 h-5 \${theme.accentText}\`} />
                        Visual Daily Timeline ({timelineDay})
                      </h3>
                      <p className={\`text-xs \${theme.textMuted}\`}>
                        Classes, tasks for {timelineDay}, and free focus windows
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setScheduleForm({ ...scheduleForm, day: timelineDay });
                        setScheduleError('');
                        setShowScheduleModal(true);
                      }}
                      className={\`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1 border \${theme.softBadge}\`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Class
                    </button>
                  </div>

                  {/* Day Switcher */}
                  <div className={\`flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b \${theme.divider}\`}>
                    {DAYS.map((d) => {
                      const isToday = d === realTodayName;
                      const active = d === timelineDay;
                      return (
                        <button
                          key={d}
                          onClick={() => setTimelineDay(d)}
                          className={\`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 shrink-0 \${
                            active ? theme.primaryBtn : \`\${theme.innerCardBg} \${theme.textMuted}\`
                          }\`}
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
                      placeholder={\`Plot task on \${timelineDay} (e.g., Practice French)...\`}
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className={\`flex-1 min-w-[160px] border rounded-2xl px-3.5 py-2 text-xs focus:outline-none \${theme.innerCardBg}\`}
                    />
                    <label htmlFor="new-task-time" className="sr-only">Task time</label>
                    <input
                      id="new-task-time"
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className={\`border rounded-2xl px-2.5 py-2 text-xs font-mono \${theme.innerCardBg}\`}
                    />
                    <label htmlFor="new-task-mins" className="sr-only">Task duration</label>
                    <select
                      id="new-task-mins"
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className={\`border rounded-2xl px-2 py-2 text-xs font-mono \${theme.innerCardBg}\`}
                    >
                      <option value={15}>15m</option>
                      <option value={30}>30m</option>
                      <option value={45}>45m</option>
                      <option value={60}>1h</option>
                      <option value={90}>1.5h</option>
                    </select>
                    <button
                      type="submit"
                      className={\`px-4 py-2 rounded-2xl font-semibold text-xs \${theme.primaryBtn}\`}
                    >
                      + Plot
                    </button>
                  </form>

                  {/* Timeline Stream */}
                  {dailyStream.length === 0 ? (
                    <div className={\`p-8 rounded-2xl border text-center space-y-2 \${theme.innerCardBg}\`}>
                      <p className="font-serif italic text-xl">An open, unhurried {timelineDay} ✨</p>
                      <p className={\`text-xs \${theme.textMuted}\`}>
                        No fixed classes or tasks plotted for {timelineDay}. Plot a task above or launch the focus timer!
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-2 sm:pl-4 space-y-4">
                      <div className={\`absolute top-3 bottom-3 left-[68px] sm:left-[80px] border-l-2 border-dashed \${theme.timelineLine}\`} />

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
                              ? \`in \${Math.floor(minsUntilStart / 60)}h \${minsUntilStart % 60}m\`
                              : \`in \${minsUntilStart}m\`
                            : '';

                        if (entry.kind === 'gap') {
                          return (
                            <div key={entry.id} className="relative flex items-center gap-3 sm:gap-4">
                              <div className={\`w-14 text-right font-mono text-xs shrink-0 \${theme.textMuted}\`}>
                                {entry.startTime}
                              </div>
                              <div className={\`w-3.5 h-3.5 rounded-full border-2 z-10 shrink-0 \${theme.pageBg} \${theme.timelineLine}\`} />
                              <div className={\`flex-1 px-4 py-2.5 rounded-2xl border border-dashed flex flex-wrap items-center justify-between gap-2 text-xs \${theme.innerCardBg}\`}>
                                <span className="font-medium flex items-center gap-1.5">
                                  <Sparkles className={\`w-3.5 h-3.5 \${theme.accentText}\`} />
                                  {entry.title} ({Math.floor(entry.durationMins / 60) > 0 ? \`\${Math.floor(entry.durationMins / 60)}h \` : ''}{entry.durationMins % 60}m)
                                </span>
                                <button
                                  onClick={() => {
                                    resetTimer('pomodoro');
                                    setTimerStartedAtMs(Date.now());
                                    setIsTimerRunning(true);
                                    updatePresence(true);
                                  }}
                                  className={\`text-xs font-mono px-2.5 py-1 rounded-xl border flex items-center gap-1 \${theme.softBadge}\`}
                                >
                                  <Play className="w-3 h-3" /> Start 25m
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={entry.id} className="relative flex items-start gap-3 sm:gap-4">
                            <div className="w-14 text-right font-mono shrink-0 pt-2">
                              <span className="text-xs font-bold block">{entry.startTime}</span>
                              <span className={\`text-xs block \${theme.textMuted}\`}>{entry.endTime}</span>
                            </div>

                            <button
                              aria-label={\`Mark \${entry.title} as completed\`}
                              onClick={() => {
                                if (entry.kind === 'class' && entry.rawClass) toggleClassAttendance(entry.rawClass);
                                else if (entry.kind === 'task' && entry.rawTask) toggleTask(entry.rawTask);
                              }}
                              className={\`mt-2.5 w-4 h-4 rounded-full border-2 z-10 shrink-0 flex items-center justify-center transition \${
                                entry.completed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : isHappeningNow
                                  ? 'bg-amber-400 border-amber-300 animate-ping'
                                  : \`\${theme.pageBg} border-current\`
                              }\`}
                            >
                              {entry.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            <div
                              className={\`flex-1 p-4 rounded-2xl border transition-all \${
                                isHappeningNow
                                  ? \`\${theme.cardBg} \${theme.activeBorder}\`
                                  : entry.completed
                                  ? \`\${theme.innerCardBg} opacity-65\`
                                  : theme.innerCardBg
                              }\`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${theme.softBadge}\`}>
                                    {entry.kind === 'class' ? \`🎓 \${entry.badge}\` : '✨ Intention'}
                                  </span>
                                  {entry.overlaps && (
                                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40">
                                      ⚠️ Time Overlap
                                    </span>
                                  )}
                                  {isHappeningNow && (
                                    <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border font-bold \${theme.streakBadge}\`}>
                                      ● Now
                                    </span>
                                  )}
                                  {isNextUp && countdownLabel && (
                                    <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${theme.softBadge}\`}>
                                      ⏳ {countdownLabel}
                                    </span>
                                  )}
                                </div>
                                <span className={\`text-xs font-mono \${theme.textMuted}\`}>
                                  +{entry.durationMins * 10} XP
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div>
                                  <h4 className={\`font-semibold text-sm \${entry.completed ? 'line-through' : ''}\`}>
                                    {entry.title}
                                  </h4>
                                  <p className={\`text-xs mt-0.5 \${theme.textMuted}\`}>{entry.subtitle}</p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      if (entry.kind === 'class' && entry.rawClass) toggleClassAttendance(entry.rawClass);
                                      else if (entry.kind === 'task' && entry.rawTask) toggleTask(entry.rawTask);
                                    }}
                                    className={\`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition \${
                                      entry.completed ? theme.doneBadge : theme.cardBg
                                    }\`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {entry.completed ? 'Done' : \`+\${entry.durationMins}m\`}
                                  </button>
                                  {entry.kind === 'task' && entry.rawTask && (
                                    <button
                                      aria-label={\`Delete \${entry.title}\`}
                                      onClick={() => deleteTask(entry.rawTask!)}
                                      className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
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
                <div className={\`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Heart className={\`w-5 h-5 \${theme.accentText}\`} />
                      Shared Squad Feed
                    </h3>
                    <span className={\`text-xs font-mono px-2.5 py-0.5 rounded-full border \${theme.softBadge}\`}>
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
                          className={\`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs \${theme.innerCardBg}\`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={\`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border shrink-0 \${mStyle.softBadge}\`}>
                              {logMember.avatar}
                            </span>
                            <div className="truncate">
                              <p className="font-medium truncate">
                                <span className="font-bold">{logMember.name}</span> • {log.targetTitle}
                              </p>
                              <span className={\`text-xs font-mono \${theme.textMuted}\`}>
                                {formatRelativeTime(log.createdAtMs, log.date)} (+{log.minutes}m)
                              </span>
                            </div>
                          </div>

                          <button
                            disabled={isOwnLog}
                            onClick={() => toggleCheerLog(log.id)}
                            aria-label={isOwnLog ? 'Your activity log' : 'Cheer companion'}
                            title={isOwnLog ? 'Companions can cheer your log!' : 'Send a warm cheer 💜'}
                            className={\`px-2.5 py-1 rounded-xl border text-xs font-mono flex items-center gap-1 transition shrink-0 \${
                              hasCheered ? theme.primaryBtn : mStyle.softBadge
                            } \${isOwnLog ? 'opacity-70 cursor-default' : 'hover:scale-105'}\`}
                          >
                            <span>💜</span>
                            <span>{log.cheeredBy.length}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* University Exam Dates */}
                <div className={\`rounded-3xl p-5 sm:p-6 border backdrop-blur-md cozy-transition \${theme.cardBg}\`}>
                  <h3 className="font-serif italic text-2xl flex items-center gap-2 mb-3">
                    <GraduationCap className={\`w-5 h-5 \${theme.accentText}\`} />
                    University Exams (1405)
                  </h3>
                  <div className="space-y-2.5">
                    {state.exams.map((ex) => (
                      <div
                        key={ex.id}
                        className={\`p-3.5 rounded-2xl border flex items-center justify-between text-xs \${theme.innerCardBg}\`}
                      >
                        <div>
                          <span className="font-semibold block">{ex.title}</span>
                          <span className={\`text-xs \${theme.textMuted}\`}>Prof. {ex.professor}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={\`font-bold block \${theme.accentText}\`}>{ex.date}</span>
                          <span className={\`text-xs \${theme.textMuted}\`}>⏰ {ex.time}</span>
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
              <div className={\`flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl border \${theme.cardBg}\`}>
                <div>
                  <h3 className="font-serif italic text-2xl">Shared Dreams & Time Bank</h3>
                  <p className={\`text-xs \${theme.textMuted}\`}>
                    Log quick study blocks (+15m, +30m, +1h) or customize short & long-term goals.
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
                  const mStat = memberMetrics[member.id];
                  return (
                    <div key={member.id} className={\`rounded-3xl p-6 border space-y-4 \${theme.cardBg}\`}>
                      <div className={\`flex items-center justify-between border-b pb-3 \${theme.divider}\`}>
                        <h4 className="font-serif italic text-2xl flex items-center gap-2">
                          <span className={\`w-7 h-7 rounded-xl text-sm flex items-center justify-center border \${mStyle.softBadge}\`}>
                            {member.avatar}
                          </span>
                          {member.name}'s Goals
                        </h4>
                        <span className={\`text-xs font-mono \${theme.textMuted}\`}>
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
                            <div key={g.id} className={\`p-4 rounded-2xl border space-y-2.5 \${theme.innerCardBg}\`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className={\`text-xs font-mono uppercase px-2 py-0.5 rounded-full border \${mStyle.softBadge}\`}>
                                    {g.category}
                                  </span>
                                  <h5 className="font-semibold text-sm mt-1">{g.title}</h5>
                                  <p className={\`text-xs font-mono \${theme.textMuted}\`}>
                                    Horizon: {g.deadline}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    aria-label={\`Edit \${g.title}\`}
                                    onClick={() => openEditGoal(g)}
                                    className="p-1.5 opacity-60 hover:opacity-100"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    aria-label={\`Delete \${g.title}\`}
                                    onClick={() => deleteGoal(g)}
                                    className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-xs font-mono pt-1">
                                <span>{hrs}h / {safeTarget}h ({pct}%)</span>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 15)}
                                    className={\`px-2 py-1 rounded-lg border \${theme.cardBg}\`}
                                  >
                                    +15m
                                  </button>
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 30)}
                                    className={\`px-2 py-1 rounded-lg border \${theme.cardBg}\`}
                                  >
                                    +30m
                                  </button>
                                  <button
                                    onClick={() => logGoalMinutes(member.id, g.id, g.title, 60)}
                                    className={\`px-2 py-1 rounded-lg border font-bold \${mStyle.softBadge}\`}
                                  >
                                    +1h
                                  </button>
                                </div>
                              </div>

                              <div className={\`w-full h-2.5 rounded-full overflow-hidden \${theme.trackBg}\`}>
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

          {/* VIEW 3: WEEKLY SCHEDULE */}
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
                    setScheduleError('');
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
                          A free, unhurried {selectedDay} ☕
                        </p>
                      ) : (
                        dayItems.map((item) => {
                          const attendedToday = item.attendedDates.includes(todayStr);
                          const isSelectedDayToday = selectedDay === realTodayName;
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
                                  <span className={\`text-xs font-mono px-2 py-0.5 rounded-full border \${mStyle.softBadge}\`}>
                                    {item.category}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-sm mt-1">{item.title}</h5>
                                <p className={\`text-xs \${theme.textMuted}\`}>{item.details}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isSelectedDayToday && (
                                  <button
                                    onClick={() => toggleClassAttendance(item)}
                                    className={\`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition \${
                                      attendedToday ? theme.doneBadge : theme.cardBg
                                    }\`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {attendedToday ? 'Attended' : 'Check-in'}
                                  </button>
                                )}
                                <button
                                  aria-label={\`Delete \${item.title}\`}
                                  onClick={() => deleteScheduleItem(item)}
                                  className="p-1.5 opacity-60 hover:text-rose-400 hover:opacity-100"
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

          {/* VIEW 4: HEATMAPS, BADGES & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.members.map((member) => {
                  const mStyle = GET_COZY_THEME(member.theme, isLatteMode);
                  const mStat = memberMetrics[member.id];
                  return (
                    <div key={member.id} className={\`rounded-3xl p-6 border space-y-4 \${theme.cardBg}\`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={\`w-8 h-8 rounded-xl font-serif italic text-base flex items-center justify-center border \${mStyle.softBadge}\`}>
                            {member.avatar}
                          </span>
                          <div>
                            <h4 className="font-serif italic text-2xl leading-none">
                              {member.name}'s 28-Day Heatmap
                            </h4>
                            <span className={\`text-xs font-mono \${theme.textMuted}\`}>
                              Tap any square to inspect minutes
                            </span>
                          </div>
                        </div>
                        <span className={\`text-xs font-mono px-2.5 py-1 rounded-full border font-bold \${theme.streakBadge}\`}>
                          🔥 {mStat.streak}d
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-2 pt-1">
                        {mStat.grid28.map((cell) => (
                          <button
                            key={cell.dateStr}
                            type="button"
                            onClick={() => setSelectedHeatCell({ date: cell.prettyDate, mins: cell.mins, member: member.name })}
                            aria-label={\`\${member.name} on \${cell.prettyDate}: \${cell.mins} minutes\`}
                            className={\`h-8 rounded-xl border transition-all flex items-center justify-center text-[10px] font-mono \${mStyle.heatLevels[cell.level]}\`}
                          >
                            {cell.mins > 0 ? \`\${cell.mins}m\` : ''}
                          </button>
                        ))}
                      </div>

                      {selectedHeatCell && selectedHeatCell.member === member.name && (
                        <div className={\`text-xs font-mono px-3 py-1.5 rounded-xl border flex justify-between \${theme.innerCardBg}\`}>
                          <span>📅 {selectedHeatCell.date}</span>
                          <span className="font-bold">{selectedHeatCell.mins} minutes logged</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Badges */}
              <div className={\`rounded-3xl p-6 border \${theme.cardBg}\`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif italic text-2xl flex items-center gap-2">
                      <Award className={\`w-5 h-5 \${theme.accentText}\`} />
                      {currentMember.name}'s Sanctuary Badges
                    </h3>
                  </div>
                  <span className={\`text-xs font-mono px-3 py-1 rounded-full border \${theme.softBadge}\`}>
                    {activeBadges.filter((b) => b.unlocked).length} / {activeBadges.length} Unlocked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBadges.map((b) => (
                    <div
                      key={b.id}
                      className={\`p-4 rounded-2xl border flex items-center gap-3.5 transition-all \${
                        b.unlocked ? \`\${theme.innerCardBg} \${theme.activeBorder}\` : \`\${theme.innerCardBg} opacity-45 grayscale\`
                      }\`}
                    >
                      <div className="text-2xl w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
                        {b.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs sm:text-sm">{b.name}</h5>
                          {b.unlocked && <span className="text-xs font-mono text-emerald-500">✓</span>}
                        </div>
                        <p className={\`text-xs \${theme.textMuted}\`}>{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Chart */}
              <div className={\`rounded-3xl p-6 border \${theme.cardBg}\`}>
                <h3 className="font-serif italic text-2xl mb-4">7-Day Consistency Rhythm (Minutes)</h3>
                <div className={\`grid grid-cols-7 gap-3 items-end h-56 pt-6 px-2 border-b \${theme.divider}\`}>
                  {last7Days.map((d) => (
                    <div key={d.dateStr} className="flex flex-col items-center h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-44">
                        {d.memberTotals.map((mt) => {
                          const hPct = Math.round((mt.mins / maxChartMins) * 100);
                          const barGrad = GET_COZY_THEME(mt.member.theme, isLatteMode).barColor;
                          return (
                            <div
                              key={mt.member.id}
                              title={\`\${mt.member.name}: \${mt.mins}m\`}
                              className={\`w-4 sm:w-6 bg-gradient-to-t \${barGrad} rounded-t-xl transition-all duration-500 flex items-start justify-center\`}
                              style={{ height: \`\${Math.max(10, hPct)}%\` }}
                            >
                              {mt.mins > 0 && (
                                <span className="text-[10px] font-mono -mt-5">{mt.mins}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <span className={\`text-xs font-mono mt-2 \${theme.textMuted}\`}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* COMPACT FLOATING FOCUS DOCK */}
        <div className="fixed bottom-16 lg:bottom-4 left-0 right-0 lg:left-72 z-30 px-3 sm:px-4 pointer-events-none">
          <div className={\`max-w-2xl mx-auto rounded-3xl p-2.5 sm:px-4 border backdrop-blur-2xl pointer-events-auto flex items-center justify-between gap-2 cozy-transition \${theme.dockBg}\`}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button
                onClick={() =>
                  resetTimer(
                    timerMode === 'stopwatch' ? 'pomodoro' : timerMode === 'pomodoro' ? 'break' : 'stopwatch'
                  )
                }
                className={\`px-2.5 py-1.5 rounded-xl text-xs font-mono border shrink-0 transition \${theme.softBadge}\`}
                title="Switch Timer Mode (Stopwatch / 25m Focus / 5m Break)"
              >
                {timerMode === 'pomodoro' ? '🍅 25m' : timerMode === 'break' ? '☕ 5m' : '⏱️ Free'}
              </button>
              <label htmlFor="dock-goal-select" className="sr-only">Select Goal</label>
              <select
                id="dock-goal-select"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className={\`w-full border rounded-xl px-2.5 py-1.5 text-xs focus:outline-none truncate \${theme.innerCardBg}\`}
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
                className={\`px-3.5 py-2 rounded-2xl font-semibold text-xs flex items-center gap-1 transition \${theme.primaryBtn}\`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isTimerRunning ? 'Pause' : 'Start'}</span>
              </button>
              {timerMode !== 'break' && (
                <button
                  onClick={handleSaveTimerSession}
                  disabled={!canLogSession}
                  title={canLogSession ? 'Log elapsed minutes' : 'Focus at least 1 minute to log'}
                  className={\`px-3 py-2 rounded-2xl font-semibold text-xs border flex items-center gap-1 transition disabled:opacity-40 \${theme.softBadge}\`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log</span>
                </button>
              )}
              <button
                onClick={() => resetTimer()}
                aria-label="Reset Timer"
                className={\`p-2 rounded-xl border \${theme.innerCardBg}\`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE THUMB-FRIENDLY BOTTOM NAVIGATION BAR */}
        <nav
          aria-label="Mobile Navigation"
          className={\`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-2xl grid grid-cols-4 px-2 py-1.5 \${theme.sidebarBg}\`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={\`flex flex-col items-center justify-center py-1 rounded-xl text-xs font-medium \${
                  active ? theme.accentText : theme.textMuted
                }\`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[11px]">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BACKUP & CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Data Backup & Cloud Sync</h3>
              <button aria-label="Close modal" onClick={() => setShowSyncModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={\`p-4 rounded-2xl border space-y-2.5 \${theme.innerCardBg}\`}>
              <p className="text-xs font-semibold">Local JSON Backup (Safe & Offline)</p>
              <div className="flex gap-2">
                <button
                  onClick={handleExportJSON}
                  className={\`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 \${theme.primaryBtn}\`}
                >
                  <Download className="w-3.5 h-3.5" /> Export Backup
                </button>
                <label className={\`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer \${theme.cardBg}\`}>
                  <Upload className="w-3.5 h-3.5" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sync-url-input" className={\`block text-xs \${theme.textMuted}\`}>
                Optional Real-Time REST Database URL (Firebase / Custom JSON Endpoint)
              </label>
              <input
                id="sync-url-input"
                type="url"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                placeholder="https://your-project-default-rtdb.firebaseio.com/"
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
              />
              {syncError && <p className="text-xs text-amber-400">{syncError}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('syncpulse_cloud_url', syncUrl.trim());
                  setShowSyncModal(false);
                }}
                className={\`px-5 py-2.5 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}
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
          <div className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Share {currentMember.name}'s Snapshot</h3>
              <button aria-label="Close modal" onClick={() => setShowShareModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className={\`p-4 rounded-2xl border text-xs font-mono whitespace-pre-wrap leading-relaxed \${theme.innerCardBg}\`}>
              {generateShareText()}
            </pre>

            <button
              onClick={handleShareStatus}
              className={\`w-full py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 \${theme.primaryBtn}\`}
            >
              <Copy className="w-4 h-4" />
              {copiedShare ? 'Copied to Clipboard! ✨' : 'Share / Copy Status Text'}
            </button>
          </div>
        </div>
      )}

      {/* ADD COMPANION MODAL */}
      {showMemberModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleAddMember} className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Invite Companion ({state.members.length}/4)</h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowMemberModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="member-name" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Name</label>
              <input
                id="member-name"
                type="text"
                required
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div>
              <label htmlFor="member-tagline" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Focus / Tagline</label>
              <input
                id="member-tagline"
                type="text"
                value={memberForm.tagline}
                onChange={(e) => setMemberForm({ ...memberForm, tagline: e.target.value })}
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div>
              <label htmlFor="member-theme" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Cozy Palette</label>
              <select
                id="member-theme"
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveGoal} className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">
                {editingGoal ? 'Edit Goal' : \`New Goal for \${currentMember.name}\`}
              </h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowGoalModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="goal-title" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Goal Title</label>
              <input
                id="goal-title"
                type="text"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="goal-cat" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Category</label>
                <select
                  id="goal-cat"
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
                <label htmlFor="goal-hrs" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Target Hours (Min 1)</label>
                <input
                  id="goal-hrs"
                  type="number"
                  min={1}
                  required
                  value={goalForm.targetHours}
                  onChange={(e) => setGoalForm({ ...goalForm, targetHours: Math.max(1, Number(e.target.value)) })}
                  className={\`w-full border rounded-2xl px-3 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal-deadline" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Horizon / Deadline</label>
              <input
                id="goal-deadline"
                type="text"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
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
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={saveScheduleItem} className={\`border rounded-3xl max-w-md w-full p-6 space-y-4 \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-2xl">Add Class ({currentMember.name})</h3>
              <button type="button" aria-label="Close modal" onClick={() => setShowScheduleModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label htmlFor="sched-title" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Title</label>
              <input
                id="sched-title"
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                className={\`w-full border rounded-2xl px-3.5 py-2.5 text-xs \${theme.innerCardBg}\`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="sched-day" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Day</label>
                <select
                  id="sched-day"
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
                <label htmlFor="sched-start" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Start</label>
                <input
                  id="sched-start"
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className={\`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
              <div>
                <label htmlFor="sched-end" className={\`block text-xs mb-1 \${theme.textMuted}\`}>End</label>
                <input
                  id="sched-end"
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className={\`w-full border rounded-2xl px-2.5 py-2.5 text-xs font-mono \${theme.innerCardBg}\`}
                />
              </div>
            </div>

            {scheduleError && <p className="text-xs text-rose-400">{scheduleError}</p>}

            <div>
              <label htmlFor="sched-details" className={\`block text-xs mb-1 \${theme.textMuted}\`}>Details</label>
              <input
                id="sched-details"
                type="text"
                value={scheduleForm.details}
                onChange={(e) => setScheduleForm({ ...scheduleForm, details: e.target.value })}
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

      {/* QUICK GUIDE MODAL */}
      {showTutorial && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={\`border rounded-3xl max-w-lg w-full p-7 space-y-4 shadow-2xl \${theme.pageBg} \${theme.activeBorder}\`}>
            <div className="flex items-center justify-between">
              <span className={\`text-xs font-mono px-3 py-1 rounded-full border \${theme.softBadge}\`}>
                SyncPulse v4.0 Guide
              </span>
              <button aria-label="Close guide" onClick={() => setShowTutorial(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-serif italic text-3xl">Your Cozy Co-Op Sanctuary ✨</h3>
            <ul className={\`text-xs space-y-2 leading-relaxed \${theme.textMuted}\`}>
              <li>• <b>Visual Timeline:</b> Plots your classes and tasks for the selected day and highlights Free Focus Windows.</li>
              <li>• <b>Persistent Timer:</b> Runs accurately even if you refresh the page or lock your phone. Supports Stopwatch, 25m Pomodoro, and 5m Breaks.</li>
              <li>• <b>Fair XP & Streaks:</b> Every minute logged earns +10 XP. Unchecking a task cleanly reverses its XP.</li>
              <li>• <b>Backup & PWA:</b> Export/Import JSON backups anytime, or install SyncPulse as an app from your browser menu!</li>
            </ul>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowTutorial(false)} className={\`px-5 py-2.5 rounded-2xl text-xs font-semibold \${theme.primaryBtn}\`}>
                Got It ✨
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
  console.log('✅ Generated:', filePath);
}

console.log('\n🎉 SyncPulse v4.0 (Full Audit Fix + Modular Code + PWA + JSON Backup) is ready!');