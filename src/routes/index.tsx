import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div><h1>MentorND está online!</h1></div>,
})
