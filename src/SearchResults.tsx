import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoContext } from './VideoContext';

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export default function SearchResults({ query, onClose }: SearchResultsProps) {
  const { videos, programs } = useContext(VideoContext);
  const navigate = useNavigate();

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  const filteredPrograms = programs.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

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
        {filteredVideos.map(video => (
          <div key={`v-${video.id}`} onClick={() => handleVideoClick(video.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-lowest cursor-pointer">
            <img src={video.thumbnail || '/logo_blanco.png'} alt={video.title} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            <div>
              <p className="font-bold text-sm line-clamp-1">{video.title}</p>
            </div>
          </div>
        ))}
        {filteredPrograms.map(program => (
          <div key={`p-${program.id}`} onClick={() => handleProgramClick(program.id)} className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-container-lowest cursor-pointer">
            <img src={program.thumbnail || '/logo_blanco.png'} alt={program.name} className="w-20 h-12 object-cover rounded" onError={(e) => { e.currentTarget.src = '/logo_blanco.png'; }} />
            <div>
              <p className="font-bold text-sm line-clamp-1">{program.name}</p>
            </div>
          </div>
        ))}
        {filteredVideos.length === 0 && filteredPrograms.length === 0 && (
          <p className="text-center text-sm text-[#DDDADB]/50 py-8">No se encontraron resultados.</p>
        )}
      </div>
    </div>
  );
}