import type { Metadata } from 'next';
import { VideoProvider } from '@/components/VideoContext';
import './index.css';
import './App.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://estudio.radioamerica.com.ve'),
  title: {
    default: 'Estudio Radio América | Transmisión en Vivo, Programas y Podcasts',
    template: '%s | Estudio Radio América'
  },
  description: 'Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América 90.9 FM. Podcasts, entrevistas exclusivas, programas en vivo y archivos históricos.',
  keywords: ['Radio América', 'Estudio Radio América', 'Radio en Vivo', 'Valencia Venezuela', 'Podcasts Venezuela', 'Noticias', 'Entrevistas', '90.9 FM'],
  authors: [{ name: 'Radio América' }],
  creator: 'Radio América',
  publisher: 'Radio América',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Estudio Radio América | Transmisión en Vivo, Programas y Podcasts',
    description: 'Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América 90.9 FM. Podcasts, entrevistas exclusivas y programas en vivo.',
    url: 'https://estudio.radioamerica.com.ve',
    siteName: 'Estudio Radio América',
    images: [
      {
        url: '/logo_colors.png',
        width: 800,
        height: 600,
        alt: 'Estudio Radio América',
      },
    ],
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estudio Radio América',
    description: 'Podcasts, entrevistas exclusivas, programas en vivo y archivos históricos de Radio América.',
    images: ['/logo_colors.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
