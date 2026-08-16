import type { Metadata } from 'next';
import { ReactNode } from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

// Obtenemos los datos del video desde el servidor para generar etiquetas SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    // En Docker host network, el backend está en localhost:3005
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
    const res = await fetch(`${apiUrl}/videos/${params.id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Video no encontrado');
    const video = await res.json();
    
    return {
      title: `${video.title} | Estudio Radio América`,
      description: video.description || 'Disfruta de este contenido en Estudio Radio América.',
      openGraph: {
        title: video.title,
        description: video.description || 'Disfruta de este contenido en Estudio Radio América.',
        images: [video.thumbnail || '/logo_colors.png'],
      },
    };
  } catch (error) {
    return {
      title: 'Video no encontrado | Estudio Radio América',
    };
  }
}

export default function WatchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
