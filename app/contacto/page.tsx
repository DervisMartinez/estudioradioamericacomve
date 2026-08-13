"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
;

export default function Contact() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container flex flex-col min-h-screen transition-colors duration-300">
      

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl shadow-none border-b border-zinc-200 dark:border-[#1c1b1c]/10">
        <div className="flex justify-between items-center px-4 md:px-8 h-20 w-full max-w-7xl mx-auto">
          <div 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 md:gap-3 cursor-pointer hover:scale-105 transition-transform"
          >
            <img src="/logo_colors.png" alt="Logo" className="w-8 h-8 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-8 h-8 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-xl md:text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter font-['Montserrat'] hidden sm:block">
              Estudio Radio América
            </span>
          </div>
          <div className="hidden lg:flex gap-8 items-center">
            <button onClick={() => router.push('/')} className="font-['Montserrat'] font-bold tracking-tight text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors hover:scale-105 duration-300">Inicio</button>
            <button onClick={() => router.push('/programas')} className="font-['Montserrat'] font-bold tracking-tight text-[#C13535] dark:text-[#DDDADB] hover:text-[#F07D00] transition-colors hover:scale-105 duration-300">Programas</button>
            <button onClick={() => router.push('/contacto')} className="font-['Montserrat'] font-bold tracking-tight text-[#F07D00] border-b-2 border-[#F07D00] pb-1">Contacto</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="bg-primary-container text-on-primary-container font-['Montserrat'] font-bold tracking-tight px-6 py-2 rounded-full hover:scale-105 transition-all duration-300 hidden md:block">
              Escuchar Ahora
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-[#C13535] dark:text-[#DDDADB]">
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white dark:bg-[#131314] shadow-lg border-b border-zinc-200 dark:border-[#1c1b1c] lg:hidden flex flex-col font-['Montserrat'] tracking-tight font-bold animate-fade-in z-50">
            <button onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }} className="px-6 py-4 text-left text-[#C13535] dark:text-[#DDDADB] border-b border-zinc-100 dark:border-[#1c1b1c]">Inicio</button>
            <button onClick={() => { router.push('/programas'); setIsMobileMenuOpen(false); }} className="px-6 py-4 text-left text-[#C13535] dark:text-[#DDDADB] border-b border-zinc-100 dark:border-[#1c1b1c]">Programas</button>
            <button onClick={() => { router.push('/contacto'); setIsMobileMenuOpen(false); }} className="px-6 py-4 text-left text-[#C13535] dark:text-[#DDDADB]">Contacto</button>
          </div>
        )}
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-20 relative flex items-center justify-center min-h-screen">
        {/* Cinematic Background con tu imagen */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-surface via-white/80 dark:via-surface/80 to-white/40 dark:to-surface/40 z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-60 blur-[2px]" 
            alt="Radio América Studio" 
            src="/estudiora.jpeg" 
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Contact Info (Left) */}
          <div className="flex flex-col gap-12 text-left">
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-5xl md:text-7xl font-extrabold tracking-tighter text-[#C13535] dark:text-on-surface mb-6 leading-tight">
                Conecta con <br/><span className="text-primary-container">La Voz.</span>
              </h1>
              <p className="text-zinc-600 dark:text-on-surface-variant text-lg max-w-md leading-relaxed font-body">
                Estamos aquí para escucharte. Envíanos tus inquietudes, noticias o simplemente saluda.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-zinc-200 dark:bg-surface-container rounded-full group-hover:bg-primary-container transition-colors duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#C13535] dark:text-on-surface group-hover:text-white">location_on</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#C13535] dark:text-on-surface mb-1">Nuestra Sede</h3>
                  <p className="text-zinc-600 dark:text-on-surface-variant font-body">Av. Bolívar Norte, Edificio Radio América<br/>Valencia, Estado Carabobo.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-zinc-200 dark:bg-surface-container rounded-full group-hover:bg-primary-container transition-colors duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#C13535] dark:text-on-surface group-hover:text-white">call</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#C13535] dark:text-on-surface mb-1">Teléfono</h3>
                  <p className="text-zinc-600 dark:text-on-surface-variant font-body">+58 241 857 2341</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-zinc-200 dark:bg-surface-container rounded-full group-hover:bg-primary-container transition-colors duration-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#C13535] dark:text-on-surface group-hover:text-white">mail</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#C13535] dark:text-on-surface mb-1">Correo Electrónico</h3>
                  <p className="text-zinc-600 dark:text-on-surface-variant font-body">contacto@radioamerica.com.ve</p>
                </div>
              </div>
            </div>
          </div>

          {/* Glassmorphism Form (Right) */}
          <div className="bg-white/60 dark:bg-surface-container/60 backdrop-blur-2xl p-8 md:p-10 rounded-2xl border border-zinc-200 dark:border-outline-variant/20 shadow-[0_0_40px_rgba(193,53,53,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container to-secondary-container"></div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold mb-8 text-[#C13535] dark:text-on-surface">Envíanos un Mensaje</h2>
            
            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); alert('Mensaje simulado exitosamente'); }}>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm uppercase tracking-widest text-[#C13535] dark:text-on-surface-variant">Nombre Completo</label>
                <input required className="bg-zinc-100 dark:bg-surface-container-lowest border-0 border-b-2 border-zinc-300 dark:border-surface-variant focus:border-[#F07D00] focus:ring-0 text-zinc-800 dark:text-on-surface px-4 py-3 rounded-t-md transition-colors w-full" placeholder="Tu nombre" type="text"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm uppercase tracking-widest text-[#C13535] dark:text-on-surface-variant">Correo Electrónico</label>
                <input required className="bg-zinc-100 dark:bg-surface-container-lowest border-0 border-b-2 border-zinc-300 dark:border-surface-variant focus:border-[#F07D00] focus:ring-0 text-zinc-800 dark:text-on-surface px-4 py-3 rounded-t-md transition-colors w-full" placeholder="tu@email.com" type="email"/>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-sm uppercase tracking-widest text-[#C13535] dark:text-on-surface-variant">Mensaje</label>
                <textarea required className="bg-zinc-100 dark:bg-surface-container-lowest border-0 border-b-2 border-zinc-300 dark:border-surface-variant focus:border-[#F07D00] focus:ring-0 text-zinc-800 dark:text-on-surface px-4 py-3 rounded-t-md transition-colors resize-none w-full" placeholder="Escribe tu mensaje aquí..." rows={4}></textarea>
              </div>
              <button className="mt-4 bg-[#C13535] text-white font-['Montserrat'] font-bold py-4 px-8 rounded-full hover:bg-[#a32a2a] hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto" type="submit">
                <span>Enviar Mensaje</span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}