import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { IA } from './ai.functions';

const ia = IA();
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <IA />
  </StrictMode>
)
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'

const router = getRouter()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
