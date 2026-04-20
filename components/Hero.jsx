import { useEffect, useState } from 'react';
import { fetchMovie, backdropUrl } from '../lib/tmdb';
import { HERO_ID, getDriveId } from '../lib/catalog';

export default function Hero({ onPlay, onInfo }) {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetchMovie(HERO_ID).then(m => m && setMovie(m));
  }, []);

  if (!movie) {
    return (
      <div className="hero" style={{ background: '#141414' }}>
        <div className="hero-content">
          <div style={{ height: 200, display: 'flex', alignItems: 'center' }}>
            <div className="spinner" style={{ margin: 0 }} />
          </div>
        </div>
      </div>
    );
  }

  const bg = backdropUrl(movie.backdrop_path);
  const year = (movie.release_date || '').slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const genre = (movie.genres || [])[0]?.name;
  const driveId = getDriveId(movie.id);

  return (
    <div
      className="hero"
      style={bg ? { backgroundImage: `url(${bg})` } : {}}
    >
      <div className="hero-content">
        <div className="hero-kicker">
          <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3"/></svg>
          Dublado · HD
        </div>

        <h1 className="hero-title">{movie.title}</h1>

        <div className="hero-meta">
          {rating && <strong>⭐ {rating}</strong>}
          {rating && <div className="hero-dot" />}
          {year && <strong>{year}</strong>}
          {genre && <><div className="hero-dot" /><span>{genre}</span></>}
        </div>

        <p className="hero-desc">{movie.overview}</p>

        <div className="hero-actions">
          {driveId ? (
            <button className="btn btn-red" onClick={() => onPlay(movie, driveId)}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              Assistir
            </button>
          ) : null}
          <button className="btn btn-ghost" onClick={() => onInfo(movie, driveId)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            Mais Informações
          </button>
        </div>
      </div>
    </div>
  );
}
