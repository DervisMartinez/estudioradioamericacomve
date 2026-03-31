import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  isFeatured: boolean;
  isShort?: boolean;
  isAudio?: boolean;
  url: string;
  duration: string;
  views: number;
  createdAt: string;
  programId?: string;
  releaseDate?: string;
}

export interface Program {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  type: 'Programa' | 'Podcast';
  description?: string;
  schedule?: string;
  host?: string;
  coverImage?: string;
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
  updateProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  incrementView: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const VideoContext = createContext<VideoContextType>({
  videos: [],
  addVideo: () => {},
  updateVideo: () => {},
  deleteVideo: () => {},
  programs: [],
  addProgram: () => {},
  updateProgram: () => {},
  deleteProgram: () => {},
  userProfile: { firstName: '', lastName: '', avatar: '', bio: '', twitter: '', instagram: '' },
  updateUserProfile: () => {},
  incrementView: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

// --- LOADER GLOBAL DE LA APP ---
export const RadioAmericaLoader = ({ fullScreen = true }: { fullScreen?: boolean }) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-[10000]' : 'w-full h-48'} flex flex-col items-center justify-center bg-white dark:bg-[#131314] transition-colors duration-300`}>
      <style>{`
        @keyframes fillUpClip {
          0% { clip-path: inset(100% 0 0 0); opacity: 0; }
          15% { opacity: 1; }
          50% { clip-path: inset(0 0 0 0); opacity: 1; }
          85% { opacity: 1; }
          100% { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
        .animate-fill-logo {
          animation: fillUpClip 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        {/* Silueta Base */}
        <img src="/logo_colors.png" className="absolute w-full h-full object-contain opacity-10 dark:hidden grayscale" alt="Loading" />
        <img src="/logo_blanco.png" className="absolute w-full h-full object-contain opacity-10 hidden dark:block grayscale" alt="Loading" />
        
        {/* Llenado animado */}
        <img src="/logo_colors.png" className="absolute w-full h-full object-contain dark:hidden animate-fill-logo" alt="Loading" />
        <img src="/logo_blanco.png" className="absolute w-full h-full object-contain hidden dark:block animate-fill-logo" alt="Loading" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#C13535] animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#F07D00] animate-bounce" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#FFB91F] animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C13535] dark:text-[#DDDADB] mt-2 opacity-80">
          Cargando
        </span>
      </div>
    </div>
  );
}

// Al usar solo '/api', Vite enviará los datos al puerto 3000 en local, y en producción Nginx hará lo mismo.
const API_URL = '/api';

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Admin', lastName: 'User', avatar: '', bio: '', twitter: '', instagram: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicializar el tema globalmente para que el loader responda al instante
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && document.documentElement.classList.contains('dark'))) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [videosRes, programsRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/videos`),
          fetch(`${API_URL}/programs`),
          fetch(`${API_URL}/profile`)
        ]);

        if (videosRes.ok) setVideos(await videosRes.json());
        if (programsRes.ok) setPrograms(await programsRes.json());
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.firstName) setUserProfile(profileData);
        }
      } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función auxiliar para manejar respuestas y notificar al usuario
  const handleResponse = async (res: Response, successMsg: string) => {
    if (res.ok) {
      alert(`✅ ${successMsg}`);
      return true;
    }
    if (res.status === 413) {
      alert("❌ Error: El archivo es demasiado pesado. Pídele al administrador del servidor que aumente el 'client_max_body_size' en Nginx.");
    } else {
      const errData = await res.json().catch(() => ({}));
      alert(`❌ Error al guardar: ${errData.error || res.statusText}`);
    }
    return false;
  };

  const addVideo = async (video: Video) => {
    try {
      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(video)
      });
      if (await handleResponse(res, 'Episodio guardado exitosamente')) {
        setVideos([video, ...videos]);
      }
    } catch (error) { 
      console.error(error); 
      alert("❌ Fallo de conexión con el servidor.");
    }
  };

  const updateVideo = async (updatedVideo: Video) => {
    try {
      const res = await fetch(`${API_URL}/videos/${updatedVideo.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedVideo)
      });
      if (await handleResponse(res, 'Episodio actualizado exitosamente')) {
        setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
      }
    } catch (error) { 
      console.error(error); 
      alert("❌ Fallo de conexión con el servidor.");
    }
  };

  const deleteVideo = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      try {
        const res = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' });
        if (await handleResponse(res, 'Episodio eliminado')) {
          setVideos(videos.filter(v => v.id !== id));
        }
      } catch (error) { 
        console.error(error); 
        alert("❌ Fallo de conexión con el servidor.");
      }
    }
  };

  const addProgram = async (program: Program) => {
    try {
      const res = await fetch(`${API_URL}/programs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(program)
      });
      if (await handleResponse(res, 'Programa creado exitosamente')) {
        setPrograms([program, ...programs]);
      }
    } catch (error) { 
      console.error(error); 
      alert("❌ Fallo de conexión con el servidor.");
    }
  };

  const updateProgram = async (updatedProgram: Program) => {
    try {
      const res = await fetch(`${API_URL}/programs/${updatedProgram.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProgram)
      });
      if (await handleResponse(res, 'Programa actualizado')) {
        setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
      }
    } catch (error) { 
      console.error(error); 
      alert("❌ Fallo de conexión con el servidor.");
    }
  };

  const deleteProgram = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      try {
        const res = await fetch(`${API_URL}/programs/${id}`, { method: 'DELETE' });
        if (await handleResponse(res, 'Programa eliminado')) {
          setPrograms(programs.filter(p => p.id !== id));
        }
      } catch (error) { 
        console.error(error); 
        alert("❌ Fallo de conexión con el servidor.");
      }
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
      });
      if (await handleResponse(res, 'Perfil guardado con éxito')) {
        setUserProfile(profile);
      }
    } catch (error) { 
      console.error(error); 
      alert("❌ Fallo de conexión con el servidor.");
    }
  };

  const incrementView = async (id: string) => {
    try {
      // No necesitamos esperar la respuesta, es una acción de "dispara y olvida"
      fetch(`${API_URL}/videos/${id}/view`, { method: 'POST' });
    } catch (error) { console.error(error); }
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, updateVideo, deleteVideo, programs, addProgram, updateProgram, deleteProgram, userProfile, updateUserProfile, incrementView, isLoading, setIsLoading }}>
      {isLoading ? <RadioAmericaLoader fullScreen={true} /> : children}
    </VideoContext.Provider>
  );
};