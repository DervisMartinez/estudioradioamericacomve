import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';
import SearchResults from './SearchResults';

export default function AllPrograms() {
  const { programs } = useContext(VideoContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

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

  // Separamos Programas de Podcasts mediante su tipo real
  const podcastList = programs.filter(p => p.type === 'Podcast');
  const programList = programs.filter(p => p.type !== 'Podcast');

  return (
    <div className="bg-white dark:bg-[#131314] text-zinc-800 dark:text-[#DDDADB] min-h-screen transition-colors duration-300 font-['Inter'] selection:bg-[#ef7c00] selection:text-[#532700]">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-sm dark:shadow-none border-b border-zinc-200 dark:border-transparent">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo_colors.png" alt="Logo" className="w-10 h-10 object-contain dark:hidden" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <img src="/logo_blanco.png" alt="Logo" className="w-10 h-10 object-contain hidden dark:block" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=RA&background=C13535&color=fff&rounded=true'; }} />
            <span className="text-2xl font-black text-[#C13535] dark:text-[#DDDADB] tracking-tighter">Estudio Radio América</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#C13535]/60 dark:text-[#DDDADB]/40">search</span>
            <input 
              type="text" 
              placeholder="Buscar programas..."
              className="bg-zinc-100 dark:bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-[#C13535] dark:text-[#DDDADB] w-48 focus:ring-2 focus:ring-[#F07D00]/50 transition-all"
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearchOpen && searchQuery && <SearchResults query={searchQuery} onClose={() => setIsSearchOpen(false)} />}
          </div>
          <button onClick={toggleTheme} className="hover:scale-105 transition-transform duration-200 text-[#C13535] dark:text-[#DDDADB]">
            <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-[#C13535] dark:text-[#DDDADB] font-['Montserrat']">CATÁLOGO DE <span className="text-[#F07D00]">CONTENIDO</span></h1>
          <p className="text-lg text-[#C13535]/80 dark:text-[#DDDADB]/60 max-w-2xl mx-auto">Explora toda nuestra parrilla, desde programas de información general hasta podcasts de nicho.</p>
        </div>

        {/* Programas */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-outline-variant/20 pb-4">
            <h2 className="text-3xl font-black tracking-tight text-[#C13535] dark:text-[#DDDADB]">PROGRAMAS</h2>
            <div className="h-1 w-12 bg-[#C13535]"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {programList.map(program => (
              <div key={program.id} onClick={() => navigate(`/program/${program.id}`)} className="group cursor-pointer">
                <div className="vertical-poster rounded-xl overflow-hidden relative border border-zinc-200 dark:border-outline-variant/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img alt={program.name} className="w-full h-full object-cover" src={program.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  <img alt={program.name} className="w-full h-full object-cover" src={program.thumbnail || '/logo_blanco.png'} onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-bold text-[#FFB91F] uppercase tracking-wider mb-1">{program.category}</p>
                    <h3 className="font-bold leading-tight text-white">{program.name}</h3>
                  </div>
                </div>
              </div>
            ))}
            {programList.length === 0 && <p className="text-[#C13535]/60 dark:text-[#DDDADB]/40 text-sm">No hay programas en esta sección.</p>}
          </div>
        </section>

        {/* Podcasts */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-outline-variant/20 pb-4">
            <h2 className="text-3xl font-black tracking-tight text-[#C13535] dark:text-[#DDDADB]">PODCASTS</h2>
            <div className="h-1 w-12 bg-[#F07D00]"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {podcastList.map(program => (
              <div key={program.id} onClick={() => navigate(`/program/${program.id}`)} className="group cursor-pointer">
                <div className="vertical-poster rounded-xl overflow-hidden relative border border-zinc-200 dark:border-outline-variant/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img alt={program.name} className="w-full h-full object-cover" src={program.thumbnail} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-bold text-[#FFB91F] uppercase tracking-wider mb-1">{program.category}</p>
                    <h3 className="font-bold leading-tight text-white">{program.name}</h3>
                  </div>
                </div>
              </div>
            ))}
            {podcastList.length === 0 && <p className="text-[#C13535]/60 dark:text-[#DDDADB]/40 text-sm">No hay podcasts en esta sección.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}