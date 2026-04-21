import { useEffect, useRef, useState, useCallback } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { extractDriveFileId, getStreamUrl } from '../lib/catalog';

export default function VideoPlayer({ driveLink, movie, onClose }) {
  const wrapRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const [showUI, setShowUI] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [error, setError] = useState(null);

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
      playerRef.current?.destroy();
    };
  }, [resetTimer, onClose]);

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen?.().then(() => setIsFull(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFull(false)).catch(() => {});
    }
    resetTimer();
  };

  useEffect(() => {
    const onChange = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);  }, []);

  // Inicializa Plyr
  useEffect(() => {
    if (!driveLink) return;

    const fileId = extractDriveFileId(driveLink);
    const streamUrl = getStreamUrl(fileId);
    
    if (!streamUrl) {
      setError('Link do Google Drive inválido');
      return;
    }

    // Proxy opcional para evitar CORS (descomente se necessário)
    // const proxyUrl = `https://your-proxy.workers.dev/?url=${encodeURIComponent(streamUrl)}`;

    playerRef.current = new Plyr(wrapRef.current, {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'mute', 
        'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['captions', 'quality', 'speed'],
      quality: { 
        default: 720, 
        options: [2160, 1440, 1080, 720, 480, 360] 
      },
      i18n: {
        play: 'Reproduzir',
        pause: 'Pausar',
        settings: 'Configurações',
        quality: 'Qualidade',
        speed: 'Velocidade',
        normal: 'Normal'
      },
      tooltips: { controls: true, seek: true },
      invertTime: true,
      storage: { enabled: true, key: `plyr-${movie?.tmdbId}` }
    });

    playerRef.current.source = {
      type: 'video',
      title: movie?.title || 'Reproduzindo...',
      sources: [{
        src: streamUrl,
        type: 'video/mp4',
        size: 1080
      }]
    };
    // Tratamento de erros do player
    playerRef.current.on('error', () => {
      setError('Erro ao carregar vídeo. Verifique se o arquivo está público no Drive.');
    });

    return () => playerRef.current?.destroy();
  }, [driveLink, movie]);

  return (
    <div 
      ref={wrapRef} 
      className="player-wrap"
      onMouseMove={resetTimer}
      onTouchStart={resetTimer}
    >
      {/* Header do player */}
      <div className={`player-top ${showUI ? '' : 'hidden'}`}>
        <button className="player-back" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Voltar
        </button>
        <h1 className="player-movie-title">{movie?.title || 'Carregando...'}</h1>
        <button className="player-fullbtn" onClick={toggleFull} title={isFull ? 'Sair da tela cheia' : 'Tela cheia'}>
          {isFull ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          )}
        </button>
      </div>

      {/* Container do Plyr */}
      <div className="player-iframe-outer">
        {error ? (
          <div className="player-error">
            <p>⚠️ {error}</p>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <video ref={wrapRef} data-plyr-provider="html5" />
        )}
      </div>

      {/* Overlay de controles ocultos */}      {!showUI && (
        <div className="player-ui-overlay" onClick={resetTimer} />
      )}
    </div>
  );
          }
