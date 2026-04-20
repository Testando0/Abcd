import { useEffect, useState, useRef } from 'react';
import { fetchMovie, fetchPopular, posterUrl } from '../lib/tmdb';
import { CATALOG } from '../lib/catalog';
import MovieDetail from './MovieDetail';

function SkeletonCards() {
  return (
    <div className="loading-row">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

export default function MovieRow({ category, label, onPlay, globalExpanded, onExpand }) {
  const [movies, setMovies] = useState([]);
  const [movieData, setMovieData] = useState({});
  const [expanded, setExpanded] = useState(null); // tmdbId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [category]);

  // Close if another row expanded
  useEffect(() => {
    if (globalExpanded !== category && expanded) {
      setExpanded(null);
    }
  }, [globalExpanded]);

  async function load() {
    setLoading(true);
    // Catalog movies for this category
    const catItems = CATALOG.filter(c => c.cats.includes(category));
    const catalogIds = catItems.map(c => c.tmdbId);

    // Fetch catalog movie details
    const catalogFetches = catalogIds.map(id => fetchMovie(id));
    // Also fetch popular from TMDB for this genre
    const popularFetch = fetchPopular(category);
    const [catalogResults, popularResults] = await Promise.all([
      Promise.allSettled(catalogFetches),
      popularFetch,
    ]);

    // Map catalog results
    const catalogMovies = catalogResults
      .map((r, i) => r.status === 'fulfilled' && r.value?.id ? { ...r.value, _driveId: catItems[i].driveId } : null)
      .filter(Boolean);

    // Merge: catalog first, then popular (excluding duplicates)
    const catalogIdSet = new Set(catalogMovies.map(m => m.id));
    const popularUniq = (popularResults || []).filter(m => !catalogIdSet.has(m.id)).slice(0, 10);
    const merged = [...catalogMovies, ...popularUniq];

    setMovies(merged);

    // Pre-cache movie data
    const dataMap = {};
    catalogMovies.forEach(m => { dataMap[m.id] = m; });
    setMovieData(dataMap);
    setLoading(false);
  }

  async function handleCardClick(movie) {
    const id = movie.id;
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    onExpand(category);
    // Fetch full data if not cached
    if (!movieData[id] || !movieData[id].genres) {
      const full = await fetchMovie(id);
      if (full) setMovieData(p => ({ ...p, [id]: { ...full, _driveId: movie._driveId } }));
    }
  }

  const expandedMovie = expanded ? (movieData[expanded] || movies.find(m => m.id === expanded)) : null;
  const expandedDriveId = expandedMovie?._driveId || CATALOG.find(c => c.tmdbId === expanded)?.driveId || null;

  return (
    <div className="row-section">
      <div className="row-header">
        <h3 className="row-title">{label}</h3>
        <span className="row-title-arrow">Ver tudo →</span>
      </div>

      {loading ? <SkeletonCards /> : (
        <div className="cards-track">
          {movies.map(movie => {
            const driveId = movie._driveId || CATALOG.find(c => c.tmdbId === movie.id)?.driveId || null;
            const isSelected = expanded === movie.id;
            return (
              <div
                key={movie.id}
                className={`movie-card no-select${isSelected ? ' selected' : ''}`}
                onClick={() => handleCardClick(movie)}
              >
                <img
                  src={posterUrl(movie.poster_path)}
                  alt={movie.title}
                  loading="lazy"
                />
                {driveId
                  ? <span className="card-badge card-badge-dub">DUB</span>
                  : <span className="card-badge card-badge-trailer">TRAILER</span>
                }
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
      )}

      <MovieDetail
        movie={expandedMovie}
        driveId={expandedDriveId}
        open={!!expanded && !!expandedMovie}
        onClose={() => setExpanded(null)}
        onPlay={onPlay}
      />
    </div>
  );
}
