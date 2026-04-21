'use client';

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
    if (!wrapRef.current) return;
    document.body.style.overflow = 'hidden';
    resetTimer();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
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
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Inicializa Plyr
  useEffect(() => {
    if (!driveLink || !wrapRef.current) return;

    const fileId = extractDriveFileId(driveLink);
    const streamUrl = getStreamUrl(fileId);

    if (!streamUrl) {
      setError('Link do Google Drive inválido');
      return;
    }

    playerRef.current = new Plyr(wrapRef.current, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
      settings: ['captions', 'quality', 'speed'],
      quality: { default: 720, options: [2160, 1440, 1080, 720, 480, 360] },
      i18n: { play: 'Reproduzir', pause: 'Pausar', settings: 'Configurações', quality: 'Qualidade', speed: 'Velocidade', normal: 'Normal' },
      tooltips: { controls: true, seek: true },
      invertTime: true,
      storage: { enabled: true, key: `plyr-${movie?.tmdbId || 'video'}` }
    });

    playerRef.current.source = {
      type: 'video',
      title: movie?.title || 'Reproduzindo...',
      sources: [{ src: streamUrl, type: 'video/mp4', size: 1080 }]
    };

    playerRef.current.on('error', () => {
      setError('Erro ao carregar vídeo. Verifique se o arquivo está público no Drive.');
    });

    return () => playerRef.current?.destroy();
  }, [driveLink, movie]);

  return (
    <div className="video-player-overlay">
      <div className="video-player-container" ref={wrapRef}>
        {/* Plyr será injetado aqui automaticamente */}
      </div>

      {/* Header */}
      <div className="player-header">
        <button onClick={onClose} className="back-btn">← Voltar</button>
        <h1>{movie?.title || 'Carregando...'}</h1>
        <button onClick={toggleFull} className="full-btn">
          {isFull ? '⤢' : '⤡'}
        </button>
      </div>

      {error && (
        <div className="player-error">
          <p>⚠️ {error}</p>
          <button onClick={onClose}>Fechar</button>
        </div>
      )}

      {/* Overlay de controles (opcional) */}
      {!showUI && <div className="player-ui-hidden" />}
    </div>
  );
                 }
