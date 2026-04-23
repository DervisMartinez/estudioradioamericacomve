import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import * as Sentry from "@sentry/react";
import App from "../App";
import Watch from "../Watch";
import ProgramView from "../Program";
import AllPrograms from "../AllPrograms";
import Admin from "../Admin";
import Login from "../Login";
import NotFound from "../NotFound";
import { VideoProvider } from "../VideoContext";
import { initMixpanel } from "./mixpanel";

// Importar los estilos globales (Tailwind CSS)
import "../index.css"; 

// 1. Inicializar servicios de terceros
Sentry.init({
  dsn: "https://775f7f4cbb92fd15dbc2bebad7fe5abe@o4511270070059008.ingest.us.sentry.io/4511270076809216",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  // Monitoreo de Rendimiento
  tracesSampleRate: 1.0, 
  // Grabación de Sesiones (Replay)
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

initMixpanel();

// 2. Configurar el Enrutador y las Páginas
const router = createBrowserRouter([
  { path: "/", element: <App />, errorElement: <NotFound /> },
  { path: "/watch/:id", element: <Watch />, errorElement: <NotFound /> },
  { path: "/program/:id", element: <ProgramView />, errorElement: <NotFound /> },
  { path: "/programas", element: <AllPrograms />, errorElement: <NotFound /> },
  { path: "/admin", element: <Admin />, errorElement: <NotFound /> },
  { path: "/login", element: <Login />, errorElement: <NotFound /> },
  { path: "*", element: <NotFound /> } // Ruta comodín para atrapar URLs inexistentes (ej: /hola)
]);

// 3. Renderizar la aplicación con todos sus contextos
const container = document.getElementById("root"); // Corregido a "root" coincidiendo con tu HTML
if (container) {
  const root = createRoot(container);
  root.render(
    <HelmetProvider>
      <VideoProvider>
        <RouterProvider router={router} />
      </VideoProvider>
    </HelmetProvider>
  );
}