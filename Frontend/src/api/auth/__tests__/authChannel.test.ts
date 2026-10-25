import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type MessageHandler = (event: MessageEvent) => void;

class FakeBroadcastChannel {
  private static channels = new Map<string, Set<FakeBroadcastChannel>>();

  private readonly handlers = new Set<MessageHandler>();

  constructor(private readonly name: string) {
    const channels = FakeBroadcastChannel.channels.get(name) ?? new Set();
    channels.add(this);
    FakeBroadcastChannel.channels.set(name, channels);
  }

  static reset(): void {
    FakeBroadcastChannel.channels.clear();
  }

  addEventListener(_type: 'message', handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  postMessage(data: unknown): void {
    const channels = FakeBroadcastChannel.channels.get(this.name) ?? new Set();

    for (const channel of channels) {
      if (channel !== this) {
        channel.dispatch(data);
      }
    }
  }

  close(): void {
    FakeBroadcastChannel.channels.get(this.name)?.delete(this);
  }

  private dispatch(data: unknown): void {
    for (const handler of this.handlers) {
      handler({ data } as MessageEvent);
    }
  }
}

beforeEach(() => {
  FakeBroadcastChannel.reset();
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('authChannel', () => {
  it('ignores logout broadcasts from the same tab', async () => {
    const { broadcastLogout, subscribeToLogout } =
      await import('../authChannel');
    const callback = vi.fn();

    const unsubscribe = subscribeToLogout(callback);
    broadcastLogout();

    expect(callback).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('handles logout broadcasts from another tab', async () => {
    const { subscribeToLogout } = await import('../authChannel');
    const callback = vi.fn();
    const externalTab = new BroadcastChannel('coffee-filter-auth');

    const unsubscribe = subscribeToLogout(callback);
    externalTab.postMessage({ type: 'logout', tabId: 'other-tab' });

    expect(callback).toHaveBeenCalledTimes(1);

    externalTab.close();
    unsubscribe();
  });

  it('handles legacy string logout broadcasts from older tabs', async () => {
    const { subscribeToLogout } = await import('../authChannel');
    const callback = vi.fn();
    const externalTab = new BroadcastChannel('coffee-filter-auth');

    const unsubscribe = subscribeToLogout(callback);
    externalTab.postMessage('logout');

    expect(callback).toHaveBeenCalledTimes(1);

    externalTab.close();
    unsubscribe();
  });
});
