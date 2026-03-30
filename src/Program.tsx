import React, { useContext, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';

export default function ProgramView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { programs, videos } = useContext(VideoContext);
  
  const program = programs.find(p => p.id === id);
  
  // Filtramos solo los videos que pertenecen a este programa
  const programVideos = videos.filter(v => v.programId === id);

  // Encontramos el video más reciente del programa
  const latestVideo = programVideos.length > 0 ? programVideos[0] : null;

  // Lógica del reproductor de radio en vivo
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause(); 
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-[#DDDADB]">
        <h2 className="text-2xl font-bold mb-4">Programa no encontrado</h2>
        <button onClick={() => navigate('/')} className="bg-[#C13535] px-6 py-2 rounded-full font-bold">Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#e5e2e3] font-['Inter'] selection:bg-[#c13535] selection:text-white min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" type="audio/mpeg" className="hidden" />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-transparent transition-all duration-300">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
              <span className="text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat']">Estudio Radio América</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-['Montserrat'] font-bold tracking-tight">Inicio</button>
              <button onClick={() => window.open('/programas', '_blank')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors font-['Montserrat'] font-bold tracking-tight">Programas</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="material-symbols-outlined text-[#C13535] dark:text-[#DDDADB] hover:scale-105 transition-transform">{isDarkMode ? 'light_mode' : 'dark_mode'}</button>
            <button onClick={() => navigate('/admin')} className="material-symbols-outlined text-[#C13535] dark:text-[#DDDADB] hover:scale-105 transition-transform">account_circle</button>
          </div>
        </div>
      </header>

      <main className="relative pt-16 flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[600px] md:min-h-[870px] flex items-center overflow-hidden bg-zinc-100 dark:bg-transparent">
          <div className="absolute inset-0 z-0">
            <img alt={program.name} className="w-full h-full object-cover object-center" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} src={program.coverImage || program.thumbnail} />
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
                <h1 className="text-6xl md:text-8xl font-black font-['Montserrat'] tracking-tighter text-[#C13535] dark:text-white leading-none">
                  {program.name}
                </h1>
                <p className="text-lg md:text-xl text-[#C13535]/80 dark:text-[#e1bebb] font-medium leading-relaxed max-w-xl">
                  {program.description || 'Sumérgete en este espacio dedicado al análisis, entretenimiento y cultura. Disfruta de todos los episodios disponibles de nuestro catálogo.'}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={() => latestVideo && navigate(`/watch/${latestVideo.id}`)} className="bg-[#C13535] text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(193,53,53,0.3)]" disabled={!latestVideo}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  REPRODUCIR ÚLTIMO
                </button>
                <button className="bg-zinc-200/50 dark:bg-[#2a2a2b]/40 backdrop-blur-md border border-zinc-300 dark:border-[#59413f]/50 text-[#C13535] dark:text-[#DDDADB] px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-zinc-300 dark:hover:bg-[#2a2a2b]/60 transition-all">
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
              <span className="material-symbols-outlined text-4xl text-[#F07D00]">history</span>
              <div>
                <h4 className="font-bold text-xl font-['Montserrat'] text-[#C13535] dark:text-white">Episodios</h4>
                <p className="text-[#C13535]/70 dark:text-[#e1bebb] text-sm">{programVideos.length} disponibles</p>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-[#1c1b1c]/80 backdrop-blur-xl p-8 rounded-2xl flex items-center gap-6 group hover:bg-zinc-50 dark:hover:bg-[#2a2a2b] transition-all border-l-4 border-[#FFB91F] shadow-lg dark:shadow-none">
              <span className="material-symbols-outlined text-4xl text-[#FFB91F]">graphic_eq</span>
              <div>
                <h4 className="font-bold text-xl font-['Montserrat'] text-[#C13535] dark:text-white">Categoría</h4>
                <p className="text-[#C13535]/70 dark:text-[#e1bebb] text-sm">{program.category}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Episodes Grid */}
        <section className="max-w-screen-2xl mx-auto px-6 py-24 space-y-12">
          <div className="flex justify-between items-end border-b border-zinc-200 dark:border-white/10 pb-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-black font-['Montserrat'] tracking-tighter uppercase text-[#C13535] dark:text-white">Explorar <span className="text-[#F07D00]">Episodios</span></h2>
              <p className="text-[#C13535]/80 dark:text-[#e1bebb] font-medium">Contenido premium original de {program.name}</p>
            </div>
          </div>

          {programVideos.length === 0 ? (
            <div className="text-center py-20 bg-zinc-100 dark:bg-[#0e0e0f] rounded-3xl border border-zinc-200 dark:border-white/5">
              <span className="material-symbols-outlined text-6xl text-[#C13535]/30 dark:text-white/10 mb-4">videocam_off</span>
              <h3 className="text-xl font-bold text-[#C13535]/60 dark:text-white/40">Aún no hay episodios</h3>
              <p className="text-sm text-[#C13535]/40 dark:text-white/30 mt-2">Los videos vinculados a este programa aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {programVideos.map(video => (
                <div key={video.id} onClick={() => navigate(`/watch/${video.id}`)} className="group relative bg-zinc-100 dark:bg-[#201f20] rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(193,53,53,0.15)] cursor-pointer border border-zinc-200 dark:border-transparent">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={video.thumbnail} />
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