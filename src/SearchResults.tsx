import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadioAmericaLoader, API_URL } from './VideoContext';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<{ videos: any[], programs: any[] }>({ videos: [], programs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query.trim().length < 3) {
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
    navigate(`/watch/${id}`);
    onClose();
  };

  const handleProgramClick = (id: string) => {
    navigate(`/program/${id}`);
    onClose();
  };

  return (
    <div className="absolute top-20 right-8 w-full max-w-md bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/20 p-4 z-50">
      <h3 className="text-xs font-bold uppercase text-[#DDDADB]/50 px-4 pb-2">Resultados de Búsqueda</h3>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-6">
            <RadioAmericaLoader fullScreen={false} />
          </div>
        ) : (
          <>
            {results.videos.map(video => (
              <div key={`v-${video.id}`} onClick={() => handleVideoClick(video.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-lowest cursor-pointer">
                <img src={video.thumbnail || '/logo_blanco.png'} alt={video.title} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div>
                  <p className="font-bold text-sm line-clamp-1">{video.title}</p>
                </div>
              </div>
            ))}
            {results.programs.map(program => (
              <div key={`p-${program.id}`} onClick={() => handleProgramClick(program.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-lowest cursor-pointer">
                <img src={program.thumbnail || '/logo_blanco.png'} alt={program.title || program.name} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
                <div>
                  <p className="font-bold text-sm line-clamp-1">{program.title || program.name}</p>
                </div>
              </div>
            ))}
            {results.videos.length === 0 && results.programs.length === 0 && (
              <p className="text-center text-sm text-[#DDDADB]/50 py-8">No se encontraron resultados.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}