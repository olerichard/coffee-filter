import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';

interface BaseLayoutProps {
  children: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      {isAuthenticated ? (
        <header className="flex items-center justify-between px-4 py-3 sm:px-0">
          <Link to="/" className="text-lg font-semibold">
            Coffee Filter
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">Settings</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void logout();
              }}
            >
              Log out
            </Button>
          </nav>
        </header>
      ) : null}
      {children}
    </div>
  );
}
