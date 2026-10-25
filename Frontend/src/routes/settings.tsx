import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChangePasswordRequest, Session } from '@/api/auth/types';
import { authClient } from '@/api/auth/authClient';
import { authKeys } from '@/api/auth/keys';
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
  const queryClient = useQueryClient();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const sessionsQuery = useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authClient.getSessions(),
  });

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

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => authClient.revokeSession(sessionId),
    onSuccess: async (_data, sessionId) => {
      const revokedSession = sessionsQuery.data?.find(
        (session) => session.id === sessionId,
      );

      if (revokedSession?.isCurrent) {
        await logout();
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: authKeys.sessions(),
      });
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
          Manage your account and active sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
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
            Changing your password revokes every refresh session. Existing
            access tokens expire within 15 minutes.
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
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Devices with a valid refresh session. Revoking a session stops it
            from refreshing; its current access token expires within 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessionsQuery.isPending ? (
            <p className="text-muted-foreground text-sm">Loading sessions…</p>
          ) : null}

          {sessionsQuery.isError ? (
            <p className="text-destructive text-sm">
              Could not load active sessions.
            </p>
          ) : null}

          {sessionsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No active sessions found.
            </p>
          ) : null}

          {sessionsQuery.data?.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              isRevoking={
                revokeSessionMutation.isPending &&
                revokeSessionMutation.variables === session.id
              }
              onRevoke={() => {
                revokeSessionMutation.mutate(session.id);
              }}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign out everywhere</CardTitle>
          <CardDescription>
            Revoke every refresh session, including this one. Existing access
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

function SessionRow({
  session,
  isRevoking,
  onRevoke,
}: {
  session: Session;
  isRevoking: boolean;
  onRevoke: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">
            {session.isCurrent ? 'This device' : 'Other device'}
          </p>
          {session.isCurrent ? (
            <span className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs">
              Current
            </span>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Last used {formatDate(session.lastUsedAt)}
        </p>
        <p className="text-muted-foreground text-xs">
          Created {formatDate(session.createdAt)}
        </p>
        <p className="text-muted-foreground mt-1 text-xs break-words">
          {session.ipAddress ?? 'Unknown IP'}
          {session.userAgent ? ` · ${session.userAgent}` : ''}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isRevoking}
        onClick={onRevoke}
      >
        {isRevoking ? 'Revoking…' : 'Revoke'}
      </Button>
    </div>
  );
}
