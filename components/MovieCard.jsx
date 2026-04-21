import { posterUrl } from '../lib/tmdb';

export default function MovieCard({ movie, onPlay, disabled = false }) {
  if (!movie) return null;

  const title = movie.title || movie.name || 'Sem título';
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
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Botão de play no hover */}
      <div className="card-play-overlay">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
          <path d="M8 5.14v14l11-7z" />
        </svg>
      </div>

      {/* Informações */}
      <div className="card-bottom">
        <div className="card-title">{title}</div>
        <div className="card-year">{year}</div>
      </div>
    </div>
  );
      }
