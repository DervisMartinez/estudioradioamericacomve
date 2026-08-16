import type { Metadata } from 'next';
import { ReactNode } from 'react';

type Props = {
  params: Promise<{ id: string }>;
};

// Obtenemos los datos del programa desde el servidor para generar etiquetas SEO
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    // En Docker host network, el backend está en localhost:3005
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
    const res = await fetch(`${apiUrl}/programs/${params.id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Programa no encontrado');
    const program = await res.json();
    
    return {
      title: `${program.name} | Estudio Radio América`,
      description: program.description || `Escucha los episodios de ${program.name} en Estudio Radio América.`,
      openGraph: {
        title: program.name,
        description: program.description || `Escucha los episodios de ${program.name} en Estudio Radio América.`,
        images: [program.thumbnail || '/logo_colors.png'],
      },
    };
  } catch (error) {
    return {
      title: 'Programa | Estudio Radio América',
    };
  }
}

export default function ProgramLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
