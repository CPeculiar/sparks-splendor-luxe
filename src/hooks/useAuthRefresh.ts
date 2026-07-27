import { useEffect, useRef, useCallback } from 'react';
import { ensureTokenValid } from '@/lib/auth';

const IDLE_TIMEOUT = 10 * 60 * 1000;
const WARNING_BEFORE_LOGOUT = 60 * 1000;
const PROACTIVE_REFRESH_INTERVAL = 4 * 60 * 1000;

export function useAuthRefresh(onIdleWarning?: (secondsLeft: number) => void, onLogout?: () => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const proactiveRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

    warningTimeoutRef.current = setTimeout(() => {
      let secondsLeft = 60;
      onIdleWarning?.(secondsLeft);

      warningIntervalRef.current = setInterval(() => {
        secondsLeft--;
        onIdleWarning?.(secondsLeft);
        if (secondsLeft <= 0) clearInterval(warningIntervalRef.current!);
      }, 1000);
    }, IDLE_TIMEOUT - WARNING_BEFORE_LOGOUT);

    timeoutRef.current = setTimeout(() => {
      onLogout?.();
    }, IDLE_TIMEOUT);
  }, [onIdleWarning, onLogout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetIdleTimer();
    events.forEach((e) => document.addEventListener(e, handleActivity));
    resetIdleTimer();

    // Proactively refresh token every 4 minutes while the tab is active
    proactiveRefreshRef.current = setInterval(() => {
      ensureTokenValid();
    }, PROACTIVE_REFRESH_INTERVAL);

    return () => {
      events.forEach((e) => document.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
      if (proactiveRefreshRef.current) clearInterval(proactiveRefreshRef.current);
    };
  }, [resetIdleTimer]);
}
