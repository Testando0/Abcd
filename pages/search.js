import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SearchPage({ onBack, onMovieSelect }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca simples (substitua por sua API real)
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      // Exemplo com TMDB - ajuste com sua chave
      const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
      if (TMDB_KEY) {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchQuery)}&language=pt-BR&include_adult=true`,
          { headers: { Authorization: `Bearer ${TMDB_KEY}` } }
        );
        const data = await res.json();
        setResults(data.results?.filter(r => r.media_type === 'movie' && r.poster_path) || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  // Debounce na busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (movie) => {
    onMovieSelect?.(movie);
    router.push(`/movie/${movie.id}`);
  };

  return (
    <div className="search-overlay">
      <div className="search-header">        <button className="search-close" onClick={onBack || (() => router.back())}>
          ←
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Títulos, pessoas, gêneros..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="search-results">
        {loading && <div className="search-loading">Buscando...</div>}
        
        {!loading && !query && (
          <div className="search-hint">
            Digite para buscar filmes e séries
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-empty">
            Nenhum resultado para "{query}"
          </div>
        )}

        <div className="results-grid">
          {results.map(item => (
            <div 
              key={item.id}
              className="result-card"
              onClick={() => handleSelect(item)}
            >
              <img 
                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
                alt={item.title || item.name}
                loading="lazy"
              />
              <div className="result-info">
                <span className="result-title">{item.title || item.name}</span>
                <span className="result-year">
                  {item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .search-overlay {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 2000;
          display: flex;
          flex-direction: column;
        }
        .search-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.95);
        }
        .search-close {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .search-close:hover { background: rgba(255,255,255,0.1); }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 1.2rem;
          padding: 8px 0;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.4); }
        .search-results {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .search-loading, .search-hint, .search-empty {
          text-align: center;          padding: 40px;
          color: rgba(255,255,255,0.6);
          font-size: 1rem;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
          padding: 8px 0;
        }
        .result-card {
          cursor: pointer;
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .result-card:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          z-index: 2;
        }
        .result-card img {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          display: block;
        }
        .result-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .result-card:hover .result-info { opacity: 1; }
        .result-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .result-year {
          font-size: 0.7rem;          color: rgba(255,255,255,0.7);
        }

        @media (max-width: 768px) {
          .search-header { padding: 12px 16px; }
          .search-input { font-size: 1rem; }
          .results-grid { 
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); 
            gap: 12px;
          }
          .result-info { opacity: 1; background: rgba(0,0,0,0.7); }
        }
      `}</style>
    </div>
  );
          }
