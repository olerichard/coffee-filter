import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';

import { useState } from 'react';
import { Card, CardContent } from '../ui/card';

export const Login = () => {
  const [state, setState] = useState({ username: 'ole', password: 'coffee' });

  const auth = useAuth();

  const login = useMutation({
    mutationFn: auth.login,
  });

  return (
    <Card>
      <CardContent>
        <div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                value={state.username}
                onChange={(e) =>
                  setState((s) => ({ ...s, username: e.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                value={state.password}
                onChange={(e) =>
                  setState((s) => ({ ...s, password: e.target.value }))
                }
              />
            </Field>
          </FieldGroup>

          <Button onClick={() => login.mutate(state)}> Login </Button>
        </div>
      </CardContent>
    </Card>
  );
};
