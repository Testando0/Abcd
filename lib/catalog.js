import contentData from '../data/content.json';

export const CATEGORIES = [
  { id: 'action', name: 'Ação', genre: 28 },
  { id: 'drama', name: 'Drama', genre: 18 },
  { id: 'comedy', name: 'Comédia', genre: 35 },
  { id: 'horror', name: 'Terror', genre: 27 },
  { id: 'romance', name: 'Romance', genre: 10749 },
  { id: 'scifi', name: 'Ficção Científica', genre: 878 },
];

/**
 * Retorna APENAS conteúdos disponíveis e ativos
 */
export function getAvailableContent() {
  return contentData.content.filter(item => item.available === true);
}

/**
 * Busca conteúdo por TMDB ID
 */
export function getContentByTmdbId(tmdbId) {
  return contentData.content.find(item => item.tmdbId === tmdbId && item.available);
}

/**
 * Extrai o ID do arquivo do Google Drive
 */
export function extractDriveFileId(driveLink) {
  if (!driveLink) return null;
  const patterns = [
    /\/d\/(.+?)\//,
    /id=(.+?)(&|$)/,
    /file\/d\/(.+?)\//
  ];
  for (const pattern of patterns) {
    const match = driveLink.match(pattern);
    if (match?.[1]) return match[1];
  }
  return driveLink;
}

/**
 * Converte link do Drive para URL de streaming direto
 */
export function getStreamUrl(driveFileId) {
  if (!driveFileId) return null;
  return `https://drive.google.com/uc?export=download&id=${driveFileId}`;
}
/**
 * Valida se o conteúdo está disponível no Drive (via API)
 */
export async function validateDriveFile(fileId, apiKey) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,webViewLink`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Filtra conteúdo por categoria (gênero TMDB)
 */
export async function filterByGenre(genreId, tmdbApiKey) {
  const available = getAvailableContent();
  const results = [];
  
  for (const item of available) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${item.tmdbId}?api_key=${tmdbApiKey}&language=pt-BR`
      );
      const movie = await res.json();
      if (movie?.genre_ids?.includes(genreId)) {
        results.push({ ...item, tmdbData: movie });
      }
    } catch {
      // Ignora se falhar na busca TMDB
    }
  }
  return results;
}

export default {
  getAvailableContent,
  getContentByTmdbId,
  extractDriveFileId,
  getStreamUrl,
  validateDriveFile,
  filterByGenre,  CATEGORIES
};
