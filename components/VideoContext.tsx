"use client";
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from './services/api';

export interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  isFeatured: boolean;
  isLive?: boolean;
  isShort?: boolean;
  isAudio?: boolean;
  url: string;
  duration: string;
  views: number;
  likes?: number;
  createdAt: string;
  programId?: string;
  releaseDate?: string;
  pressNoteUrl?: string;
  sendNewsletter?: boolean;
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
  hostImage?: string;
}

export interface Banner {
  id: string;
  title?: string;
  imageUrl: string;
  url?: string;
  createdAt?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  url: string;
  programId?: string;
  type?: 'audio' | 'video';
  assignedEntities?: string[];
  createdAt?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar: string;
  bio?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
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
  banners: Banner[];
  addBanner: (banner: Banner) => Promise<boolean>;
  updateBanner: (banner: Banner) => Promise<boolean>;
  deleteBanner: (id: string) => void;
  sponsors: Sponsor[];
  addSponsor: (sponsor: Sponsor) => Promise<boolean>;
  updateSponsor: (sponsor: Sponsor) => Promise<boolean>;
  deleteSponsor: (id: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  incrementView: (id: string) => void;
  incrementLike: (id: string) => void;
  viewHistory: Video[];
  addToHistory: (id: string) => void;
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
  banners: [],
  addBanner: async () => false,
  updateBanner: async () => false,
  deleteBanner: () => {},
  sponsors: [],
  addSponsor: async () => false,
  updateSponsor: async () => false,
  deleteSponsor: () => {},
  userProfile: { firstName: '', lastName: '', avatar: '', bio: '', twitter: '', instagram: '', youtube: '', facebook: '' },
  updateUserProfile: () => {},
  incrementView: () => {},
  incrementLike: () => {},
  viewHistory: [],
  addToHistory: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

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
        <img src="/logo_colors.png" className="absolute w-full h-full object-contain opacity-10 dark:hidden grayscale" alt="Loading" />
        <img src="/logo_blanco.png" className="absolute w-full h-full object-contain opacity-10 hidden dark:block grayscale" alt="Loading" />
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

// El cliente asume que Nginx redirige /api hacia el backend en producción.
// Si no, puedes forzar la URL absoluta: https://estudio.radioamerica.com.ve/api
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3005/api');

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Admin', lastName: 'User', avatar: '', bio: '', twitter: '', instagram: '', youtube: '', facebook: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewHistoryIds, setViewHistoryIds] = useState<string[]>(() => {
    const saved = (typeof window !== 'undefined' ? localStorage.getItem('radioamerica_history') : null);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    applyTheme(mediaQuery);
    mediaQuery.addEventListener('change', applyTheme);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const adminToken = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null) || '';
        const [videosRes, programsRes, sponsorsRes, bannersRes, profileRes] = await Promise.allSettled([
          apiService.fetchVideos(),
          apiService.fetchPrograms(),
          apiService.fetchSponsors(),
          apiService.fetchBanners(),
          adminToken ? apiService.fetchProfile(adminToken) : Promise.resolve(null)
        ]);

        if (videosRes.status === 'fulfilled') setVideos(videosRes.value);
        if (programsRes.status === 'fulfilled') setPrograms(programsRes.value);
        if (sponsorsRes.status === 'fulfilled') setSponsors(sponsorsRes.value);
        if (bannersRes.status === 'fulfilled') setBanners(bannersRes.value);
        if (profileRes.status === 'fulfilled' && profileRes.value?.firstName) {
          setUserProfile(profileRes.value);
        }
      } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
      }
      finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  const handleAlerts = (success: boolean, msg: string) => {
    if (success) {
      alert(`✅ ${msg}`);
      return true;
    }
    alert("❌ Fallo de conexión con el servidor.");
    return false;
  };

  const addVideo = async (video: Video) => {
    try {
      const success = await apiService.createVideo(video, false);
      if (handleAlerts(success, 'Episodio guardado exitosamente')) setVideos([video, ...videos]);
    } catch (e) { handleAlerts(false, ''); }
  };

  const updateVideo = async (updatedVideo: Video) => {
    try {
      const success = await apiService.updateVideo(updatedVideo);
      if (handleAlerts(success, 'Episodio actualizado exitosamente')) setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
    } catch (e) { handleAlerts(false, ''); }
  };

  const deleteVideo = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      try {
        const success = await apiService.deleteVideo(id);
        if (handleAlerts(success, 'Episodio eliminado')) setVideos(videos.filter(v => v.id !== id));
      } catch (e) { handleAlerts(false, ''); }
    }
  };

  const addProgram = async (program: Program) => {
    try {
      const success = await apiService.createProgram(program);
      if (handleAlerts(success, 'Programa creado exitosamente')) setPrograms([program, ...programs]);
    } catch (e) { handleAlerts(false, ''); }
  };

  const updateProgram = async (updatedProgram: Program) => {
    try {
      const success = await apiService.updateProgram(updatedProgram);
      if (handleAlerts(success, 'Programa actualizado')) setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    } catch (e) { handleAlerts(false, ''); }
  };

  const deleteProgram = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      try {
        const success = await apiService.deleteProgram(id);
        if (handleAlerts(success, 'Programa eliminado')) setPrograms(programs.filter(p => p.id !== id));
      } catch (e) { handleAlerts(false, ''); }
    }
  };

  const addBanner = async (banner: Banner) => {
    try {
      const success = await apiService.createBanner(banner);
      if (handleAlerts(success, 'Banner publicitario creado con éxito')) {
        setBanners([banner, ...banners]);
        return true;
      }
      return false;
    } catch (e) {
      handleAlerts(false, '');
      return false;
    }
  };

  const updateBanner = async (banner: Banner) => {
    try {
      const success = await apiService.updateBanner(banner);
      if (handleAlerts(success, 'Banner publicitario actualizado')) {
        setBanners(banners.map(b => b.id === banner.id ? banner : b));
        return true;
      }
      return false;
    } catch (e) {
      handleAlerts(false, '');
      return false;
    }
  };

  const deleteBanner = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este banner publicitario?")) {
      try {
        const success = await apiService.deleteBanner(id);
        if (handleAlerts(success, 'Banner eliminado')) setBanners(banners.filter(b => b.id !== id));
      } catch (e) {}
    }
  };

  const addSponsor = async (sponsor: Sponsor) => {
    try {
      const success = await apiService.createSponsor(sponsor);
      if (handleAlerts(success, 'Cuña registrada exitosamente')) {
        setSponsors([sponsor, ...sponsors]);
        return true;
      }
      return false;
    } catch (e) { 
      handleAlerts(false, ''); 
      return false;
    }
  };

  const updateSponsor = async (sponsor: Sponsor) => {
    try {
      const success = await apiService.updateSponsor(sponsor);
      if (handleAlerts(success, 'Cuña actualizada exitosamente')) {
        setSponsors(sponsors.map(s => s.id === sponsor.id ? sponsor : s));
        return true;
      }
      return false;
    } catch (e) { 
      handleAlerts(false, ''); 
      return false;
    }
  };

  const deleteSponsor = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar esta cuña? Esto no la borrará de los episodios donde ya esté incrustada.")) {
      try {
        const success = await apiService.deleteSponsor(id);
        if (handleAlerts(success, 'Cuña eliminada')) setSponsors(sponsors.filter(s => s.id !== id));
      } catch (e) { }
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const adminToken = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null) || '';
      const success = await apiService.updateProfile(profile, adminToken);
      if (handleAlerts(success, 'Perfil guardado con éxito')) setUserProfile(profile);
    } catch (e) { handleAlerts(false, ''); }
  };

  const incrementView = async (id: string) => {
    try { 
      apiService.incrementView(id);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, views: (v.views || 0) + 1 } : v));
    } catch (e) {}
  };

  const incrementLike = async (id: string) => {
    try { 
      apiService.incrementLike(id);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, likes: (v.likes || 0) + 1 } : v));
    } catch (e) {}
  };

  const addToHistory = (id: string) => {
    setViewHistoryIds(prev => {
      const filtered = prev.filter(vId => vId !== id);
      const newHistory = [id, ...filtered].slice(0, 15);
      if (typeof window !== 'undefined') localStorage.setItem('radioamerica_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const viewHistory = viewHistoryIds.map(id => videos.find(v => v.id === id)).filter(v => v !== undefined) as Video[];

  return (
    <VideoContext.Provider value={{ videos, addVideo, updateVideo, deleteVideo, programs, addProgram, updateProgram, deleteProgram, banners, addBanner, updateBanner, deleteBanner, sponsors, addSponsor, updateSponsor, deleteSponsor, userProfile, updateUserProfile, incrementView, incrementLike, viewHistory, addToHistory, isLoading, setIsLoading }}>
      {isLoading ? <RadioAmericaLoader fullScreen={true} /> : children}
    </VideoContext.Provider>
  );
};