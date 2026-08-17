import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://estudio.radioamerica.com.ve';

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch('http://localhost:3005/api/videos', { next: { revalidate: 3600 } });
    if (res.ok) {
      const videos = await res.json();
      if (Array.isArray(videos)) {
        dynamicRoutes = videos.map((video: any) => ({
          url: `${baseUrl}/watch/${video.id}`,
          lastModified: new Date(video.createdAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (e) {
    // Si falla el fetch en build, continúa con las rutas fijas
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...dynamicRoutes,
  ];
}
