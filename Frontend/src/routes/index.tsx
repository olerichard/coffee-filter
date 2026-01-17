import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: () => {},
})

function App() {
  return <div>base</div>
}
