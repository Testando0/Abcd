import { useEffect, useRef, useState } from 'react';
import { searchMovies, posterUrl } from '../lib/tmdb';
import { getDriveId } from '../lib/catalog';

export default function SearchOverlay({ open, onClose, onSelect }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchMovies(q);
      setResults(data.slice(0, 20));
      setLoading(false);
    }, 350);
  };

  return (
    <div className={`search-overlay${open ? ' open' : ''}`}>
      <div className="search-top">
        <button className="search-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Títulos, pessoas, gêneros"
            value={query}
            onChange={handleChange}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="search-results">
        {!query && !results.length && (
          <div className="search-hint">Digite para buscar filmes e séries</div>
        )}

        {loading && <div className="spinner" />}

        {!loading && results.length > 0 && (
          <>
            <div className="search-category">Resultados para "{query}"</div>
            <div className="search-grid">
              {results.map(movie => {
                const driveId = getDriveId(movie.id);
                return (
                  <div
                    key={movie.id}
                    className="movie-card"
                    style={{ width: '100%' }}
                    onClick={() => { onSelect(movie, driveId); onClose(); }}
                  >
                    <img src={posterUrl(movie.poster_path)} alt={movie.title} loading="lazy" />
                    {driveId && <span className="card-badge card-badge-dub">DUB</span>}
                    <div className="card-info">
                      <div className="card-title">{movie.title}</div>
                      <div className="card-year">{(movie.release_date || '').slice(0, 4)}</div>
                    </div>
                    <div className="card-play-hint">
                      <div className="card-play-circle">
                        <svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-hint">Nenhum resultado para "{query}"</div>
        )}
      </div>
    </div>
  );
}
