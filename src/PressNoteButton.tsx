import type { FC } from 'react';

interface PressNoteButtonProps {
  url?: string;
  className?: string;
}

const PressNoteButton: FC<PressNoteButtonProps> = ({ url, className }) => {
  if (!url) return null;

  return (
    <button onClick={() => window.open(url, '_blank')} className={className}>
      <span className="material-symbols-outlined">article</span>
      LEE LA NOTA COMPLETA AQUI
    </button>
  );
};

export default PressNoteButton;