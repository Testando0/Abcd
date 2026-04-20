import { useEffect, useRef } from 'react';
import { IMG } from '../lib/tmdb';

export default function MovieDetail({ movie, driveId, open, onClose, onPlay }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && panelRef.current) {
      setTimeout(() => {
        panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
    }
  }, [open, movie]);

  const year = (movie?.release_date || '').slice(0, 4);
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : null;
  const genres = (movie?.genres || []).slice(0, 3);
  const runtime = movie?.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
    : null;
  const backdrop = movie?.backdrop_path
    ? `${IMG}w780${movie.backdrop_path}`
    : movie?.poster_path
    ? `${IMG}w500${movie.poster_path}`
    : null;

  return (
    <div ref={panelRef} className={`detail-panel${open ? ' open' : ''}`}>
      {open && movie && (
        <div className="detail-inner">
          {backdrop && (
            <div className="detail-backdrop">
              <img src={backdrop} alt={movie.title} />
              <div className="detail-backdrop-fade" />
            </div>
          )}

          <div className="detail-body">
            <button className="detail-close" onClick={onClose} aria-label="Fechar">✕</button>

            <h2 className="detail-title">{movie.title}</h2>

            <div className="detail-meta">
              {rating && <span className="detail-rating">⭐ {rating}</span>}
              {year && <span className="detail-year">{year}</span>}
              {runtime && <span style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{runtime}</span>}
              {genres.map(g => (
                <span key={g.id} className="detail-genre">{g.name}</span>
              ))}
            </div>

            {movie.overview && (
              <p className="detail-desc">{movie.overview}</p>
            )}

            <div className="detail-actions">
              {driveId ? (
                <button className="btn btn-red btn-sm" onClick={() => onPlay(movie, driveId)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M5 3l14 9-14 9V3z"/></svg>
                  Assistir Agora
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => onPlay(movie, null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                  </svg>
                  Ver Trailer
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
