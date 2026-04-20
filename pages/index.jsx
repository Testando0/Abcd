import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSession, getCurrentProfile, isPlanActive, getCurrentUser } from '../lib/auth';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import SearchOverlay from '../components/SearchOverlay';
import VideoPlayer from '../components/VideoPlayer';
import MovieDetail from '../components/MovieDetail';
import { CATEGORIES, getDriveId } from '../lib/catalog';
import { fetchMovie } from '../lib/tmdb';



export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [planOk, setPlanOk] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [player, setPlayer] = useState(null); // { movie, driveId }
  const [detailState, setDetailState] = useState({ open: false, movie: null, driveId: null });
  const [expandedRow, setExpandedRow] = useState(null); // which row is expanded

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    const p = getCurrentProfile();
    if (!p) { router.replace('/profiles'); return; }
    const u = getCurrentUser();
    setPlanOk(isPlanActive(u));
    setReady(true);
  }, []);

  const handlePlay = (movie, driveId) => {
    if (!driveId) {
      // no drive: show trailer via detail panel
      setDetailState({ open: true, movie, driveId: null });
      return;
    }
    setPlayer({ movie, driveId });
    setSearchOpen(false);
  };

  const handleInfo = (movie, driveId) => {
    setDetailState({ open: true, movie, driveId });
  };

  const closeDetail = () => setDetailState({ open: false, movie: null, driveId: null });

  // Search selects movie → opens detail
  const handleSearchSelect = async (movie, driveId) => {
    // fetch full data
    const full = await fetchMovie(movie.id).catch(() => movie);
    setDetailState({ open: true, movie: full || movie, driveId });
  };

  if (!ready) return null;

  if (player) {
    return (
      <VideoPlayer
        driveId={player.driveId}
        movie={player.movie}
        onClose={() => setPlayer(null)}
      />
    );
  }

  return (
    <>
      <Head>
        <title>RHFLIX — Início</title>
      </Head>

      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      {/* Paywall banner */}
      {!planOk && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 700,
          background: 'rgba(20,20,20,.98)',
          borderTop: '1px solid rgba(229,9,20,.3)',
          padding: '16px 4%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          backdropFilter: 'blur(12px)',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>Seu acesso está inativo</div>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>
              Insira um código de recarga para assistir ao conteúdo.
            </div>
          </div>
          <button
            className="btn btn-red btn-sm"
            onClick={() => router.push('/profiles')}
          >
            Inserir código
          </button>
        </div>
      )}

      <main className="page-fade" style={{ paddingBottom: planOk ? 40 : 100 }}>
        <Hero onPlay={handlePlay} onInfo={handleInfo} />

        {/* Inline detail panel (shows below hero, above rows) */}
        {detailState.open && (
          <div style={{ marginTop: -20, position: 'relative', zIndex: 10 }}>
            <MovieDetail
              movie={detailState.movie}
              driveId={detailState.driveId}
              open={detailState.open}
              onClose={closeDetail}
              onPlay={(movie, driveId) => {
                closeDetail();
                handlePlay(movie, driveId);
              }}
            />
          </div>
        )}

        {CATEGORIES.map(cat => (
          <MovieRow
            key={cat.key}
            category={cat.key}
            label={cat.label}
            onPlay={handlePlay}
            globalExpanded={expandedRow}
            onExpand={setExpandedRow}
          />
        ))}
      </main>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 4%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', letterSpacing: '2px', color: 'var(--red)' }}>RHFLIX</span>
        <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Conteúdo hospedado por terceiros. RHFLIX não armazena arquivos.</span>
      </footer>
    </>
  );
}
