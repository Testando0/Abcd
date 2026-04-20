import { useEffect, useRef, useState, useCallback } from 'react';

export default function VideoPlayer({ driveId, movie, onClose, onNext, onPrev }) {
  const wrapRef = useRef(null);
  const iframeRef = useRef(null);
  const timerRef = useRef(null);
  const [showUI, setShowUI] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Converter ID do Drive para URL embedável
  const getDriveEmbedUrl = (id) => {
    if (!id) return null;
    const cleanId = id.split('?')[0].split('/').pop();
    return `https://drive.google.com/file/d/${cleanId}/preview`;
  };

  const resetTimer = useCallback(() => {
    setShowUI(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isPlaying) setShowUI(false);
    }, 4000);
  }, [isPlaying]);

  // Prevenir navegação externa do iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'navigate' || event.data?.url?.includes('drive.google.com')) {
        event.stopPropagation();
      }
    };
    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, []);

  // Controle de teclado e fullscreen
  useEffect(() => {
    resetTimer();
    document.body.style.overflow = 'hidden';
    
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFull();
      } else if (e.key === ' ' || e.key === 'k') {        e.preventDefault();
        // Tenta toggle play/pause no iframe do Drive
        iframeRef.current?.contentWindow?.postMessage(
          { event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo' },
          '*'
        );
        setIsPlaying(!isPlaying);
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      }
    };
    
    window.addEventListener('keydown', onKey);
    
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timerRef.current);
      document.body.style.overflow = '';
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [onClose, onNext, onPrev, resetTimer, isPlaying]);

  const toggleFull = async () => {
    try {
      if (!document.fullscreenElement) {
        await wrapRef.current?.requestFullscreen();
        setIsFull(true);
      } else {
        await document.exitFullscreen();
        setIsFull(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
    resetTimer();
  };

  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const embedUrl = getDriveEmbedUrl(driveId);

  if (loadError || !embedUrl) {    return (
      <div className="player-wrap">
        <div className="error-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>Erro ao carregar vídeo</p>
          <button className="form-btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={wrapRef}
      className="player-wrap"
      onMouseMove={resetTimer}
      onClick={resetTimer}
      tabIndex={0}
    >
      {/* 
        Iframe do Google Drive com sandbox RESTRICTIVO:
        - allow-scripts: necessário para o player funcionar
        - SEM allow-top-navigation: impede abrir em nova aba
        - SEM allow-popups: impede popups do Drive
        - allow-same-origin: mantém cookies de sessão
      */}
      <div className="player-iframe-outer">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="drive-iframe"
          frameBorder="0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onLoad={() => setLoadError(false)}
          onError={() => setLoadError(true)}
          title={movie?.title || 'Player de vídeo'}
        />
      </div>

      {/* Overlay de UI estilo Netflix */}
      <div className={`player-top ${showUI ? '' : 'hidden'}`}>
        <button className="player-back" onClick={onClose} aria-label="Voltar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Voltar        </button>
        <h1 className="player-movie-title">{movie?.title || movie?.name}</h1>
        <button className="player-fullbtn" onClick={toggleFull} aria-label="Tela cheia">
          {isFull ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loadError === null && (
        <div className="video-loading">
          <div className="loader-spinner" />
        </div>
      )}

      <style jsx>{`
        .player-wrap {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: #000;
          display: flex;
          flex-direction: column;
          cursor: ${showUI ? 'default' : 'none'};
          outline: none;
        }
        .player-iframe-outer {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .drive-iframe {
          position: absolute;
          top: -64px;
          left: 0;
          width: 100%;
          height: calc(100% + 64px);
          border: none;
          background: #000;
        }
        .player-top {
          position: absolute;
          top: 0;          left: 0;
          right: 0;
          z-index: 10;
          padding: 22px 4%;
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, transparent 100%);
          transition: opacity 0.35s ease;
          pointer-events: ${showUI ? 'auto' : 'none'};
        }
        .player-top.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .player-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 9px 18px;
          color: #fff;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 500;
          transition: background 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .player-back:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.3);
        }
        .player-movie-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          color: #fff;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .player-fullbtn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .player-fullbtn:hover {
          background: rgba(255,255,255,0.18);
        }
        .video-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .loader-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #E50914;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error-state {
          text-align: center;
          color: #fff;
          padding: 32px;
          background: rgba(30,30,30,0.95);
          border-radius: 12px;
          max-width: 400px;
          margin: auto;
        }
        .error-state svg {
          color: #E50914;
          margin-bottom: 16px;
        }
        .error-state p {
          margin: 0 0 20px;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );}
