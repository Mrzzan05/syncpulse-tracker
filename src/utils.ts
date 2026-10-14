export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Fixes UTC bug in Iran/Türkiye: Always returns local YYYY-MM-DD
export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const yesterday = getPastLocalDateStr(1);
  const diffSec = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  const timeFormatted = new Date(createdAtMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dateStr === today) return `Today, ${timeFormatted}`;
  if (dateStr === yesterday) return `Yesterday, ${timeFormatted}`;
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
