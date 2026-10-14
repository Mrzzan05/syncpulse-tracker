import { TimeLog } from '../types';
import { getLocalDateStr } from './utils';

export interface RhythmInsights {
  bestTimeOfDay: string;
  consistencyText: string;
  avgSessionMins: number;
  thisWeekSessions: number;
  thisWeekMinutes: number;
}

// Turns raw logs into human-centric self-understanding insights (Audit Point 84 & 124)
export function computeRhythmInsights(logs: TimeLog[], userId: string, streak: number): RhythmInsights {
  const userLogs = logs.filter((l) => l.userId === userId && l.minutes > 0);

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);
  const weekAgoStr = getLocalDateStr(weekAgo);

  const weekLogs = userLogs.filter((l) => l.date >= weekAgoStr);
  const thisWeekSessions = weekLogs.length;
  const thisWeekMinutes = weekLogs.reduce((a, b) => a + b.minutes, 0);

  const avgSessionMins =
    userLogs.length > 0
      ? Math.round(userLogs.reduce((a, b) => a + b.minutes, 0) / userLogs.length)
      : 0;

  // Analyze time-of-day buckets
  let morning = 0;
  let afternoon = 0;
  let night = 0;

  userLogs.forEach((l) => {
    const hr = new Date(l.createdAtMs).getHours();
    if (hr >= 5 && hr < 12) morning += l.minutes;
    else if (hr >= 12 && hr < 18) afternoon += l.minutes;
    else night += l.minutes;
  });

  let bestTimeOfDay = 'Building your baseline rhythm';
  if (userLogs.length > 0) {
    if (night >= morning && night >= afternoon) bestTimeOfDay = 'You focus deepest in the evening & night';
    else if (morning >= afternoon) bestTimeOfDay = 'Your sharpest focus happens in the morning';
    else bestTimeOfDay = 'You find your strongest flow in the afternoon';
  }

  const consistencyText =
    streak >= 7
      ? `${streak} days of steady rhythm — a true habit is forming`
      : streak >= 3
      ? `${streak} days building your rhythm consistently`
      : streak >= 1
      ? `You showed up today — small steps build momentum`
      : 'Your first focused moment today starts the rhythm';

  return {
    bestTimeOfDay,
    consistencyText,
    avgSessionMins,
    thisWeekSessions,
    thisWeekMinutes
  };
}
