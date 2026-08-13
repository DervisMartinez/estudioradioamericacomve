import type { Metadata } from 'next';
import { VideoProvider } from '@/components/VideoContext';
import './index.css';
import './App.css';

export const metadata: Metadata = {
  title: 'Estudio Radio América',
  description: 'Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América. Podcasts, entrevistas y más.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <VideoProvider>
          {children}
        </VideoProvider>
      </body>
    </html>
  );
}
