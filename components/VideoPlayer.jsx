import { useEffect, useRef, useState, useCallback } from 'react';

export default function VideoPlayer({ driveId, movie, onClose }) {
  const iframeRef = useRef(null);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);
  const [showUI, setShowUI] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [seekFlash, setSeekFlash] = useState(null);
  const [isFull, setIsFull] = useState(false);

  // Auto-hide UI after 3s
  const resetTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowUI(false), 3500);
  }, []);

  useEffect(() => {
    resetTimer();
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowRight') seek(10);
      if (e.key === 'ArrowLeft') seek(-10);
      if (e.key === 'f') toggleFull();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timerRef.current);
      document.body.style.overflow = '';
    };
  }, []);

  const togglePlay = () => {
    setPlaying(p => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: p ? 'pause' : 'play' }), '*'
        );
      } catch (_) {}
      return !p;
    });
    resetTimer();
  };

  const seek = (secs) => {
    setSeekFlash(secs > 0 ? `+${secs}s` : `${secs}s`);
    setTimeout(() => setSeekFlash(null), 700);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'seek', seconds: secs }), '*'
      );
    } catch (_) {}
    resetTimer();
  };

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
      onClick={resetTimer}
    >
      {/* Drive iframe (cropped to hide Drive's title bar) */}
      <div className="player-iframe-outer">
        <iframe
          ref={iframeRef}
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title={movie?.title}
        />
      </div>

      {/* Seek flash indicator */}
      {seekFlash && (
        <div key={seekFlash + Date.now()} className="seek-flash">{seekFlash}</div>
      )}

      {/* Top bar */}
      <div className={`player-top${showUI ? '' : ' hidden'}`}>
        <button className="player-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>
        <span className="player-movie-title">{movie?.title}</span>
      </div>

      {/* Bottom controls */}
      <div className={`player-bottom${showUI ? '' : ' hidden'}`}>
        <div className="player-controls">
          <button className="player-ctrl" onClick={() => seek(-10)} title="Voltar 10s">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <text x="4" y="18" fontSize="9" fontWeight="bold" fontFamily="sans-serif">10</text>
              <path d="M12 5V2L7 7l5 5V9c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          <button className="player-ctrl player-ctrl-play" onClick={togglePlay} title={playing ? 'Pausar' : 'Reproduzir'}>
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
            )}
          </button>
          <button className="player-ctrl" onClick={() => seek(10)} title="Avançar 10s">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <text x="8" y="18" fontSize="9" fontWeight="bold" fontFamily="sans-serif">10</text>
              <path d="M12 5V2l5 5-5 5V9c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            </svg>
          </button>
          <div className="player-spacer"/>
          <button className="player-fullbtn" onClick={toggleFull} title="Tela cheia">
            {isFull ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
