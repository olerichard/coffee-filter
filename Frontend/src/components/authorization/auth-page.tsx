import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const AuthPage = ({ children }: { children: ReactNode }) => (
  <div className="pt-16">{children}</div>
);

export const AuthLoading = () => (
  <Card>
    <CardContent className="flex justify-center text-4xl">
      <div>Loading</div>
    </CardContent>
  </Card>
);
