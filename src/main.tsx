import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Watch from './Watch.tsx'
import ProgramView from './Program.tsx'
import { VideoProvider } from './VideoContext.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/watch/:id",
    element: <Watch />,
  },
  {
    path: "/program/:id",
    element: <ProgramView />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VideoProvider>
      <RouterProvider router={router} />
    </VideoProvider>
  </StrictMode>,
)
