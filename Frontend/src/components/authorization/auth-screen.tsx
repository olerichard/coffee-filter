import { useEffect, useState } from 'react';
import { Login } from './login';
import { Register } from './register';
import { authClient } from '@/api/auth/authClient';

type AuthMode = 'login' | 'register';

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupEnabled, setSignupEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void authClient.signupStatus().then((status) => {
      if (!cancelled) {
        setSignupEnabled(status.enabled);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === 'register' && signupEnabled) {
    return <Register onSwitchToLogin={() => setMode('login')} />;
  }

  return (
    <Login
      signupEnabled={signupEnabled}
      onSwitchToRegister={() => setMode('register')}
    />
  );
};
