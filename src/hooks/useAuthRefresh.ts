import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE_LOGOUT = 60 * 1000; // Show warning 1 minute before logout

export function useAuthRefresh(onIdleWarning?: (secondsLeft: number) => void, onLogout?: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    // Set new warning timeout (shows at 1 minute mark)
    warningTimeoutRef.current = setTimeout(() => {
      let secondsLeft = 60;
      onIdleWarning?.(secondsLeft);

      // Start countdown interval
      warningIntervalRef.current = setInterval(() => {
        secondsLeft--;
        onIdleWarning?.(secondsLeft);
        if (secondsLeft <= 0) {
          clearInterval(warningIntervalRef.current!);
        }
      }, 1000);
    }, IDLE_TIMEOUT - WARNING_BEFORE_LOGOUT);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      onLogout?.();
    }, IDLE_TIMEOUT);
  }, [onIdleWarning, onLogout]);

  useEffect(() => {
    // List of user activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetIdleTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    };
  }, [resetIdleTimer]);
}

export async function refreshAuthToken(): Promise<boolean> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login
  window.location.href = '/login';
}
