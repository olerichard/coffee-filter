import type { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>;
}
