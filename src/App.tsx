import { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent, ChangeEvent } from 'react'
import './App.css'
import { VideoContext } from './VideoContext'
import SearchResults from './SearchResults';
import { Helmet } from 'react-helmet-async';

function App() {
  const { videos, programs } = useContext(VideoContext);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Todo');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return document.documentElement.classList.contains('dark');
  });

  // Radio Player Logic
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play(); }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Estado para reproducir shorts en línea
  const [playingShortId, setPlayingShortId] = useState<string | null>(null);

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

  // Manejador del Newsletter
  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value })
      });
      if (res.ok) alert("✅ ¡Gracias por suscribirte! Estás en la lista.");
      else alert("❌ Hubo un error al procesar tu suscripción.");
    } catch (error) {
      alert("❌ Fallo de conexión con el servidor.");
    }
    form.reset();
  };

  // Carrusel dinámico de videos destacados
  const featuredVideos = videos.filter(v => v.isFeatured);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  useEffect(() => {
    // Si hay 1 o menos videos destacados, no es necesario rotar
    if (featuredVideos.length <= 1) return;

    const interval = setInterval(() => {
      setFadeClass('opacity-0'); // Inicia el desvanecimiento
      setTimeout(() => {
        setCurrentFeaturedIndex(prev => (prev + 1) % featuredVideos.length);
        setFadeClass('opacity-100'); // Aparece la nueva imagen y contenido
      }, 1000); // 1 segundo exacto de margen de separación
    }, 7000); // Cambia cada 7 segundos

    return () => clearInterval(interval);
  }, [featuredVideos.length]);

  const featuredVideo = featuredVideos[currentFeaturedIndex] || null;

  // Encuentra el próximo episodio o video similar
  let nextVideo = null;
  if (featuredVideo) {
    const similarVideos = videos.filter(v => v.id !== featuredVideo.id && !v.isShort);
    const programVideos = similarVideos.filter(v => v.programId === featuredVideo.programId);
    const categoryVideos = similarVideos.filter(v => v.category === featuredVideo.category);
    
    nextVideo = programVideos.length > 0 ? programVideos[0] : (categoryVideos.length > 0 ? categoryVideos[0] : similarVideos[0]);
  }

  // --- Lógica del Carrusel de Programas ---
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const PROGRAM_LIMIT = 5; // Si hay 5 o menos, se queda estático

  useEffect(() => {
    // No hacer auto-scroll si no superamos el límite o si el usuario tiene el mouse encima
    if (programs.length <= PROGRAM_LIMIT || isCarouselHovered) return;

    const scrollInterval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const cardWidth = 250; // Ancho aproximado de la tarjeta + su gap (espacio)

        // Si estamos en el final, volvemos al inicio suavemente
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Avanzamos una tarjeta
          carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }
    }, 2500); // 2.5s entre cada movimiento (La velocidad de la animación nativa es de aprox 0.5s)

    return () => clearInterval(scrollInterval);
  }, [programs.length, isCarouselHovered]);

  // Filtra los videos que NO son destacados para la sección de abajo
  const nonFeaturedVideos = videos.filter(v => !v.isFeatured && !v.isShort);
  
  // Filtra los Shorts
  const shorts = videos.filter(v => v.isShort && (activeCategory === 'Todo' || v.category === activeCategory));

  const filteredVideos = activeCategory === 'Todo' ? nonFeaturedVideos : nonFeaturedVideos.filter(v => v.category === activeCategory);
  
  // Extrae el video destacado para la categoría activa
  const categoryFeaturedVideo = filteredVideos[0];

  return (
    <>
      <Helmet>
        <title>Estudio Radio América | Inicio</title>
        <meta name="description" content="Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América. Podcasts, entrevistas y más." />
        <meta property="og:title" content="Estudio Radio América" />
        <meta property="og:description" content="Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América. Podcasts, entrevistas y más." />
        <meta property="og:image" content="/logo_colors.png" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" className="hidden" />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-sm dark:shadow-none border-b border-zinc-200 dark:border-transparent">
        <div className="flex items-center gap-4 md:gap-12">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo_colors.png" alt="Logo" className="w-10 h-10 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-10 h-10 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-lg md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter hidden sm:block">Estudio Radio América</span>
          </div>
          <div className="hidden lg:flex gap-8 items-center font-['Montserrat'] tracking-tight font-bold">
            <a className="text-[#C13535] dark:text-[#DDDADB] border-b-2 border-[#C13535] dark:border-[#DDDADB] pb-1" href="#">Inicio</a>
            <a className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors duration-300" href="/programas" target="_blank" rel="noopener noreferrer">Programas Destacados</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#C13535]/60 dark:text-[#DDDADB]/40">search</span>
            <input 
              type="text" 
              placeholder="Buscar..."
              className="bg-zinc-100 dark:bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-[#C13535] dark:text-[#DDDADB] w-32 sm:w-48 md:w-64 focus:ring-2 focus:ring-[#F07D00]/50 transition-all"
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearchOpen && searchQuery && <SearchResults query={searchQuery} onClose={() => setIsSearchOpen(false)} />}
          </div>
          <button onClick={toggleTheme} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]" title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={() => navigate('/admin')} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section: Cinematic Style */}
        <section className="relative min-h-[600px] md:h-[700px] lg:h-[870px] w-full flex items-center overflow-hidden bg-white dark:bg-transparent py-12 md:py-0">
          <div className="absolute inset-0 z-0">
            <img alt="Radio Interview" className={`w-full h-full object-cover transition-opacity duration-1000 ${fadeClass}`} src={featuredVideo ? (featuredVideo.thumbnail || '/logo_blanco.png') : "media/enconexion_pureba.webp"} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-surface via-white/80 dark:via-surface/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface via-transparent to-transparent"></div>
          </div>
          
          <div className={`relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full grid md:grid-cols-2 gap-8 md:gap-12 items-center transition-opacity duration-1000 ${fadeClass}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-sm text-xs font-bold tracking-widest uppercase">Especial</span>
                <span className="text-tertiary flex items-center gap-1 font-bold text-sm tracking-wide">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ENTREVISTA DESTACADA
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#C13535] dark:text-on-surface leading-none text-shadow-editorial break-words">
                {featuredVideo ? (
                  <span dangerouslySetInnerHTML={{ __html: featuredVideo.title.replace(' ', '<br />') }} />
                ) : (
                  <>VOCES DEL <br /><span className="text-[#C13535] dark:text-[#DDDADB]">MAÑANA</span></>
                )}
              </h1>
              <p className="text-lg text-[#C13535] dark:text-[#DDDADB]/80 max-w-lg leading-relaxed font-medium">
                {featuredVideo 
                  ? featuredVideo.description 
                  : "Una conversación íntima con los líderes que están transformando la realidad actual. Descubre las historias que nunca se contaron detrás de los micrófonos de Estudio Radio América."}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <button onClick={() => featuredVideo && navigate(`/watch/${featuredVideo.id}`)} className="bg-[#C13535] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold flex items-center gap-2 hover:bg-[#a12b2b] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  ESCUCHAR AHORA
                </button>
                <button className="bg-zinc-200/50 dark:bg-surface-container/50 backdrop-blur-md text-[#C13535] dark:text-on-surface px-6 md:px-8 py-3 md:py-4 rounded-full text-sm md:text-base font-bold border border-zinc-300 dark:border-outline-variant/30 hover:bg-zinc-200 dark:hover:bg-surface-container transition-all whitespace-nowrap">
                  MÁS INFO
                </button>
              </div>
            </div>

            <div className="hidden md:block relative group cursor-pointer" onClick={() => featuredVideo && navigate(`/watch/${featuredVideo.id}`)}>
              <div className="aspect-video rounded-xl overflow-hidden border border-outline-variant/20 shadow-2xl relative">
                <img alt="Video Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={featuredVideo ? (featuredVideo.thumbnail || '/logo_blanco.png') : "https://lh3.googleusercontent.com/aida-public/AB6AXuDEbbLF32OUk4LOEOHKzXMH2gf4_xY2yc7y1h5I3odeYcFdEpe24aAN77JaKY60XVpqqQxVNy4j5iNiRcwDxyDy5XlZViVEUEmZMt9UQayx9MXeAyRF_r9rqKlbU6HNPbrcfdk0kvbQZ9U6piQuuSA6JRG_Nfwnisb6JoCMz12QKkmIMQgZTFFoW39tQPFB_GsYmY_97TYVt3eFnXjhdRTzYEcsTEDZmcIoJVTWf2RpQ5xgW8cJB5bYchXzpH3p13fWdgB8ulz5mVvZ"} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  </div>
                </div>
              </div>
              {nextVideo && (
                <div onClick={(e) => { e.stopPropagation(); navigate(`/watch/${nextVideo.id}`); }} className="absolute -bottom-6 -right-6 bg-white/60 dark:bg-surface-container/60 backdrop-blur-md p-4 rounded-lg border border-zinc-200 dark:border-outline-variant/20 hidden lg:block hover:scale-105 transition-transform cursor-pointer shadow-2xl z-20">
                  <p className="text-xs font-bold text-[#F07D00] mb-1 uppercase tracking-widest">Siguiente Episodio</p>
                  <p className="font-bold text-sm line-clamp-1 max-w-[220px]">{nextVideo.title}</p>
                  <p className="text-[10px] text-[#DDDADB]/60 uppercase tracking-widest mt-1">{nextVideo.category}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vertical Catalog: Programas */}
        <section className="py-24 bg-zinc-100 dark:bg-surface-container-low overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-end justify-between mb-12">
              <div className="font-['Montserrat']">
                <h2 className="text-3xl font-black tracking-tight text-[#C13535] dark:text-[#DDDADB]">PROGRAMAS DESTACADOS</h2>
                <div className="h-1 w-12 bg-[#F07D00] mt-2"></div>
              </div>
            </div>
            
            <div 
              ref={carouselRef}
              onMouseEnter={() => setIsCarouselHovered(true)}
              onMouseLeave={() => setIsCarouselHovered(false)}
              onTouchStart={() => setIsCarouselHovered(true)}
              onTouchEnd={() => setIsCarouselHovered(false)}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar scroll-smooth"
            >
              {programs.map(program => (
                <div key={program.id} onClick={() => navigate(`/program/${program.id}`)} className="group cursor-pointer flex-none w-40 md:w-56 snap-start">
                  <div className="vertical-poster rounded-xl overflow-hidden relative border border-outline-variant/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img alt={program.name} className="w-full h-full object-cover" src={program.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs font-bold text-[#FFB91F] uppercase tracking-wider mb-1">{program.category}</p>
                      <h3 className="font-bold text-lg leading-tight">{program.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asymmetric Catalog: Noticias & Archivo */}
        <section className="py-24 bg-white dark:bg-surface">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-12 md:mb-16">
              <div className="max-w-xl">
                <h2 className="text-4xl font-black tracking-tighter text-[#C13535] dark:text-on-surface">FORMATO <span className="text-[#F07D00]">VERTICAL</span></h2>
                <p className="text-[#C13535] dark:text-[#DDDADB]/60 mt-2">Disfruta de nuestros Shorts y Reels. Un vistazo rápido al mejor contenido de Estudio Radio América.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Todo', 'Historia', 'Personajes', 'Sociedad', 'Deportes'].map(category => (
                  <button 
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                      activeCategory === category 
                        ? 'bg-zinc-200 dark:bg-surface-container-high text-[#C13535] dark:text-on-surface' 
                        : 'bg-zinc-100 dark:bg-surface-container-low text-[#C13535]/70 dark:text-[#DDDADB]/60 hover:bg-[#C13535] hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              
              {/* Left Column: Shorts and Reels */}
              <div className="md:col-span-7 flex flex-col gap-6">
                <h3 className="text-xs font-bold text-[#C13535] tracking-widest uppercase mb-2 border-b border-zinc-200 dark:border-outline-variant/20 pb-2">Feed de Shorts & Reels</h3>
                {shorts.length === 0 ? (
                  <p className="text-sm text-[#C13535]/80 dark:text-[#DDDADB]/40 py-4">No hay shorts en esta categoría.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {shorts.map((short) => (
                      <div key={short.id} className="flex flex-col gap-2">
                        {playingShortId === short.id ? (
                          <div className="aspect-[9/16] bg-zinc-200 dark:bg-surface-container-highest rounded-xl overflow-hidden relative shadow-lg group/player">
                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-30 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                              <button onClick={(e) => { e.stopPropagation(); setPlayingShortId(null); }} className="bg-black/60 hover:bg-surface-variant text-white w-8 h-8 rounded-full backdrop-blur-md transition-colors flex items-center justify-center border border-white/10" title="Cerrar">
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                              <a href={short.url} target="_blank" rel="noreferrer" className="bg-black/60 hover:bg-[#F07D00] hover:text-black text-white w-8 h-8 rounded-full backdrop-blur-md transition-colors flex items-center justify-center border border-white/10" title="Ver en plataforma original">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                              </a>
                            </div>
                            {getYoutubeId(short.url) ? (
                              <iframe className="w-full h-full relative z-10" src={`https://www.youtube.com/embed/${getYoutubeId(short.url)}?autoplay=1&rel=0`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            ) : isDirectVideo(short.url) ? (
                              <video className="w-full h-full object-cover relative z-10 bg-black" src={short.url} poster={short.thumbnail || '/logo_blanco.png'} controls autoPlay playsInline preload="metadata"></video>
                            ) : (
                              <div className="w-full h-full relative z-10 flex flex-col items-center justify-center bg-zinc-200 dark:bg-surface-container-highest p-4 text-center">
                                <span className="material-symbols-outlined text-4xl text-[#F07D00] mb-2">link</span>
                                <p className="text-xs text-[#DDDADB] font-bold mb-4">Contenido Externo</p>
                                <a href={short.url} target="_blank" rel="noreferrer" className="bg-[#C13535] hover:bg-[#a12b2b] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors">
                                  Ver Original
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div onClick={() => setPlayingShortId(short.id)} className="aspect-[9/16] relative rounded-xl overflow-hidden group cursor-pointer border border-zinc-200 dark:border-outline-variant/10 shadow-lg group-hover:scale-105 transition-transform">
                            <img src={short.thumbnail || '/logo_blanco.png'} alt={short.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                              </div>
                            </div>
                            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">{short.category}</span>
                          </div>
                        )}
                        <h4 className="text-xs font-bold text-[#C13535] dark:text-[#DDDADB] line-clamp-2 px-1 hover:text-[#F07D00] cursor-pointer" onClick={() => !playingShortId && setPlayingShortId(short.id)}>{short.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right Column: Featured Video by Category & List */}
              <div className="md:col-span-5 flex flex-col gap-6 border-l border-zinc-200 dark:border-outline-variant/10 md:pl-12">
                <h3 className="text-xs font-bold text-[#C13535] tracking-widest uppercase mb-2 border-b border-zinc-200 dark:border-outline-variant/20 pb-2">Archivo de Video Destacado</h3>
                
                {/* Featured Category Video */}
                {categoryFeaturedVideo && (
                  <div onClick={() => navigate(`/watch/${categoryFeaturedVideo.id}`)} className="w-full bg-white/80 dark:bg-surface-container/80 backdrop-blur-md rounded-2xl overflow-hidden relative border border-zinc-200 dark:border-outline-variant/10 group cursor-pointer mb-4">
                    <div className="aspect-video relative">
                      <img alt={categoryFeaturedVideo.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={categoryFeaturedVideo.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <span className="material-symbols-outlined text-4xl text-white drop-shadow-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-black text-[#FFB91F] tracking-widest uppercase mb-2">{categoryFeaturedVideo.category}</p>
                      <h4 className="font-bold text-2xl leading-tight mb-2 text-[#C13535] dark:text-on-surface group-hover:text-primary transition-colors">{categoryFeaturedVideo.title}</h4>
                      <p className="text-xs text-[#C13535]/90 dark:text-[#DDDADB]/60 line-clamp-3">{categoryFeaturedVideo.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-zinc-100 dark:bg-surface-container">
          <div className="max-w-5xl mx-auto px-8 text-center space-y-8">
            <div className="inline-block p-4 rounded-full bg-[#C13535]/10 border border-[#C13535]/20 mb-4">
              <span className="material-symbols-outlined text-4xl text-[#C13535] dark:text-[#DDDADB]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-[#C13535] dark:text-on-surface">ÚNETE A LA <span className="text-[#C13535] dark:text-[#DDDADB]">COMUNIDAD</span></h2>
            <p className="text-xl text-[#C13535] dark:text-[#DDDADB]/60 max-w-2xl mx-auto">Recibe todas las últimas novedades de tus programas favoritos directamente en tu correo. Entérate al instante cuando subamos nuevo contenido.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input name="email" required type="email" className="flex-1 bg-white dark:bg-surface-container-lowest border border-zinc-300 dark:border-outline-variant/20 focus:ring-2 focus:ring-[#F07D00] rounded-full px-6 py-4 text-[#C13535] dark:text-[#DDDADB] placeholder:text-[#C13535]/50 dark:placeholder:text-[#DDDADB]/30" placeholder="Tu correo electrónico" />
              <button type="submit" className="bg-[#C13535] text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform active:scale-95">SUSCRIBIRME</button>
            </form>
            <p className="text-[10px] text-[#C13535]/80 dark:text-[#DDDADB]/40 uppercase tracking-widest">Al suscribirte aceptas nuestros términos y condiciones.</p>
          </div>
        </section>
      </main>

      {/* Now Playing Persistent Bar */}
      <div className="fixed bottom-0 w-full z-50 px-2 md:px-4 pb-2 md:pb-4">
        <div className="max-w-7xl mx-auto py-2 md:py-0 md:h-20 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl rounded-2xl border-t-2 border-[#F07D00]/30 flex flex-row items-center justify-between px-4 md:px-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-white dark:bg-surface-container relative group flex items-center justify-center">
              <img src="/logo_colors.png" alt="Logo" className="w-full h-full object-contain p-1 dark:hidden" />
              <img src="/logo_blanco.png" alt="Logo" className="w-full h-full object-contain p-1 hidden dark:block" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-sm">open_in_full</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-black text-[#C13535] tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C13535] animate-pulse"></span> EN VIVO
              </p>
              <p className="font-bold text-sm truncate max-w-[150px] text-zinc-800 dark:text-on-surface">Estudio Radio América - Prime Time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <button className="text-zinc-500 dark:text-[#DDDADB]/60 hover:text-zinc-800 dark:hover:text-on-surface transition-colors hidden md:block">
              <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button onClick={toggleRadio} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#C13535] flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button className="text-zinc-500 dark:text-[#DDDADB]/60 hover:text-zinc-800 dark:hover:text-on-surface transition-colors hidden md:block">
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 group">
              <span className="material-symbols-outlined text-zinc-500 dark:text-[#DDDADB]/60 text-lg">volume_up</span>
              <div className="w-24 h-1 bg-zinc-200 dark:bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute h-full bg-[#F07D00] rounded-full" style={{ width: `${volume * 100}%` }}></div>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="absolute inset-0 opacity-0 cursor-pointer"/>
              </div>
            </div>
            <button className="text-[#C13535]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
            <button className="text-zinc-700 dark:text-[#DDDADB]">
              <span className="material-symbols-outlined">list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-100 dark:bg-[#131314] w-full border-t border-zinc-200 dark:border-[#59413f]/15 pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center space-y-8">
          <span className="text-xl font-bold text-[#C13535] font-['Montserrat'] dark:text-[#DDDADB]">Estudio Radio América</span>
          <div className="flex flex-wrap justify-center gap-8 font-['Montserrat'] text-sm text-[#C13535] dark:text-[#DDDADB]">
            <a className="text-[#C13535]/80 dark:text-[#DDDADB]/60 hover:text-[#C13535] transition-colors" href="#">Privacidad</a>
            <a className="text-[#C13535]/80 dark:text-[#DDDADB]/60 hover:text-[#C13535] transition-colors" href="#">Términos</a>
            <a className="text-[#C13535]/80 dark:text-[#DDDADB]/60 hover:text-[#C13535] transition-colors" href="#">Contacto</a>
            <a className="text-[#C13535]/80 dark:text-[#DDDADB]/60 hover:text-[#C13535] transition-colors" href="#">Publicidad</a>
          </div>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-[#C13535]/60 dark:text-[#DDDADB]/40 cursor-pointer hover:text-[#C13535]">share</span>
            <span className="material-symbols-outlined text-[#C13535]/60 dark:text-[#DDDADB]/40 cursor-pointer hover:text-[#C13535]">language</span>
            <span className="material-symbols-outlined text-[#C13535]/60 dark:text-[#DDDADB]/40 cursor-pointer hover:text-[#C13535]">podcasts</span>
          </div>
          <p className="text-center font-['Montserrat'] text-sm text-[#C13535]/80 dark:text-[#DDDADB]/40">© 2024 Estudio Radio América. Todos los derechos reservados.</p>
        </div>
      </footer>
    </>
  )
}

export default App
