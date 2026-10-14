export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';

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
