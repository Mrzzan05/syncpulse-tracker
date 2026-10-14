import { AppState } from '../types';
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
  const trimmed = baseUrl.trim().replace(/\/$/, '').replace(/\.json$/, '');
  return `${trimmed}/sanctuaries/${safeRoom}.json`;
};
