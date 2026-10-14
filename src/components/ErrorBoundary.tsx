import React from 'react';
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
