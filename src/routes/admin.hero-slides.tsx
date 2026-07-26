import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/hero-slides')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/hero-slides"!</div>
}
