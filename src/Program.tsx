import { useContext, useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';
import { Helmet } from 'react-helmet-async';

export default function ProgramView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { programs, videos } = useContext(VideoContext);
  
  const program = programs.find(p => p.id === id);
  
  // Filtramos solo los videos que pertenecen a este programa
  const programVideos = videos.filter(v => v.programId === id);
  const videoEpisodes = programVideos.filter(v => !v.isAudio);
  const audioEpisodes = programVideos.filter(v => v.isAudio);

  // Encontramos el video más reciente del programa
  const latestVideo = videoEpisodes.length > 0 ? videoEpisodes[0] : null;
  const latestAudio = audioEpisodes.length > 0 ? audioEpisodes[0] : null;

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Lógica del reproductor de Podcast
  const podcastAudioRef = useRef<HTMLAudioElement>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState<string | null>(latestAudio ? latestAudio.id : null);
  const activePodcast = audioEpisodes.find(a => a.id === activePodcastId);

  // --- LÓGICA DE LISTA DE REPRODUCCIÓN (PATROCINADORES) ---
  const playlist = useMemo(() => {
    if (!activePodcast?.url) return [];
    try {
      const arr = JSON.parse(activePodcast.url);
      if (Array.isArray(arr)) return arr;
    } catch(e) {}
    return [activePodcast.url];
  }, [activePodcast?.url]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const isAdPlaying = playlist.length > 1 && currentTrackIndex < playlist.length - 1;
  const currentSrc = playlist[currentTrackIndex] || '';

  // Resetear la pista si cambias de episodio
  useEffect(() => {
    setCurrentTrackIndex(0);
    setIsPodcastPlaying(false);
  }, [activePodcastId]);

  useEffect(() => {
    if (currentTrackIndex > 0 && podcastAudioRef.current) {
      podcastAudioRef.current.play().catch(() => console.warn("Autoplay bloqueado por el navegador"));
      setIsPodcastPlaying(true);
    }
  }, [currentTrackIndex]);

  // Lógica de progreso real
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = () => { if (podcastAudioRef.current) setCurrentTime(podcastAudioRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (podcastAudioRef.current) setDuration(podcastAudioRef.current.duration); };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAdPlaying) return; // Bloquear salto de anuncio
    const newTime = Number(e.target.value);
    if (podcastAudioRef.current) podcastAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePodcast = () => {
    if (podcastAudioRef.current) {
      if (isPodcastPlaying) podcastAudioRef.current.pause(); 
      else podcastAudioRef.current.play();
      setIsPodcastPlaying(!isPodcastPlaying);
    }
  };

  const handleEnded = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    } else {
      setIsPodcastPlaying(false);
    }
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      html.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  if (!program) {
    return (
      <>
        <Helmet>
          <title>Programa no encontrado | Estudio Radio América</title>
        </Helmet>
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-[#DDDADB]">
          <h2 className="text-2xl font-bold mb-4">Programa no encontrado</h2>
          <button onClick={() => navigate('/')} className="bg-[#C13535] px-6 py-2 rounded-full font-bold">Volver al inicio</button>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#e5e2e3] font-['Inter'] selection:bg-[#c13535] selection:text-white min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <Helmet>
        <title>{program.name} | Estudio Radio América</title>
        <meta name="description" content={program.description || `Episodios y contenido exclusivo de ${program.name}`} />
        <meta property="og:title" content={`${program.name} | Estudio Radio América`} />
        <meta property="og:description" content={program.description || `Episodios y contenido exclusivo de ${program.name}`} />
        <meta property="og:image" content={program.coverImage || program.thumbnail || '/logo_colors.png'} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {activePodcast && <audio ref={podcastAudioRef} src={currentSrc} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} className="hidden" />}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-transparent transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <span className="text-lg md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat'] hidden sm:block">Estudio Radio América</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-['Montserrat'] font-bold tracking-tight">Inicio</button>
              <button onClick={() => window.open('/programas', '_blank')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-['Montserrat'] font-bold tracking-tight">Programas</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="material-symbols-outlined text-[#C13535] dark:text-[#DDDADB] hover:scale-105 transition-transform">{isDarkMode ? 'light_mode' : 'dark_mode'}</button>
          </div>
        </div>
      </header>

      <main className="relative pt-16 flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[700px] lg:min-h-[870px] flex items-center overflow-hidden bg-zinc-100 dark:bg-transparent py-16 md:py-0">
          <div className="absolute inset-0 z-0">
            <img alt={program.name} className="w-full h-full object-cover object-center" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} src={program.coverImage || program.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#131314] via-white/80 dark:via-[#131314]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#131314] via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12 md:mt-0">
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#C13535] text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {program.category}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-['Montserrat'] tracking-tighter text-[#C13535] dark:text-white leading-none break-words">
                  {program.name}
                </h1>
                <p className="text-lg md:text-xl text-[#C13535]/80 dark:text-[#e1bebb] font-medium leading-relaxed max-w-xl">
                  {program.description || 'Sumérgete en este espacio dedicado al análisis, entretenimiento y cultura. Disfruta de todos los episodios disponibles de nuestro catálogo.'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 md:gap-4">
                <button onClick={() => latestVideo && navigate(`/watch/${latestVideo.id}`)} className="bg-[#C13535] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold flex items-center gap-2 md:gap-3 hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(193,53,53,0.3)]" disabled={!latestVideo}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  REPRODUCIR ÚLTIMO
                </button>
                <button className="bg-zinc-200/50 dark:bg-[#2a2a2b]/40 backdrop-blur-md border border-zinc-300 dark:border-[#59413f]/50 text-[#C13535] dark:text-[#DDDADB] px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold flex items-center gap-2 md:gap-3 hover:bg-zinc-300 dark:hover:bg-[#2a2a2b]/60 transition-all">
                  <span className="material-symbols-outlined">add</span>
                  MI LISTA
                </button>
              </div>
              
              <div className="flex items-center gap-12 pt-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-[#F07D00] font-bold">Horario</span>
                  <span className="text-xl font-bold font-['Montserrat'] text-[#C13535] dark:text-white">{program.schedule || 'Bajo Demanda'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-[#FFB91F] font-bold">Host</span>
                  <span className="text-xl font-bold font-['Montserrat'] text-[#C13535] dark:text-white">{program.host || 'Estudio Radio América'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes/Stats Section */}
        <section className="max-w-screen-2xl mx-auto px-6 -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-[#1c1b1c]/80 backdrop-blur-xl p-8 rounded-2xl flex items-center gap-6 group hover:bg-zinc-50 dark:hover:bg-[#2a2a2b] transition-all border-l-4 border-[#C13535] shadow-lg dark:shadow-none">
              <span className="material-symbols-outlined text-4xl text-[#C13535]">mic_external_on</span>
              <div>
                <h4 className="font-bold text-xl font-['Montserrat'] text-[#C13535] dark:text-white">Formato</h4>
                <p className="text-[#C13535]/70 dark:text-[#e1bebb] text-sm">{program.type}</p>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-[#1c1b1c]/80 backdrop-blur-xl p-8 rounded-2xl flex items-center gap-6 group hover:bg-zinc-50 dark:hover:bg-[#2a2a2b] transition-all border-l-4 border-[#F07D00] shadow-lg dark:shadow-none">
              <span className="material-symbols-outlined text-4xl text-[#F07D00]">video_library</span>
              <div>
                <h4 className="font-bold text-xl font-['Montserrat'] text-[#C13535] dark:text-white">Videos</h4>
                <p className="text-[#C13535]/70 dark:text-[#e1bebb] text-sm">{videoEpisodes.length} disponibles</p>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-[#1c1b1c]/80 backdrop-blur-xl p-8 rounded-2xl flex items-center gap-6 group hover:bg-zinc-50 dark:hover:bg-[#2a2a2b] transition-all border-l-4 border-[#FFB91F] shadow-lg dark:shadow-none">
              <span className="material-symbols-outlined text-4xl text-[#FFB91F]">headphones</span>
              <div>
                <h4 className="font-bold text-xl font-['Montserrat'] text-[#C13535] dark:text-white">Audios</h4>
                <p className="text-[#C13535]/70 dark:text-[#e1bebb] text-sm">{audioEpisodes.length} disponibles</p>
              </div>
            </div>
          </div>
        </section>

        {/* Audio Player Section (Visible only if audios exist) */}
        {audioEpisodes.length > 0 && activePodcast && (
          <section className="max-w-screen-2xl mx-auto px-6 py-12 md:py-24 mt-12 md:mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Left Side: Synopsis */}
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center gap-3">
                  <span className="bg-[#C13535] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Podcast / Audio</span>
                  <span className="bg-[#F07D00]/20 text-[#F07D00] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Escuchando</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tighter font-['Montserrat'] text-[#C13535] dark:text-[#DDDADB] leading-[0.95] break-words">
                    {isAdPlaying ? `Anuncio (${currentTrackIndex + 1}/${playlist.length - 1})` : activePodcast.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm font-medium text-[#F07D00]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">event</span>
                      {new Date(activePodcast.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#353436]"></span>
                    <span className="text-[#C13535]/60 dark:text-[#DDDADB]/60">{activePodcast.duration || '00:00'}</span>
                  </div>
                </div>
                <p className="text-lg text-zinc-600 dark:text-[#DDDADB]/80 leading-relaxed font-light">
                  {isAdPlaying ? 'Este episodio es traído a ti por nuestros aliados comerciales.' : activePodcast.description}
                </p>
                <div className="pt-4 flex items-center gap-6">
                  <button onClick={togglePodcast} className="bg-[#C13535] hover:bg-[#C13535]/90 text-white flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all active:scale-95">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPodcastPlaying ? 'pause' : 'play_arrow'}</span>
                    {isPodcastPlaying ? 'PAUSAR' : 'REPRODUCIR AHORA'}
                  </button>
                </div>
              </div>
              
              {/* Right Side: Audio Player UI */}
              <div className="lg:col-span-7">
                <div className="bg-zinc-100 dark:bg-surface-container-low rounded-3xl p-6 md:p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-zinc-200 dark:border-transparent">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C13535]/10 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    
                    <div className="relative w-full aspect-square max-w-md mx-auto group">
                      <img className={`w-full h-full object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ${isPodcastPlaying ? 'scale-[1.02]' : ''}`} src={activePodcast.thumbnail || '/logo_blanco.png'} alt={activePodcast.title} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                      <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 hidden dark:block">
                        <img alt="RA Logo" className="w-10 h-10 object-contain" src="/logo_blanco.png" />
                      </div>
                    </div>
                    
                    {/* Wave Visualizer Simulation */}
                    <div className={`w-full flex items-end justify-center gap-1.5 h-16 mt-12 mb-8 opacity-60 ${isPodcastPlaying ? 'animate-pulse' : ''}`}>
                      {[4,8,12,6,10,14,8,12,4,10,14,6,8,12,10,14,6,10,4,8,12].map((h, i) => (
                        <div key={i} className={`w-1 rounded-sm bg-[#F07D00] ${isPodcastPlaying ? 'animate-bounce' : ''}`} style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                      ))}
                    </div>
                    
                    {/* Progress Bar (Real) */}
                    <div className="w-full space-y-2 px-4">
                      <div className={`relative w-full h-1.5 rounded-full overflow-hidden flex items-center group/progress transition-colors ${isAdPlaying ? 'bg-zinc-700' : 'bg-zinc-300 dark:bg-[#353436]'}`}>
                        <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className={`absolute inset-0 w-full h-full opacity-0 z-20 ${isAdPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}`} disabled={isAdPlaying} />
                        <div className={`absolute top-0 left-0 h-full z-10 pointer-events-none transition-all duration-300 ${isAdPlaying ? 'bg-[#FFB91F] shadow-[0_0_10px_#FFB91F]' : 'bg-[#F07D00] shadow-[0_0_10px_#F07D00]'}`} style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-[#DDDADB]/40 tracking-widest px-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="mt-8 flex items-center justify-center gap-10">
                      <button className="material-symbols-outlined text-4xl text-[#C13535]/60 dark:text-[#DDDADB] hover:text-[#C13535] transition-colors">skip_previous</button>
                      <button onClick={togglePodcast} className="w-20 h-20 bg-[#C13535] rounded-full flex items-center justify-center shadow-lg shadow-[#C13535]/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{isPodcastPlaying ? 'pause' : 'play_arrow'}</span>
                      </button>
                      <button className="material-symbols-outlined text-4xl text-[#C13535]/60 dark:text-[#DDDADB] hover:text-[#C13535] transition-colors">skip_next</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Audio Playlist Selector */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audioEpisodes.map(audio => (
                <div key={audio.id} onClick={() => { setActivePodcastId(audio.id); setIsPodcastPlaying(true); }} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${activePodcastId === audio.id ? 'bg-[#C13535]/10 border-[#C13535]/30' : 'bg-zinc-100 dark:bg-surface-container-low border-transparent hover:border-[#F07D00]/30'}`}>
                  <img src={audio.thumbnail || '/logo_blanco.png'} alt={audio.title} className="w-12 h-12 rounded object-cover" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-bold text-sm truncate ${activePodcastId === audio.id ? 'text-[#C13535]' : 'text-[#C13535] dark:text-[#DDDADB]'}`}>{audio.title}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-[#DDDADB]/40 uppercase">{audio.duration || '00:00'}</p>
                  </div>
                  {activePodcastId === audio.id && isPodcastPlaying && <span className="material-symbols-outlined text-[#F07D00] animate-pulse">graphic_eq</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video Episodes Grid */}
        <section className="max-w-screen-2xl mx-auto px-6 py-24 space-y-12">
          <div className="flex justify-between items-end border-b border-zinc-200 dark:border-white/10 pb-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-black font-['Montserrat'] tracking-tighter uppercase text-[#C13535] dark:text-white">Explorar <span className="text-[#F07D00]">Videos</span></h2>
              <p className="text-[#C13535]/80 dark:text-[#e1bebb] font-medium">Contenido premium original de {program.name}</p>
            </div>
          </div>

          {videoEpisodes.length === 0 ? (
            <div className="text-center py-20 bg-zinc-100 dark:bg-[#0e0e0f] rounded-3xl border border-zinc-200 dark:border-white/5">
              <span className="material-symbols-outlined text-6xl text-[#C13535]/30 dark:text-white/10 mb-4">videocam_off</span>
              <h3 className="text-xl font-bold text-[#C13535]/60 dark:text-white/40">Aún no hay videos</h3>
              <p className="text-sm text-[#C13535]/40 dark:text-white/30 mt-2">Los episodios en formato video aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {videoEpisodes.map(video => (
                <div key={video.id} onClick={() => navigate(`/watch/${video.id}`)} className="group relative bg-zinc-100 dark:bg-[#201f20] rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(193,53,53,0.15)] cursor-pointer border border-zinc-200 dark:border-transparent">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={video.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-5xl text-white">play_circle</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#C13535] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{video.category}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="text-xl font-bold font-['Montserrat'] text-[#C13535] dark:text-white group-hover:text-[#F07D00] transition-colors line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-[#C13535]/70 dark:text-[#e1bebb] line-clamp-2">{video.description}</p>
                    <p className="text-[10px] text-[#F07D00] font-bold mt-2">{new Date(video.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer Shell */}
      <footer className="relative z-20 w-full flex flex-col md:flex-row justify-between px-10 py-8 items-center gap-4 bg-zinc-100 dark:bg-[#131314] border-t border-zinc-200 dark:border-[#59413f]/15 mt-auto">
        <div className="text-[#C13535]/60 dark:text-[#DDDADB]/40 font-['Montserrat'] text-xs uppercase tracking-[0.05em] text-center md:text-left">
          © 2024 Estudio Radio América. Patrimonio de Carabobo.
        </div>
      </footer>
    </div>
  );
}