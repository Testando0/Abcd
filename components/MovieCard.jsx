import { posterUrl } from '../lib/tmdb';

export default function MovieCard({ movie, onPlay, disabled = false }) {
  if (!movie) return null;

  const title = movie.title || 'Sem título';
  const year = movie.release_date 
    ? movie.release_date.slice(0, 4) 
    : (movie.first_air_date ? movie.first_air_date.slice(0, 4) : '');

  const imageUrl = posterUrl(movie.poster_path);

  return (
    <div
      className="movie-card"
      onClick={() => !disabled && onPlay && onPlay()}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
      />
      <div className="card-info">
        <div className="card-title">{title}</div>
        <div className="card-year">{year}</div>
      </div>
      <div className="card-play-hint">
        <div className="card-play-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
      </div>
    </div>
  );
    }
