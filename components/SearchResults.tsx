"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { RadioAmericaLoader, API_URL } from './VideoContext';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<{ videos: any[], programs: any[] }>({ videos: [], programs: [] });
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Detectar clic fuera del buscador para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ videos: [], programs: [] });
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchResults, 300); // Espera 300ms antes de buscar
    return () => clearTimeout(debounce);
  }, [query]);

  const handleVideoClick = (id: string) => {
    router.push(`/watch/${id}`);
    onClose();
  };

  const handleProgramClick = (id: string) => {
    router.push(`/program/${id}`);
    onClose();
  };

  return (
    <div ref={modalRef} className="absolute top-20 right-8 w-full max-w-md bg-white dark:bg-surface-container-high rounded-2xl shadow-2xl border border-zinc-200 dark:border-outline-variant/20 p-4 z-50">
      <h3 className="text-xs font-bold uppercase text-[#DDDADB]/50 px-4 pb-2">Resultados de Búsqueda</h3>
      <div className="max-h-96 overflow-y-auto">
        {query.trim().length < 2 ? (
          <p className="text-center text-sm text-[#C13535]/80 dark:text-[#DDDADB]/50 py-8">Escribe al menos 2 caracteres...</p>
        ) : loading ? (
          <div className="py-6">
            <RadioAmericaLoader fullScreen={false} />
          </div>
        ) : (
          <>
            {results.videos?.map(video => (
              <div key={`v-${video.id}`} onClick={() => handleVideoClick(video.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-surface-container-lowest cursor-pointer transition-colors">
                <img src={video.thumbnail || '/logo_blanco.png'} alt={video.title} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div>
                  <p className="font-bold text-sm text-[#C13535] dark:text-[#DDDADB] line-clamp-1">{video.title}</p>
                  <p className="text-[10px] text-[#F07D00] uppercase tracking-widest">{video.category}</p>
                </div>
              </div>
            ))}
            {results.programs?.map(program => (
              <div key={`p-${program.id}`} onClick={() => handleProgramClick(program.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-surface-container-lowest cursor-pointer transition-colors">
                <img src={program.thumbnail || '/logo_blanco.png'} alt={program.title || program.name} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div>
                  <p className="font-bold text-sm text-[#C13535] dark:text-[#DDDADB] line-clamp-1">{program.title || program.name}</p>
                  <p className="text-[10px] text-[#C13535]/60 dark:text-[#DDDADB]/40 uppercase tracking-widest">Programa</p>
                </div>
              </div>
            ))}
            {(!results.videos || results.videos.length === 0) && (!results.programs || results.programs.length === 0) && (
              <p className="text-center text-sm text-[#C13535]/80 dark:text-[#DDDADB]/50 py-8">No se encontraron resultados para "{query}".</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}