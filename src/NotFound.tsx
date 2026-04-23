import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();
  const { videos } = useContext(VideoContext);
  
  // Estado para el modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Obtenemos los 3 videos más recientes para la sección "Lo más buscado"
  const recommendedVideos = videos
    .filter(v => !v.isShort)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const featuredVideo = recommendedVideos[0];
  const secondaryVideos = recommendedVideos.slice(1, 3);

  return (
    <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#e5e2e3] font-['Inter'] selection:bg-[#c13535] selection:text-white min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <Helmet>
        <title>Página no encontrada | Estudio Radio América</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-20 shadow-sm dark:shadow-none border-b border-zinc-200 dark:border-transparent transition-all duration-300">
        <div className="flex items-center gap-4 md:gap-12">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo_colors.png" alt="Logo" className="w-10 h-10 object-contain dark:hidden" />
            <img src="/logo_blanco.png" alt="Logo" className="w-10 h-10 object-contain hidden dark:block" />
            <span className="text-lg md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat'] hidden sm:block">
              Estudio Radio América
            </span>
          </div>
          <div className="hidden lg:flex gap-8 items-center font-['Montserrat'] tracking-tight font-bold">
            <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors duration-300">Inicio</button>
            <button onClick={() => navigate('/programas')} className="text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors duration-300">Programas</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button onClick={() => navigate('/')} className="hidden md:block bg-[#C13535] text-white px-6 py-2.5 rounded-full font-bold tracking-tight hover:scale-105 transition-all duration-300 shadow-lg shadow-[#C13535]/20">
            Escuchar Ahora
          </button>
        </div>
      </nav>

      <main className="relative pt-20 flex-1">
        {/* Hero 404 Section */}
        <section className="relative min-h-[70vh] md:min-h-[870px] flex flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-transparent">
          {/* Background Artistic Element */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-10 dark:opacity-20 grayscale dark:brightness-50 transition-opacity duration-500" 
              alt="Moody cinematic close-up of a vintage chrome radio microphone" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5TsY56cCV7iPWXQ1tifSinUeZ1gxJMM_7dNKlfbxg7oKqRq1OJOy3EMB-t4hmpXudS3dntaABAUtj8F8TxIyhvRND3bDoyRNS41erUtxoFZS4DyeuJRDCXsXb5LkCZwSzN69IxnwGq9tW1HXLXCG95mHUnQfzqtMzLN7qyGxlOO6W6B-6od_l7b2bH47K8XF6dvv72oHizVd-PSLU-w5Wc1LDDoNmKDGIYo0p9HkDFK1zF0pcE-ZXecxEwaMa8Fi7FITBUEtT6tEJ"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-zinc-50/80 to-zinc-50 dark:from-[#131314]/0 dark:via-[#131314]/80 dark:to-[#131314]"></div>
            {/* Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#C13535] opacity-[0.05] dark:opacity-[0.03] blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <div className="mb-2">
              <span className="inline-block px-4 py-1 bg-[#C13535] text-white text-xs font-black tracking-widest rounded-sm mb-6 uppercase shadow-lg shadow-[#c13535]/20 animate-pulse">
                Se ha perdido la señal
              </span>
            </div>
            <h1 className="text-[8rem] sm:text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-zinc-200 dark:text-[#DDDADB]/5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-['Montserrat']">
              404
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-[#C13535] dark:text-white tracking-tight mb-6 font-['Montserrat'] drop-shadow-[0_0_30px_rgba(193,53,53,0.4)] relative z-10">
              Página No Encontrada
            </h2>
            <p className="text-lg md:text-2xl text-[#C13535]/80 dark:text-[#DDDADB]/60 max-w-2xl mx-auto mb-12 font-medium leading-relaxed relative z-10">
              Parece que la frecuencia que buscas está fuera del aire. No te preocupes, la señal informativa sigue activa.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
              <button onClick={() => navigate('/')} className="w-full sm:w-auto bg-[#C13535] hover:bg-[#A02B2B] text-white px-10 py-4 md:py-5 rounded-full font-bold text-base md:text-lg tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-[#C13535]/30">
                Volver al Inicio
              </button>
              <button onClick={() => navigate('/')} className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 md:py-5 rounded-full border border-zinc-300 dark:border-outline-variant/20 bg-white dark:bg-surface-container-low hover:bg-zinc-100 dark:hover:bg-surface-container text-[#C13535] dark:text-white transition-all duration-300 group">
                <span className="material-symbols-outlined group-hover:animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>radio</span>
                <span className="font-bold">Ir al En Vivo</span>
              </button>
            </div>
          </div>
        </section>

        {/* Recommended Content Section */}
        {recommendedVideos.length > 0 && (
          <section className="bg-white dark:bg-[#131314] py-24 px-6 md:px-8 overflow-hidden border-t border-zinc-200 dark:border-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12">
                <div className="font-['Montserrat']">
                  <h3 className="text-3xl font-black text-[#C13535] dark:text-white tracking-tight mb-2 uppercase">Lo más buscado</h3>
                  <div className="h-1 w-20 bg-[#F07D00]"></div>
                </div>
                <button onClick={() => navigate('/')} className="text-[#F07D00] font-bold text-sm hover:underline tracking-wide uppercase">
                  Ver todo
                </button>
              </div>

              {/* Bento Grid Inspired Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Featured Article */}
                {featuredVideo && (
                  <div onClick={() => navigate(`/watch/${featuredVideo.id}`)} className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-surface-container aspect-video md:aspect-auto cursor-pointer border border-zinc-200 dark:border-transparent shadow-lg">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 dark:opacity-60" alt={featuredVideo.title} src={featuredVideo.thumbnail || '/logo_blanco.png'} onError={(e) => e.currentTarget.src = '/logo_blanco.png'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 p-6 md:p-8 w-full">
                      <span className="bg-[#FFB91F] text-black px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase mb-4 inline-block">{featuredVideo.category}</span>
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-[#F07D00] transition-colors leading-tight font-['Montserrat']">{featuredVideo.title}</h4>
                      <p className="text-zinc-300 dark:text-[#DDDADB]/80 line-clamp-2 mb-6 max-w-lg text-sm">{featuredVideo.description}</p>
                      <span className="material-symbols-outlined text-white text-4xl group-hover:scale-110 transition-transform shadow-lg rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  </div>
                )}

                {/* Secondary Recommendation Cards */}
                {secondaryVideos.map((video, idx) => (
                  <div key={video.id} onClick={() => navigate(`/watch/${video.id}`)} className="group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-surface-container aspect-[4/3] md:aspect-[3/4] cursor-pointer border border-zinc-200 dark:border-transparent shadow-lg">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 dark:opacity-60" alt={video.title} src={video.thumbnail || '/logo_blanco.png'} onError={(e) => e.currentTarget.src = '/logo_blanco.png'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 p-6 w-full">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase mb-3 inline-block ${idx === 0 ? 'bg-[#C13535] text-white' : 'bg-[#F07D00] text-black'}`}>
                        {video.category}
                      </span>
                      <h4 className="text-lg md:text-xl font-bold text-white group-hover:text-[#F07D00] transition-colors font-['Montserrat'] line-clamp-3">{video.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="bg-zinc-100 dark:bg-[#131314] w-full py-12 md:py-16 border-t border-zinc-200 dark:border-outline-variant/10 relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="font-black text-[#C13535] dark:text-[#DDDADB] text-xl font-['Montserrat']">Estudio Radio América</div>
            <p className="text-zinc-500 dark:text-[#DDDADB]/60 text-sm tracking-wide max-w-xs">
              © {new Date().getFullYear()} Estudio Radio América. Patrimonio de Carabobo.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB]/60 hover:text-[#F07D00] transition-colors text-sm font-medium tracking-wide">Privacidad</button>
            <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB]/60 hover:text-[#F07D00] transition-colors text-sm font-medium tracking-wide">Términos de Uso</button>
            <button onClick={() => navigate('/')} className="text-[#C13535] dark:text-[#DDDADB]/60 hover:text-[#F07D00] transition-colors text-sm font-medium tracking-wide">Contacto</button>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-surface-container flex items-center justify-center hover:bg-[#C13535] hover:text-white dark:hover:bg-primary-container text-[#C13535] dark:text-[#DDDADB] transition-all group">
              <span className="material-symbols-outlined text-sm group-hover:text-white">smart_display</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-surface-container flex items-center justify-center hover:bg-[#C13535] hover:text-white dark:hover:bg-primary-container text-[#C13535] dark:text-[#DDDADB] transition-all group">
              <span className="material-symbols-outlined text-sm group-hover:text-white">photo_camera</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}