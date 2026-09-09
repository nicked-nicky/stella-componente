import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Notification } from '../../molecules/Notification';
import type { NotificationVariant } from '../../molecules/Notification';
import { getExitDelay } from '../../utils/motion';

const EXIT_DURATION_MS = 150;

interface NotifyOptions {
  duration?: number;
  icon?: React.ReactNode;
}

interface NotificationItem {
  id: string;
  variant: NotificationVariant;
  message: string;
  duration: number;
  icon?: React.ReactNode;
  closing?: boolean;
}

interface NotifyAPI {
  success: (message: string, options?: NotifyOptions) => string;
  warning: (message: string, options?: NotifyOptions) => string;
  error: (message: string, options?: NotifyOptions) => string;
  info: (message: string, options?: NotifyOptions) => string;
  debug: (message: string, options?: NotifyOptions) => string;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotifyAPI | undefined>(undefined);

const DEFAULT_DURATION = 5000;
let notificationCounter = 0;

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const removeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    const el = document.createElement('div');
    el.setAttribute('data-stella-notification-root', '');
    document.body.appendChild(el);
    setRoot(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const timerMap = timers.current;
    const removeTimerMap = removeTimers.current;
    return () => {
      timerMap.forEach((timer) => clearTimeout(timer));
      timerMap.clear();
      removeTimerMap.forEach((timer) => clearTimeout(timer));
      removeTimerMap.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, closing: true } : item))
    );

    const existingRemoveTimer = removeTimers.current.get(id);
    if (existingRemoveTimer) clearTimeout(existingRemoveTimer);
    const removeTimer = setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      removeTimers.current.delete(id);
    }, getExitDelay(EXIT_DURATION_MS));
    removeTimers.current.set(id, removeTimer);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const pause = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const resume = useCallback(
    (id: string, duration: number) => {
      scheduleDismiss(id, duration);
    },
    [scheduleDismiss]
  );

  const push = useCallback(
    (
      variant: NotificationVariant,
      message: string,
      options?: NotifyOptions
    ) => {
      const id = `stella-notification-${++notificationCounter}`;
      const duration = options?.duration ?? DEFAULT_DURATION;
      setItems((prev) => [
        ...prev,
        { id, variant, message, duration, icon: options?.icon },
      ]);
      scheduleDismiss(id, duration);
      return id;
    },
    [scheduleDismiss]
  );

  const notify = useMemo<NotifyAPI>(
    () => ({
      success: (message, options) => push('success', message, options),
      warning: (message, options) => push('warning', message, options),
      error: (message, options) => push('error', message, options),
      info: (message, options) => push('info', message, options),
      debug: (message, options) => push('debug', message, options),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {root &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              bottom: 'var(--stella-space-4)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--stella-space-2)',
              pointerEvents: 'none',
            }}
            aria-live="polite"
            aria-atomic="false"
          >
            {items.map((item) => (
              <div key={item.id} style={{ pointerEvents: 'auto' }}>
                <Notification
                  variant={item.variant}
                  icon={item.icon}
                  closing={item.closing ?? false}
                  onDismiss={() => dismiss(item.id)}
                  onMouseEnter={() => !item.closing && pause(item.id)}
                  onMouseLeave={() =>
                    !item.closing && resume(item.id, item.duration)
                  }
                >
                  {item.message}
                </Notification>
              </div>
            ))}
          </div>,
          root
        )}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotifyAPI {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within a <NotificationProvider>.'
    );
  }
  return ctx;
}

export function useOptionalNotifications(): NotifyAPI | undefined {
  return useContext(NotificationContext);
}
