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
});

const API_URL = '/api';

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'Admin', lastName: 'User', avatar: '', bio: '', twitter: '', instagram: ''
  });

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, []);

  const addVideo = async (video: Video) => {
    try {
      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(video)
      });
      if (res.ok) setVideos([video, ...videos]);
    } catch (error) { console.error(error); }
  };

  const updateVideo = async (updatedVideo: Video) => {
    try {
      const res = await fetch(`${API_URL}/videos/${updatedVideo.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedVideo)
      });
      if (res.ok) setVideos(videos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
    } catch (error) { console.error(error); }
  };

  const deleteVideo = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este video?")) {
      try {
        const res = await fetch(`${API_URL}/videos/${id}`, { method: 'DELETE' });
        if (res.ok) setVideos(videos.filter(v => v.id !== id));
      } catch (error) { console.error(error); }
    }
  };

  const addProgram = async (program: Program) => {
    try {
      const res = await fetch(`${API_URL}/programs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(program)
      });
      if (res.ok) setPrograms([program, ...programs]);
    } catch (error) { console.error(error); }
  };

  const updateProgram = async (updatedProgram: Program) => {
    try {
      const res = await fetch(`${API_URL}/programs/${updatedProgram.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedProgram)
      });
      if (res.ok) setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    } catch (error) { console.error(error); }
  };

  const deleteProgram = async (id: string) => {
    if(window.confirm("¿Estás seguro de que deseas eliminar este programa?")) {
      try {
        const res = await fetch(`${API_URL}/programs/${id}`, { method: 'DELETE' });
        if (res.ok) setPrograms(programs.filter(p => p.id !== id));
      } catch (error) { console.error(error); }
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
      });
      if (res.ok) setUserProfile(profile);
    } catch (error) { console.error(error); }
  };

  return (
    <VideoContext.Provider value={{ videos, addVideo, updateVideo, deleteVideo, programs, addProgram, updateProgram, deleteProgram, userProfile, updateUserProfile }}>
      {children}
    </VideoContext.Provider>
  );
};