import type { FC } from 'react';

interface PressNoteButtonProps {
  url?: string;
  className?: string;
  text?: string;
}

const PressNoteButton: FC<PressNoteButtonProps> = ({ url, className, text = "LEE LA NOTA COMPLETA AQUI" }) => {
  if (!url) return null;

  return (
    <button onClick={() => window.open(url, '_blank')} className={className}>
      <span className="material-symbols-outlined">article</span>
      {text}
    </button>
  );
};

export default PressNoteButton;