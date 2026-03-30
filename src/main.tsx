import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Admin from './Admin.tsx'
import Watch from './Watch.tsx'
import Login from './Login.tsx'
import AllPrograms from './AllPrograms.tsx'
import ProgramView from './Program.tsx'
import { VideoProvider } from './VideoContext.tsx'
import { HelmetProvider } from 'react-helmet-async'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
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
  {
    path: "/programas",
    element: <AllPrograms />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <VideoProvider>
        <RouterProvider router={router} />
      </VideoProvider>
    </HelmetProvider>
  </StrictMode>,
)
