export type ThemePalette = 'warm-sage' | 'lavender-blush' | 'peach-terracotta' | 'matcha-cream';
export type SessionFeeling = 'easy' | 'normal' | 'hard';
export type AmbientSound = 'off' | 'rain' | 'forest' | 'tone';

export interface ActivePresence {
  isFocusing: boolean;
  targetTitle: string;
  durationPreset: number;
  startedAtMs: number;
}

export interface Member {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  theme: ThemePalette;
  todayIntention?: string;
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
  goalId?: string; // Links action directly to a Goal/Direction
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
  goalId?: string;
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
