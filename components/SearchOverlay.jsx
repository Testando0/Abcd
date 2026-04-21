import { useEffect, useRef, useState } from 'react';
import { searchMovies, posterUrl } from '../lib/tmdb';
import { getDriveId } from '../lib/catalog';

export default function SearchOverlay({ isOpen, onClose, onSelect }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchMovies(q);
      setResults(data.slice(0, 20));
      setLoading(false);
    }, 350);
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Buscar filmes e séries..."
            className="search-input"
          />
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="search-results">
          {!query && !results.length && (
            <p className="search-empty">Digite para buscar filmes e séries</p>
          )}

          {loading && <div className="loading-spinner">Carregando...</div>}

          {!loading && results.length > 0 && (
            <>
              <h3>Resultados para "{query}"</h3>
              <div className="results-list">
                {results.map((movie) => {
                  const driveId = getDriveId(movie.id);
                  return (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => {
                        onSelect(movie);
                        onClose();
                      }}
                    >
                      {movie.poster_path && (
                        <img
                          src={posterUrl(movie.poster_path, 'w92')}
                          alt={movie.title}
                          className="result-poster"
                        />
                      )}
                      <div className="result-info">
                        <div className="result-title">
                          {movie.title}
                          {driveId && <span className="badge-dub">DUB</span>}
                        </div>
                        <div className="result-year">
                          {(movie.release_date || '').slice(0, 4)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && query && results.length === 0 && (
            <p className="search-empty">Nenhum resultado para "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
                          }
