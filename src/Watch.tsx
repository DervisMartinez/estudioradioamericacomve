import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';
import { Helmet } from 'react-helmet-async';
import PressNoteButton from './PressNoteButton';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { videos, programs, incrementView } = useContext(VideoContext);
  
  const video = videos.find(v => v.id === id);
  const program = video?.programId ? programs.find(p => p.id === video.programId) : null;
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Radio Player Logic
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isRadioPlaying) audioRef.current.pause(); 
      else audioRef.current.play();
      setIsRadioPlaying(!isRadioPlaying);
    }
  };

  // --- Helper functions for embeds ---
  const getSpotifyEmbedUrl = (url: string) => {
    if (!url) return null;
    // e.g., https://open.spotify.com/episode/3x245sZ2d42L5q6sZ4p8a9
    const match = url.match(/open\.spotify\.com\/(track|episode|show|playlist)\/([a-zA-Z0-9]+)/);
    if (match) {
      // The embed URL is slightly different
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }
    return null;
  };

  const getZenoEmbedUrl = (url: string) => {
    if (!url) return null;
    // e.g., https://zeno.fm/podcast/some-show/
    const match = url.match(/zeno\.fm\/(?:podcast|show)\/([^/]+)/);
    if (match && match[1]) {
      return `https://zeno.fm/player/${match[1]}`;
    }
    return null;
  };

  // Episode Audio Player Logic (Para el formato Podcast/Audio)
  const episodeAudioRef = useRef<HTMLAudioElement>(null);
  const [isEpisodePlaying, setIsEpisodePlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleEpisodeAudio = () => {
    if (episodeAudioRef.current) {
      if (isEpisodePlaying) episodeAudioRef.current.pause();
      else episodeAudioRef.current.play();
      setIsEpisodePlaying(!isEpisodePlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (episodeAudioRef.current) setCurrentTime(episodeAudioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (episodeAudioRef.current) setDuration(episodeAudioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (episodeAudioRef.current) episodeAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    if (episodeAudioRef.current) episodeAudioRef.current.volume = newVol;
    setAudioVolume(newVol);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    // Cuando el componente se carga, incrementa la vista del video
    if (id) {
      incrementView(id);
    }
  }, [id, incrementView]);

  if (!video) {
    return (
      <>
        <Helmet>
          <title>Video no encontrado | Estudio Radio América</title>
        </Helmet>
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-[#DDDADB]">
          <h2 className="text-2xl font-bold mb-4">Video no encontrado</h2>
          <button onClick={() => navigate('/')} className="bg-[#C13535] px-6 py-2 rounded-full font-bold">Volver al inicio</button>
        </div>
      </>
    );
  }

  // Extrae el ID de YouTube (Mejorado para soportar múltiples formatos)
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/(?:shorts|live)\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Extrae el ID de Instagram
  const getInstagramId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  // Detecta si es un archivo de video directo (mp4) o una carga local
  const isDirectVideo = (url: string) => {
    if (!url) return false;
    return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg)$/i);
  };

  const ytId = getYoutubeId(video.url);
  const igId = getInstagramId(video.url);
  const relatedVideos = videos.filter(v => v.id !== id).slice(0, 6);

  // --- RENDERIZADO DEL REPRODUCTOR DE AUDIO (PODCAST) ---
  if (video.isAudio) {
    const spotifyEmbedUrl = getSpotifyEmbedUrl(video.url);
    const zenoEmbedUrl = getZenoEmbedUrl(video.url);
    const embedUrl = spotifyEmbedUrl || zenoEmbedUrl;

    return (
      <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#e5e2e3] font-['Inter'] selection:bg-[#c13535] selection:text-white min-h-screen antialiased transition-colors duration-300">
        <style>{`
          .wave-bar { width: 4px; border-radius: 2px; background-color: #F07D00; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .vinyl-animation { animation: spin 12s linear infinite; }
          .glass-player { background: rgba(19, 19, 20, 0.8); backdrop-filter: blur(20px); }
          .editorial-shadow { text-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        `}</style>
        <Helmet>
          <title>{video.title} | Estudio Radio América</title>
          <meta name="description" content={video.description || `Escucha ${video.title} en Estudio Radio América`} />
          <meta property="og:title" content={`${video.title} | Estudio Radio América`} />
          <meta property="og:image" content={video.thumbnail || program?.coverImage || '/logo_colors.png'} />
        </Helmet>

        <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" className="hidden" />
        {/* Conditionally render the audio element only if it's a direct file */}
        {!embedUrl && <audio ref={episodeAudioRef} src={video.url} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={() => setIsEpisodePlaying(false)} className="hidden" />}

        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-transparent transition-all duration-300">
          <div className="flex items-center gap-4 md:gap-10 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
              <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <span className="text-lg md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat'] hidden sm:block">Estudio Radio América</span>
            </div>
            <div className="hidden md:flex gap-8">
              <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-medium">Inicio</button>
              <button className="text-[#F07D00] border-b-2 border-[#F07D00] pb-1 font-medium">Reproductor Podcast</button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin')} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
              <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
            </button>
          </div>
        </nav>

        <main className="pt-24 pb-32 px-6 md:px-12 lg:px-20 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Left Side: Synopsis */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <span className="bg-[#C13535] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Podcasts</span>
                <span className="bg-[#F07D00]/20 text-[#F07D00] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">{video.category}</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#C13535] dark:text-[#DDDADB] leading-[0.95] break-words">
                  {video.title}
                </h1>
                <div className="flex items-center gap-4 text-sm font-medium text-[#F07D00] flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Conducido por {program?.host || 'Estudio Radio América'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-[#353436]"></span>
                  <span className="text-zinc-500 dark:text-[#DDDADB]/60">{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-lg text-zinc-600 dark:text-[#DDDADB]/80 leading-relaxed font-light">
                {video.description || "Sin descripción disponible para este episodio."}
              </p>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                {!embedUrl ? (
                  <button onClick={toggleEpisodeAudio} className="bg-[#C13535] hover:bg-[#a12b2b] text-white flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isEpisodePlaying ? 'pause' : 'play_arrow'}</span>
                    {isEpisodePlaying ? 'PAUSAR AHORA' : 'REPRODUCIR AHORA'}
                  </button>
                ) : (
                  <div className="px-8 py-4 rounded-full bg-zinc-200 dark:bg-surface-container text-zinc-500 dark:text-on-surface/50 font-bold flex items-center gap-2 cursor-not-allowed">
                    <span className="material-symbols-outlined">play_disabled</span>
                    <span>REPRODUCIR EN PANEL</span>
                  </div>
                )}
                <PressNoteButton 
                  url={(video as any)?.pressNoteUrl} 
                  text="LEA LA NOTA COMPLETA AQUI"
                  className="bg-zinc-200/50 dark:bg-surface-container/50 backdrop-blur-md text-[#C13535] dark:text-[#DDDADB] px-4 py-3 rounded-full text-xs font-bold border border-zinc-300 dark:border-outline-variant/20 hover:bg-zinc-100 dark:hover:bg-surface-container transition-colors flex items-center gap-2 whitespace-nowrap" 
                />
                <button className="flex items-center justify-center w-14 h-14 rounded-full border border-zinc-300 dark:border-outline-variant/20 hover:bg-zinc-100 dark:hover:bg-surface-container transition-colors text-[#C13535] dark:text-[#DDDADB]">
                  <span className="material-symbols-outlined">add</span>
                </button>
                <button className="flex items-center justify-center w-14 h-14 rounded-full border border-zinc-300 dark:border-outline-variant/20 hover:bg-zinc-100 dark:hover:bg-surface-container transition-colors text-[#C13535] dark:text-[#DDDADB]">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>

            {/* Right Side: Audio Player UI */}
            <div className="lg:col-span-7">
                <div className="bg-zinc-100 dark:bg-surface-container-low rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl border border-zinc-200 dark:border-transparent">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C13535]/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative w-full aspect-square max-w-[240px] sm:max-w-[280px] md:max-w-[320px] mx-auto group">
                    <img className={`w-full h-full object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 ${isEpisodePlaying ? 'scale-[1.02]' : ''}`} src={video.thumbnail || program?.coverImage || '/logo_blanco.png'} alt={video.title} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                      
                      {/* Botón Flotante Pantalla Completa */}
                      {!embedUrl && (
                        <button onClick={() => setIsFullscreen(true)} className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-[#F07D00] hover:scale-105 transition-all border border-white/20 shadow-2xl lg:opacity-0 lg:group-hover:opacity-100 z-30">
                          <span className="material-symbols-outlined text-base">fullscreen</span>
                          <span className="hidden sm:inline">Pantalla Completa</span>
                        </button>
                      )}

                      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10 hidden dark:block">
                        <img alt="RA Logo" className="w-8 h-8 object-contain" src="/logo_blanco.png" />
                    </div>
                  </div>
                  
                  {embedUrl ? (
                    // --- EMBED PLAYER (Spotify/Zeno) ---
                    <div className="w-full mt-12">
                      <iframe
                        title={`Reproductor de ${spotifyEmbedUrl ? 'Spotify' : 'Zeno.fm'}`}
                        src={embedUrl}
                        width="100%"
                        height={spotifyEmbedUrl ? "152" : "200"}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl shadow-lg"
                      ></iframe>
                    </div>
                  ) : (
                    // --- CUSTOM PLAYER (Direct File) ---
                    <>
                      {/* Wave Visualizer Simulation */}
                      <div className={`w-full flex items-end justify-center gap-1 sm:gap-1.5 h-14 mt-8 mb-6 opacity-60 ${isEpisodePlaying ? 'animate-pulse' : ''}`}>
                        {[4,8,12,6,10,14,8,12,4,10,14,6,8,12,10,14,6,10,4,8,12].map((h, i) => (
                          <div key={i} className={`wave-bar ${isEpisodePlaying ? 'animate-bounce' : ''}`} style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full space-y-2 px-2 sm:px-4">
                        <div className="relative w-full h-1.5 bg-zinc-300 dark:bg-[#353436] rounded-full overflow-hidden flex items-center group/progress">
                          <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                          <div className="absolute top-0 left-0 h-full bg-[#F07D00] shadow-[0_0_10px_#F07D00] z-10 pointer-events-none" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-[#DDDADB]/40 tracking-widest">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="mt-6 sm:mt-8 flex items-center justify-center gap-6 sm:gap-10">
                        <button className="material-symbols-outlined text-2xl sm:text-3xl text-zinc-400 dark:text-[#DDDADB]/60 hover:text-[#C13535] dark:hover:text-[#DDDADB] transition-colors">shuffle</button>
                        <button className="material-symbols-outlined text-3xl sm:text-4xl text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors">skip_previous</button>
                        <button onClick={toggleEpisodeAudio} className="w-16 h-16 sm:w-20 sm:h-20 bg-[#C13535] rounded-full flex items-center justify-center shadow-lg shadow-[#C13535]/20 hover:scale-105 active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-3xl sm:text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{isEpisodePlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button className="material-symbols-outlined text-3xl sm:text-4xl text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors">skip_next</button>
                        <button className="material-symbols-outlined text-2xl sm:text-3xl text-zinc-400 dark:text-[#DDDADB]/60 hover:text-[#C13535] dark:hover:text-[#DDDADB] transition-colors">repeat</button>
                      </div>

                      {/* Controles Secundarios: Volumen & Fullscreen */}
                      <div className="mt-8 flex items-center justify-between w-full max-w-[320px] mx-auto">
                        <div className="flex items-center gap-3 w-32 sm:w-40">
                          <span className="material-symbols-outlined text-zinc-500 dark:text-[#DDDADB]/40 text-sm">volume_down</span>
                          <div className="flex-1 relative h-1.5 bg-zinc-300 dark:bg-[#353436] rounded-full flex items-center group/vol">
                            <input type="range" min="0" max="1" step="0.01" value={audioVolume} onChange={handleVolume} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            <div className="absolute top-0 left-0 h-full bg-[#C13535] dark:bg-[#DDDADB]/60 rounded-full z-10 pointer-events-none" style={{ width: `${audioVolume * 100}%` }}></div>
                          </div>
                          <span className="material-symbols-outlined text-zinc-500 dark:text-[#DDDADB]/40 text-sm">volume_up</span>
                        </div>
                        <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-1.5 bg-[#131314] dark:bg-surface-container text-white dark:text-[#DDDADB] hover:bg-[#C13535] dark:hover:bg-[#C13535] hover:text-white px-4 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md">
                          <span className="material-symbols-outlined text-base">open_in_full</span>
                          Expandir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* ... Aquí reutilizamos la misma "Section de Relacionados" del final ... */}
          {/* Related Content Section */}
          <section className="px-4 sm:px-8 md:px-16 py-12 md:py-20 mt-10">
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-[#C13535] dark:text-[#DDDADB] font-['Montserrat']">Sugerencias de Temas Similares</h2>
              <div className="h-1 w-20 bg-[#F07D00]"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {relatedVideos.map(relVideo => (
                <div key={relVideo.id} onClick={() => { setIsVideoPlaying(false); setIsEpisodePlaying(false); navigate(`/watch/${relVideo.id}`); window.scrollTo(0,0); }} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden poster-hover transition-all duration-300 border border-outline-variant/10">
                    <img className="w-full h-full object-cover" alt={relVideo.title} src={relVideo.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase">{relVideo.isAudio ? 'Audio' : relVideo.category}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold truncate text-zinc-800 dark:text-white group-hover:text-[#F07D00] transition-colors">{relVideo.title}</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-[#DDDADB]/50 uppercase tracking-widest">{relVideo.duration || '00:00'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* OVERLAY DE REPRODUCTOR VINILO (PANTALLA COMPLETA) */}
        {isFullscreen && !embedUrl && (
          <div className="fixed inset-0 z-[100] bg-[#131314] text-[#e5e2e3] font-['Montserrat'] overflow-hidden h-[100dvh] flex flex-col select-none">
            {/* Top Navigation Bar */}
            <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-transparent">
              <div className="flex items-center gap-2">
                <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold tracking-tighter text-[#DDDADB] font-['Montserrat'] hidden sm:block">Radio América</span>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => setIsFullscreen(false)} className="material-symbols-outlined text-[#DDDADB]/60 hover:text-[#F07D00] transition-colors scale-95 active:duration-150 text-3xl" title="Salir de Pantalla Completa">fullscreen_exit</button>
              </div>
            </header>

            {/* Main Content: Player Canvas */}
            <div className="relative flex-1 w-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-6 md:px-20 lg:px-32 pt-16 pb-[18rem] md:pb-48 overflow-y-auto hide-scrollbar">
              {/* Background Lighting Effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#c13535]/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#ef7c00]/5 rounded-full blur-[120px]"></div>
              </div>

              {/* 3D Vinyl Record Section */}
              <div className="relative z-10 w-full max-w-[260px] md:max-w-[360px] lg:max-w-[420px] aspect-square flex items-center justify-center group flex-shrink-0 mt-8 lg:mt-0">
                {/* Turntable Platter Base */}
                <div className="absolute w-full h-full rounded-full bg-[#201f20] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-[#59413f]/10"></div>
                
                {/* Vinyl Disc */}
                <div className="vinyl-animation relative w-[96%] h-[96%] rounded-full bg-[#0a0a0a] shadow-2xl flex items-center justify-center overflow-hidden" style={{ animationPlayState: isEpisodePlaying ? 'running' : 'paused' }}>
                  {/* Grooves Texture */}
                  <div className="absolute inset-0 opacity-40" style={{ background: 'repeating-radial-gradient(circle, transparent, transparent 1px, #1a1a1a 2px)' }}></div>
                  {/* Light Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5"></div>
                  {/* Center Label (Art) */}
                  <div className="relative w-[38%] h-[38%] rounded-full overflow-hidden border-[6px] border-[#131314] shadow-inner">
                    <img alt="Podcast Cover" className="w-full h-full object-cover" src={video.thumbnail || program?.coverImage || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    {/* Spindle Hole */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#131314] rounded-full shadow-lg border border-[#59413f]/20"></div>
                    </div>
                  </div>
                </div>
                
                {/* Tonearm (Static UI Element) */}
                <div className={`absolute top-0 right-0 w-24 h-64 pointer-events-none hidden md:block transition-transform duration-1000 origin-top-right ${isEpisodePlaying ? 'rotate-[12deg]' : 'rotate-0'}`}>
                  <div className="absolute top-8 right-8 w-8 h-8 rounded-full bg-[#39393a] border border-[#59413f]/30 shadow-lg"></div>
                  <div className="absolute top-12 right-[46px] w-1 h-48 bg-gradient-to-b from-[#39393a] to-[#59413f] origin-top rotate-[12deg] rounded-full shadow-xl"></div>
                  <div className="absolute top-[200px] right-[78px] w-4 h-8 bg-[#353436] rounded-sm rotate-[12deg] shadow-lg"></div>
                </div>
              </div>

              {/* Editorial Info Section */}
              <div className="relative z-10 w-full max-w-xl flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#c13535] text-[10px] font-bold tracking-widest text-[#ffe4e1] uppercase">{video.category}</span>
                  <span className="text-[#ffba29] font-medium text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>radio</span>
                    {program?.name || 'RADIO AMÉRICA'}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#e5e2e3] editorial-shadow leading-tight font-['Montserrat'] break-words line-clamp-4">
                  {video.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#59413f]/30 bg-[#201f20]">
                    <img alt="Host Avatar" className="w-full h-full object-cover" src={program?.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-[#e5e2e3] font-semibold text-sm md:text-lg">Con {program?.host || 'Estudio Radio América'}</p>
                    <p className="text-[#e1bebb] text-xs md:text-sm font-['Inter']">{program?.schedule || new Date(video.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-[#e1bebb] text-sm md:text-base leading-relaxed max-w-md mt-2 font-['Inter'] line-clamp-3">
                  {video.description || 'Disfruta de este episodio y descubre más contenido exclusivo en Estudio Radio América.'}
                </p>
              </div>
            </div>

            {/* Lower Controls: Waveform & Glass Bar */}
            <div className="absolute bottom-0 left-0 w-full z-[60] flex flex-col items-center">
              {/* Waveform Visualizer */}
              <div className="w-full h-16 md:h-24 flex items-end justify-center gap-[2px] md:gap-[3px] opacity-40 px-4 md:px-0">
                {[20, 40, 60, 80, 95, 70, 50, 30, 60, 85, 100, 75, 55, 40, 90, 65, 45, 70, 85, 60, 35, 55, 20].map((h, i) => {
                  const colors = ['bg-[#c13535]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#ef7c00]', 'bg-[#ffba29]', 'bg-[#c13535]', 'bg-[#c13535]'];
                  return (
                    <div key={i} className={`w-1 ${colors[i]} rounded-full transition-all duration-200 ${isEpisodePlaying ? 'animate-pulse' : ''}`} style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                  );
                })}
              </div>

              {/* Glass Player Bar */}
              <div className="w-full glass-player px-4 md:px-8 pb-6 pt-4 md:pb-10 md:pt-6 border-t-2 border-[#ef7c00]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="max-w-6xl mx-auto flex flex-col gap-4 md:gap-6">
                  {/* Progress Bar */}
                  <div className="w-full flex items-center gap-2 md:gap-4">
                    <span className="text-[10px] font-bold text-[#e1bebb] font-['Inter'] tracking-widest w-10 text-right">{formatTime(currentTime)}</span>
                    <div className="relative flex-1 h-1.5 bg-[#353436] rounded-full overflow-hidden group flex items-center">
                      <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                      <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#c13535] to-[#ef7c00] rounded-full pointer-events-none" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                      {/* Handle Dot Simulation */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#e5e2e3] rounded-full shadow-lg pointer-events-none transition-all" style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#e1bebb] font-['Inter'] tracking-widest w-10">{formatTime(duration)}</span>
                  </div>

                  {/* Main Interaction Cluster */}
                  <div className="flex items-center justify-between">
                    {/* Volume (Left) */}
                    <div className="hidden md:flex items-center gap-4 text-[#e1bebb] w-1/3">
                      <button className="material-symbols-outlined hover:text-[#ffba29] transition-colors">volume_up</button>
                      <div className="relative w-24 h-1.5 bg-[#353436] rounded-full flex items-center">
                        <input type="range" min="0" max="1" step="0.01" value={audioVolume} onChange={handleVolume} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        <div className="absolute top-0 left-0 h-full bg-[#e1bebb]/40 rounded-full pointer-events-none" style={{ width: `${audioVolume * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Playback Controls (Center) */}
                    <div className="flex items-center justify-center gap-6 md:gap-12 w-full md:w-1/3">
                      <button className="material-symbols-outlined text-3xl text-[#e1bebb] hover:text-[#e5e2e3] transition-all active:scale-90">skip_previous</button>
                      <button onClick={toggleEpisodeAudio} className="w-16 h-16 flex items-center justify-center bg-[#c13535] text-[#ffe4e1] rounded-full shadow-[0_0_25px_rgba(193,53,53,0.4)] hover:scale-105 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isEpisodePlaying ? 'pause' : 'play_arrow'}</span>
                      </button>
                      <button className="material-symbols-outlined text-3xl text-[#e1bebb] hover:text-[#e5e2e3] transition-all active:scale-90">skip_next</button>
                    </div>

                    {/* Options (Right) */}
                    <div className="hidden md:flex items-center justify-end gap-6 text-[#e1bebb] w-1/3">
                      <button className="material-symbols-outlined hover:text-[#ef7c00] transition-all">playlist_play</button>
                      <button className="material-symbols-outlined hover:text-[#c13535] transition-all">favorite</button>
                      <button className="material-symbols-outlined hover:text-[#ffba29] transition-all">equalizer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERIZADO ESTÁNDAR DEL REPRODUCTOR DE VIDEO ---
  return (
    <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#e5e2e3] font-['Inter'] selection:bg-[#c13535] selection:text-white min-h-screen antialiased transition-colors duration-300">
      <Helmet>
        <title>{video.title} | Estudio Radio América</title>
        <meta name="description" content={video.description || `Disfruta de ${video.title} en Estudio Radio América`} />
        <meta property="og:title" content={`${video.title} | Estudio Radio América`} />
        <meta property="og:description" content={video.description || `Disfruta de ${video.title} en Estudio Radio América`} />
        <meta property="og:image" content={video.thumbnail || '/logo_colors.png'} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:type" content="video.other" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" className="hidden" />

      {/* TopAppBar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-transparent transition-all duration-300">
        <div className="flex items-center gap-4 md:gap-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
            <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-lg md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat'] hidden sm:block">Estudio Radio América</span>
          </div>
          <div className="hidden md:flex gap-8">
            <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-medium">Inicio</button>
            <button className="text-[#F07D00] border-b-2 border-[#F07D00] pb-1 font-medium">Reproductor</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
            <span className="material-symbols-outlined" data-icon="search">search</span>
          </button>
          <button onClick={() => navigate('/admin')} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
            <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
          </button>
        </div>
      </nav>

      <main className="pt-20 min-h-screen">
        {/* Hero Section: Video Player & Synopsis */}
        <section className="relative h-auto md:h-[65vh] lg:h-[75vh] min-h-[500px] flex flex-col-reverse md:flex-row items-stretch overflow-hidden border-b border-outline-variant/10">
          
          {/* Left Side: Detailed Synopsis */}
          <div className="relative z-10 w-full md:w-[35%] p-6 sm:p-8 md:pl-12 lg:pl-16 flex flex-col justify-center bg-white dark:bg-[#131314] md:bg-transparent md:bg-gradient-to-r md:from-white md:dark:from-[#131314] md:via-white md:dark:via-[#131314] md:to-transparent shrink-0">
            <div className="mb-4 flex items-center gap-3">
              <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold tracking-widest uppercase rounded-sm">Premium Archive</span>
              <span className="text-tertiary text-sm font-semibold tracking-wide">● {new Date(video.createdAt).getFullYear()} Remastered</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight text-[#C13535] dark:text-white font-['Montserrat'] break-words">
              {video.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-bold text-[#C13535]/80 dark:text-[#DDDADB]/60 uppercase tracking-widest mb-6">
              <span>{video.duration || '--:--'}</span>
              <span className="w-1 h-1 bg-[#C13535]/30 dark:bg-[#DDDADB]/30 rounded-full"></span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              <span className="w-1 h-1 bg-[#C13535]/30 dark:bg-[#DDDADB]/30 rounded-full"></span>
              <span className="text-tertiary">{video.category}</span>
            </div>
            <p className="text-lg text-zinc-600 dark:text-[#DDDADB]/80 leading-relaxed mb-8 font-light max-w-md">
              {video.description || "Sin descripción disponible para este archivo."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setIsVideoPlaying(true)} className="flex items-center gap-2 px-8 py-4 bg-[#C13535] text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all cinematic-shadow">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Reproducir
              </button>
              <button className="flex items-center gap-2 px-6 py-4 border border-zinc-300 dark:border-[#DDDADB]/15 text-[#C13535] dark:text-[#DDDADB] rounded-full font-bold hover:bg-zinc-100 dark:hover:bg-[#DDDADB]/5 transition-all">
                <span className="material-symbols-outlined">add</span>
                Mi Lista
              </button>
            <PressNoteButton 
              url={(video as any)?.pressNoteUrl} 
              text="LEA LA NOTA COMPLETA AQUI"
              className="flex items-center gap-2 px-5 py-3 border border-zinc-300 dark:border-[#DDDADB]/15 text-[#C13535] dark:text-[#DDDADB] rounded-full font-bold text-xs hover:bg-zinc-100 dark:hover:bg-[#DDDADB]/5 transition-all whitespace-nowrap" 
            />
            </div>
          </div>

          {/* Right Side: Video Reproductor */}
          <div className="relative w-full md:w-[65%] min-h-[400px] md:min-h-full bg-zinc-200 dark:bg-surface-container-lowest">
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white dark:from-[#131314] to-transparent hidden md:block pointer-events-none"></div>
            
            {isVideoPlaying ? (
              <div className="absolute inset-0 z-20 bg-black flex items-center justify-center group/player">
                <div className="absolute top-4 right-4 z-30 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                   <a href={video.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/60 hover:bg-[#F07D00] hover:text-black text-white px-4 py-2 rounded-full backdrop-blur-md transition-colors text-xs font-bold border border-white/10 shadow-xl">
                     <span className="material-symbols-outlined text-sm">open_in_new</span>
                     Ver en plataforma externa
                   </a>
                </div>
                {ytId ? (
                  <iframe className="w-full aspect-video max-h-full relative z-10" src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                ) : igId ? (
                  <iframe className="w-full h-full max-h-full relative z-10 bg-white" src={`https://www.instagram.com/p/${igId}/embed`} title={video.title} frameBorder="0" scrolling="no" allowTransparency={true} allowFullScreen></iframe>
                ) : isDirectVideo(video.url) ? (
                  <video className="w-full aspect-video max-h-full relative z-10 bg-black" src={video.url} poster={video.thumbnail || '/logo_blanco.png'} controls autoPlay playsInline preload="metadata"></video>
                ) : (
                  <div className="w-full h-full relative z-10 flex flex-col items-center justify-center bg-surface-container-highest p-8 text-center">
                     <span className="material-symbols-outlined text-6xl text-[#F07D00] mb-4">dynamic_feed</span>
                     <h3 className="text-2xl font-bold text-[#DDDADB] mb-2">Plataforma Externa</h3>
                     <p className="text-[#DDDADB]/60 max-w-md mb-8">
                       Este video pertenece a una red social externa (como Instagram, TikTok o Facebook). Por restricciones de estas plataformas, debe reproducirse en su sitio original.
                     </p>
                     <a href={video.url} target="_blank" rel="noreferrer" className="bg-[#C13535] hover:bg-[#a12b2b] text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg">
                       <span className="material-symbols-outlined">open_in_new</span>
                       Ver Video Original
                     </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img className="w-full h-full object-cover opacity-60" alt={video.title} src={video.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="group cursor-pointer relative" onClick={() => setIsVideoPlaying(true)}>
                    <div className="absolute -inset-8 bg-[#C13535]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-24 h-24 flex items-center justify-center bg-[#C13535] rounded-full text-white shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <span className="material-symbols-outlined text-5xl ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                </div>
                {/* Controls Preview */}
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col gap-4 bg-gradient-to-t from-background/90 to-transparent pointer-events-none">
                  <div className="flex justify-between items-center text-white/80">
                    <div className="flex items-center gap-6">
                      <span className="material-symbols-outlined">pause</span>
                      <span className="material-symbols-outlined">volume_up</span>
                      <span className="text-xs font-mono">En espera...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Content Section */}
        <section className="px-4 sm:px-8 md:px-16 py-12 md:py-20">
          <div className="flex flex-col gap-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-[#C13535] dark:text-[#DDDADB] font-['Montserrat']">Sugerencias de Temas Similares</h2>
            <div className="h-1 w-20 bg-[#F07D00]"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relatedVideos.map(relVideo => (
              <div key={relVideo.id} onClick={() => { setIsVideoPlaying(false); navigate(`/watch/${relVideo.id}`); window.scrollTo(0,0); }} className="flex flex-col gap-3 group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden poster-hover transition-all duration-300 border border-outline-variant/10">
                  <img className="w-full h-full object-cover" alt={relVideo.title} src={relVideo.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase">{relVideo.category}</div>
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate text-zinc-800 dark:text-white group-hover:text-[#F07D00] transition-colors">{relVideo.title}</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-[#DDDADB]/50 uppercase tracking-widest">{relVideo.duration || '00:00'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Live Player Indicator (Desktop Only) */}
      <div className="hidden lg:flex fixed bottom-8 right-8 z-40 items-center gap-4 p-4 bg-white/90 dark:bg-surface-container/80 backdrop-blur-xl rounded-xl border-t-[2px] border-[#F07D00]/30 shadow-2xl dark:cinematic-shadow">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black">
          <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span> En Vivo
          </span>
          <span className="text-sm font-bold text-[#C13535] dark:text-white">Estudio Radio América</span>
        </div>
        <button onClick={toggleRadio} className="w-10 h-10 bg-[#C13535] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{isRadioPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
      </div>
    </div>
  );
}