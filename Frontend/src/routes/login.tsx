import { useAuth } from '@/components/context/authentication/AuthenticationContext'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import {
  createRoute,
  Link,
  useNavigate,
  createFileRoute,
} from '@tanstack/react-router'
import { useState } from 'react'

const Login = () => {
  const [state, setState] = useState({ username: 'ole', password: 'coffee' })

  const navigate = useNavigate()
  const auth = useAuth()

  const login = useMutation({
    mutationFn: auth.login,
    onSuccess: () => {
      navigate({ to: '/', replace: true })
    },
  })

  if (auth.isAuthenticated) return <Link to="/"></Link>

  return (
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
  )
}

export const Route = createFileRoute('/login')({ component: Login })
