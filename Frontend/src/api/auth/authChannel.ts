const CHANNEL_NAME = 'coffee-filter-auth';
const LOGOUT_MESSAGE = 'logout';

const tabId = createTabId();

interface LogoutMessage {
  type: typeof LOGOUT_MESSAGE;
  tabId: string;
}

export function broadcastLogout(): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: LOGOUT_MESSAGE, tabId } satisfies LogoutMessage);
  channel.close();
}

export function subscribeToLogout(callback: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener('message', (event) => {
    if (
      event.data === LOGOUT_MESSAGE ||
      (isLogoutMessage(event.data) && event.data.tabId !== tabId)
    ) {
      callback();
    }
  });

  return () => channel.close();
}

function isLogoutMessage(value: unknown): value is LogoutMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === LOGOUT_MESSAGE &&
    'tabId' in value &&
    typeof value.tabId === 'string'
  );
}

function createTabId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
