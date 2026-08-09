// Cloud Realtime synchronization via Server-Sent Events (SSE) and Local fallback
export type RealtimeEventType =
  | 'MEMBER_LOGIN'
  | 'MEMBER_REGISTER'
  | 'MEMBER_LOGOUT'
  | 'ORDER_SUBMITTED'
  | 'ORDER_APPROVED'
  | 'ORDER_REJECTED'
  | 'NOTIFICATION_SENT'
  | 'MEMBER_UPDATED'
  | 'QR_UPDATED'
  | 'CONNECTED';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  data?: any;
  timestamp: number;
}

const EVENT_NAME = 'mongkulkar_realtime_event';
const STORAGE_TRIGGER_KEY = 'mongkulkar_last_event';

let eventSource: EventSource | null = null;
const listeners: Set<(event: RealtimeEventPayload) => void> = new Set();

// Initialize Cloud SSE Connection
function initSseConnection() {
  if (typeof window === 'undefined' || !('EventSource' in window)) return;
  if (eventSource) return;

  try {
    eventSource = new EventSource('/api/realtime/stream');

    eventSource.onmessage = (evt) => {
      try {
        const payload: RealtimeEventPayload = JSON.parse(evt.data);
        if (payload && payload.type && payload.type !== 'CONNECTED') {
          listeners.forEach((cb) => cb(payload));
        }
      } catch (e) {
        // ignore parse error
      }
    };

    eventSource.onerror = () => {
      // Automatic reconnection handled by EventSource browser standard
    };
  } catch (e) {
    console.warn('EventSource initialization error:', e);
  }
}

// Trigger SSE initialization on load
if (typeof window !== 'undefined') {
  initSseConnection();
}

/**
 * Dispatch a realtime event to current tab and broadcast locally
 */
export const notifyRealtimeEvent = (type: RealtimeEventType, data?: any) => {
  const payload: RealtimeEventPayload = {
    type,
    data,
    timestamp: Date.now(),
  };

  // Dispatch DOM event in current tab
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
    try {
      localStorage.setItem(STORAGE_TRIGGER_KEY, JSON.stringify(payload));
    } catch (e) {}
  }
};

/**
 * Subscribe to realtime events (combining SSE + local storage events)
 */
export const subscribeRealtime = (callback: (event: RealtimeEventPayload) => void) => {
  if (typeof window === 'undefined') return () => {};

  listeners.add(callback);

  // Custom DOM event listener
  const handleCustomEvent = (e: Event) => {
    const customEvt = e as CustomEvent<RealtimeEventPayload>;
    if (customEvt.detail) {
      callback(customEvt.detail);
    }
  };
  window.addEventListener(EVENT_NAME, handleCustomEvent);

  // Storage event listener fallback across windows/tabs
  const handleStorageEvent = (evt: StorageEvent) => {
    if (evt.key === STORAGE_TRIGGER_KEY && evt.newValue) {
      try {
        const payload: RealtimeEventPayload = JSON.parse(evt.newValue);
        callback(payload);
      } catch (e) {}
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    listeners.delete(callback);
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
