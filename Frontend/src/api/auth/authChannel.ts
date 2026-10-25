const CHANNEL_NAME = 'coffee-filter-auth';
const LOGOUT_MESSAGE = 'logout';

export function broadcastLogout(): void {
  if (typeof BroadcastChannel === 'undefined') {
    return;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(LOGOUT_MESSAGE);
  channel.close();
}

export function subscribeToLogout(callback: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined;
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener('message', (event) => {
    if (event.data === LOGOUT_MESSAGE) {
      callback();
    }
  });

  return () => channel.close();
}
