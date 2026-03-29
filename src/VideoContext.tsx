import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  isFeatured: boolean;
  isShort?: boolean;
  url: string;
  duration: string;
  views: number;
  createdAt: string;
  programId?: string;
}

export interface Program {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar: string;
  bio?: string;
  twitter?: string;
  instagram?: string;
}

interface VideoContextType {
  videos: Video[];
  addVideo: (video: Video) => void;
  updateVideo: (video: Video) => void;
  deleteVideo: (id: string) => void;
  programs: Program[];
  addProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
}

export const VideoContext = createContext<VideoContextType>({
  videos: [],
  addVideo: () => {},
  updateVideo: () => {},
  deleteVideo: () => {},
  programs: [],
  addProgram: () => {},
  deleteProgram: () => {},
  userProfile: { firstName: '', lastName: '', avatar: '', bio: '', twitter: '', instagram: '' },
  updateUserProfile: () => {},
});

// Datos iniciales para que el dashboard no esté vacío la primera vez
const defaultVideos: Video[] = [
  { id: '1', title: 'El Legado de Monseñor Adam', category: 'Historia', description: 'Un repaso por la vida de Monseñor.', isFeatured: false, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtwhCdMgSD16FVD6f6JvFtT9bimQlgsT158wMh1t46O67izpfNVjU2N0jEVO0gG_YSTSPjrU7TbTrU90QBQj1eZyGPqff0tz1j5XBxC_Me5eUFkArbkXIISgc2V7lETmY1LJVVUKEzS9Sva9idqcJiDxeS8irixvZXDZoPgSzmx7jxsFkC_yjBmA4LFIPLGih4H_p6N96uSWYcu0sV8Buk8PQu-cL7Hi9E9OozrTShkuOtNDqxHZ8wGPHVmNyd7ORE21LaB0Gig8zV', url: 'https://youtube.com', duration: '12:45', views: 12500, createdAt: new Date(Date.now() - 86400000).toISOString(), programId: 'p1' },
  { id: '2', title: 'Crónicas de la Libertad 1920', category: 'Documentales', description: 'Historia de libertad.', isFeatured: false, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3QT5kwoZz15OdPLG61_r98CvL_j_afDPj3_1V7Kns02fafPq7ysLYXjdNnuP-Kp538Cdc8iQD_P46gwpMURbGeRx5rPCOyiED85F300jWN5kT2LVHYsmNBtL318gV3ZM7cfIhymFYBg9WJRzC3o38xdmYH9h4qm_tcWa9bTLQG_miE6bJr2bl--9e8g_clKpRLyoSWbSG_KdNpnvDg_4vAtYH3miX8fcKfvVzXRXJpopJdyWQvqktmeQEoaLYn1-S5zRAeM3eFNpf', url: 'https://youtube.com', duration: '45:10', views: 8300, createdAt: new Date(Date.now() - 172800000).toISOString(), programId: 'p2' },
  { id: '3', title: 'Entrevista: Luis Beltrán Prieto', category: 'Personajes', description: 'Conversación exclusiva.', isFeatured: false, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1NXW9D5Mr4dnvF2Ig-TDmojvPKCwpMbJCJJXew2R2beArg1Q4TVmqL2Piy4m0AEFOkl_bRNtHFcKatCDrIu-DFv5L6aZ3LdoFSsC4yyzGJzSqEYvNRVZ6jjSFlbFKv-OdAtgkfUYrd0dwyAzJoU3zlwVx2CNZjzIFeaNsVX4ZUHXEvPBNwinyWL5SV6Hec019udBYtTuFuS0zxKig_p0-bG9w9uQp8Zud2HutuLw_8dB91fYFJGBhliA0HBnyxQV2ZqtNZM_LlK5i', url: 'https://youtube.com', duration: '08:22', views: 42000, createdAt: new Date(Date.now() - 432000000).toISOString(), programId: 'p3' },
  { id: '4', title: 'Estudio Radio América: 70 Años de Voz', category: 'Archivo', description: 'Aniversario de la radio.', isFeatured: false, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLiyfiLmE87FLSy-U_spzw2HExgvD8GzIR4kNen9tNd9f9ns8iKzhPop-SkgslKrFG_c-_O0DwXo_f1iJsnHG0--WfX8OdB_MJrNb5hr1WwejtHQF8hqxweHPNss-8eWoT3kUT8MAsaHozqsjcFrpn-QSaNOXu8hLQeqxRLZuOh4mZ-kMbvJjSPIZ2nLxeuAKWzbsozhpfuq5KmYosfmCFyFHaX2Jqn_VWmL5KppTIk9lXTDSexrpcyjTw9AcZ55rbOrnw9jylYFzn', url: 'https://youtube.com', duration: '22:00', views: 21500, createdAt: new Date(Date.now() - 864000000).toISOString(), programId: 'p4' },
  { id: '5', title: 'Resumen de Noticias en 1 minuto', category: 'Política', description: 'Lo más destacado de la semana.', isFeatured: false, isShort: true, thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop', url: 'https://www.youtube.com/shorts/12345678901', duration: '0:59', views: 15400, createdAt: new Date().toISOString(), programId: 'p1' },
];

const defaultPrograms: Program[] = [
  { id: 'p1', name: 'Debate Político', category: 'Política', thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoc1Qg5LVpdo2zL0b_cp3r14h5XkLWtxqA0JHe5UojWyBM1Fh7thbtqWkJ9Ro9gb5xZvbDCKPP0QNNFAT6Avy6nkWlm_LeI--MUfI1iLK6jORcTjlG2Xvc1BMfRk0SdT_YOaApBEVntZL-AE5MlQebs7X3z_dteoYZ0oGLIx6sVfZBYxKwKhU1jZ1SpIF93FSBHfsVo6R-LVk6IsRPERmOEILpAtJF5-beMKhPW0JYPOFRRn8Ph1ajiYPjy_CWVEDEN4BN2ctSBNHy' },
  { id: 'p2', name: 'Visión Deportiva', category: 'Deportes', thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSFHBkOHXCW-yTt36ZX7cWK7yAkQkLoW-QL9z3PqkSQh3auFgRzdjjImM3V2TYGi93wbm-Q5gZ3npdb9BoKXby2it5-ZPUqRGqK7VXo-u4xrMi4TB_bJdkEQ-ULERpuSr5GhXzJYBqO-YGbbAVOL3AIwWgRQwH1_XFiexnhKgTxNBUdVlk9h_BYaL-_fVJ-cwLU8DwqiLhZhNxaKcgvkbyoLXWqSCEzxyM87qTTWBy9XVbFRQzyQUYZmN5ZF5iUVo2ZvTnczUclhId' },
  { id: 'p3', name: 'Perfiles de Éxito', category: 'Personajes', thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClntysuUAxBYXccJnomizpFynhCyXBskKa_ZYi44oCJnKloNXdN1MhrKKu2I61Z-kA8a-FEJXdMfr3CGH7p8mPQv4S8VknfSJZ3h3L05adnate9any3ODZrJ2aGMqfWFPfBmBKQ-YQiXzjP56CcfA0_0T3-KkwekD0gCl0Oi8qMKtJi53BgawDPTcoihzkEg0Iz6BJGS7aK8OMsonBLUQmKDfe0J2E1i9xSm3ACOhNaJU4ISl3hrpRK2fcecuYGunn5OJowK1cFiBh' },
  { id: 'p4', name: 'Cultura en la Ciudad', category: 'Cultura', thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ1UK5IaQ4wkydyELExB3MHYc4uebNizWWS8JGcsV1Xk0gyXqtzBwJ40mi0XXhqHJct898q8qcgSP_ppP4lUuzxrP39f4q4HE-enHV94K_ExRnhiLtcC8KRF98UInzRHDllmAyVtSao0aEq_0XfSnCoKOgpoobFHB1cUXpYCN4-rvTXznfUhNar86Id3KXNKOD183k_9LnqMWlWftYGbAc4g1UIzMxe5JPk7AtiQPvWN-6fiHtCNZFn0Wqp9yAXhTv8_ZwIylcWB3u' },
];

// Lector a prueba de fallos (Evita pantallas blancas)
const safeStorageGet = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return defaultValue;
    const parsed = JSON.parse(item);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue) && (typeof parsed !== 'object' || !parsed)) return defaultValue;
    return parsed;
  } catch (error) {
    console.warn(`Reparando memoria de ${key}`);
    return defaultValue;
  }
};

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>(() => safeStorageGet('radio_videos', defaultVideos));
  const [programs, setPrograms] = useState<Program[]>(() => safeStorageGet('radio_programs', defaultPrograms));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => safeStorageGet('radio_profile', {
      firstName: 'Admin',
      lastName: 'User',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1BbI8XbJZgl_0Hr9TabRG3LZ_BLN2DoQo2UM8mdhOscSVn2oBJsrGtwDWYyY1GvMH-uF37RqccvB5NrOglvV3JEZPbUm-mfC7ADhFXpUBU1KNE1DRHqha_DXwRRp1A_dx7dJmSLZOE0m6n_mtseuW8VdqTTY8Hgiy6xH5-GxFuAc71L8ItO-_e-zKSX81wqlhArMgBwE7-D_rtlqztWeYFDC9D-4AIdmnSCagPhmhIOcUp_wwLRT-h1cr-Ln95TF7zl5mzdunpOyW',
      bio: 'Administrador principal del sistema para Estudio Radio América.',
      twitter: '@radioamerica',
      instagram: '@radioamerica_fm'
  }));

  useEffect(() => {
  }, []);

  // Función auxiliar para manejar el límite del navegador (QuotaExceededError)
  const safeStorageSet = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
      alert("⚠️ LÍMITE DE ALMACENAMIENTO ALCANZADO:\n\nEl archivo que subiste es muy pesado para la memoria del navegador. El elemento se muestra en pantalla pero SE BORRARÁ al recargar.\n\nSolución: Usa imágenes de menor resolución o usa Enlaces (URL) en lugar de subir archivos locales (Especialmente para los Videos).");
    }
  };

  const addVideo = (video: Video) => {
    const newVideos = [video, ...videos];
    setVideos(newVideos);
    safeStorageSet('radio_videos', newVideos);
  };

  const updateVideo = (updatedVideo: Video) => {
    const newVideos = videos.map(v => v.id === updatedVideo.id ? updatedVideo : v);
    setVideos(newVideos);
    safeStorageSet('radio_videos', newVideos);
  };

  const deleteVideo = (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      const newVideos = videos.filter(v => v.id !== id);
      setVideos(newVideos);
      safeStorageSet('radio_videos', newVideos);
    }
  };

  const addProgram = (program: Program) => {
    const newPrograms = [program, ...programs];
    setPrograms(newPrograms);
    safeStorageSet('radio_programs', newPrograms);
  };

  const deleteProgram = (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      const newPrograms = programs.filter(p => p.id !== id);
      setPrograms(newPrograms);
      safeStorageSet('radio_programs', newPrograms);
    }
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    safeStorageSet('radio_profile', profile);
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, updateVideo, deleteVideo, programs, addProgram, deleteProgram, userProfile, updateUserProfile }}>
      {children}
    </VideoContext.Provider>
  );
};