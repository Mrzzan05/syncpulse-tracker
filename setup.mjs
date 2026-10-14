// setup.mjs - SyncPulse v7.0 (Modular Domain Architecture + CSS Variables + Experience-Driven UX)
// Run with: node setup.mjs
import fs from 'fs';
import path from 'path';

const files = {
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-page: #161514;
  --bg-sidebar: #121110;
  --bg-surface: #1e1c1a;
  --bg-elevated: #252220;
  --text-main: #f2efe9;
  --text-muted: #9c968e;
  --border-subtle: rgba(255, 255, 255, 0.07);
  --track-bg: rgba(255, 255, 255, 0.07);
  --accent: #6b948b;
  --accent-soft: rgba(107, 148, 139, 0.16);
  --glow: rgba(107, 148, 139, 0.12);
}

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: var(--bg-page);
    color: var(--text-main);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.35s ease, color 0.25s ease;
  }

  /* Semantic keyboard accessibility focus ring */
  *:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.living-canvas {
  background-image: radial-gradient(circle at 50% 0%, var(--glow) 0%, transparent 65%);
}

@keyframes pulseWave {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(200%); opacity: 0; }
}

.pulse-wave-bar {
  animation: pulseWave 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes softBreathe {
  0%, 100% { transform: scale(1); opacity: 0.45; }
  50% { transform: scale(1.06); opacity: 0.85; }
}

.focus-halo {
  animation: softBreathe 6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .pulse-wave-bar, .focus-halo, .animate-ping, .animate-pulse {
    animation: none !important;
  }
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 9999px;
}
`,

  'src/types.ts': `export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';
export type SessionFeeling = 'hard' | 'steady' | 'great';
export type AmbientSound = 'off' | 'rain' | 'forest' | 'tone';

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

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'Short-Term' | 'Long-Term' | 'Habit' | 'Career';
  targetHours: number;
  loggedMinutes: number;
  deadline: string;
  milestones: GoalMilestone[];
}

export interface TaskItem {
  id: string;
  userId: string;
  day: string;
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
  type: 'Core' | 'General' | 'Language';
}

export interface TimeLog {
  id: string;
  sourceKey?: string;
  userId: string;
  targetTitle: string;
  minutes: number;
  date: string;
  createdAtMs: number;
  feeling?: SessionFeeling;
  cheeredBy: string[];
}

export interface AppState {
  version: number;
  isConfigured: boolean;
  workspaceName: string;
  roomCode: string;
  lastUpdatedMs: number;
  members: Member[];
  schedules: ScheduleItem[];
  goals: GoalItem[];
  tasks: TaskItem[];
  exams: ExamItem[];
  logs: TimeLog[];
}
`,

  'src/core/utils.ts': `export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
};

export const getTodayWeekday = (): string => {
  const jsDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return DAYS.includes(jsDay) ? jsDay : 'Saturday';
};

export const getTimeOfDayGreeting = (): string => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 18) return 'Good afternoon';
  return 'Good evening';
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
  const diffSec = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return \`\${Math.floor(diffSec / 60)}m ago\`;
  const timeFormatted = new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateStr === today) return \`Today, \${timeFormatted}\`;
  return dateStr;
};
`,

  'src/core/audio.ts': `import { AmbientSound } from '../types';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;

  public stop() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  public play(mode: AmbientSound) {
    this.stop();
    if (mode === 'off') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      this.ctx = ctx;

      if (mode === 'rain' || mode === 'forest') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= mode === 'rain' ? 0.1 : 0.07;
        }
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = mode === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = mode === 'rain' ? 620 : 420;

        source.connect(filter);
        filter.connect(ctx.destination);
        source.start(0);
      } else if (mode === 'tone') {
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
    } catch {}
  }

  public playChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 1.15);
      });
    } catch {}
  }
}

export const soundEngine = new SoundscapeEngine();
`,

  'src/theme/tokens.ts': `import { ThemePalette } from '../types';

export interface ThemeTokens {
  name: string;
  personality: string;
  vars: Record<string, string>;
  heatLevels: [string, string, string, string];
}

export const GET_THEME_TOKENS = (palette: ThemePalette, isLatte: boolean): ThemeTokens => {
  if (palette === 'lavender-blush') {
    return isLatte
      ? {
          name: 'Soft Lavender',
          personality: 'Creative • Dreamy • Calm',
          vars: {
            '--bg-page': '#F9F7FC',
            '--bg-sidebar': '#F2EDF9',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F4EFFA',
            '--text-main': '#2B2138',
            '--text-muted': '#7A6B8A',
            '--border-subtle': '#E6DDF2',
            '--track-bg': '#E9E1F4',
            '--accent': '#845EC2',
            '--accent-soft': 'rgba(132, 94, 194, 0.12)',
            '--glow': 'rgba(155, 114, 207, 0.16)'
          },
          heatLevels: ['bg-[#F0EBF8] border-[#E4DCF0]', 'bg-[#D5C4EE] border-[#C5B0E6]', 'bg-[#A685E2] border-[#9571D8]', 'bg-[#7E57C2] border-[#6C46B0] text-white']
        }
      : {
          name: 'Velvet Lavender',
          personality: 'Evening • Reflective • Gentle',
          vars: {
            '--bg-page': '#15121C',
            '--bg-sidebar': '#110E17',
            '--bg-surface': '#1D1826',
            '--bg-elevated': '#251F30',
            '--text-main': '#F2ECF9',
            '--text-muted': '#9E91B0',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#A982DB',
            '--accent-soft': 'rgba(169, 130, 219, 0.16)',
            '--glow': 'rgba(169, 130, 219, 0.15)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#5E4382]/60 border-[#73539C]/40', 'bg-[#845EC2]/80 border-[#9B72CF]', 'bg-[#B388EB] border-[#C8A8F0] text-black']
        };
  }

  if (palette === 'peach-terracotta') {
    return isLatte
      ? {
          name: 'Warm Terracotta',
          personality: 'Grounded • Artisanal • Warm',
          vars: {
            '--bg-page': '#FBF8F6',
            '--bg-sidebar': '#F5EFEA',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F7F1EC',
            '--text-main': '#33241E',
            '--text-muted': '#876F66',
            '--border-subtle': '#E8DDD5',
            '--track-bg': '#ECE0D8',
            '--accent': '#C86D51',
            '--accent-soft': 'rgba(200, 109, 81, 0.12)',
            '--glow': 'rgba(200, 109, 81, 0.14)'
          },
          heatLevels: ['bg-[#F3ECE8] border-[#E6DBD4]', 'bg-[#E6BFB3] border-[#D9ABA0]', 'bg-[#D18872] border-[#C47760]', 'bg-[#B85D43] border-[#A34E36] text-white']
        }
      : {
          name: 'Fireside Clay',
          personality: 'Cozy • Hearth • Focused',
          vars: {
            '--bg-page': '#171312',
            '--bg-sidebar': '#120F0E',
            '--bg-surface': '#211B19',
            '--bg-elevated': '#2A2220',
            '--text-main': '#F7EFEA',
            '--text-muted': '#A8958D',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#D47A5E',
            '--accent-soft': 'rgba(212, 122, 94, 0.16)',
            '--glow': 'rgba(212, 122, 94, 0.14)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#6E3D2E]/60 border-[#854B3A]/40', 'bg-[#A85840]/80 border-[#C86D51]', 'bg-[#DF8A70] border-[#F0B29E] text-black']
        };
  }

  if (palette === 'matcha-cream') {
    return isLatte
      ? {
          name: 'Matcha Mist',
          personality: 'Botanical • Fresh • Serene',
          vars: {
            '--bg-page': '#F7F9F6',
            '--bg-sidebar': '#EEF3EC',
            '--bg-surface': '#FFFFFF',
            '--bg-elevated': '#F1F6EF',
            '--text-main': '#1F2D24',
            '--text-muted': '#667B6C',
            '--border-subtle': '#DCE5D8',
            '--track-bg': '#DDE7DA',
            '--accent': '#52796F',
            '--accent-soft': 'rgba(82, 121, 111, 0.12)',
            '--glow': 'rgba(82, 121, 111, 0.14)'
          },
          heatLevels: ['bg-[#EDF2EB] border-[#DFE7DC]', 'bg-[#B7D1C1] border-[#A3C2AF]', 'bg-[#74A18E] border-[#618F7B]', 'bg-[#4A7866] border-[#3B6353] text-white']
        }
      : {
          name: 'Forest Calm',
          personality: 'Deep Woods • Quiet • Steady',
          vars: {
            '--bg-page': '#121714',
            '--bg-sidebar': '#0E1210',
            '--bg-surface': '#19211C',
            '--bg-elevated': '#212B25',
            '--text-main': '#ECF4EE',
            '--text-muted': '#8FA696',
            '--border-subtle': 'rgba(255, 255, 255, 0.07)',
            '--track-bg': 'rgba(255, 255, 255, 0.07)',
            '--accent': '#6B9E8F',
            '--accent-soft': 'rgba(107, 158, 143, 0.16)',
            '--glow': 'rgba(107, 158, 143, 0.14)'
          },
          heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#2F4F44]/60 border-[#3E6658]/40', 'bg-[#4E8070]/80 border-[#639685]', 'bg-[#7BB5A3] border-[#98C9BA] text-black']
        };
  }

  // Default: 'warm-sage' (Mehrsan)
  return isLatte
    ? {
        name: 'Warm Stone & Sage',
        personality: 'Morning Light • Organic • Clear',
        vars: {
          '--bg-page': '#F7F5F0',
          '--bg-sidebar': '#EFECE6',
          '--bg-surface': '#FFFFFF',
          '--bg-elevated': '#F3F0EA',
          '--text-main': '#262421',
          '--text-muted': '#78736A',
          '--border-subtle': '#E2DDD3',
          '--track-bg': '#E5E0D5',
          '--accent': '#4F6F68',
          '--accent-soft': 'rgba(79, 111, 104, 0.12)',
          '--glow': 'rgba(79, 111, 104, 0.14)'
        },
        heatLevels: ['bg-[#ECE8E0] border-[#DFD9CE]', 'bg-[#B2C7C1] border-[#9EB5AE]', 'bg-[#6F968D] border-[#5D837A]', 'bg-[#4A6E66] border-[#3C5C55] text-white']
      }
    : {
        name: 'Cozy Espresso & Sage',
        personality: 'Deep Work • Warm • Grounded',
        vars: {
          '--bg-page': '#161514',
          '--bg-sidebar': '#121110',
          '--bg-surface': '#1E1C1A',
          '--bg-elevated': '#252220',
          '--text-main': '#F2EFE9',
          '--text-muted': '#9C968E',
          '--border-subtle': 'rgba(255, 255, 255, 0.07)',
          '--track-bg': 'rgba(255, 255, 255, 0.07)',
          '--accent': '#6B948B',
          '--accent-soft': 'rgba(107, 148, 139, 0.16)',
          '--glow': 'rgba(107, 148, 139, 0.14)'
        },
        heatLevels: ['bg-white/[0.04] border-white/[0.06]', 'bg-[#334A44]/60 border-[#425E57]/40', 'bg-[#52786F]/80 border-[#668C83]', 'bg-[#82B0A5] border-[#9EC4BB] text-black']
      };
};
`,

  'src/initialData.ts': `import { AppState, ThemePalette } from './types';
import { getTodayWeekday, uid } from './utils';

export const DEFAULT_CLOUD_DB_URL = 'https://syncpulse-8b026-default-rtdb.firebaseio.com/';

export const CREATE_DEMO_STATE = (): AppState => {
  const now = Date.now();
  const todayDay = getTodayWeekday();
  return {
    version: 7,
    isConfigured: true,
    workspaceName: 'Calm Study Sanctuary',
    roomCode: 'public-demo',
    lastUpdatedMs: now,
    members: [
      {
        id: 'alex',
        name: 'Alex',
        tagline: 'Software Engineering',
        avatar: 'A',
        theme: 'warm-sage',
        statusNote: 'Focusing one calm step at a time',
        presence: null
      },
      {
        id: 'claire',
        name: 'Claire',
        tagline: 'Language & Design',
        avatar: 'C',
        theme: 'lavender-blush',
        statusNote: 'Steady daily practice',
        presence: null
      }
    ],
    schedules: [
      { id: 'd-s1', userId: 'alex', day: todayDay, title: 'Algorithms Lecture', startTime: '09:00', endTime: '11:00', details: 'Room 101', category: 'Core', attendedDates: [] },
      { id: 'd-s2', userId: 'claire', day: todayDay, title: 'French Conversation', startTime: '18:00', endTime: '19:30', details: 'Live Session', category: 'Language', attendedDates: [] }
    ],
    goals: [
      {
        id: 'd-g1',
        userId: 'alex',
        title: 'Build Full-Stack Portfolio',
        category: 'Long-Term',
        targetHours: 80,
        loggedMinutes: 0,
        deadline: 'This Semester',
        milestones: [
          { id: 'dms-1', title: 'Design system architecture', completed: false },
          { id: 'dms-2', title: 'Deploy production app', completed: false }
        ]
      },
      {
        id: 'd-g2',
        userId: 'claire',
        title: 'Reach B2 Fluency',
        category: 'Long-Term',
        targetHours: 120,
        loggedMinutes: 0,
        deadline: 'This Year',
        milestones: [
          { id: 'dms-3', title: 'Complete grammar foundations', completed: false },
          { id: 'dms-4', title: 'Practice 20 speaking sessions', completed: false }
        ]
      }
    ],
    tasks: [],
    exams: [],
    logs: []
  };
};

export const CREATE_CUSTOM_SANCTUARY = (
  workspaceName: string,
  roomCode: string,
  p1Name: string,
  p1Tagline: string,
  p1Theme: ThemePalette,
  p2Name?: string,
  p2Tagline?: string,
  p2Theme?: ThemePalette
): AppState => {
  const now = Date.now();
  const id1 = uid('member');
  const members = [
    {
      id: id1,
      name: p1Name.trim() || 'Me',
      tagline: p1Tagline.trim() || 'Focused Learner',
      avatar: (p1Name.trim()[0] || 'M').toUpperCase(),
      theme: p1Theme,
      statusNote: 'Building my daily rhythm',
      presence: null
    }
  ];

  const goals = [
    {
      id: uid('goal'),
      userId: id1,
      title: 'Primary Focus Goal',
      category: 'Long-Term' as const,
      targetHours: 50,
      loggedMinutes: 0,
      deadline: 'Ongoing',
      milestones: []
    }
  ];

  if (p2Name && p2Name.trim()) {
    const id2 = uid('member');
    members.push({
      id: id2,
      name: p2Name.trim(),
      tagline: (p2Tagline || '').trim() || 'Study Companion',
      avatar: p2Name.trim()[0].toUpperCase(),
      theme: p2Theme || 'lavender-blush',
      statusNote: 'Growing together day by day',
      presence: null
    });
    goals.push({
      id: uid('goal'),
      userId: id2,
      title: 'Primary Focus Goal',
      category: 'Long-Term' as const,
      targetHours: 50,
      loggedMinutes: 0,
      deadline: 'Ongoing',
      milestones: []
    });
  }

  return {
    version: 7,
    isConfigured: true,
    workspaceName: workspaceName.trim() || 'Our Sanctuary',
    roomCode: roomCode.trim() || uid('room'),
    lastUpdatedMs: now,
    members,
    schedules: [],
    goals,
    tasks: [],
    exams: [],
    logs: []
  };
};

export const CREATE_MEHRSAN_RONAK_PRESET = (customRoomCode = 'mr-1405'): AppState => {
  const now = Date.now();

  return {
    version: 7,
    isConfigured: true,
    workspaceName: 'Mehrsan & Ronak',
    roomCode: customRoomCode,
    lastUpdatedMs: now,
    members: [
      {
        id: 'mehrsan',
        name: 'Mehrsan',
        tagline: 'Computer Eng • Deep Learning & Web',
        avatar: 'M',
        theme: 'warm-sage',
        statusNote: 'Steady focus, one step at a time',
        presence: null
      },
      {
        id: 'ronak',
        name: 'Ronak',
        tagline: 'French B2 • English & University',
        avatar: 'R',
        theme: 'lavender-blush',
        statusNote: 'Step by step toward B2 fluency',
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

      { id: 'r-s1', userId: 'ronak', day: 'Saturday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
      { id: 'r-s2', userId: 'ronak', day: 'Sunday', title: 'University Classes', startTime: '08:30', endTime: '12:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s3', userId: 'ronak', day: 'Monday', title: 'University Classes', startTime: '08:30', endTime: '14:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s4', userId: 'ronak', day: 'Monday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
      { id: 'r-s5', userId: 'ronak', day: 'Tuesday', title: 'University Classes', startTime: '08:30', endTime: '14:30', details: 'Campus Block', category: 'University', attendedDates: [] },
      { id: 'r-s6', userId: 'ronak', day: 'Wednesday', title: 'French Class', startTime: '21:00', endTime: '22:30', details: 'Evening Session', category: 'Language', attendedDates: [] },
    ],
    goals: [
      {
        id: 'm-g1',
        userId: 'mehrsan',
        title: 'B.Sc. Final Project (3 Credits)',
        category: 'Long-Term',
        targetHours: 120,
        loggedMinutes: 0,
        deadline: 'End of Semester',
        milestones: [
          { id: 'ms-1', title: 'Architecture & supervisor coordination', completed: false },
          { id: 'ms-2', title: 'Core implementation & testing', completed: false },
          { id: 'ms-3', title: 'Final documentation & defense', completed: false }
        ]
      },
      {
        id: 'm-g2',
        userId: 'mehrsan',
        title: 'Deep Learning & Neural Networks',
        category: 'Long-Term',
        targetHours: 80,
        loggedMinutes: 0,
        deadline: '1405/11/14',
        milestones: [
          { id: 'ms-4', title: 'Review lecture notes & assignments', completed: false },
          { id: 'ms-5', title: 'Complete course project', completed: false }
        ]
      },
      {
        id: 'r-g1',
        userId: 'ronak',
        title: 'Master French up to B2 Level',
        category: 'Long-Term',
        targetHours: 400,
        loggedMinutes: 0,
        deadline: 'Until Graduation (~3 Years)',
        milestones: [
          { id: 'ms-6', title: 'Complete A1 foundations', completed: false },
          { id: 'ms-7', title: 'Complete A2 elementary level', completed: false },
          { id: 'ms-8', title: 'Reach B1 intermediate fluency', completed: false },
          { id: 'ms-9', title: 'Achieve B2 upper-intermediate mastery', completed: false }
        ]
      },
      {
        id: 'r-g2',
        userId: 'ronak',
        title: 'English Immersion (Movies & YouTube)',
        category: 'Habit',
        targetHours: 150,
        loggedMinutes: 0,
        deadline: 'Daily Habit',
        milestones: [
          { id: 'ms-10', title: 'Daily English media immersion', completed: false }
        ]
      },
      {
        id: 'r-g3',
        userId: 'ronak',
        title: 'Start English Teaching Career',
        category: 'Career',
        targetHours: 60,
        loggedMinutes: 0,
        deadline: 'This Year',
        milestones: [
          { id: 'ms-11', title: 'Prepare lesson plans & teaching portfolio', completed: false },
          { id: 'ms-12', title: 'Begin first teaching sessions', completed: false }
        ]
      }
    ],
    tasks: [],
    exams: [
      { id: 'ex-1', userId: 'mehrsan', title: 'Principles of Compiler Design', date: '1405/10/26', time: '11:00', professor: 'Damanafshan', type: 'Core' },
      { id: 'ex-2', userId: 'mehrsan', title: 'Fundamentals of Info Security', date: '1405/10/30', time: '11:00', professor: 'Tajbakhsh', type: 'Core' },
      { id: 'ex-3', userId: 'mehrsan', title: 'Analytical History of Early Islam', date: '1405/11/05', time: '14:00', professor: 'Karimi', type: 'General' },
      { id: 'ex-4', userId: 'mehrsan', title: 'Web Programming', date: '1405/11/10', time: '09:00', professor: 'Azimi', type: 'Core' },
      { id: 'ex-5', userId: 'mehrsan', title: 'Special Topics (Deep Learning)', date: '1405/11/14', time: '09:00', professor: 'Yousefi', type: 'Core' }
    ],
    logs: []
  };
};

export const INITIAL_STATE: AppState = {
  ...CREATE_DEMO_STATE(),
  isConfigured: false
};
`,

  'src/core/sync.ts': `import { AppState } from '../types';
import { INITIAL_STATE } from '../initialData';
import { getTodayWeekday } from './utils';

const STORAGE_KEY = 'syncpulse_v7';

export const migrateState = (raw: any): AppState => {
  if (!raw || !Array.isArray(raw.members) || raw.members.length === 0) {
    return INITIAL_STATE;
  }
  const todayDay = getTodayWeekday();
  return {
    version: 7,
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

export const loadLocalState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('syncpulse_v6');
  if (saved) {
    try {
      return migrateState(JSON.parse(saved));
    } catch {}
  }
  return INITIAL_STATE;
};

export const saveLocalState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export const buildCloudEndpoint = (baseUrl: string, roomCode: string): string => {
  const safeRoom = (roomCode || 'default-room')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const trimmed = baseUrl.trim().replace(/\\/$/, '').replace(/\\.json$/, '');
  return \`\${trimmed}/sanctuaries/\${safeRoom}.json\`;
};
`,

  'src/components/ui/Primitives.tsx': `import React from 'react';
import { X } from '@phosphor-icons/react';

export interface SurfaceProps {
  variant?: 'primary' | 'secondary' | 'ambient';
  className?: string;
  children: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  variant = 'secondary',
  className = '',
  children
}) => {
  const styles = {
    primary: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg',
    secondary: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
    ambient: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
  };
  return (
    <div className={\`rounded-3xl transition-colors duration-300 \${styles[variant]} \${className}\`}>
      {children}
    </div>
  );
};

// Signature SyncPulse visual metaphor: ●──────●──────● with living wave
export const PulseLine: React.FC<{ active?: boolean; label?: string }> = ({ active = false, label }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 flex-1 max-w-[140px]">
        <span
          className="w-2 h-2 rounded-full shrink-0 transition-transform"
          style={{
            backgroundColor: active ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: active ? '0 0 10px var(--accent)' : 'none'
          }}
        />
        <div className="h-[2px] flex-1 bg-[var(--track-bg)] overflow-hidden relative rounded-full">
          {active && (
            <div
              className="absolute inset-y-0 w-1/2 pulse-wave-bar rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
        </div>
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: active ? 'var(--accent)' : 'var(--border-subtle)' }}
        />
      </div>
      {label && (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
};

export const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-serif italic text-2xl">{title}</h3>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
`,

  'src/features/focus/useFocusTimer.ts': `import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../../core/audio';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'break';

// Isolated timer hook: 1-second ticks only update components that subscribe to it!
export function useFocusTimer(onPresenceChange?: (isRunning: boolean, mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>(() => {
    return (localStorage.getItem('sp_timer_mode') as TimerMode) || 'pomodoro';
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    return localStorage.getItem('sp_timer_running') === 'true';
  });
  const [startedAtMs, setStartedAtMs] = useState<number | null>(() => {
    const s = localStorage.getItem('sp_timer_start');
    return s ? Number(s) : null;
  });
  const [accumulatedSec, setAccumulatedSec] = useState<number>(() => {
    return Number(localStorage.getItem('sp_timer_acc') || 0);
  });
  const [displaySeconds, setDisplaySeconds] = useState<number>(25 * 60);

  useEffect(() => {
    localStorage.setItem('sp_timer_mode', mode);
    localStorage.setItem('sp_timer_running', String(isRunning));
    if (startedAtMs) localStorage.setItem('sp_timer_start', String(startedAtMs));
    else localStorage.removeItem('sp_timer_start');
    localStorage.setItem('sp_timer_acc', String(accumulatedSec));
  }, [mode, isRunning, startedAtMs, accumulatedSec]);

  useEffect(() => {
    const tick = () => {
      const activeElapsed =
        isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      const totalElapsed = accumulatedSec + activeElapsed;

      if (mode === 'stopwatch') {
        setDisplaySeconds(totalElapsed);
      } else {
        const target = mode === 'pomodoro' ? 25 * 60 : 5 * 60;
        const remaining = Math.max(0, target - totalElapsed);
        setDisplaySeconds(remaining);
        if (remaining === 0 && isRunning) {
          setIsRunning(false);
          setStartedAtMs(null);
          setAccumulatedSec(target);
          soundEngine.playChime();
          onPresenceChange?.(false, mode);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startedAtMs, accumulatedSec, mode, onPresenceChange]);

  const toggle = useCallback(() => {
    if (isRunning) {
      const elapsed = startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      setAccumulatedSec((prev) => prev + elapsed);
      setStartedAtMs(null);
      setIsRunning(false);
      onPresenceChange?.(false, mode);
    } else {
      setStartedAtMs(Date.now());
      setIsRunning(true);
      onPresenceChange?.(true, mode);
    }
  }, [isRunning, startedAtMs, mode, onPresenceChange]);

  const reset = useCallback(
    (newMode: TimerMode = mode) => {
      setIsRunning(false);
      setStartedAtMs(null);
      setAccumulatedSec(0);
      setMode(newMode);
      onPresenceChange?.(false, newMode);
    },
    [mode, onPresenceChange]
  );

  const getElapsedMinutes = useCallback((): number => {
    const activeElapsed =
      isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
    return Math.floor((accumulatedSec + activeElapsed) / 60);
  }, [isRunning, startedAtMs, accumulatedSec]);

  return {
    mode,
    isRunning,
    displaySeconds,
    elapsedMinutes: getElapsedMinutes(),
    toggle,
    reset
  };
}
`,

  'src/features/today/TodayView.tsx': `import React, { useState, useMemo } from 'react';
import {
  Play, CheckCircle, Circle, Plus, Trash, Sparkle, ArrowRight
} from '@phosphor-icons/react';
import { AppState, Member, ScheduleItem, TaskItem } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { DAYS, getTimeOfDayGreeting, toMins, fromMins, getLocalDateStr } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  todayMins: number;
  realTodayName: string;
  onEnterFocusRoom: (goalId?: string) => void;
  onToggleClass: (sched: ScheduleItem) => void;
  onToggleTask: (task: TaskItem) => void;
  onAddTask: (day: string, title: string, time: string, mins: number) => void;
  onDeleteTask: (task: TaskItem) => void;
  onSwitchMember: (id: string) => void;
}

export const TodayView: React.FC<Props> = ({
  state,
  currentMember,
  todayMins,
  realTodayName,
  onEnterFocusRoom,
  onToggleClass,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onSwitchMember
}) => {
  const [timelineDay, setTimelineDay] = useState<string>(realTodayName);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('17:00');
  const [newTaskMins, setNewTaskMins] = useState(45);

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
        endMins: eM,
        startTime: c.startTime,
        durationMins: eM - sM,
        completed: c.attendedDates.includes(todayStr),
        rawClass: c
      });
    });

    dayTasks.forEach((t) => {
      const sM = toMins(t.reminderTime);
      const eM = sM + (t.estimatedMinutes || 30);
      items.push({
        id: t.id,
        kind: 'task',
        title: t.title,
        subtitle: \`≈ \${t.estimatedMinutes} min intention\`,
        startMins: sM,
        endMins: eM,
        startTime: t.reminderTime,
        durationMins: t.estimatedMinutes || 30,
        completed: t.completed,
        rawTask: t
      });
    });

    items.sort((a, b) => a.startMins - b.startMins);
    return items;
  }, [state.schedules, state.tasks, currentMember.id, timelineDay, todayStr]);

  const nextStep = dailyStream.find((item) => !item.completed);

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(timelineDay, newTaskTitle.trim(), newTaskTime, newTaskMins);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-10">
      {/* 1. Experience-Driven Greeting Header */}
      <section className="space-y-2">
        <PulseLine
          active={Boolean(currentMember.presence?.isFocusing)}
          label={
            todayMins > 0
              ? \`\${Math.floor(todayMins / 60)}h \${todayMins % 60}m focused today\`
              : 'Your sanctuary is quiet'
          }
        />
        <h2 className="font-serif italic text-4xl sm:text-5xl tracking-tight pt-1">
          {getTimeOfDayGreeting()}, {currentMember.name}.
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {nextStep
            ? \`Next meaningful step: \${nextStep.title} at \${nextStep.startTime}\`
            : primaryGoal
            ? \`Current direction: \${primaryGoal.title}\`
            : 'Ready to begin your first mindful session?'}
        </p>
      </section>

      {/* 2. Primary Surface: Hero Focus Invitation */}
      <Surface variant="primary" className="p-7 sm:p-9 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <span
              className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Sparkle weight="fill" className="w-3.5 h-3.5" />
              Today’s Focus Sanctuary
            </span>
            <h3 className="font-serif italic text-2xl sm:text-3xl pt-1">
              {nextStep ? nextStep.title : primaryGoal ? primaryGoal.title : 'Deep Focus Session'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Step into a quiet space with ambient soundscapes and a persistent focus timer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEnterFocusRoom(primaryGoal?.id)}
            className="px-6 py-4 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2.5 shadow-md transition transform hover:scale-[1.02] shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Play weight="fill" className="w-4 h-4" />
            <span>Enter Focus Room</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </Surface>

      {/* 3. Ambient Surface: Sanctuary Companion Pulse */}
      <section className="space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
          Sanctuary Pulse
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {state.members.map((m) => {
            const isFocusing = Boolean(m.presence?.isFocusing);
            const mTodayMins = state.logs
              .filter((l) => l.userId === m.id && l.date === todayStr)
              .reduce((a, b) => a + b.minutes, 0);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSwitchMember(m.id)}
                className={\`p-4 rounded-2xl border text-left flex items-center justify-between transition \${
                  m.id === currentMember.id
                    ? 'bg-[var(--bg-surface)] border-[var(--accent)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-80 hover:opacity-100'
                }\`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isFocusing ? '#10b981' : 'var(--text-muted)',
                      boxShadow: isFocusing ? '0 0 8px #10b981' : 'none'
                    }}
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {isFocusing
                        ? \`Focusing on \${m.presence?.targetTitle}\`
                        : mTodayMins > 0
                        ? \`\${Math.floor(mTodayMins / 60)}h \${mTodayMins % 60}m today\`
                        : 'Resting'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                  {m.id === currentMember.id ? 'Active' : 'Switch'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Secondary Surface: Today's Rhythm (Timeline Flow) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif italic text-2xl">Today’s Rhythm</h3>
          <div className="flex items-center gap-1 overflow-x-auto">
            {DAYS.map((d) => {
              const active = d === timelineDay;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTimelineDay(d)}
                  className={\`px-2.5 py-1 rounded-lg text-xs font-medium transition \${
                    active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }\`}
                  style={active ? { backgroundColor: 'var(--accent)' } : undefined}
                >
                  {d.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {dailyStream.length === 0 ? (
            <div className="p-8 text-center space-y-1">
              <p className="text-sm font-medium">Your space is clear for {timelineDay}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Add a small intention below or step directly into the Focus Room.
              </p>
            </div>
          ) : (
            dailyStream.map((entry) => (
              <div
                key={entry.id}
                className="px-5 py-4 flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    type="button"
                    aria-label={\`Toggle \${entry.title}\`}
                    onClick={() => {
                      if (entry.kind === 'class' && entry.rawClass) onToggleClass(entry.rawClass);
                      else if (entry.kind === 'task' && entry.rawTask) onToggleTask(entry.rawTask);
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
                    <p className={\`text-sm font-medium truncate \${entry.completed ? 'line-through opacity-50' : ''}\`}>
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
                      aria-label={\`Delete \${entry.title}\`}
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

          <form onSubmit={handleSubmitTask} className="px-5 py-3.5 flex flex-wrap items-center gap-2.5">
            <Plus weight="bold" className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={\`What moves you forward on \${timelineDay}?\`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[160px] bg-transparent text-xs py-1 focus:outline-none"
            />
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
              <option value={15}>≈ 15m</option>
              <option value={30}>≈ 30m</option>
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
                Add Step
              </button>
            )}
          </form>
        </Surface>
      </section>
    </div>
  );
};
`,

  'src/features/focus/FocusRoomView.tsx': `import React, { useState } from 'react';
import {
  Play, Pause, ArrowCounterClockwise, Check, CloudRain, TreeEvergreen,
  Waveform, SpeakerSlash, Smiley, SmileyMeh, Fire
} from '@phosphor-icons/react';
import { AmbientSound, GoalItem, Member, SessionFeeling } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { TimerMode } from './useFocusTimer';

interface Props {
  currentMember: Member;
  companions: Member[];
  userGoals: GoalItem[];
  selectedGoalId: string;
  onSelectGoal: (id: string) => void;
  timer: {
    mode: TimerMode;
    isRunning: boolean;
    displaySeconds: number;
    elapsedMinutes: number;
    toggle: () => void;
    reset: (m?: TimerMode) => void;
  };
  ambientMode: AmbientSound;
  onChangeAmbient: (m: AmbientSound) => void;
  onCompleteSession: (mins: number, feeling: SessionFeeling) => void;
}

export const FocusRoomView: React.FC<Props> = ({
  currentMember,
  companions,
  userGoals,
  selectedGoalId,
  onSelectGoal,
  timer,
  ambientMode,
  onChangeAmbient,
  onCompleteSession
}) => {
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const canLog = timer.elapsedMinutes >= 1 && timer.mode !== 'break';

  const handleFinishClick = () => {
    if (!canLog) return;
    setShowReflection(true);
  };

  const confirmSessionReflection = (feeling: SessionFeeling) => {
    onCompleteSession(timer.elapsedMinutes, feeling);
    setShowReflection(false);
  };

  const activeGoal = userGoals.find((g) => g.id === selectedGoalId) || userGoals[0];

  return (
    <div className="space-y-8 py-2">
      {/* Header & Live Pulse */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <PulseLine
            active={timer.isRunning}
            label={timer.isRunning ? 'Deep focus in progress' : 'Sanctuary ready'}
          />
          <h2 className="font-serif italic text-3xl sm:text-4xl mt-1">
            {activeGoal ? activeGoal.title : 'Mindful Focus Room'}
          </h2>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {(['pomodoro', 'stopwatch', 'break'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => timer.reset(m)}
              className={\`px-3.5 py-1.5 rounded-xl text-xs font-medium transition \${
                timer.mode === m ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }\`}
              style={timer.mode === m ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {m === 'pomodoro' ? '25m Focus' : m === 'stopwatch' ? 'Open Flow' : '5m Break'}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Focus Stage */}
      <Surface variant="primary" className="p-8 sm:p-14 text-center relative overflow-hidden space-y-8">
        {timer.isRunning && (
          <div
            className="focus-halo absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background: 'radial-gradient(circle at 50% 50%, var(--accent-soft) 0%, transparent 70%)'
            }}
          />
        )}

        <div className="relative z-10 max-w-sm mx-auto">
          <label htmlFor="focus-goal-picker" className="sr-only">Select active goal</label>
          <select
            id="focus-goal-picker"
            value={selectedGoalId}
            onChange={(e) => onSelectGoal(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl text-xs text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <option value="">Select direction to nourish...</option>
            {userGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({(g.loggedMinutes / 60).toFixed(1)}h / {g.targetHours}h)
              </option>
            ))}
          </select>
        </div>

        {/* Giant Calm Clock */}
        <div className="relative z-10 font-mono text-7xl sm:text-8xl font-semibold tracking-tight select-none py-2">
          {String(Math.floor(timer.displaySeconds / 60)).padStart(2, '0')}:
          {String(timer.displaySeconds % 60).padStart(2, '0')}
        </div>

        {/* Controls or Post-Session Reflection */}
        {!showReflection ? (
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={timer.toggle}
              className="px-8 py-4 rounded-2xl font-semibold text-sm text-white flex items-center gap-2.5 shadow-lg transition transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {timer.isRunning ? <Pause weight="fill" className="w-5 h-5" /> : <Play weight="fill" className="w-5 h-5" />}
              <span>{timer.isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            {canLog && (
              <button
                type="button"
                onClick={handleFinishClick}
                className="px-5 py-4 rounded-2xl font-semibold text-sm border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-2 transition hover:border-[var(--accent)]"
              >
                <Check weight="bold" className="w-4 h-4" />
                <span>Complete (+{timer.elapsedMinutes}m)</span>
              </button>
            )}

            <button
              type="button"
              aria-label="Reset Timer"
              onClick={() => timer.reset()}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              <ArrowCounterClockwise weight="duotone" className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative z-10 max-w-md mx-auto p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-4">
            <p className="text-sm font-medium">
              Nice session (+{timer.elapsedMinutes}m). How did this focus feel?
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => confirmSessionReflection('hard')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <SmileyMeh weight="duotone" className="w-5 h-5 text-amber-400" />
                <span>Challenging</span>
              </button>
              <button
                type="button"
                onClick={() => confirmSessionReflection('steady')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <Smiley weight="duotone" className="w-5 h-5 text-emerald-400" />
                <span>Steady</span>
              </button>
              <button
                type="button"
                onClick={() => confirmSessionReflection('great')}
                className="py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] text-xs font-medium flex flex-col items-center gap-1 hover:border-[var(--accent)]"
              >
                <Fire weight="duotone" className="w-5 h-5 text-purple-400" />
                <span>Deep Flow</span>
              </button>
            </div>
          </div>
        )}

        {/* Ambient Soundscape Bar */}
        <div className="relative z-10 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'rain', label: 'Soft Rain', Icon: CloudRain },
            { id: 'forest', label: 'Forest Wind', Icon: TreeEvergreen },
            { id: 'tone', label: 'Warm Tone', Icon: Waveform },
            { id: 'off', label: 'Silence', Icon: SpeakerSlash }
          ].map((s) => {
            const Icon = s.Icon;
            const active = ambientMode === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeAmbient(s.id as AmbientSound)}
                className={\`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition \${
                  active
                    ? 'text-white border-transparent'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }\`}
                style={active ? { backgroundColor: 'var(--accent)' } : undefined}
              >
                <Icon weight={active ? 'fill' : 'duotone'} className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </Surface>

      {/* Nearby Companions in the Sanctuary */}
      <Surface variant="ambient" className="p-5 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Companions in Sanctuary
        </span>
        <div className="flex flex-wrap items-center gap-4">
          {[currentMember, ...companions].map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: m.presence?.isFocusing ? '#10b981' : 'var(--text-muted)' }}
              />
              <span className="font-semibold">{m.name}:</span>
              <span className="text-[var(--text-muted)]">
                {m.presence?.isFocusing ? \`Focusing (\${m.presence.targetTitle})\` : 'Resting'}
              </span>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
};
`,

  'src/features/journey/JourneyView.tsx': `import React, { useState } from 'react';
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
                      aria-label={\`Edit \${g.title}\`}
                      onClick={() => onOpenEditGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <PencilSimple weight="duotone" className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={\`Delete \${g.title}\`}
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
                          +{mins === 60 ? '1h' : \`\${mins}m\`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--track-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: \`\${pct}%\`, backgroundColor: 'var(--accent)' }}
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
                className={\`px-3.5 py-1.5 rounded-xl text-xs font-medium transition \${
                  active ? 'text-white' : 'text-[var(--text-muted)]'
                }\`}
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
`,

  'src/features/sanctuary/SanctuaryView.tsx': `import React, { useState } from 'react';
import {
  Heart, Fire, Plant, Lightning, Buildings, Crown
} from '@phosphor-icons/react';
import { AppState, Member } from '../../types';
import { Surface, PulseLine } from '../../components/ui/Primitives';
import { GET_THEME_TOKENS } from '../../theme/tokens';
import { formatRelativeTime } from '../../core/utils';

interface Props {
  state: AppState;
  currentMember: Member;
  isLatteMode: boolean;
  memberMetrics: Record<string, {
    todayMins: number;
    totalHours: string;
    streak: number;
    level: number;
    grid28: { dateStr: string; prettyDate: string; mins: number; level: number }[];
  }>;
  onCheerLog: (logId: string) => void;
}

export const SanctuaryView: React.FC<Props> = ({
  state,
  currentMember,
  isLatteMode,
  memberMetrics,
  onCheerLog
}) => {
  const [selectedCell, setSelectedCell] = useState<{ member: string; date: string; mins: number } | null>(null);
  const activeCount = state.members.filter((m) => m.presence?.isFocusing).length;

  const myStats = memberMetrics[currentMember.id];
  const userLogs = state.logs.filter((l) => l.userId === currentMember.id);
  const totalHrs = Number(myStats?.totalHours || 0);
  const hasDeep = userLogs.some((l) => l.minutes >= 90);
  const cheersReceived = userLogs.reduce((a, l) => a + l.cheeredBy.length, 0);

  const badges = [
    { id: 'spark', Icon: Plant, name: 'First Spark', desc: 'Complete your first focus session', unlocked: userLogs.length > 0 },
    { id: 'flame', Icon: Fire, name: '3-Day Rhythm', desc: '3 consecutive days building momentum', unlocked: (myStats?.streak || 0) >= 3 },
    { id: 'deep', Icon: Lightning, name: 'Deep Diver', desc: 'Complete a 90+ minute session', unlocked: hasDeep },
    { id: 'warm', Icon: Heart, name: 'Shared Warmth', desc: 'Receive cheers from companions', unlocked: cheersReceived >= 2 },
    { id: 'club10', Icon: Buildings, name: '10-Hour Milestone', desc: 'Invest 10 hours in your directions', unlocked: totalHrs >= 10 },
    { id: 'legend50', Icon: Crown, name: '50-Hour Mastery', desc: 'Invest 50 hours in your directions', unlocked: totalHrs >= 50 }
  ];

  return (
    <div className="space-y-12">
      {/* Shared Presence Header */}
      <section className="space-y-2">
        <PulseLine
          active={activeCount > 0}
          label={activeCount > 0 ? \`\${activeCount} focusing in sanctuary\` : 'Sanctuary at rest'}
        />
        <h2 className="font-serif italic text-3xl sm:text-4xl">Shared Sanctuary Rhythm</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Side-by-side consistency across the last 28 days
        </p>
      </section>

      {/* Companion 28-Day Rhythm Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.members.map((m) => {
          const mTokens = GET_THEME_TOKENS(m.theme, isLatteMode);
          const stat = memberMetrics[m.id];
          return (
            <Surface key={m.id} variant="secondary" className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">{m.name}</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {stat?.streak ? \`\${stat.streak} days building rhythm\` : 'Starting fresh'} • {stat?.totalHours || '0.0'}h total
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  Lv.{stat?.level || 1}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {(stat?.grid28 || []).map((cell) => (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedCell({ member: m.name, date: cell.prettyDate, mins: cell.mins })}
                    className={\`h-7 rounded-lg border transition flex items-center justify-center text-[10px] font-mono \${mTokens.heatLevels[cell.level]}\`}
                  >
                    {cell.mins > 0 ? cell.mins : ''}
                  </button>
                ))}
              </div>

              {selectedCell && selectedCell.member === m.name && (
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  {selectedCell.date}: {selectedCell.mins} minutes focused
                </p>
              )}
            </Surface>
          );
        })}
      </section>

      {/* Shared Focus Moments Feed */}
      <section className="space-y-4">
        <h3 className="font-serif italic text-2xl">Recent Focus Moments</h3>
        <Surface variant="secondary" className="divide-y divide-[var(--border-subtle)]">
          {state.logs.length === 0 ? (
            <p className="text-xs py-8 text-center text-[var(--text-muted)]">
              Your shared feed is quiet. Complete a focus session to inspire your companions.
            </p>
          ) : (
            state.logs.slice(0, 12).map((log) => {
              const logMember = state.members.find((m) => m.id === log.userId);
              if (!logMember) return null;
              const isOwn = log.userId === currentMember.id;
              const cheered = log.cheeredBy.includes(currentMember.id);
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-semibold">{logMember.name}</span>
                    <span className="text-[var(--text-muted)] truncate">{log.targetTitle}</span>
                    {log.feeling && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                        {log.feeling}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[var(--text-muted)]">
                      +{log.minutes}m • {formatRelativeTime(log.createdAtMs, log.date)}
                    </span>
                    <button
                      type="button"
                      disabled={isOwn}
                      onClick={() => onCheerLog(log.id)}
                      className="px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center gap-1"
                    >
                      <Heart weight={cheered || log.cheeredBy.length > 0 ? 'fill' : 'duotone'} className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      <span>{log.cheeredBy.length}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Surface>
      </section>

      {/* Milestones */}
      <section className="space-y-4">
        <h3 className="font-serif italic text-2xl">{currentMember.name}’s Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map((b) => {
            const Icon = b.Icon;
            return (
              <Surface
                key={b.id}
                variant={b.unlocked ? 'secondary' : 'ambient'}
                className={\`p-4 flex items-center gap-3 \${b.unlocked ? '' : 'opacity-40'}\`}
              >
                <Icon weight={b.unlocked ? 'duotone' : 'regular'} className="w-6 h-6 shrink-0" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-xs font-semibold">{b.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{b.desc}</p>
                </div>
              </Surface>
            );
          })}
        </div>
      </section>
    </div>
  );
};
`,

  'src/App.tsx': `import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
                className={\`rounded-2xl px-3 py-2 flex items-center justify-between group transition \${
                  m.id === activeUser ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)]'
                }\`}
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
                  aria-label={\`Edit \${m.name}\`}
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
                  className={\`w-full px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-between transition \${
                    active ? 'bg-[var(--bg-elevated)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }\`}
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
                const sourceKey = \`class-\${sched.id}-\${todayStr}\`;
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
                const sourceKey = \`task-\${task.id}\`;
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
                  logs: prev.logs.filter((l) => l.sourceKey !== \`task-\${task.id}\`)
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
                if (window.confirm(\`Delete "\${g.title}"?\`)) {
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
                className={\`flex flex-col items-center justify-center py-1 rounded-xl text-xs font-medium \${
                  active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
                }\`}
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
                  : CREATE_CUSTOM_SANCTUARY(\`Sanctuary (\${code || 'new'})\`, code || uid('room'), 'Companion 1', 'Focused Learner', 'warm-sage');
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
              const link = \`\${window.location.origin}\${window.location.pathname}?room=\${state.roomCode}\`;
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
                a.download = \`syncpulse-\${state.roomCode}.json\`;
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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('🏛️ Modularized:', filePath);
}

console.log('\n✨ SyncPulse v7.0 (12-File Modular Domain Architecture + CSS Variables + Experience Flow) is ready!');