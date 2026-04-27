import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent, FormEvent } from 'react';
import { VideoContext, RadioAmericaLoader, API_URL } from './VideoContext';

function Admin() {
  const { videos, addVideo, updateVideo, deleteVideo, programs, addProgram, updateProgram, deleteProgram, sponsors, addSponsor, deleteSponsor, userProfile, updateUserProfile } = useContext(VideoContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'programs' | 'sponsors' | 'analytics' | 'settings'>('dashboard');
  const [selectedProgramDetails, setSelectedProgramDetails] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', category: 'Historia', thumbnail: '', url: '', description: '', isFeatured: false, isShort: false, isAudio: false, programId: '', releaseDate: '', duration: '', pressNoteUrl: '' });
  const [newProgram, setNewProgram] = useState({ name: '', category: '', thumbnail: '', type: 'Programa' as 'Programa' | 'Podcast', description: '', schedule: '', host: '', coverImage: '' });
  const [newSponsorForm, setNewSponsorForm] = useState({ name: '', url: '', programId: '' });
  const [profileForm, setProfileForm] = useState(userProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorCount, setSponsorCount] = useState(1);
  const [sponsorUrls, setSponsorUrls] = useState<string[]>([]);

  const resetVideoForm = (overrides = {}) => {
    setEditingId(null);
    setNewVideo({ title: '', category: 'Historia', thumbnail: '', url: '', description: '', isFeatured: false, isShort: false, isAudio: false, programId: '', releaseDate: '', duration: '', pressNoteUrl: '', ...overrides });
    setIsSponsored(false);
    setSponsorCount(1);
    setSponsorUrls([]);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (isAuth !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'avatar' | 'url' | 'program_thumbnail' | 'program_cover' | 'sponsor_url') => {
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
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'url' || field === 'sponsor_url') {
        const uploadMedia = async () => {
          setIsUploading(true);
          const formData = new FormData();
          formData.append('file', file);
          try {
            const uploadEndpoint = field === 'sponsor_url' ? `${API_URL}/upload/sponsor` : `${API_URL}/upload`;
            const response = await fetch(uploadEndpoint, {
              method: 'POST',
              body: formData // Fetch calcula el multipart/form-data automáticamente
            });
            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`Código ${response.status}: ${errText.substring(0, 50)}`);
            }
            const data = await response.json();
            if (field === 'url') {
              setNewVideo({ ...newVideo, url: data.url, isAudio: file.type.startsWith('audio/') });
            } else if (field === 'sponsor_url') {
              setNewSponsorForm({ ...newSponsorForm, url: data.url });
            }
            alert("✅ Archivo multimedia procesado y listo para guardar.");
          } catch (error: any) {
            alert(`❌ Falló la carga del archivo. Detalle: ${error.message}`);
          } finally {
            setIsUploading(false);
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
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_URL}/upload/sponsor`, { method: 'POST', body: formData });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Código ${response.status}: ${errText.substring(0, 100)}`);
      }
      const data = await response.json();
      
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
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let finalUrl = newVideo.url;
    // Si es audio, está patrocinado y tiene URLs de cuñas, lo convertimos en un JSON Array (Lista de reproducción)
    if (newVideo.isAudio && isSponsored && sponsorUrls.length > 0) {
      const validSponsors = sponsorUrls.slice(0, sponsorCount).filter(u => u !== '');
      if (validSponsors.length > 0) {
        finalUrl = JSON.stringify([...validSponsors, newVideo.url]);
      }
    }

    const videoData = {
      title: newVideo.title, category: newVideo.category, description: newVideo.description,
      isFeatured: newVideo.isFeatured, isShort: newVideo.isShort, isAudio: newVideo.isAudio, thumbnail: newVideo.thumbnail, 
      url: finalUrl, programId: newVideo.programId, duration: newVideo.duration || '00:00', releaseDate: newVideo.releaseDate, pressNoteUrl: newVideo.pressNoteUrl
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
    setNewProgram({ name: '', category: '', thumbnail: '', type: 'Programa', description: '', schedule: '', host: '', coverImage: '' });
  };

  const handleStandaloneSponsorSubmit = (e: FormEvent) => {
    e.preventDefault();
    addSponsor({ id: Date.now().toString(), name: newSponsorForm.name, url: newSponsorForm.url, programId: newSponsorForm.programId, createdAt: new Date().toISOString() });
    setIsSponsorModalOpen(false);
    setNewSponsorForm({ name: '', url: '', programId: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/login');
  };

  const openEditModal = (video: any) => {
    let parsedUrl = video.url;
    let sUrls: string[] = [];
    
    // Intenta detectar si el archivo guardado es una lista de reproducción (Patrocinado)
    try {
      const arr = JSON.parse(video.url);
      if (Array.isArray(arr) && video.isAudio) {
        parsedUrl = arr[arr.length - 1]; // El último siempre es el episodio
        sUrls = arr.slice(0, -1); // El resto son las cuñas
      }
    } catch(e) {}

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
        isShort: video.isShort || false, 
        isAudio: video.isAudio || false, 
        programId: video.programId || '',
        releaseDate: video.releaseDate ? new Date(video.releaseDate).toISOString().split('T')[0] : '',
        duration: video.duration || '',
        pressNoteUrl: video.pressNoteUrl || ''
    });
    setEditingId(video.id);
    setIsModalOpen(true);
  };

  const openEditProgramModal = (prog: any) => {
    setNewProgram({ name: prog.name, category: prog.category, thumbnail: prog.thumbnail, type: prog.type, description: prog.description || '', schedule: prog.schedule || '', host: prog.host || '', coverImage: prog.coverImage || '' });
    setEditingProgramId(prog.id);
    setIsProgramModalOpen(true);
  };

  // Métricas calculadas en tiempo real basadas en el contexto
  const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0);
  const sortedByViews = [...videos].sort((a, b) => b.views - a.views);
  const mostViewed = sortedByViews.slice(0, 4); // Top 4

  // Detalles del programa seleccionado
  const activeProgramData = selectedProgramDetails ? programs.find(p => p.id === selectedProgramDetails) : null;
  const activeProgramEpisodes = selectedProgramDetails ? videos.filter(v => v.programId === selectedProgramDetails) : [];

  // Extraer todas las categorías existentes para sugerirlas
  const allCategories = Array.from(new Set([...programs.map(p => p.category), ...videos.map(v => v.category)]));

  return (
    <div className="text-on-surface antialiased overflow-x-hidden">
      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" className="hidden" />
      
      {/* Side Navigation Shell */}
      <aside className={`h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#131314] flex flex-col p-4 border-r border-[#59413f]/15 shadow-2xl shadow-red-900/5 z-50 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-1">
            <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <h1 className="text-2xl font-black tracking-tighter text-[#C13535]">Estudio Radio América <span className="text-[10px] text-[#F07D00] align-top bg-[#F07D00]/10 px-2 py-0.5 rounded-full ml-2">v2.0</span></h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#DDDADB]/40 font-bold mt-1">Admin Dashboard</p>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('dashboard'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab('library'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'library' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="video_library">video_library</span>
            <span className="text-sm">Video Library</span>
          </button>
          
          <button onClick={() => { setActiveTab('programs'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'programs' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="podcasts">podcasts</span>
            <span className="text-sm">Programas</span>
          </button>
          
          <button onClick={() => { setActiveTab('sponsors'); setSelectedProgramDetails(null); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'sponsors' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
            <span className="text-sm">Cuñas (Sponsors)</span>
          </button>

          <button onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'analytics' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
            <span className="text-sm">Analytics</span>
          </button>

          <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'settings' ? 'bg-[#C13535] text-[#DDDADB]' : 'text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-[#1c1b1c]'}`}>
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="text-sm">Settings</span>
          </button>
        </nav>
        <div className="mt-auto pt-6 border-t border-[#59413f]/15">
          <button onClick={() => { resetVideoForm(); setIsModalOpen(true); }} className="w-full bg-[#C13535] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity editorial-shadow">
            <span className="material-symbols-outlined text-sm" data-icon="upload">upload</span>
            Upload Video
          </button>
          <div className="mt-6 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
              <img className="w-full h-full object-cover" alt="Profile" src={userProfile.avatar || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#DDDADB]">{userProfile.firstName} {userProfile.lastName}</span>
              <span className="text-[10px] text-[#DDDADB]/40">Super Admin</span>
            </div>
            <button onClick={handleLogout} className="ml-auto text-[#DDDADB]/40 hover:text-[#C13535] transition-colors" title="Cerrar Sesión">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content Shell */}
      <main className="md:ml-64 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-[#131314]/80 backdrop-blur-xl border-b border-[#59413f]/15">
          <div className="flex justify-between items-center h-16 px-4 md:px-8">
            <div className="flex items-center gap-8">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-[#DDDADB]">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-xl font-bold text-[#DDDADB] capitalize">{activeTab.replace('_', ' ')}</h2>
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
                <button onClick={() => { resetVideoForm({ programId: selectedProgramDetails || '' }); setIsModalOpen(true); }} className="bg-[#C13535] text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
                  Add New Video
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-24 px-4 md:px-8 pb-12">
          
          {/* DASHBOARD & LIBRARY TABS SHARE STATS */}
          {(activeTab === 'dashboard' || activeTab === 'library') && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <h3 className="text-3xl font-black text-[#DDDADB] mt-1">{(totalViews / 1000).toFixed(1)}k</h3>
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
          </section>
          )}

          {/* LIBRARY / DASHBOARD CONTENT */}
          {(activeTab === 'dashboard' || activeTab === 'library') && (
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">{activeTab === 'dashboard' ? 'Videos Más Vistos' : 'Video Library'}</h3>
                <p className="text-[#DDDADB]/50 text-sm max-w-md">Manage your cinematic archives, interviews, and historical documentaries for the Estudio Radio América network.</p>
              </div>
              {/* Tab Filter Bar */}
              {activeTab === 'library' && (
                <div className="flex bg-surface-container-lowest p-1 rounded-full border border-outline-variant/10">
                  <button className="px-6 py-2 rounded-full text-xs font-bold bg-[#C13535] text-white">Todos</button>
                  <button className="px-6 py-2 rounded-full text-xs font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] transition-colors">Historia</button>
                  <button className="px-6 py-2 rounded-full text-xs font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] transition-colors">Personajes</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(activeTab === 'dashboard' ? mostViewed : videos).map(video => (
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
                        <span onClick={() => openEditModal(video)} className="material-symbols-outlined text-lg hover:text-[#DDDADB] transition-colors" data-icon="edit">edit</span>
                        <span onClick={() => deleteVideo(video.id)} className="material-symbols-outlined text-lg hover:text-[#C13535] transition-colors" data-icon="delete">delete</span>
                        <a href={video.url} target="_blank" rel="noreferrer" className="material-symbols-outlined text-lg hover:text-[#FFB91F] transition-colors">open_in_new</a>
                      </div>
                      <span className="text-[10px] text-[#DDDADB]/30 font-medium italic">{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeTab === 'library' && (
            <div className="mt-12 flex justify-center">
              <button className="flex items-center gap-2 text-[#DDDADB]/60 hover:text-[#F07D00] font-bold text-sm transition-colors">
                Ver Todos los Videos
                <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
            )}
          </section>
          )}

          {/* PROGRAMS TAB */}
          {activeTab === 'programs' && !selectedProgramDetails && (
          <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Programas y Podcasts</h3>
                <p className="text-[#DDDADB]/50 text-sm max-w-md">Administra los programas en los que se agrupan los videos.</p>
              </div>
              <button onClick={() => { setEditingProgramId(null); setNewProgram({ name: '', category: '', thumbnail: '', type: 'Programa', description: '', schedule: '', host: '', coverImage: '' }); setIsProgramModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
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
                      <button onClick={(e) => { e.stopPropagation(); openEditProgramModal(program); }} className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#F07D00] transition-colors shadow-lg"><span className="material-symbols-outlined text-sm">edit</span></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteProgram(program.id); }} className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-[#C13535] transition-colors shadow-lg"><span className="material-symbols-outlined text-sm">delete</span></button>
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
                  <h2 className="text-4xl font-black text-[#DDDADB]">{activeProgramData.name}</h2>
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
                        <button onClick={() => openEditModal(ep)} className="hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        <button onClick={() => deleteVideo(ep.id)} className="hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* SPONSORS (CUÑAS) TAB */}
          {activeTab === 'sponsors' && (
            <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Biblioteca de Cuñas y Anuncios</h3>
                  <p className="text-[#DDDADB]/50 text-sm max-w-md">Gestiona los audios publicitarios centralizados. Se pueden reutilizar en múltiples episodios.</p>
                </div>
                <button onClick={() => { setNewSponsorForm({ name: '', url: '', programId: '' }); setIsSponsorModalOpen(true); }} className="bg-[#F07D00] text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span> Añadir Cuña
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-[#DDDADB]/40 text-sm">No hay cuñas registradas aún.</div>
                ) : (
                  sponsors.map(sponsor => (
                    <div key={sponsor.id} className="bg-surface-container-highest p-5 rounded-2xl border border-outline-variant/10 hover:border-[#F07D00]/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-[#DDDADB] font-bold text-lg">{sponsor.name}</h4>
                        <button onClick={() => deleteSponsor(sponsor.id)} className="text-[#DDDADB]/40 hover:text-[#C13535] transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                      <audio controls className="w-full h-8 mb-3 opacity-90 grayscale" src={sponsor.url}></audio>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] bg-black/40 px-2 py-1 rounded text-[#DDDADB]/60 uppercase tracking-widest">
                          {sponsor.programId ? `Programa: ${programs.find(p=>p.id === sponsor.programId)?.name || 'Varios'}` : 'Global'}
                        </span>
                        <span className="text-[10px] text-[#DDDADB]/30 font-medium italic">{new Date(sponsor.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-[#DDDADB]">Dashboard de Analíticas</h3>
                <button onClick={() => alert("Generando reporte PDF detallado de estadísticas, ratings y programas...\n(Simulación)")} className="flex items-center gap-2 bg-[#F07D00]/20 hover:bg-[#F07D00]/30 text-[#F07D00] px-5 py-2 rounded-full text-sm font-bold border border-[#F07D00]/30 transition-all">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Generar Reporte General
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* ... (el resto del código de Analytics se mantiene igual) */}
                <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
                  <h4 className="text-[#F07D00] font-bold mb-6">Tiempo de Reproducción Total</h4>
                  <div className="text-5xl font-black text-[#DDDADB] mb-2">{((totalViews * 15) / 60).toFixed(1)} <span className="text-xl text-[#DDDADB]/40">Horas</span></div>
                  <p className="text-xs text-[#DDDADB]/60">+4.2% respecto al mes pasado</p>
                </div>
                <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
                  <h4 className="text-[#FFB91F] font-bold mb-6">Visitas al Mes</h4>
                  <div className="text-5xl font-black text-[#DDDADB] mb-2">{(totalViews / 1000).toFixed(1)}k</div>
                  <p className="text-xs text-[#DDDADB]/60">Promedio de {Math.floor(totalViews / 30)} visitas diarias</p>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 mt-8">
                <h4 className="text-[#C13535] font-bold mb-6">Contenido Más Consumido (Top 3)</h4>
                <div className="space-y-4">
                  {mostViewed.slice(0,3).map((v, i) => (
                    <div key={v.id} className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-[#DDDADB]/20">0{i+1}</span>
                        <div>
                          <div className="font-bold text-[#DDDADB]">{v.title}</div>
                          <div className="text-xs text-[#DDDADB]/40">{v.category}</div>
                        </div>
                      </div>
                      <div className="font-bold text-[#F07D00]">{(v.views/1000).toFixed(1)}k vistas</div>
                    </div>
                  ))}
                </div>
              </div>
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
      <div className="fixed bottom-6 right-6 z-50">
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
          <p className="text-[#DDDADB] font-bold mt-4 animate-pulse uppercase tracking-widest text-sm">Subiendo y procesando...</p>
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
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Categoría</label>
                <select value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]">
                  <option>Historia</option>
                  <option>Personajes</option>
                  <option>Documentales</option>
                  <option>Sociedad</option>
                  <option>Deportes</option>
                  <option>Cultura</option>
                  <option>Política</option>
                </select>
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
              {newVideo.isAudio && (
                <div className="md:col-span-2 bg-[#F07D00]/10 p-5 rounded-xl border border-[#F07D00]/30 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <input id="isSponsored" checked={isSponsored} onChange={e => setIsSponsored(e.target.checked)} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-[#F07D00] cursor-pointer" />
                    <label htmlFor="isSponsored" className="text-sm text-[#DDDADB] font-bold cursor-pointer">¿Episodio Patrocinado? (Añadir Cuñas de Audio)</label>
                  </div>
                  {isSponsored && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-xs font-bold text-[#F07D00] mb-1 uppercase tracking-widest">Cantidad de Cuñas a reproducir (Máx 3)</label>
                        <select value={sponsorCount} onChange={e => setSponsorCount(Number(e.target.value))} className="w-full sm:w-1/3 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-[#DDDADB] font-bold">
                          <option value={1}>1 Cuña</option>
                          <option value={2}>2 Cuñas</option>
                          <option value={3}>3 Cuñas</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: sponsorCount }).map((_, i) => (
                          <div key={i} className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <label className="block text-[10px] font-bold text-[#DDDADB]/60 mb-2 uppercase">Audio Patrocinante {i + 1}</label>
                            <div className="flex flex-col xl:flex-row gap-2 items-center">
                              <select 
                                value={sponsorUrls[i] || ''}
                                onChange={(e) => {
                                  const newUrls = [...sponsorUrls];
                                  newUrls[i] = e.target.value;
                                  setSponsorUrls(newUrls);
                                }}
                                className="w-full xl:w-2/3 bg-black/40 border border-white/10 rounded p-2 text-xs text-[#DDDADB]"
                              >
                                <option value="">-- Seleccionar cuña de la biblioteca --</option>
                                {sponsors.map(s => <option key={s.id} value={s.url}>{s.name}</option>)}
                              </select>
                              <label className="w-full xl:w-1/3 bg-[#F07D00]/20 text-[#F07D00] hover:bg-[#F07D00] hover:text-black border border-[#F07D00]/30 cursor-pointer px-3 py-2 rounded-lg flex items-center justify-center transition-all shadow-sm font-bold text-xs text-center">
                                <span className="material-symbols-outlined text-sm mr-1">add</span> Nueva
                                <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleSponsorUpload(e, i)} />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10 mt-2">
                <div className="flex items-center gap-2">
                  <input id="isFeatured" checked={newVideo.isFeatured} onChange={e => setNewVideo({...newVideo, isFeatured: e.target.checked})} type="checkbox" className="h-5 w-5 rounded bg-surface-container-highest border-none text-[#C13535] cursor-pointer" />
                  <label htmlFor="isFeatured" className="text-sm text-[#DDDADB] font-medium cursor-pointer">⭐ Marcar como Entrevista Destacada</label>
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
          <div className="bg-surface-container rounded-2xl p-4 md:p-8 w-full max-w-2xl border border-outline-variant/20 shadow-2xl">
            <h3 className="text-xl font-bold text-[#DDDADB] mb-6">Registrar Nueva Cuña (Sponsor)</h3>
            <form onSubmit={handleStandaloneSponsorSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Nombre Descriptivo de la Cuña</label>
                <input required value={newSponsorForm.name} onChange={e => setNewSponsorForm({...newSponsorForm, name: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Ej: Anuncio Banesco Navidad" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Audio (URL o subir archivo MP3)</label>
                <div className="flex gap-2">
                  <input required value={newSponsorForm.url} onChange={e => setNewSponsorForm({...newSponsorForm, url: e.target.value})} className="flex-1 bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]" type="text" placeholder="Enlace de audio o carga 👉" />
                  <label className="bg-surface-container-high hover:bg-surface-bright cursor-pointer px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[#DDDADB]">upload_file</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'sponsor_url')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#DDDADB]/60 mb-1">Asociar a un Programa en específico (Opcional)</label>
                <select value={newSponsorForm.programId} onChange={e => setNewSponsorForm({...newSponsorForm, programId: e.target.value})} className="w-full bg-surface-container-lowest border-none rounded-lg p-3 text-sm text-[#DDDADB]">
                  <option value="">Global / Para cualquier programa</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant/20">
                <button type="button" onClick={() => setIsSponsorModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-[#DDDADB]/60 hover:text-[#DDDADB] hover:bg-surface-container-highest transition-all">Cancelar</button>
                <button type="submit" disabled={isUploading} className="bg-[#F07D00] text-black px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                  {isUploading ? 'Subiendo...' : 'Guardar Cuña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;