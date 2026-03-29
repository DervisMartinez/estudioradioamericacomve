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

  // Lógica del reproductor de radio en vivo
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause(); 
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
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
    <div className="selection:bg-tertiary selection:text-surface bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      <audio ref={audioRef} id="radio" src="https://transmision.radioamerica.com.ve:8087/RA909FM" type="audio/mpeg" className="hidden" />

      {/* Navegación superior */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#131314]/80 backdrop-blur-xl border-none bg-gradient-to-b from-[#131314] to-transparent">
        <div className="flex items-center gap-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-3 hover:scale-105 transition-transform">
            <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-2xl font-black text-[#C13535] tracking-tighter">Estudio Radio América</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="text-[#DDDADB] font-bold text-sm hover:text-[#F07D00] transition-colors">
          Volver al Inicio
        </button>
      </nav>

      <main className="pt-24 px-8 md:px-16 flex-1 max-w-7xl mx-auto w-full pb-32">
        {/* Encabezado del Programa */}
        <div className="flex flex-col md:flex-row items-start gap-12 border-b border-outline-variant/15 pb-16 pt-8">
          <div className="w-48 md:w-64 flex-none aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl cinematic-shadow border border-outline-variant/20">
            <img src={program.thumbnail} alt={program.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col pt-4">
            <span className="bg-[#F07D00]/20 text-[#F07D00] px-3 py-1 rounded text-xs font-bold uppercase tracking-widest w-max mb-4 border border-[#F07D00]/30">
              {program.category}
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#DDDADB] leading-tight mb-4">
              {program.name}
            </h1>
            <p className="text-lg text-[#DDDADB]/60 max-w-2xl mb-8 leading-relaxed">
              Explora todos los episodios, entrevistas y contenido exclusivo perteneciente a este programa. Sumérgete en el archivo de Estudio Radio América.
            </p>
            <div className="flex items-center gap-6 text-sm font-bold text-[#DDDADB]/40 uppercase tracking-widest">
              <span>{programVideos.length} Episodios disponibles</span>
            </div>
          </div>
        </div>

        {/* Lista de Episodios */}
        <div className="pt-16">
          <h2 className="text-2xl font-bold tracking-tight mb-10 flex items-center gap-4">
            Episodios Recientes <span className="h-px bg-outline-variant/30 flex-1"></span>
          </h2>
          
          {programVideos.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-6xl text-[#DDDADB]/10 mb-4">videocam_off</span>
              <h3 className="text-xl font-bold text-[#DDDADB]/40">Aún no hay episodios</h3>
              <p className="text-sm text-[#DDDADB]/30 mt-2">Los videos vinculados a este programa aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {programVideos.map(video => (
                <div key={video.id} onClick={() => navigate(`/watch/${video.id}`)} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant/10 group-hover:border-[#C13535]/50 transition-colors duration-300">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} src={video.thumbnail} />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#FFB91F] uppercase tracking-widest font-bold mb-1">{new Date(video.createdAt).toLocaleDateString()}</p>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Botón flotante de Radio */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={toggleRadio} className="w-14 h-14 bg-[#C13535] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform cinematic-shadow">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
      </div>
    </div>
  );
}