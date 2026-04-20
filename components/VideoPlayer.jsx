import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ driveId, movie, onClose, onNext, onPrev }) {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // URL do Drive com parâmetros para auto-play e UI mínima
  const getEmbedUrl = (id) => {
    const cleanId = id?.split('?')[0]?.split('/').pop();
    if (!cleanId) return null;
    // autoplay=1 + controls para mínimo de UI do Drive
    return `https://drive.google.com/file/d/${cleanId}/preview?usp=drivesdk&autoplay=1`;
  };

  useEffect(() => {
    // Força foco no iframe para auto-play funcionar
    const timer = setTimeout(() => {
      iframeRef.current?.focus();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const embedUrl = getEmbedUrl(driveId);

  if (!embedUrl) {
    return (
      <div className="player-error">
        <p>URL do vídeo inválida</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    );
  }

  return (
    <div className="player-overlay">
      {/* Iframe com sandbox que BLOQUEIA links externos mas mantém o player */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="player-iframe"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox"
        onLoad={() => setLoaded(true)}
        title={movie?.title || 'Player'}      />
      
      {/* Overlay minimalista só com botão Voltar */}
      <div className="player-ui">
        <button className="player-back-btn" onClick={onClose}>
          ← Voltar
        </button>
      </div>

      <style jsx>{`
        .player-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
        }
        .player-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
          /* Hack para esconder header do Drive */
          transform: scale(1.02);
        }
        .player-ui {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 16px 20px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.85), transparent);
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .player-overlay:hover .player-ui,
        .player-ui:focus-within {
          opacity: 1;
          pointer-events: auto;
        }
        .player-back-btn {
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;          transition: background 0.2s;
        }
        .player-back-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .player-error {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          gap: 16px;
        }
        .player-error button {
          background: #e50914;
          border: none;
          color: #fff;
          padding: 10px 24px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
