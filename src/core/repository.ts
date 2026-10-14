import { AppState } from '../types';
import { INITIAL_STATE } from '../initialData';
import { getTodayWeekday } from './utils';

const STORAGE_KEY = 'syncpulse_v8';

export type SyncStatus = {
  state: 'local' | 'syncing' | 'synced' | 'offline';
  lastSyncedAtMs: number | null;
};

export const migrateState = (raw: any): AppState => {
  if (!raw || !Array.isArray(raw.members) || raw.members.length === 0) {
    return INITIAL_STATE;
  }
  const todayDay = getTodayWeekday();
  return {
    version: 8,
    isConfigured: raw.isConfigured !== undefined ? Boolean(raw.isConfigured) : true,
    workspaceName: raw.workspaceName || 'Sanctuary',
    roomCode: raw.roomCode || 'mr-1405',
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

// Local-First Storage Repository Adapter (Audit Point 70, 71, 135, 153)
class SanctuaryRepository {
  public loadLocal(): AppState {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('syncpulse_v7') ||
      localStorage.getItem('syncpulse_v6');
    if (raw) {
      try {
        return migrateState(JSON.parse(raw));
      } catch {}
    }
    return INITIAL_STATE;
  }

  public saveLocal(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  public buildEndpoint(baseUrl: string, roomCode: string): string {
    const safeRoom = (roomCode || 'mr-1405')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const trimmed = baseUrl.trim().replace(/\/$/, '').replace(/\.json$/, '');
    return `${trimmed}/sanctuaries/${safeRoom}.json`;
  }

  public async pushRemote(baseUrl: string, state: AppState): Promise<boolean> {
    if (!baseUrl || !state.isConfigured) return false;
    try {
      const endpoint = this.buildEndpoint(baseUrl, state.roomCode);
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async pullRemote(baseUrl: string, roomCode: string): Promise<AppState | null> {
    if (!baseUrl || !roomCode) return null;
    try {
      const endpoint = this.buildEndpoint(baseUrl, roomCode);
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.members)) {
        return migrateState(data);
      }
      return null;
    } catch {
      return null;
    }
  }

  public exportJSONFile(state: AppState, dateStr: string): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `syncpulse-${state.roomCode}-${dateStr}.json`;
    a.click();
  }
}

export const repository = new SanctuaryRepository();
