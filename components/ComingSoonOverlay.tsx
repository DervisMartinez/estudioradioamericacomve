"use client";
import React, { useRef, useState } from 'react';
import Link from 'next/link';

export default function ComingSoonOverlay({ onAdminLoginClick }: { onAdminLoginClick?: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#131314] text-[#DDDADB] flex flex-col justify-between items-center p-6 md:p-12 overflow-y-auto selection:bg-[#C13535] selection:text-white">
      {/* Radio Audio Stream Element */}
      <audio ref={audioRef} src="https://stream.zeno.fm/k2v8v2v284zuv" preload="none" />

      {/* Decorative Atmosphere Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C13535]/15 blur-[160px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-[#F07D00]/10 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Header / Brand Mini */}
      <header className="w-full max-w-6xl flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo_colors.png" alt="Radio América 90.9 FM" className="h-10 md:h-12 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
          <div>
            <span className="text-[11px] font-black tracking-widest text-[#F07D00] uppercase block">90.9 FM</span>
            <span className="text-[9px] font-bold text-[#DDDADB]/50 tracking-wider uppercase block">Patrimonio de Carabobo</span>
          </div>
        </div>

        <Link 
          href="/login" 
          className="text-xs font-bold text-[#DDDADB]/40 hover:text-[#F07D00] transition-colors py-2 px-4 rounded-full border border-white/5 hover:border-[#F07D00]/30 backdrop-blur-md"
        >
          Acceso Staff
        </Link>
      </header>

      {/* Center Landing Hero */}
      <main className="flex flex-col items-center text-center max-w-3xl my-auto py-12 relative z-10">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C13535]/20 via-[#F07D00]/20 to-transparent border border-[#C13535]/30 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#F07D00] animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FFB91F]">Próximamente</span>
        </div>

        {/* Main Logo Center */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#C13535]/20 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          <img 
            src="/logo_blanco.png" 
            alt="Estudio Radio América" 
            className="w-56 md:w-80 object-contain relative z-10 drop-shadow-[0_10px_35px_rgba(193,53,53,0.35)]" 
          />
        </div>

        {/* Hero Headlines */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-tight">
          La nueva era digital <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#C13535] via-[#F07D00] to-[#FFB91F] bg-clip-text text-transparent">
            está por comenzar
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#DDDADB]/70 max-w-xl mb-10 leading-relaxed font-medium">
          Estamos preparando una experiencia audiovisual sin precedentes con entrevistas exclusivas, programas en vivo, podcasts y los archivos históricos de <strong>Estudio Radio América</strong>.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button 
            onClick={toggleRadio} 
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#C13535] hover:bg-[#a62b2b] text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_10px_30px_rgba(193,53,53,0.4)] active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pausar Radio en Vivo' : 'Escuchar Radio en Vivo (90.9 FM)'}</span>
          </button>

          <a 
            href="https://instagram.com/radioamericave" 
            target="_blank" 
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-full font-bold text-sm border border-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-lg">campaign</span>
            <span>Síguenos en Redes</span>
          </a>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#DDDADB]/40 relative z-10 pt-6 border-t border-white/5">
        <p>© 2026 Estudio Radio América 90.9 FM. Todos los derechos reservados.</p>
        <div className="flex items-center gap-6">
          <span>Valencia, Venezuela</span>
          <span>•</span>
          <span className="text-[#F07D00] font-bold">Transmitiendo 24/7</span>
        </div>
      </footer>
    </div>
  );
}
