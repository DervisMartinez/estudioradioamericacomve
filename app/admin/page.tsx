"use client";
import { useState, useContext, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from 'react';
import { VideoContext, RadioAmericaLoader, API_URL, Banner } from "@/components/VideoContext";

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch(e) {
    return null;
  }
};

function Admin() {
  const { videos, addVideo, updateVideo, deleteVideo, programs, addProgram, updateProgram, deleteProgram, banners, addBanner, updateBanner, deleteBanner, sponsors, addSponsor, updateSponsor, deleteSponsor, userProfile, updateUserProfile } = useContext(VideoContext);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'programs' | 'banners' | 'sponsors' | 'analytics' | 'settings' | 'newsletter' | 'users'>('dashboard');
  
  const token = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null);
  const userPayload = token ? decodeJWT(token) : null;
  const userRole = userPayload?.role || 'superadmin';
  const userName = userPayload?.name || (userPayload?.email ? userPayload.email.split('@')[0] : 'Usuario');

  const [analyticsSubTab, setAnalyticsSubTab] = useState<'overview' | 'live' | 'social' | 'audience'>('overview');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('Todos');
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days'>('all');
  const [selectedProgramDetails, setSelectedProgramDetails] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', category: '', thumbnail: '', url: '', description: '', isFeatured: false, isLive: false, isShort: false, isAudio: false, programId: '', releaseDate: '', duration: '', pressNoteUrl: '', sendNewsletter: false });
  const [newProgram, setNewProgram] = useState({ name: '', category: '', thumbnail: '', type: 'Programa' as 'Programa' | 'Podcast', description: '', schedule: '', host: '', coverImage: '', hostImage: '' });
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '', url: '' });
  const [newSponsorForm, setNewSponsorForm] = useState({ name: '', url: '', type: 'audio' as 'audio' | 'video', assignedEntities: [] as string[] });
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState(userProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorCount, setSponsorCount] = useState(1);
  const [sponsorUrls, setSponsorUrls] = useState<string[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setNewBanner({ title: '', imageUrl: '', url: '' });
  };

  const resetVideoForm = (overrides = {}) => {
    setEditingId(null);
    setNewVideo({ title: '', category: '', thumbnail: '', url: '', description: '', isFeatured: false, isLive: false, isShort: false, isAudio: false, programId: '', releaseDate: '', duration: '', pressNoteUrl: '', sendNewsletter: false, ...overrides });
    setIsSponsored(false);
    setSponsorCount(1);
    setSponsorUrls([]);
  };

  useEffect(() => {
    const isAuth = (typeof window !== 'undefined' ? localStorage.getItem('admin_auth') : null);
    if (isAuth !== 'true') {
      router.push('/login');
    } else {
      // Cargar lista de suscriptores al iniciar el panel
      const cacheBuster = `?t=${new Date().getTime()}`;
      fetch(`${API_URL}/subscribers${cacheBuster}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => { if (Array.isArray(data)) setSubscribers(data); })
        .catch(e => console.error("Error cargando suscriptores:", e));
    }
  }, [router]);

  // Radio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'avatar' | 'url' | 'program_thumbnail' | 'program_cover' | 'program_host' | 'sponsor_url' | 'banner_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Comprimir imagen para no llenar el LocalStorage de inmediato
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // Reducir ancho máximo a 600px
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Calidad al 70%
          
          if (field === 'thumbnail') setNewVideo({ ...newVideo, thumbnail: compressedDataUrl });
          else if (field === 'avatar') setProfileForm({ ...profileForm, avatar: compressedDataUrl });
          else if (field === 'program_thumbnail') setNewProgram({ ...newProgram, thumbnail: compressedDataUrl });
          else if (field === 'program_cover') setNewProgram({ ...newProgram, coverImage: compressedDataUrl });
          else if (field === 'program_host') setNewProgram({ ...newProgram, hostImage: compressedDataUrl });
          else if (field === 'banner_image') setNewBanner({ ...newBanner, imageUrl: compressedDataUrl });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'url' || field === 'sponsor_url') {
        const uploadMedia = async () => {
          setIsUploading(true);
          setUploadProgress(0);
          
          try {
            const formData = new FormData();
            formData.append('file', file);
            
            const data = await new Promise<any>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', `${API_URL}/upload`);
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
              };
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve({}); }
                } else {
                  reject(new Error(`Código ${xhr.status}: ${xhr.responseText.substring(0, 100)}`));
                }
              };
              xhr.onerror = () => reject(new Error("Fallo de red al intentar subir el archivo."));
              xhr.send(formData);
            });

            if (field === 'url') setNewVideo({ ...newVideo, url: data.url, isAudio: file.type.startsWith('audio/') });
            else if (field === 'sponsor_url') setNewSponsorForm({ ...newSponsorForm, url: data.url });
            
            alert("✅ Archivo multimedia procesado y listo para guardar.");
          } catch (error: any) {
            alert(`❌ Falló la carga del archivo. Detalle: ${error.message}`);
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        };
        uploadMedia();
      }
    }
  };

  // Manejador independiente para subir cuñas publicitarias
  const handleSponsorUpload = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sponsorName = window.prompt("Ingresa un nombre para guardar esta cuña en la biblioteca (Ej: Promo Coca-Cola):");
    if (!sponsorName) {
      e.target.value = ""; // reset
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve({}); }
          } else {
            reject(new Error(`Código ${xhr.status}: ${xhr.responseText.substring(0, 100)}`));
          }
        };
        xhr.onerror = () => reject(new Error("Fallo de red al intentar subir la cuña."));
        xhr.send(formData);
      });
      
      // Guardar globalmente en la BD
      const newSponsorObj = { id: Date.now().toString(), name: sponsorName, url: data.url, programId: newVideo.programId || '', createdAt: new Date().toISOString() };
      await addSponsor(newSponsorObj);

      setSponsorUrls(prev => {
        const newUrls = [...prev];
        newUrls[index] = data.url;
        return newUrls;
      });
      alert("✅ Cuña publicitaria procesada, guardada en biblioteca y seleccionada con éxito.");
    } catch (error: any) { 
      console.error("Error subiendo cuña:", error);
      alert(`❌ Error al subir la cuña: ${error.message}`); 
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let finalUrl = newVideo.url;
    // Si está patrocinado y tiene URLs de cuñas, lo convertimos en un JSON Array (Lista de reproducción)
    if (isSponsored && sponsorUrls.length > 0) {
      const validSponsors = sponsorUrls.slice(0, sponsorCount).filter(u => u !== '');
      if (validSponsors.length > 0) {
        finalUrl = JSON.stringify([...validSponsors, newVideo.url]);
      }
    }

    const videoData = {
      title: newVideo.title, category: newVideo.category, description: newVideo.description,
      isFeatured: newVideo.isFeatured, isLive: newVideo.isLive, isShort: newVideo.isShort, isAudio: newVideo.isAudio, thumbnail: newVideo.thumbnail, 
      url: finalUrl, programId: newVideo.programId, duration: newVideo.duration || '00:00', releaseDate: newVideo.releaseDate, pressNoteUrl: newVideo.pressNoteUrl,
      sendNewsletter: newVideo.sendNewsletter
    };

    if (editingId) {
      const existingVideo = videos.find(v => v.id === editingId);
      updateVideo({ ...existingVideo!, ...videoData });
    } else {
      addVideo({ ...videoData, id: Date.now().toString(), views: 0, createdAt: new Date().toISOString() });
    }

    setIsModalOpen(false);
  };

  const handleProgramSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingProgramId) {
      const existing = programs.find(p => p.id === editingProgramId);
      updateProgram({ ...existing!, ...newProgram });
    } else {
      addProgram({ id: Date.now().toString(), ...newProgram });
    }
    setIsProgramModalOpen(false);
    setNewProgram({ name: '', category: '', thumbnail: '', type: 'Programa', description: '', schedule: '', host: '', coverImage: '', hostImage: '' });
  };

  const handleStandaloneSponsorSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingSponsorId) {
      updateSponsor({ id: editingSponsorId, name: newSponsorForm.name, url: newSponsorForm.url, type: newSponsorForm.type, assignedEntities: newSponsorForm.assignedEntities });
    } else {
      addSponsor({ id: Date.now().toString(), name: newSponsorForm.name, url: newSponsorForm.url, type: newSponsorForm.type, assignedEntities: newSponsorForm.assignedEntities, createdAt: new Date().toISOString() });
    }
    setIsSponsorModalOpen(false);
    setNewSponsorForm({ name: '', url: '', type: 'audio', assignedEntities: [] });
    setEditingSponsorId(null);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('admin_auth');
    router.push('/login');
  };

  const openEditModal = (video: any) => {
    let parsedUrl = video.url;
    let sUrls: string[] = [];
    
    // Intenta detectar si el archivo guardado es una lista de reproducción (Patrocinado) y desanida si hubo errores de guardado previos
    let currentUrl = video.url;
    while(true) {
      try {
        const arr = JSON.parse(currentUrl);
        if (Array.isArray(arr)) {
          sUrls = [...sUrls, ...arr.slice(0, -1)];
          currentUrl = arr[arr.length - 1]; // El último siempre es el episodio o el siguiente nivel anidado
        } else {
          break;
        }
      } catch(e) {
        break; // Cuando JSON.parse falla, significa que currentUrl ya es un string normal (la URL del video)
      }
    }
    parsedUrl = currentUrl;

    setIsSponsored(sUrls.length > 0);
    setSponsorCount(sUrls.length > 0 ? sUrls.length : 1);
    setSponsorUrls(sUrls);

    setNewVideo({ 
        title: video.title, 
        category: video.category, 
        thumbnail: video.thumbnail, 
        url: parsedUrl, 
        description: video.description, 
        isFeatured: video.isFeatured, 
        isLive: !!video.isLive,
        isShort: video.isShort || false, 
        isAudio: video.isAudio || false, 
        programId: video.programId || '',
        releaseDate: video.releaseDate ? new Date(video.releaseDate).toISOString().split('T')[0] : '',
        duration: video.duration || '',
        pressNoteUrl: video.pressNoteUrl || '',
        sendNewsletter: false // Nunca marcamos notificar por defecto al editar, para no enviar spam accidental
    });
    setEditingId(video.id);
    setIsModalOpen(true);
  };

  const openEditProgramModal = (prog: any) => {
    setNewProgram({ name: prog.name, category: prog.category, thumbnail: prog.thumbnail, type: prog.type, description: prog.description || '', schedule: prog.schedule || '', host: prog.host || '', coverImage: prog.coverImage || '', hostImage: prog.hostImage || '' });
    setEditingProgramId(prog.id);
    setIsProgramModalOpen(true);
  };

  const openEditBannerModal = (banner: Banner) => {
    setNewBanner({ title: banner.title || '', imageUrl: banner.imageUrl, url: banner.url || '' });
    setEditingBannerId(banner.id);
    setIsBannerModalOpen(true);
  };

  const handleBannerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingBannerId) {
      const existing = banners.find(b => b.id === editingBannerId);
      await updateBanner({ ...existing!, ...newBanner });
    } else {
      await addBanner({ ...newBanner, id: Date.now().toString(), createdAt: new Date().toISOString() });
    }
    setIsBannerModalOpen(false);
    resetBannerForm();
  };

  // Métricas calculadas en tiempo real basadas en el contexto
  const globalTotalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
  const globalTotalLikes = videos.reduce((acc, video) => acc + (video.likes || 0), 0);
  const globalMostViewed = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4); // Top 4 global
  const globalMostLiked = [...videos].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5); // Top 5 likes

  const now = new Date();
  const filteredVideos = videos.filter(video => {
    if (timeFilter === 'all') return true;
    const diffDays = (now.getTime() - new Date(video.createdAt).getTime()) / (1000 * 3600 * 24);
    return timeFilter === '7days' ? diffDays <= 7 : diffDays <= 30;
  });

  const filteredSubscribers = subscribers.filter(sub => {
    if (timeFilter === 'all') return true;
    const diffDays = (now.getTime() - new Date(sub.subscribedAt).getTime()) / (1000 * 3600 * 24);
    return timeFilter === '7days' ? diffDays <= 7 : diffDays <= 30;
  });

  const analyticsTotalViews = filteredVideos.reduce((acc, video) => acc + (video.views || 0), 0);
  const analyticsTotalLikes = filteredVideos.reduce((acc, video) => acc + (video.likes || 0), 0);
  const analyticsMostViewed = [...filteredVideos].sort((a, b) => (b.views || 0) - (a.views || 0));
  const analyticsMostLiked = [...filteredVideos].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  // Métricas por Programa
  const programAnalytics = programs.map(prog => {
    const progEpisodes = videos.filter(v => v.programId === prog.id);
    const progViews = progEpisodes.reduce((acc, v) => acc + (v.views || 0), 0);
    const progLikes = progEpisodes.reduce((acc, v) => acc + (v.likes || 0), 0);
    return {
      ...prog,
      episodesCount: progEpisodes.length,
      totalViews: progViews,
      totalLikes: progLikes
    };
  }).sort((a, b) => b.totalViews - a.totalViews);

  // Detalles del programa seleccionado
  const activeProgramData = selectedProgramDetails ? programs.find(p => p.id === selectedProgramDetails) : null;
  const activeProgramEpisodes = selectedProgramDetails ? videos.filter(v => v.programId === selectedProgramDetails) : [];

  // Extraer todas las categorías existentes para sugerirlas
  const allCategories = Array.from(new Set([...programs.map(p => p.category), ...videos.map(v => v.category)]));

  // Filtro de videos para la librería
  const libraryCategories = Array.from(new Set(videos.map(v => v.category)));
  const displayedVideos = activeTab === 'dashboard' ? globalMostViewed : (libraryFilter === 'Todos' ? videos : videos.filter(v => v.category === libraryFilter));

  // Función para Generar el PDF dinámicamente
  const handleGeneratePDF = () => {
    // Usamos el motor nativo del navegador: Evita el error 'oklab' y crea PDFs vectoriales perfectos.
    window.print();
  };

  useEffect(() => {
    if (activeTab === 'users') {
      setIsUsersLoading(true);
      const token = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null);
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      fetch(`${API_URL}/users`, { headers })
        .then(res => res.json())
        .then(data => { setAdminUsers(data); setIsUsersLoading(false); })
        .catch(e => { console.error("Error fetching users:", e); setIsUsersLoading(false); });
    }
  }, [activeTab]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const token = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null);
      const requestHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) requestHeaders['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(newAdminUser)
      });
      if (res.ok) {
        alert("✅ Usuario creado exitosamente");
        setNewAdminUser({ name: '', email: '', password: '', role: 'admin' });
        const fetchHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        fetch(`${API_URL}/users`, { headers: fetchHeaders }).then(r => r.json()).then(setAdminUsers);
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch(err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if(!confirm("¿Estás seguro de que quieres eliminar a este usuario?")) return;
    try {
      const token = (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null);
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/users/${id}`, { 
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setAdminUsers(adminUsers.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch(err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="text-on-surface antialiased overflow-x-hidden print:bg-white print:text-black">
      {/* Inyección de estilos para impresión nativa */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
      `}</style>

      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" className="hidden" />
      
      {/* Side Navigation Shell */}
      <aside className={`print:hidden h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#131314] flex flex-col p-4 border-r border-[#59413f]/15 shadow-2xl shadow-red-900/5 z-50 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-10 px-2">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1 mt-4 md:mt-0">
            <img src="/logo_colors.png" alt="Logo" className="w-16 h-16 md:w-8 md:h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-16 h-16 md:w-8 md:h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <h1 className="text-2xl font-black tracking-tighter text-[#C13535] hidden md:block">Estudio Radio América <span className="text-[10px] text-[#F07D00] align-top bg-[#F07D00]/10 px-2 py-0.5 rounded-full ml-2">v2.0</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#DDDADB]/40 font-bold mt-1 hidden md:block">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('dashboard'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('library'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'library' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="video_library">video_library</span>
            <span className="text-sm">Libreria de Videos</span>
          </button>
          
          <button onClick={() => { setActiveTab('programs'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'programs' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="podcasts">podcasts</span>
            <span className="text-sm">Programas</span>
          </button>

          <button onClick={() => { setActiveTab('banners'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'banners' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="ad">ad</span>
            <span className="text-sm">Banners App</span>
          </button>
          
          <button onClick={() => { setActiveTab('sponsors'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'sponsors' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
            <span className="text-sm">Cuñas (Sponsors)</span>
          </button>

          <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'analytics' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
            <span className="text-sm">Estadisticas</span>
          </button>

          <button onClick={() => { setActiveTab('newsletter'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'newsletter' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="mail">mail</span>
            <span className="text-sm">Newsletter</span>
          </button>

          {userRole !== 'producer' && (
            <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'users' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
              <span className="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
              <span className="text-sm">Usuarios</span>
            </button>
          )}

          <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'settings' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="text-sm">Herramientas</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-[#59413f]/15">
          {userRole !== 'producer' && (
            <button onClick={() => { resetVideoForm(); setIsModalOpen(true); }} className="hidden md:flex w-full bg-[#C13535] text-white py-3 rounded-xl font-bold text-sm items-center justify-center gap-2 hover:opacity-90 transition-opacity editorial-shadow">
              <span className="material-symbols-outlined text-sm" data-icon="upload">upload</span>
              Upload Video
            </button>
          )}
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
              <img className="w-full h-full object-cover" alt="Profile" src={userProfile.avatar || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#DDDADB]">{userName}</span>
              <span className="text-[10px] text-[#DDDADB]/40 capitalize">{userRole}</span>
            </div>
            <button onClick={handleLogout} className="ml-auto text-[#DDDADB]/40 hover:text-[#C13535] transition-colors" title="Cerrar Sesión">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content Shell */}
      <main className="print:hidden md:ml-64 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-[#131314]/80 backdrop-blur-xl border-b border-[#59413f]/15">
          <div className="flex justify-between items-center h-16 px-4 md:px-8">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-[#DDDADB]">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-xl font-bold text-[#DDDADB] capitalize">
                {activeTab === 'dashboard' ? `Bienvenido, ${userName}` : activeTab.replace('_', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <span className="absolute inset-y-0 left-3 flex items-center text-[#DDDADB]/40">
                  <span className="material-symbols-outlined text-lg" data-icon="search">search</span>
                </span>
                <input className="bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm text-[#DDDADB] w-32 sm:w-48 md:w-64 focus:ring-2 focus:ring-[#FFB91F]/50 transition-all" placeholder="Buscar..." type="text" />
              </div>
              <div className="flex items-center gap-4 text-[#DDDADB]/60">
                <button className="hover:text-[#DDDADB] transition-colors relative">
                  <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-[#F07D00] rounded-full border border-[#131314]"></span>
                </button>
                <button className="hover:text-[#DDDADB] transition-colors">
                  <span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
                </button>
                <button onClick={() => { resetVideoForm({ programId: selectedProgramDetails || '' }); setIsModalOpen(true); }} className="hidden md:block bg-[#C13535] text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-24 px-4 md:px-8 pb-12">
          
          {/* DASHBOARD & LIBRARY TABS SHARE STATS */}
          {(activeTab === 'dashboard' || activeTab === 'library') && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 group hover:border-[#C13535]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#C13535]/10 rounded-xl text-[#C13535]">
                  <span className="material-symbols-outlined" data-icon="movie">movie</span>
                </div>
                <span className="text-[#F07D00] text-xs font-bold">Tiempo Real</span>
              </div>
              <p className="text-[#DDDADB]/60 text-xs font-bold uppercase tracking-wider">Total Videos</p>
              <h3 className="text-3xl font-black text-[#DDDADB] mt-1">{videos.length}</h3>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 group hover:border-[#F07D00]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#F07D00]/10 rounded-xl text-[#F07D00]">
                  <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                </div>
                <span className="text-[#F07D00] text-xs font-bold">Global</span>
              </div>
              <p className="text-[#DDDADB]/60 text-xs font-bold uppercase tracking-wider">Vistas Totales</p>
              <h3 className="text-3xl font-black text-[#DDDADB] mt-1">{(globalTotalViews / 1000).toFixed(1)}k</h3>
            </div>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 group hover:border-[#FFB91F]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#FFB91F]/10 rounded-xl text-[#FFB91F]">
                  <span className="material-symbols-outlined" data-icon="cloud_done">cloud_done</span>
                </div>
                <span className="text-[#DDDADB]/40 text-xs font-bold">Optimizado</span>
              </div>
              <p className="text-[#DDDADB]/60 text-xs font-bold uppercase tracking-wider">Estado del Sistema</p>
              <h3 className="text-3xl font-black text-[#DDDADB] mt-1">Óptimo</h3>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-[#FFB91F] h-full w-[100%]"></div>
              </div>
            </div>
            <div onClick={() => setActiveTab('newsletter')} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 group hover:border-[#F07D00]/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#F07D00]/10 rounded-xl text-[#F07D00]">
                  <span className="material-symbols-outlined" data-icon="group">group</span>
                </div>
                <span className="text-[#F07D00] text-xs font-bold">Comunidad</span>
              </div>
              <p className="text-[#DDDADB]/60 text-xs font-bold uppercase tracking-wider">Suscriptores</p>
              <h3 className="text-3xl font-black text-[#DDDADB] mt-1">{subscribers.length}</h3>
            </div>
          </section>
          )}

          {/* LIBRARY / DASHBOARD CONTENT */}
          {(activeTab === 'dashboard' || activeTab === 'library') && (
          <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">{activeTab === 'dashboard' ? 'Videos Más Vistos' : 'Video Library'}</h3>
                <p className="text-[#DDDADB]/50 text-sm max-w-md">Manage your cinematic archives, interviews, and historical documentaries for the Estudio Radio América network.</p>
              </div>
              {/* Tab Filter Bar */}
              {activeTab === 'library' && (
                <div className="w-full md:w-auto flex bg-surface-container-lowest p-1 rounded-full border border-outline-variant/10 overflow-x-auto hide-scrollbar snap-x">
                  <button onClick={() => setLibraryFilter('Todos')} className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors snap-start ${libraryFilter === 'Todos' ? 'bg-[#C13535] text-white' : 'text-[#DDDADB]/60 hover:text-[#DDDADB]'}`}>
                    Todos
                  </button>
                  {libraryCategories.map(cat => (
                    <button key={cat} onClick={() => setLibraryFilter(cat)} className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors snap-start ${libraryFilter === cat ? 'bg-[#C13535] text-white' : 'text-[#DDDADB]/60 hover:text-[#DDDADB]'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedVideos.map(video => (
                <div key={video.id} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-surface-container-highest">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={video.thumbnail || '/logo_blanco.png'} alt={video.title} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      {video.isFeatured && <span className="bg-[#F07D00] text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider">Destacado</span>}
                      {video.isShort && <span className="bg-[#8b6200] text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider">Short</span>}
                      {video.isAudio && <span className="bg-[#C13535] text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">headphones</span>Audio</span>}
                      <span className="bg-[#C13535] text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider">Publicado</span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[10px] text-white">visibility</span>
                      <span className="text-[10px] font-bold text-white">{(video.views/1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#FFB91F] text-[10px] font-bold uppercase tracking-widest">{video.category}</span>
                    <h4 className="text-[#DDDADB] font-bold text-lg group-hover:text-[#F07D00] transition-colors leading-tight">{video.title}</h4>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-[#DDDADB]/40">
                        {userRole !== 'producer' && (
                          <>
                            <span onClick={() => openEditModal(video)} className="material-symbols-outlined text-lg hover:text-[#DDDADB] transition-colors" data-icon="edit">edit</span>
                            <span onClick={() => deleteVideo(video.id)} className="material-symbols-outlined text-lg hover:text-[#C13535] transition-colors" data-icon="delete">delete</span>
                          </>
                        )}
                        <a href={video.url} target="_blank" rel="noreferrer" className="material-symbols-outlined text-lg hover:text-[#FFB91F] transition-colors">open_in_new</a>
                      </div>
                      <span className="text-[10px] text-[#DDDADB]/30 font-medium italic">{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeTab === 'library' && displayedVideos.length === 0 && (
              <div className="py-16 text-center text-[#DDDADB]/40 text-sm font-bold uppercase tracking-widest">
                No hay contenido en esta categoría
              </div>
            )}
          </section>
          )}

          {/* PROGRAMS TAB */}
          {activeTab === 'programs' && !selectedProgramDetails && (
          <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Programas y Podcasts</h3>
                <p className="text-[#DDDADB]/50 text-sm max-w-md">Administra los programas en los que se agrupan los videos.</p>
              </div>
              <button onClick={() => { setEditingProgramId(null); setNewProgram({ name: '', category: '', thumbnail: '', type: 'Programa', description: '', schedule: '', host: '', coverImage: '', hostImage: '' }); setIsProgramModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                Añadir Programa
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {programs.map(program => (
                <div key={program.id} onClick={() => setSelectedProgramDetails(program.id)} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-outline-variant/10 group-hover:scale-105 transition-transform duration-500">
                    <img className="w-full h-full object-cover" src={program.thumbnail || '/logo_blanco.png'} alt={program.name} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {userRole !== 'producer' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openEditProgramModal(program); }} className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#F07D00] transition-colors shadow-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteProgram(program.id); }} className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#C13535] transition-colors shadow-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[10px] font-bold text-[#FFB91F] uppercase tracking-wider mb-1">{program.category}</p>
                      <h3 className="font-bold leading-tight text-[#DDDADB]">{program.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* PROGRAM DETAILS TAB */}
          {activeTab === 'programs' && selectedProgramDetails && activeProgramData && (
            <section className="space-y-6">
              <button onClick={() => setSelectedProgramDetails(null)} className="flex items-center gap-2 text-[#DDDADB]/60 hover:text-[#F07D00] font-bold text-sm transition-colors mb-4">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Volver a Programas
              </button>
              
              <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 flex flex-col md:flex-row gap-8 items-start">
                <img src={activeProgramData.thumbnail || '/logo_blanco.png'} alt={activeProgramData.name} className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-xl" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div className="flex-1 space-y-4">
                  <span className="bg-[#F07D00]/20 text-[#F07D00] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">{activeProgramData.type}</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#DDDADB] leading-none">{activeProgramData.name}</h2>
                  <p className="text-[#DDDADB]/60 text-sm max-w-2xl">{activeProgramData.description || 'Sin descripción.'}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#DDDADB]/40">
                    <span>Host: {activeProgramData.host || 'N/A'}</span> • <span>Horario: {activeProgramData.schedule || 'N/A'}</span>
                  </div>
                  <div className="pt-4 flex gap-4">
                  <button onClick={() => { resetVideoForm({ category: activeProgramData.category, programId: activeProgramData.id, isAudio: false }); setIsModalOpen(true); }} className="bg-[#C13535] text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">Añadir Episodio (Video)</button>
                  <button onClick={() => { resetVideoForm({ category: activeProgramData.category, programId: activeProgramData.id, isAudio: true }); setIsModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">Añadir Episodio (Audio)</button>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#DDDADB] pt-4">Episodios de {activeProgramData.name}</h3>
              <div className="grid grid-cols-1 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                {activeProgramEpisodes.length === 0 ? (
                  <div className="p-8 text-center text-[#DDDADB]/40 text-sm">No hay episodios aún para este programa.</div>
                ) : (
                  activeProgramEpisodes.map(ep => (
                    <div key={ep.id} className="flex items-center justify-between p-4 border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-black flex items-center justify-center text-white relative overflow-hidden">
                          <img src={ep.thumbnail || '/logo_blanco.png'} alt="thumb" className="absolute inset-0 w-full h-full object-cover opacity-40" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                          <span className="material-symbols-outlined relative z-10">{ep.isAudio ? 'headphones' : 'smart_display'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#DDDADB]">{ep.title}</p>
                          <p className="text-[10px] text-[#DDDADB]/40 uppercase tracking-wider">{ep.isAudio ? 'Audio / Podcast' : 'Video'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[#DDDADB]/40">
                        {userRole !== 'producer' && (
                          <>
                            <button onClick={() => openEditModal(ep)} className="hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                            <button onClick={() => deleteVideo(ep.id)} className="hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SPONSORS (CUÑAS) TAB */}
          {activeTab === 'sponsors' && (() => {
            const audioSponsors = sponsors.filter(s => s.type !== 'video');
            const videoSponsors = sponsors.filter(s => s.type === 'video');
            return (
            <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Biblioteca de Cuñas y Anuncios</h3>
                  <p className="text-[#DDDADB]/50 text-sm max-w-md">Gestiona los audios y videos publicitarios. Se pueden reutilizar en múltiples episodios.</p>
                </div>
                <button onClick={() => { setNewSponsorForm({ name: '', url: '', type: 'audio', assignedEntities: [] }); setEditingSponsorId(null); setIsSponsorModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span> Añadir Cuña
                </button>
              </div>

              <div className="space-y-8">
                {/* Audios */}
                <div>
                  <h4 className="text-lg font-bold text-[#DDDADB] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#F07D00]">headphones</span> Cuñas de Audio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {audioSponsors.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-[#DDDADB]/40 text-sm">No hay cuñas de audio registradas aún.</div>
                    ) : (
                      audioSponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-surface-container-highest p-5 rounded-2xl border border-outline-variant/10 hover:border-[#F07D00]/50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-[#DDDADB] font-bold text-lg">{sponsor.name}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingSponsorId(sponsor.id); setNewSponsorForm({ name: sponsor.name, url: sponsor.url, type: sponsor.type || 'audio', assignedEntities: sponsor.assignedEntities || [] }); setIsSponsorModalOpen(true); }} className="text-[#DDDADB]/40 hover:text-[#F07D00] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                              <button onClick={() => deleteSponsor(sponsor.id)} className="text-[#DDDADB]/40 hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                          </div>
                          <audio controls className="w-full h-8 mb-3 opacity-90 grayscale" src={sponsor.url}></audio>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-[#DDDADB]/60 uppercase tracking-widest truncate max-w-[60%]">
                              {sponsor.assignedEntities && sponsor.assignedEntities.length > 0 && !sponsor.assignedEntities.includes('global') ? `${sponsor.assignedEntities.length} Asignaciones` : 'Global'}
                            </span>
                            {sponsor.createdAt && <span className="text-[10px] text-[#DDDADB]/30 font-medium italic">{new Date(sponsor.createdAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <h4 className="text-lg font-bold text-[#DDDADB] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#C13535]">smart_display</span> Cuñas de Video</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videoSponsors.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-[#DDDADB]/40 text-sm">No hay cuñas de video registradas aún.</div>
                    ) : (
                      videoSponsors.map(sponsor => (
                        <div key={sponsor.id} className="bg-surface-container-highest p-5 rounded-2xl border border-outline-variant/10 hover:border-[#F07D00]/50 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-[#DDDADB] font-bold text-lg">{sponsor.name}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingSponsorId(sponsor.id); setNewSponsorForm({ name: sponsor.name, url: sponsor.url, type: sponsor.type || 'video', assignedEntities: sponsor.assignedEntities || [] }); setIsSponsorModalOpen(true); }} className="text-[#DDDADB]/40 hover:text-[#F07D00] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                              <button onClick={() => deleteSponsor(sponsor.id)} className="text-[#DDDADB]/40 hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                          </div>
                          <video controls className="w-full h-32 mb-3 bg-black rounded" src={sponsor.url}></video>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-[#DDDADB]/60 uppercase tracking-widest truncate max-w-[60%]">
                              {sponsor.assignedEntities && sponsor.assignedEntities.length > 0 && !sponsor.assignedEntities.includes('global') ? `${sponsor.assignedEntities.length} Asignaciones` : 'Global'}
                            </span>
                            {sponsor.createdAt && <span className="text-[10px] text-[#DDDADB]/30 font-medium italic">{new Date(sponsor.createdAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
            );
          })()}

          {/* BANNERS TAB */}
          {activeTab === 'banners' && (
            <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Banners Publicitarios (App Móvil)</h3>
                  <p className="text-[#DDDADB]/50 text-sm max-w-md">Administra los banners promocionales y comerciales que se muestran en el carrusel de la app móvil.</p>
                </div>
                <button onClick={() => { resetBannerForm(); setIsBannerModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span> Añadir Banner
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-[#DDDADB]/40 text-sm">No hay banners creados aún.</div>
                ) : (
                  banners.map(banner => (
                    <div key={banner.id} className="bg-surface-container-highest p-4 rounded-2xl border border-outline-variant/10 hover:border-[#F07D00]/50 transition-colors">
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-black">
                        <img src={banner.imageUrl || '/logo_blanco.png'} alt={banner.title || 'Banner'} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[#DDDADB] font-bold text-base">{banner.title || 'Sin Título'}</h4>
                          {banner.url && <a href={banner.url} target="_blank" rel="noreferrer" className="text-xs text-[#F07D00] hover:underline truncate block max-w-[200px]">{banner.url}</a>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditBannerModal(banner)} className="text-[#DDDADB]/40 hover:text-[#F07D00] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button onClick={() => deleteBanner(banner.id)} className="text-[#DDDADB]/40 hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* NEWSLETTER TAB */}
          {activeTab === 'newsletter' && (
            <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Comunidad y Newsletter</h3>
                  <p className="text-[#DDDADB]/50 text-sm max-w-md">Lista de usuarios que se han suscrito para recibir correos con novedades.</p>
                </div>
                <button onClick={() => alert("Función en desarrollo: Apertura de creador de campañas masivas de correo.")} className="bg-[#C13535] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span> Enviar Correo Masivo
                </button>
              </div>

              <div className="overflow-x-auto border border-outline-variant/10 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-highest border-b border-outline-variant/20">
                      <th className="p-4 text-xs font-bold text-[#DDDADB]/60 uppercase tracking-widest">Correo Electrónico (Email)</th>
                      <th className="p-4 text-xs font-bold text-[#DDDADB]/60 uppercase tracking-widest text-right">Fecha de Suscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr><td colSpan={2} className="p-8 text-center text-[#DDDADB]/40 text-sm">No hay suscriptores aún.</td></tr>
                    ) : subscribers.map((sub, i) => (
                      <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container-highest transition-colors">
                        <td className="p-4 text-sm text-[#DDDADB] font-bold"><a href={`mailto:${sub.email}`} className="hover:text-[#F07D00] transition-colors">{sub.email}</a></td>
                        <td className="p-4 text-sm text-[#DDDADB]/60 text-right">{new Date(sub.subscribedAt).toLocaleString('es-VE')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <section className="bg-surface-container-low rounded-3xl p-4 sm:p-8 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Administración de Usuarios</h3>
                  <p className="text-[#DDDADB]/50 text-sm max-w-md">Gestiona quién tiene acceso a este panel de administración.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulario de Creación */}
                <div className="col-span-1 bg-surface-container-highest p-6 rounded-2xl border border-outline-variant/10 h-fit">
                  <h4 className="text-lg font-bold text-[#DDDADB] mb-4">Añadir Nuevo Administrador</h4>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Nombre</label>
                      <input required type="text" value={newAdminUser.name} onChange={e => setNewAdminUser({...newAdminUser, name: e.target.value})} className="w-full bg-[#0e0e0f] border-none rounded-lg p-3 text-[#DDDADB] focus:ring-2 focus:ring-[#C13535]" placeholder="Nombre del usuario" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Email</label>
                      <input required type="email" value={newAdminUser.email} onChange={e => setNewAdminUser({...newAdminUser, email: e.target.value})} className="w-full bg-[#0e0e0f] border-none rounded-lg p-3 text-[#DDDADB] focus:ring-2 focus:ring-[#C13535]" placeholder="admin@radioamerica.com.ve" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Contraseña</label>
                      <input required type="password" value={newAdminUser.password} onChange={e => setNewAdminUser({...newAdminUser, password: e.target.value})} className="w-full bg-[#0e0e0f] border-none rounded-lg p-3 text-[#DDDADB] focus:ring-2 focus:ring-[#C13535]" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Rol</label>
                      <select value={newAdminUser.role} onChange={e => setNewAdminUser({...newAdminUser, role: e.target.value})} className="w-full bg-[#0e0e0f] border-none rounded-lg p-3 text-[#DDDADB] focus:ring-2 focus:ring-[#C13535]">
                        <option value="admin">Administrador (Normal)</option>
                        <option value="superadmin">Super Administrador</option>
                        <option value="producer">Productor (Cuñas y Estadísticas)</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#C13535] text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all">Crear Usuario</button>
                  </form>
                </div>

                {/* Lista de Usuarios */}
                <div className="col-span-1 md:col-span-2 overflow-x-auto border border-outline-variant/10 rounded-2xl bg-surface-container-highest">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="p-4 text-xs font-bold text-[#DDDADB]/60 uppercase">Email</th>
                        <th className="p-4 text-xs font-bold text-[#DDDADB]/60 uppercase">Rol</th>
                        <th className="p-4 text-xs font-bold text-[#DDDADB]/60 uppercase text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isUsersLoading ? (
                        <tr><td colSpan={3} className="p-8 text-center text-[#DDDADB]/40 text-sm">Cargando...</td></tr>
                      ) : adminUsers.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-[#DDDADB]/40 text-sm">No hay usuarios.</td></tr>
                      ) : adminUsers.map((u, i) => (
                        <tr key={i} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                          <td className="p-4 text-sm text-[#DDDADB] font-bold">{u.email}</td>
                          <td className="p-4 text-sm text-[#DDDADB]">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'superadmin' ? 'bg-[#F07D00]/20 text-[#F07D00]' : 'bg-[#DDDADB]/10 text-[#DDDADB]/80'}`}>{u.role}</span>
                          </td>
                          <td className="p-4 text-right">
                             <button onClick={() => handleDeleteUser(u.id)} className="text-[#C13535] hover:text-white p-2 rounded hover:bg-[#C13535] transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-10 animate-fade-in">
              
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-10 bg-[#C13535]"></div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#DDDADB] uppercase font-['Montserrat'] tracking-tighter">Estadísticas Editoriales</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="bg-surface-container-high border-none rounded-lg py-2.5 px-4 text-sm font-bold text-[#DDDADB] focus:ring-2 focus:ring-[#C13535] cursor-pointer">
                    <option value="all">Histórico (Todo)</option>
                    <option value="30days">Últimos 30 Días</option>
                    <option value="7days">Últimos 7 Días</option>
                  </select>
                  <button onClick={handleGeneratePDF} className="flex items-center gap-2 bg-[#C13535] hover:bg-[#a12b2b] text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg">
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    Exportar Reporte PDF
                  </button>
                </div>
              </div>

              {/* Analytics Sub-navigation */}
              <div className="flex overflow-x-auto hide-scrollbar items-center gap-2 border-b border-outline-variant/10 pb-4">
                <button onClick={() => setAnalyticsSubTab('overview')} className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${analyticsSubTab === 'overview' ? 'bg-[#C13535]/10 text-[#C13535] border-b-2 border-[#C13535]' : 'text-[#DDDADB]/60 hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Overview (Métricas)
                </button>
                <button onClick={() => setAnalyticsSubTab('live')} className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${analyticsSubTab === 'live' ? 'bg-[#C13535]/10 text-[#C13535] border-b-2 border-[#C13535]' : 'text-[#DDDADB]/60 hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>podcasts</span>
                  Live Metrics
                </button>
                <button onClick={() => setAnalyticsSubTab('social')} className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${analyticsSubTab === 'social' ? 'bg-[#C13535]/10 text-[#C13535] border-b-2 border-[#C13535]' : 'text-[#DDDADB]/60 hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-sm">share</span>
                  Social Impact
                </button>
                <button onClick={() => setAnalyticsSubTab('audience')} className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${analyticsSubTab === 'audience' ? 'bg-[#C13535]/10 text-[#C13535] border-b-2 border-[#C13535]' : 'text-[#DDDADB]/60 hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-sm">group</span>
                  Audience Data
                </button>
              </div>

              {analyticsSubTab === 'overview' && (
                <div className="space-y-10 animate-fade-in">
                  {/* Section 1: Metrics Overview (Diseño Editorial) */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#F07D00]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                      <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-[#DDDADB]">Resumen de Métricas</h2>
                      <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-3 border-l-4 border-[#C13535] shadow-lg border border-outline-variant/10">
                        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#DDDADB]/60" title="Contadas desde el reproductor interno de la aplicación">Reproducciones Nativas</span>
                        <div className="border-b-2 border-outline-variant/20 min-h-[2.5rem] flex items-end pb-1 text-3xl font-black text-[#DDDADB]">{analyticsTotalViews}</div>
                      </div>
                      <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-3 border-l-4 border-[#E11D48] shadow-lg border border-outline-variant/10">
                        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#DDDADB]/60">Me Gusta (Likes)</span>
                        <div className="border-b-2 border-outline-variant/20 min-h-[2.5rem] flex items-end pb-1 text-3xl font-black text-[#DDDADB]">{analyticsTotalLikes}</div>
                      </div>
                      <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-3 border-l-4 border-[#F07D00] shadow-lg border border-outline-variant/10">
                        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#DDDADB]/60">Engagement (Suscritos)</span>
                        <div className="border-b-2 border-outline-variant/20 min-h-[2.5rem] flex items-end pb-1 text-3xl font-black text-[#DDDADB]">{filteredSubscribers.length}</div>
                      </div>
                      <div className="p-6 bg-surface-container-low rounded-xl flex flex-col gap-3 border-l-4 border-[#FFB91F] shadow-lg border border-outline-variant/10">
                        <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#DDDADB]/60">Total Episodios</span>
                        <div className="border-b-2 border-outline-variant/20 min-h-[2.5rem] flex items-end pb-1 text-3xl font-black text-[#DDDADB]">{filteredVideos.length}</div>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Performance Breakdown (Tabla de Top Vistos) */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#F07D00]" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                      <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-[#DDDADB]">Episodios Más Vistos</h2>
                      <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 shadow-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-highest border-b border-outline-variant/20">
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#F07D00]">Episodio</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#F07D00]">Formato</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#F07D00]">Reproducciones</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#F07D00]">Likes</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#F07D00] text-right">Categoría</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {analyticsMostViewed.slice(0, 5).map(v => (
                            <tr key={v.id} className="hover:bg-surface-container-highest transition-colors">
                              <td className="px-6 py-4 font-bold text-[#DDDADB] text-sm">{v.title}</td>
                              <td className="px-6 py-4 text-[#DDDADB]/60 text-sm">{v.isAudio ? 'Audio/Podcast' : 'Video/Reel'}</td>
                              <td className="px-6 py-4 font-black text-[#C13535] text-sm">{v.views || 0}</td>
                              <td className="px-6 py-4 font-black text-[#E11D48] text-sm">{v.likes || 0}</td>
                              <td className="px-6 py-4 text-[#DDDADB]/60 text-right uppercase text-[10px] tracking-widest">{v.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Section 3: Performance by Program (Rendimiento por Programa / Podcast) */}
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#FFB91F]" style={{ fontVariationSettings: "'FILL' 1" }}>podcasts</span>
                      <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-[#DDDADB]">Rendimiento por Programa / Podcast</h2>
                      <div className="flex-1 h-[1px] bg-outline-variant/20"></div>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 shadow-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-highest border-b border-outline-variant/20">
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#FFB91F]">Programa</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#FFB91F]">Tipo</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#FFB91F]">Episodios</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#FFB91F]">Total Reproducciones</th>
                            <th className="px-6 py-4 font-['Inter'] text-xs uppercase font-bold text-[#FFB91F] text-right">Total Likes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {programAnalytics.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-[#DDDADB]/40">No hay programas registrados.</td></tr>
                          ) : (
                            programAnalytics.map(prog => (
                              <tr key={prog.id} className="hover:bg-surface-container-highest transition-colors">
                                <td className="px-6 py-4 font-bold text-[#DDDADB] text-sm flex items-center gap-3">
                                  <img src={prog.thumbnail || '/logo_blanco.png'} alt={prog.name} className="w-8 h-8 rounded-lg object-cover" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                                  <span>{prog.name}</span>
                                </td>
                                <td className="px-6 py-4 text-[#DDDADB]/60 text-sm">{prog.type}</td>
                                <td className="px-6 py-4 text-[#DDDADB] font-medium text-sm">{prog.episodesCount}</td>
                                <td className="px-6 py-4 font-black text-[#C13535] text-sm">{prog.totalViews}</td>
                                <td className="px-6 py-4 font-black text-[#E11D48] text-sm text-right">{prog.totalLikes}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {analyticsSubTab === 'live' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 bg-[#C13535]/10 border border-[#C13535]/30 rounded-xl">
                    <h3 className="text-[#C13535] font-bold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">sensors</span> Emisiones en Vivo (Live)
                    </h3>
                    <p className="text-sm text-[#DDDADB]/60">Rendimiento de los episodios marcados como transmisión en directo durante este periodo.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.filter(v => v.isLive).map(v => (
                      <div key={v.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-lg group">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                          <img src={v.thumbnail || '/logo_blanco.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={v.title} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
                          </div>
                        </div>
                        <h4 className="font-bold text-[#DDDADB] text-sm line-clamp-1 mb-3">{v.title}</h4>
                        <div className="flex justify-between items-center bg-surface-container p-2 rounded-lg">
                          <span className="text-xs text-[#DDDADB]/60 uppercase tracking-widest font-bold">Vistas</span>
                          <span className="text-sm font-black text-[#F07D00]">{v.views}</span>
                        </div>
                      </div>
                    ))}
                    {filteredVideos.filter(v => v.isLive).length === 0 && (
                      <div className="col-span-full py-12 text-center text-[#DDDADB]/40">No hubo emisiones en vivo en este periodo.</div>
                    )}
                  </div>
                </div>
              )}

              {analyticsSubTab === 'social' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-6 bg-[#F07D00]/10 border border-[#F07D00]/30 rounded-xl">
                    <h3 className="text-[#F07D00] font-bold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">share</span> Impacto Social y Formatos Cortos
                    </h3>
                    <p className="text-sm text-[#DDDADB]/60">Alcance nativo de tus Reels, Shorts y contenido vinculado a plataformas externas.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVideos.filter(v => v.isShort || v.url.includes('youtube') || v.url.includes('instagram')).map(v => (
                      <div key={v.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-lg flex gap-4">
                        <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden relative">
                          <img src={v.thumbnail || '/logo_blanco.png'} className="w-full h-full object-cover" alt={v.title} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <span className="text-[10px] uppercase tracking-widest text-[#F07D00] font-bold mb-1">
                            {v.isShort ? 'Short/Reel' : 'Enlace Externo'}
                          </span>
                          <h4 className="font-bold text-[#DDDADB] text-sm line-clamp-2 mb-2">{v.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-[#DDDADB]/60 mt-auto">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            <span className="font-bold">{v.views} vistas (app)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredVideos.filter(v => v.isShort || v.url.includes('youtube') || v.url.includes('instagram')).length === 0 && (
                      <div className="col-span-full py-12 text-center text-[#DDDADB]/40">No hay contenido de impacto social en este periodo.</div>
                    )}
                  </div>
                </div>
              )}

              {analyticsSubTab === 'audience' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-[#C13535] shadow-lg">
                      <h3 className="text-[#DDDADB] font-bold mb-2">Crecimiento (Periodo)</h3>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-[#F07D00]">{filteredSubscribers.length}</p>
                        <p className="text-sm text-[#DDDADB]/40 mb-1">nuevos registros</p>
                      </div>
                    </div>
                    <div className="p-6 bg-surface-container-low rounded-xl border-l-4 border-zinc-600 shadow-lg">
                      <h3 className="text-[#DDDADB] font-bold mb-2">Total Comunidad</h3>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-[#DDDADB]">{subscribers.length}</p>
                        <p className="text-sm text-[#DDDADB]/40 mb-1">usuarios históricos</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-highest border-b border-outline-variant/20">
                          <th className="px-6 py-4 font-['Inter'] text-xs font-bold text-[#F07D00] uppercase">Usuario (Email)</th>
                          <th className="px-6 py-4 font-['Inter'] text-xs font-bold text-[#F07D00] uppercase text-right">Fecha de Suscripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {filteredSubscribers.slice(0, 10).map((sub, i) => (
                          <tr key={i} className="hover:bg-surface-container-highest transition-colors">
                            <td className="px-6 py-4 text-sm text-[#DDDADB] font-medium">{sub.email}</td>
                            <td className="px-6 py-4 text-sm text-[#DDDADB]/60 text-right">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {filteredSubscribers.length === 0 && (
                          <tr><td colSpan={2} className="px-6 py-8 text-center text-[#DDDADB]/40">No hay nuevos suscriptores en este periodo.</td></tr>
                        )}
                      </tbody>
                    </table>
                    {filteredSubscribers.length > 10 && (
                      <div className="px-6 py-3 bg-surface-container-highest text-center text-xs text-[#DDDADB]/40 font-bold uppercase tracking-widest">
                        Mostrando los 10 más recientes del periodo
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-[#DDDADB] mb-6">Editar Perfil</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateUserProfile(profileForm); alert("Perfil actualizado"); }} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <img src={profileForm.avatar || '/logo_blanco.png'} alt="Avatar" className="w-24 h-24 rounded-full border border-outline-variant/20 object-cover" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Foto de Perfil (URL o subir archivo)</label>
                    <div className="flex gap-2">
                      <input value={profileForm.avatar} onChange={e => setProfileForm({...profileForm, avatar: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="URL de la imagen" />
                      <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Nombre</label>
                    <input value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Apellido</label>
                    <input value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Biografía</label>
                  <textarea value={profileForm.bio || ''} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" placeholder="Breve descripción profesional..." rows={3}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Usuario de Twitter (X)</label>
                    <input value={profileForm.twitter || ''} onChange={e => setProfileForm({...profileForm, twitter: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="@usuario" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Usuario de Instagram</label>
                    <input value={profileForm.instagram || ''} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="@usuario" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Canal de YouTube</label>
                    <input value={profileForm.youtube || ''} onChange={e => setProfileForm({...profileForm, youtube: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="url" placeholder="https://youtube.com/..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Página de Facebook</label>
                    <input value={profileForm.facebook || ''} onChange={e => setProfileForm({...profileForm, facebook: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="url" placeholder="https://facebook.com/..." />
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button type="submit" className="bg-[#C13535] text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all">Guardar Cambios</button>
                </div>
              </form>

            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-8 pb-8 text-[#DDDADB]/20 text-[10px] flex justify-between uppercase tracking-widest font-bold">
          <div>© 2024 Estudio Radio América Digital Archiving</div>
          <div>Powered by CinemaPulse Admin v2.1</div>
        </footer>
      </main>

      {/* Floating Live Status */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <div className="glass-panel border border-[#C13535]/20 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#C13535] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C13535]"></span>
          </span>
          <span className="text-[10px] font-black uppercase text-[#DDDADB] tracking-widest">Radio en Vivo</span>
          <div className="h-4 w-px bg-white/10"></div>
          <button onClick={toggleRadio} className="material-symbols-outlined text-[#F07D00] text-lg hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</button>
        </div>
      </div>

      {/* Uploading Media Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <RadioAmericaLoader fullScreen={false} />
          <p className="text-[#DDDADB] font-bold mt-4 uppercase tracking-widest text-sm">Subiendo y procesando... {uploadProgress > 0 ? `${uploadProgress}%` : ''}</p>
          {uploadProgress > 0 && (
            <div className="w-64 h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden shadow-inner">
              <div className="bg-[#C13535] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
        </div>
      )}

      {/* Modal para Añadir Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-outline-variant/20 shadow-2xl custom-scrollbar">
            <h3 className="text-xl font-bold text-[#DDDADB] mb-6">{editingId ? 'Editar Video' : 'Añadir Nuevo Video'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Título</label>
                <input required value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Entrevista Exclusiva" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Formato de Medio</label>
                <select value={newVideo.isAudio ? 'audio' : 'video'} onChange={e => setNewVideo({...newVideo, isAudio: e.target.value === 'audio'})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]">
                  <option value="video">🎥 Video (YouTube, MP4, Reel)</option>
                  <option value="audio">🎧 Audio / Podcast (MP3, WAV, Enlace)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Categoría (Selecciona o escribe una nueva)</label>
                <input required list="video-categories-list" value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Historia" />
                <datalist id="video-categories-list">
                  {allCategories.map(cat => <option key={`cat-${cat}`} value={cat} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Programa al que pertenece (Opcional)</label>
                <select value={newVideo.programId} onChange={e => setNewVideo({...newVideo, programId: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]">
                  <option value="">Ninguno / Independiente</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Fecha de Estreno (Opcional)</label>
                <input 
                    type="date" 
                    value={newVideo.releaseDate || ''} 
                    onChange={e => setNewVideo({...newVideo, releaseDate: e.target.value})} 
                    className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Duración (Opcional, Ej: 45:00)</label>
                <input type="text" value={newVideo.duration || ''} onChange={e => setNewVideo({...newVideo, duration: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" placeholder="MM:SS" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Descripción</label>
                <textarea required value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" placeholder="Una breve sinopsis del video..." rows={3}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">URL de Nota de Prensa (Opcional)</label>
                <input value={newVideo.pressNoteUrl || ''} onChange={e => setNewVideo({...newVideo, pressNoteUrl: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="url" placeholder="https://ejemplo.com/noticia" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Miniatura (URL o subir archivo)</label>
                <div className="flex gap-2">
                  <input required value={newVideo.thumbnail} onChange={e => setNewVideo({...newVideo, thumbnail: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="https://ejemplo... o sube una imagen 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">{newVideo.isAudio ? 'Audio (URL o subir archivo MP3)' : 'Video (URL de YouTube/Reels o subir archivo MP4)'}</label>
                <div className="flex gap-2">
                  <input required value={newVideo.url} onChange={e => setNewVideo({...newVideo, url: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder={newVideo.isAudio ? 'Enlace de audio o carga 👉' : 'Enlace de YouTube o carga 👉'} />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept={newVideo.isAudio ? "audio/*" : "video/*"} className="hidden" onChange={(e) => handleFileUpload(e, 'url')} />
                  </label>
                </div>
              </div>
              
              {/* LÓGICA DE PATROCINIOS / CUÑAS */}
              <div className="md:col-span-2 bg-[#F07D00]/10 p-5 rounded-xl border border-[#F07D00]/30 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <input id="isSponsored" checked={isSponsored} onChange={e => setIsSponsored(e.target.checked)} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-[#F07D00] cursor-pointer" />
                  <label htmlFor="isSponsored" className="text-sm text-[#DDDADB] font-bold cursor-pointer">¿Episodio Patrocinado? (Añadir Cuñas)</label>
                </div>
                
                {isSponsored && (
                  <div className="space-y-4 animate-fade-in pl-7 border-l-2 border-[#F07D00]/30 ml-2">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-[#DDDADB]/60">Número de Cuñas antes del Episodio:</label>
                      <select value={sponsorCount} onChange={e => setSponsorCount(Number(e.target.value))} className="bg-surface-container-highest border-none rounded p-1 text-xs text-[#DDDADB]">
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>

                    {Array.from({ length: sponsorCount }).map((_, idx) => (
                      <div key={idx} className="bg-surface-container-lowest p-4 rounded-lg flex flex-col gap-3">
                        <label className="text-xs font-bold text-[#DDDADB]">Cuña #{idx + 1}</label>
                        <div className="flex flex-col md:flex-row gap-2">
                          <select 
                            value={sponsorUrls[idx] || ''} 
                            onChange={(e) => {
                              const newUrls = [...sponsorUrls];
                              newUrls[idx] = e.target.value;
                              setSponsorUrls(newUrls);
                            }}
                            className="flex-1 bg-surface-container-highest border-none rounded-lg p-3 text-sm text-[#DDDADB]"
                          >
                            <option value="">-- Seleccionar cuña de la biblioteca --</option>
                            {sponsors.map(sponsor => (
                              <option key={sponsor.id} value={sponsor.url}>{sponsor.name}</option>
                            ))}
                          </select>
                          
                          <label className="bg-[#C13535] hover:bg-red-800 cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm gap-2">
                            <span className="material-symbols-outlined text-white text-sm">upload</span>
                            <span className="text-xs font-bold text-white">Subir Nueva</span>
                            <input type="file" accept={newVideo.isAudio ? "audio/*" : "video/*"} className="hidden" onChange={(e) => handleSponsorUpload(e, idx)} />
                          </label>
                        </div>
                        {sponsorUrls[idx] && (
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <span className="material-symbols-outlined text-sm">check_circle</span> Cuña seleccionada
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10 mt-2">
                <div className="flex items-center gap-2">
                  <input id="isFeatured" checked={newVideo.isFeatured} onChange={e => setNewVideo({...newVideo, isFeatured: e.target.checked})} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-[#C13535] cursor-pointer" />
                  <label htmlFor="isFeatured" className="text-sm text-[#DDDADB] font-medium cursor-pointer">⭐ Marcar como Entrevista Destacada</label>
                </div>
                <div className="flex items-center gap-2">
              <input id="isLive" checked={newVideo.isLive} onChange={e => setNewVideo({...newVideo, isLive: e.target.checked})} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-red-500 cursor-pointer" />
              <label htmlFor="isLive" className="text-sm text-[#DDDADB] font-medium cursor-pointer">🔴 Marcar como EN VIVO</label>
            </div>
            <div className="flex items-center gap-2">
                  <input id="isShort" checked={newVideo.isShort} onChange={e => setNewVideo({...newVideo, isShort: e.target.checked})} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-[#F07D00] cursor-pointer" />
                  <label htmlFor="isShort" className="text-sm text-[#DDDADB] font-medium cursor-pointer">📱 Es un Short / Reel (Vertical)</label>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-surface-container-highest transition-all">Cancelar</button>
                <button type="submit" disabled={isUploading} className={`bg-[#C13535] text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 transition-all'}`}>{isUploading ? 'Subiendo...' : 'Guardar Video'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Añadir Programa */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-outline-variant/20 shadow-2xl custom-scrollbar">
            <h3 className="text-xl font-bold text-[#DDDADB] mb-6">{editingProgramId ? 'Editar Programa' : 'Añadir Programa o Podcast'}</h3>
            <form onSubmit={handleProgramSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Nombre del Programa</label>
                <input required value={newProgram.name} onChange={e => setNewProgram({...newProgram, name: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Visión Deportiva" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Tipo de Contenido</label>
                <select value={newProgram.type} onChange={e => setNewProgram({...newProgram, type: e.target.value as 'Programa' | 'Podcast'})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]">
                  <option value="Programa">Programa</option>
                  <option value="Podcast">Podcast</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Categoría (Selecciona o escribe una nueva)</label>
                <input required list="categories-list" value={newProgram.category} onChange={e => setNewProgram({...newProgram, category: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Tecnología" />
                <datalist id="categories-list">
                  {allCategories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Host / Presentador</label>
                <input required value={newProgram.host || ''} onChange={e => setNewProgram({...newProgram, host: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Carlos Arvelo" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Horario</label>
                <input required value={newProgram.schedule || ''} onChange={e => setNewProgram({...newProgram, schedule: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Lun - Vie, 8:00 AM" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Póster Vertical (URL o subir archivo)</label>
                <div className="flex gap-2">
                  <input required value={newProgram.thumbnail} onChange={e => setNewProgram({...newProgram, thumbnail: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="URL o subir imagen 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'program_thumbnail')} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Imagen de Portada Amplia (Opcional)</label>
                <div className="flex gap-2">
                  <input value={newProgram.coverImage || ''} onChange={e => setNewProgram({...newProgram, coverImage: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="URL o subir imagen ancha 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'program_cover')} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Foto del Locutor / Presentador (Opcional - En la app móvil se muestra en Talento)</label>
                <div className="flex gap-2">
                  <input value={newProgram.hostImage || ''} onChange={e => setNewProgram({...newProgram, hostImage: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="URL o subir foto del locutor 👉 (Si se omite, usa la miniatura)" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'program_host')} />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Sinopsis / Descripción</label>
                <textarea required value={newProgram.description || ''} onChange={e => setNewProgram({...newProgram, description: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" placeholder="Sinopsis del programa..." rows={3}></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsProgramModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-surface-container-highest transition-all">Cancelar</button>
                <button type="submit" className="bg-[#F07D00] text-black px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">Guardar Programa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Añadir Cuña Standalone */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-4 md:p-8 w-full max-w-2xl border border-outline-variant/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#DDDADB] mb-6">{editingSponsorId ? 'Editar Cuña' : 'Registrar Nueva Cuña (Sponsor)'}</h3>
            <form onSubmit={handleStandaloneSponsorSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Nombre Descriptivo de la Cuña</label>
                <input required value={newSponsorForm.name} onChange={e => setNewSponsorForm({...newSponsorForm, name: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Anuncio Banesco Navidad" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Tipo de Cuña</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#DDDADB] cursor-pointer"><input type="radio" name="sponsorType" value="audio" checked={newSponsorForm.type === 'audio'} onChange={() => setNewSponsorForm({...newSponsorForm, type: 'audio'})} className="text-[#F07D00] focus:ring-[#F07D00] bg-surface-container-lowest border-none" /> Audio</label>
                  <label className="flex items-center gap-2 text-sm text-[#DDDADB] cursor-pointer"><input type="radio" name="sponsorType" value="video" checked={newSponsorForm.type === 'video'} onChange={() => setNewSponsorForm({...newSponsorForm, type: 'video'})} className="text-[#F07D00] focus:ring-[#F07D00] bg-surface-container-lowest border-none" /> Video</label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Archivo (URL o subir {newSponsorForm.type === 'audio' ? 'MP3' : 'MP4'})</label>
                <div className="flex gap-2">
                  <input required value={newSponsorForm.url} onChange={e => setNewSponsorForm({...newSponsorForm, url: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Enlace o carga 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept={newSponsorForm.type === 'audio' ? 'audio/*' : 'video/*'} className="hidden" onChange={(e) => handleFileUpload(e, 'sponsor_url')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Asignar a Programas/Episodios (Opcional - Ctrl/Cmd para selección múltiple)</label>
                <select multiple value={newSponsorForm.assignedEntities} onChange={e => setNewSponsorForm({...newSponsorForm, assignedEntities: Array.from(e.target.selectedOptions, option => option.value)})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB] h-32 focus:ring-[#F07D00]">
                  <option value="global">-- Global (Se aplica a todos) --</option>
                  <optgroup label="Programas">
                    {programs.map(p => <option key={`prog-${p.id}`} value={p.id}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Episodios">
                    {videos.map(v => <option key={`vid-${v.id}`} value={v.id}>{v.title}</option>)}
                  </optgroup>
                </select>
                <p className="text-[10px] text-[#DDDADB]/40 mt-1">Si seleccionas "Global", se aplicará a todo el sistema.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => { setIsSponsorModalOpen(false); setEditingSponsorId(null); }} className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-surface-container-highest transition-all">Cancelar</button>
                <button type="submit" disabled={isUploading} className="bg-[#F07D00] text-black px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                  {isUploading ? 'Subiendo...' : 'Guardar Cuña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Añadir/Editar Banner */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-4 md:p-8 w-full max-w-2xl border border-outline-variant/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#DDDADB] mb-6">{editingBannerId ? 'Editar Banner' : 'Añadir Banner Publicitario'}</h3>
            <form onSubmit={handleBannerSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Título o Nombre del Banner (Opcional)</label>
                <input value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Promo Concierto 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Imagen del Banner (Formato horizontal recomendado)</label>
                <div className="flex gap-2">
                  <input required value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="URL o sube una imagen 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'banner_image')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Enlace / URL de Destino al hacer clic (Opcional)</label>
                <input value={newBanner.url} onChange={e => setNewBanner({...newBanner, url: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="url" placeholder="https://instagram.com/... o https://tuweb.com" />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsBannerModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-surface-container-highest transition-all">Cancelar</button>
                <button type="submit" className="bg-[#F07D00] text-black px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">Guardar Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLANTILLA FÍSICA A4 PARA EL REPORTE PDF - SOLO SE RENDERIZA AL IMPRIMIR */}
      <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[99999] m-0 p-0 text-black">
        <div id="pdf-report-template" className="w-[850px] mx-auto min-h-[1100px] bg-white p-12 flex flex-col gap-10 relative font-['Inter'] text-black shadow-none">
            {/* Editorial Accent Corner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffe4e1] -mr-16 -mt-16 rounded-full"></div>
            
            {/* Header Section */}
            <header className="flex justify-between items-start border-b border-[#e4e4e7] pb-6 relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-12 bg-[#C13535]"></div>
                  <h1 className="font-['Montserrat'] text-4xl font-black text-black tracking-tighter uppercase leading-none">Reporte de Estadísticas Editoriales</h1>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2 font-['Inter'] text-sm uppercase tracking-widest text-[#52525b] mt-2">
                  <div><span className="text-[#F07D00] font-bold">Fecha:</span> <span className="border-b-2 border-[#e4e4e7] inline-block w-40 ml-2 text-black font-bold">{new Date().toLocaleDateString('es-VE')}</span></div>
                  <div><span className="text-[#F07D00] font-bold">Autor:</span> <span className="border-b-2 border-[#e4e4e7] inline-block w-40 ml-2 text-black font-bold">{userProfile.firstName} {userProfile.lastName}</span></div>
                  <div className="col-span-2 mt-2"><span className="text-[#F07D00] font-bold">Departamento:</span> <span className="border-b-2 border-[#e4e4e7] inline-block w-[80%] ml-2 text-black font-bold">Dirección General / Analíticas</span></div>
                  <div className="col-span-2 mt-2"><span className="text-[#F07D00] font-bold">Periodo:</span> <span className="border-b-2 border-[#e4e4e7] inline-block w-[80%] ml-2 text-black font-bold">{timeFilter === 'all' ? 'Histórico Completo' : timeFilter === '30days' ? 'Últimos 30 Días' : 'Últimos 7 Días'}</span></div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                {/* Logo con ruta absoluta para forzar carga en html2canvas */}
                <img src={`${window.location.origin}/logo_colors.png`} alt="Logo" className="w-16 h-16 object-contain mb-2" crossOrigin="anonymous" />
                <span className="text-xl font-['Montserrat'] font-black tracking-tighter text-[#C13535]">RADIO AMÉRICA</span>
                <p className="text-[10px] font-['Inter'] text-[#71717a] font-bold uppercase tracking-widest">CONFIDENCIAL / USO INTERNO</p>
              </div>
            </header>

            {/* 1. Metrics Overview Section */}
            <section className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#F07D00]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-black">Metrics Overview</h2>
                <div className="flex-1 h-[1px] bg-[#e4e4e7]"></div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <div className="p-5 bg-[#fafafa] rounded-xl flex flex-col gap-3 border-l-4 border-[#C13535]">
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Reproducciones Nativas</span>
                  <div className="border-b-2 border-[#e4e4e7] min-h-[2rem] flex items-end pb-1 text-2xl font-black text-black">{analyticsTotalViews}</div>
                </div>
                <div className="p-5 bg-[#fafafa] rounded-xl flex flex-col gap-3 border-l-4 border-[#F07D00]">
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Suscritos (Engagement)</span>
                  <div className="border-b-2 border-[#e4e4e7] min-h-[2rem] flex items-end pb-1 text-2xl font-black text-black">{filteredSubscribers.length}</div>
                </div>
                <div className="p-5 bg-[#fafafa] rounded-xl flex flex-col gap-3 border-l-4 border-[#FFB91F]">
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Contenido (Episodios)</span>
                  <div className="border-b-2 border-[#e4e4e7] min-h-[2rem] flex items-end pb-1 text-2xl font-black text-black">{filteredVideos.length}</div>
                </div>
                <div className="p-5 bg-[#fafafa] rounded-xl flex flex-col gap-3 border-l-4 border-[#a1a1aa]">
                  <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest text-[#71717a]">Vistas Externas (YT/IG)</span>
                  <div className="border-b-2 border-[#e4e4e7] min-h-[2rem] flex items-end pb-2 text-sm font-bold text-[#71717a] italic">No vinculado</div>
                </div>
              </div>
            </section>

            {/* 2. Performance Breakdown Section */}
            <section className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#F07D00]" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-black">Performance Breakdown</h2>
                <div className="flex-1 h-[1px] bg-[#e4e4e7]"></div>
              </div>
              <div className="overflow-hidden rounded-xl bg-[#fafafa] border border-[#e4e4e7]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f4f4f5] border-b border-[#e4e4e7]">
                      <th className="px-6 py-3 font-['Inter'] text-[10px] uppercase font-bold text-[#F07D00]">Programa/Segmento</th>
                      <th className="px-6 py-3 font-['Inter'] text-[10px] uppercase font-bold text-[#F07D00]">Plataforma/Formato</th>
                      <th className="px-6 py-3 font-['Inter'] text-[10px] uppercase font-bold text-[#F07D00]">Vistas Nativas</th>
                      <th className="px-6 py-3 font-['Inter'] text-[10px] uppercase font-bold text-[#F07D00] text-right">Categoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e4e7]">
                    {analyticsMostViewed.slice(0, 4).map(v => (
                      <tr key={v.id}>
                        <td className="px-6 py-4 font-bold text-black text-sm border-b border-[#f4f4f5]">{v.title}</td>
                        <td className="px-6 py-4 text-[#52525b] text-sm border-b border-[#f4f4f5]">{v.isAudio ? 'Audio / Podcast' : 'Video Web'}</td>
                        <td className="px-6 py-4 font-bold text-[#C13535] text-sm border-b border-[#f4f4f5]">{v.views}</td>
                        <td className="px-6 py-4 text-[#52525b] text-right uppercase text-[10px] font-bold tracking-widest border-b border-[#f4f4f5]">{v.category}</td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - analyticsMostViewed.length) }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="px-6 py-4"><div className="border-b-2 border-[#e4e4e7] min-h-[1.5rem]"></div></td>
                        <td className="px-6 py-4"><div className="border-b-2 border-[#e4e4e7] min-h-[1.5rem]"></div></td>
                        <td className="px-6 py-4"><div className="border-b-2 border-[#e4e4e7] min-h-[1.5rem]"></div></td>
                        <td className="px-6 py-4"><div className="border-b-2 border-[#e4e4e7] min-h-[1.5rem]"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Notes & Analysis Section */}
            <section className="flex flex-col gap-4 flex-1 relative z-10">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-[#F07D00]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-widest text-black">Notes & Analysis</h2>
                <div className="flex-1 h-[1px] bg-[#e4e4e7]"></div>
              </div>
              <div className="flex-1 min-h-[180px] p-8 bg-white border-2 border-dashed border-[#d4d4d8] rounded-xl relative">
                <div className="space-y-8 mt-2">
                  <div className="border-b-2 border-[#e4e4e7] h-1"></div>
                  <div className="border-b-2 border-[#e4e4e7] h-1"></div>
                  <div className="border-b-2 border-[#e4e4e7] h-1"></div>
                  <div className="border-b-2 border-[#e4e4e7] h-1"></div>
                </div>
                <span className="absolute top-4 right-4 text-[10px] uppercase font-['Inter'] font-bold text-[#a1a1aa]">Manual entry area</span>
              </div>
            </section>

            {/* Footer Page Meta */}
            <footer className="flex justify-between items-center pt-6 border-t border-[#d4d4d8] relative z-10 mt-auto">
              <div className="flex gap-4 items-center">
                <span className="text-[10px] font-['Inter'] font-bold uppercase tracking-widest text-[#71717a]">© {new Date().getFullYear()} Radio América</span>
                <span className="text-[10px] font-['Inter'] uppercase tracking-widest text-[#d4d4d8]">|</span>
                <span className="text-[10px] font-['Inter'] font-bold uppercase tracking-widest text-[#71717a]">Editorial Report Studio</span>
              </div>
              <div className="font-['Montserrat'] font-bold text-[#C13535] text-sm italic">Pág. 1 / 1</div>
            </footer>
        </div>
      </div>

      {/* Botón Flotante para Añadir (Solo Móvil) */}
      <button
        onClick={() => {
          setIsSidebarOpen(false); // Cierra menú si está abierto
          if (activeTab === 'programs') {
            setEditingProgramId(null);
            setNewProgram({ name: '', category: '', thumbnail: '', type: 'Programa', description: '', schedule: '', host: '', coverImage: '', hostImage: '' });
            setIsProgramModalOpen(true);
          } else if (activeTab === 'banners') {
            resetBannerForm();
            setIsBannerModalOpen(true);
          } else if (activeTab === 'sponsors') {
            setNewSponsorForm({ name: '', url: '', type: 'audio', assignedEntities: [] });
            setEditingSponsorId(null);
            setIsSponsorModalOpen(true);
          } else {
            resetVideoForm({ programId: selectedProgramDetails || '' });
            setIsModalOpen(true);
          }
        }}
        className="md:hidden print:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-[#C13535] rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(193,53,53,0.6)] hover:scale-105 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

    </div>
  );
}

export default Admin;
