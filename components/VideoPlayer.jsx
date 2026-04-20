import { useEffect, useRef, useState, useCallback } from 'react';

export default function VideoPlayer({ driveId, movie, onClose }) {
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const [showUI, setShowUI] = useState(true);
  const [isFull, setIsFull] = useState(false);

  const resetTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowUI(false), 4000);
  }, []);

  useEffect(() => {
    resetTimer();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'f' || e.key === 'F') toggleFull();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timerRef.current);
      document.body.style.overflow = '';
    };
  }, []);

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen().then(() => setIsFull(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFull(false)).catch(() => {});
    }
    resetTimer();
  };

  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="player-wrap"
      onMouseMove={resetTimer}
      onTouchStart={resetTimer}
    >
      {/* 
        Drive iframe sandboxed: sem allow-top-navigation nem allow-popups
        → impede que o Drive abra em nova aba ao clicar play/pause/título
        Os controles nativos de vídeo do Drive funcionam perfeitamente
      */}
      <div className="player-iframe-outer">
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          title={movie?.title}
        />
      </div>

      {/* Top bar: Voltar + Título + Fullscreen */}
      <div className={`player-top${showUI ? '' : ' hidden'}`}>
        <button className="player-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        <span className="player-movie-title">{movie?.title}</span>

        <button
          className="player-fullbtn"
          onClick={toggleFull}
          title={isFull ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
          style={{ marginLeft: 'auto' }}
        >
          {isFull ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="20" height="20">
              <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="20" height="20">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
