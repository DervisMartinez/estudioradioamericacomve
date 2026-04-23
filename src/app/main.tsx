import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "../App"; // Importación actualizada (sube un nivel)
import { initMixpanel } from "./mixpanel";

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

// 2. Renderizar la aplicación de React
const container = document.getElementById("root"); // Corregido a "root" coincidiendo con tu HTML
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}