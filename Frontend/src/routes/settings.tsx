import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import type { ChangePasswordRequest } from '@/api/auth/types';
import { authClient } from '@/api/auth/authClient';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function SettingsPage() {
  const { user, logout, logoutAll } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const changePasswordMutation = useMutation({
    mutationFn: (request: ChangePasswordRequest) =>
      authClient.changePassword(request),
    onMutate: () => {
      setPasswordError(null);
    },
    onSuccess: async () => {
      await logout();
    },
    onError: () => {
      setPasswordError(
        'Could not change the password. Check your current password and try again.',
      );
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
  });

  if (!user) {
    return null;
  }

  const passwordValidationError = (() => {
    if (newPassword.length > 0 && newPassword.length < 12) {
      return 'Use at least 12 characters.';
    }

    if (newPassword.length > 0 && newPassword === currentPassword) {
      return 'The new password must be different from the current password.';
    }

    if (confirmPassword.length > 0 && confirmPassword !== newPassword) {
      return 'The passwords do not match.';
    }

    return null;
  })();

  const canChangePassword =
    currentPassword.length > 0 &&
    newPassword.length >= 12 &&
    confirmPassword === newPassword &&
    passwordValidationError === null &&
    !changePasswordMutation.isPending;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account and password.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Display name</span>
            <span className="font-medium">{user.displayName ?? '—'}</span>
          </div>
          {user.lastLoginAt ? (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Last login</span>
              <span className="font-medium">
                {formatDate(user.lastLoginAt)}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Changing your password revokes every refresh token. Existing access
            tokens expire within 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();

              if (!canChangePassword) {
                return;
              }

              changePasswordMutation.mutate({
                currentPassword,
                newPassword,
              });
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </Field>
            </FieldGroup>

            {passwordValidationError ? (
              <FieldError className="mt-3">
                {passwordValidationError}
              </FieldError>
            ) : null}

            {passwordError ? (
              <FieldError className="mt-3">{passwordError}</FieldError>
            ) : null}

            <Button
              type="submit"
              className="mt-4"
              disabled={!canChangePassword}
            >
              {changePasswordMutation.isPending
                ? 'Changing password…'
                : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign out everywhere</CardTitle>
          <CardDescription>
            Revoke every refresh token, including this one. Existing access
            tokens expire within 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            disabled={logoutAllMutation.isPending}
            onClick={() => {
              logoutAllMutation.mutate();
            }}
          >
            {logoutAllMutation.isPending
              ? 'Signing out…'
              : 'Sign out of all devices'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
