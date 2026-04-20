const KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';
export const IMG = 'https://image.tmdb.org/t/p/';

const cache = {};

async function fetcher(path) {
  if (cache[path]) return cache[path];
  try {
    const r = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}api_key=${KEY}&language=pt-BR`);
    const d = await r.json();
    cache[path] = d;
    return d;
  } catch { return null; }
}

export async function fetchMovie(id) {
  return fetcher(`/movie/${id}?append_to_response=videos,credits`);
}

export async function searchMovies(query) {
  const d = await fetcher(`/search/movie?query=${encodeURIComponent(query)}`);
  return d?.results || [];
}

export async function fetchPopular(genre) {
  const genreMap = { action: 28, anim: 16, drama: 18, terror: 27, romance: 10749 };
  const g = genreMap[genre];
  const d = await fetcher(`/discover/movie?sort_by=popularity.desc&with_genres=${g}&vote_count.gte=100`);
  return d?.results || [];
}

export function posterUrl(path, size = 'w342') {
  return path ? `${IMG}${size}${path}` : '/placeholder.png';
}
export function backdropUrl(path, size = 'original') {
  return path ? `${IMG}${size}${path}` : null;
}
