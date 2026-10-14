export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

export const toMins = (timeStr: string): number => {
  const [h, m] = (timeStr || '09:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const fromMins = (total: number): string => {
  const normalized = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatRelativeTime = (createdAtMs: number, dateStr: string): string => {
  const today = getLocalDateStr();
  const diffSec = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  const timeFormatted = new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateStr === today) return `Today, ${timeFormatted}`;
  return dateStr;
};
