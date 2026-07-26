import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/faq')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/faq"!</div>
}
