import type { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return <div className="mx-auto max-w-2xl">{children}</div>;
}
