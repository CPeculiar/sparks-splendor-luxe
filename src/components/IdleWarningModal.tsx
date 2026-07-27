import { useState } from 'react';
import { Clock, LogOut, LogIn } from 'lucide-react';
import { ensureTokenValid, clearAuth } from '@/lib/auth';

interface IdleWarningModalProps {
  open: boolean;
  secondsLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function IdleWarningModal({ open, secondsLeft, onStayLoggedIn, onLogout }: IdleWarningModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleStayLoggedIn() {
    setIsRefreshing(true);
    try {
      // Force expiry so ensureTokenValid always refreshes
      localStorage.setItem('ss-token-expiry', '0');
      await ensureTokenValid();
      const token = localStorage.getItem('ss-auth-token');
      if (token) {
        onStayLoggedIn();
      } else {
        clearAuth();
        onLogout();
      }
    } catch {
      onLogout();
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleLogout() {
    clearAuth();
    onLogout();
  }

  if (!open) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-onyx/80" />
      <div className="relative bg-background border border-gold/30 rounded-lg p-8 max-w-md w-full space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Clock className="h-12 w-12 text-gold animate-pulse" />
          </div>
          <h2 className="font-display text-2xl">Session Idle</h2>
          <p className="text-sm text-muted-foreground">
            You have been inactive for 10 minutes. You will be automatically logged out for security.
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-secondary/50 border border-gold/20 rounded-lg p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Logout in</p>
          <p className="font-display text-4xl text-gold font-bold">{timeDisplay}</p>
        </div>

        {/* Info */}
        <div className="bg-warning/10 border border-warning/30 rounded p-3 text-xs text-muted-foreground">
          💡 <span className="ml-2">Click "Yes" to stay logged in and continue working, or "No" to log out now.</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive rounded font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            No, Logout
          </button>
          <button
            onClick={handleStayLoggedIn}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded font-medium transition-colors disabled:cursor-not-allowed"
          >
            <LogIn className="h-4 w-4" />
            {isRefreshing ? 'Refreshing...' : 'Yes, Keep Me Logged In'}
          </button>
        </div>

        {/* Auto-logout notice */}
        <p className="text-xs text-muted-foreground text-center">
          If you don't respond, you'll be logged out automatically at 0:00
        </p>
      </div>
    </div>
  );
}
