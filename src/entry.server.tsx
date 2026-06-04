import { renderToString } from 'react-dom/server'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'

export default function render() {
  const router = getRouter()
  return renderToString(<RouterProvider router={router} />)
}
