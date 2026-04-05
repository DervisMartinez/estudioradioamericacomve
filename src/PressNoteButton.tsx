import type { FC } from 'react';

interface PressNoteButtonProps {
  url?: string;
  className?: string;
  text?: string;
}

const PressNoteButton: FC<PressNoteButtonProps> = ({ url, className, text = "LEA LA NOTA COMPLETA AQUI" }) => {
  if (!url || url.trim() === '') return null;

  const handleOpen = () => {
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button type="button" onClick={handleOpen} className={className}>
      <span className="material-symbols-outlined">article</span>
      {text}
    </button>
  );
};

export default PressNoteButton;