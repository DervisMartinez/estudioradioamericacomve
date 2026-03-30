import { useContext, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';
import { Helmet } from 'react-helmet-async';

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { videos, incrementView } = useContext(VideoContext);
  
  const video = videos.find(v => v.id === id);
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
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Detecta si es un archivo de video directo (mp4) o una carga local
  const isDirectVideo = (url: string) => {
    if (!url) return false;
    return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg)$/i);
  };

  const ytId = getYoutubeId(video.url);
  const relatedVideos = videos.filter(v => v.id !== id).slice(0, 6);

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
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-transparent transition-all duration-300">
        <div className="flex items-center gap-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-3 hover:scale-105 transition-transform">
            <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat']">Estudio Radio América</span>
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
        <section className="relative h-auto md:h-[65vh] lg:h-[75vh] min-h-[500px] flex flex-col md:flex-row items-stretch overflow-hidden border-b border-outline-variant/10">
          
          {/* Left Side: Detailed Synopsis */}
          <div className="relative z-10 w-full md:w-[35%] p-8 md:pl-12 lg:pl-16 flex flex-col justify-center bg-gradient-to-r from-white dark:from-[#131314] via-white dark:via-[#131314] to-transparent shrink-0">
            <div className="mb-4 flex items-center gap-3">
              <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold tracking-widest uppercase rounded-sm">Premium Archive</span>
              <span className="text-tertiary text-sm font-semibold tracking-wide">● {new Date(video.createdAt).getFullYear()} Remastered</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 tracking-tight text-[#C13535] dark:text-white font-['Montserrat']">
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
        <section className="px-8 md:px-16 py-20">
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