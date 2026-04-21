import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSession, getCurrentProfile, isPlanActive, getCurrentUser } from '../lib/auth';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchOverlay from '../components/SearchOverlay';
import dynamic from 'next/dynamic';
const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), { ssr: false });
import { getAvailableContent, getContentByTmdbId } from '../lib/catalog';
import { fetchMovie, posterUrl } from '../lib/tmdb';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [planOk, setPlanOk] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrega conteúdo disponível
  const loadContent = useCallback(async () => {
    try {
      const available = getAvailableContent();
      const enriched = await Promise.all(
        available.slice(0, 50).map(async (item) => {
          try {
            const tmdb = await fetchMovie(item.tmdbId);
            return { ...item, tmdbData: tmdb };
          } catch {
            return { ...item, tmdbData: null };
          }
        })
      );
      setContent(enriched.filter(c => c.tmdbData));
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const session = getSession();
      if (!session) { router.replace('/login'); return; }
      
      const profile = getCurrentProfile();
      if (!profile) { router.replace('/profiles'); return; }
            const user = getCurrentUser();
      setPlanOk(isPlanActive(user));
      
      await loadContent();
      setReady(true);
    };
    init();
  }, [loadContent, router]);

  const handlePlay = (item) => {
    if (!item.driveLink) return;
    setPlayer({ item });
    setSearchOpen(false);
  };

  const handleSearchSelect = async (movie) => {
    const contentItem = getContentByTmdbId(movie.id);
    if (contentItem) {
      handlePlay(contentItem);
    }
  };

  if (!ready) return <div className="loading-spinner" />;

  if (player) {
    return (
      <VideoPlayer 
        driveLink={player.item.driveLink} 
        movie={player.item.tmdbData} 
        onClose={() => setPlayer(null)} 
      />
    );
  }

  return (
    <>
      <Head>
        <title>RHFLIX — Início</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <Navbar onSearch={() => setSearchOpen(true)} />

      {/* Banner de plano inativo */}
      {!planOk && (
        <div className="paywall-banner">
          <span>⚠️ Seu acesso está inativo</span>
          <button onClick={() => router.push('/profiles')}>
            Inserir código de recarga
          </button>        </div>
      )}

      {/* Grid de filmes */}
      <main className="content-grid">
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : content.length > 0 ? (
          <div className="movie-grid">
            {content.map((item) => (
              <MovieCard 
                key={item.tmdbId}
                movie={item.tmdbData}
                onPlay={() => handlePlay(item)}
                disabled={!planOk}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhum conteúdo disponível no momento.</p>
          </div>
        )}
      </main>

      <SearchOverlay 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
    </>
  );
                       }
