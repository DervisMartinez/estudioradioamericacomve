import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import Watch from "./Watch";
import ProgramView from "./Program";
import AllPrograms from "./AllPrograms";
import Admin from "./Admin";
import Login from "./Login";
import NotFound from "./NotFound";
import { VideoProvider } from "./VideoContext";

// Importar los estilos globales (Tailwind CSS)
import "./index.css"; 

// 1. Configurar el Enrutador y las Páginas
const router = createBrowserRouter([
  { path: "/", element: <App />, errorElement: <NotFound /> },
  { path: "/watch/:id", element: <Watch />, errorElement: <NotFound /> },
  { path: "/program/:id", element: <ProgramView />, errorElement: <NotFound /> },
  { path: "/programas", element: <AllPrograms />, errorElement: <NotFound /> },
  { path: "/admin", element: <Admin />, errorElement: <NotFound /> },
  { path: "/login", element: <Login />, errorElement: <NotFound /> },
  { path: "/NotFound", element: <NotFound /> } // Ruta comodín para atrapar URLs inexistentes (ej: /hola)
]);

// 2. Renderizar la aplicación con todos sus contextos
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