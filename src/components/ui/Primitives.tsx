import React from 'react';
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
    <div className={`rounded-3xl transition-colors duration-200 ${styles[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Signature SyncPulse visual element: ●──────●──────●
export const PulseLine: React.FC<{ active?: boolean; label?: string }> = ({ active = false, label }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
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

// Calm Skeleton Loader (Audit Point 60 & 129: "Syncing your rhythm... ●━━━○━━━○")
export const RhythmSkeleton: React.FC = () => (
  <div className="py-16 space-y-6 max-w-md mx-auto text-center animate-pulse">
    <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-muted)]">
      <span>Syncing your rhythm...</span>
      <span>●━━━○━━━○</span>
    </div>
    <div className="h-8 bg-[var(--bg-elevated)] rounded-2xl w-3/4 mx-auto" />
    <div className="h-32 bg-[var(--bg-surface)] rounded-3xl w-full border border-[var(--border-subtle)]" />
  </div>
);

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
