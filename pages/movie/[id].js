import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const VideoPlayer = dynamic(() => import('../../components/VideoPlayer'), { ssr: false });

export default function MovieDetail({ movie, profiles, userId }) {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    // Carrega perfil ativo
    try {
      const active = JSON.parse(localStorage.getItem('rhflix_active_profile') || 'null');
      if (active?.userId === userId) {
        const all = JSON.parse(localStorage.getItem('rhflix_profiles_v2') || '{}');
        setActiveProfile(all[userId]?.find(p => p.id === active.profileId));
      }
    } catch {}
  }, [userId]);

  // Se não tem perfil, volta para seleção
  useEffect(() => {
    if (userId && !activeProfile && typeof window !== 'undefined') {
      router.replace('/profiles');
    }
  }, [userId, activeProfile, router]);

  const handleWatch = () => {
    if (!movie?.driveId) {
      alert('Vídeo indisponível');
      return;
    }
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    // Volta para página anterior (lista/home) - NÃO para perfis!
    router.back();
  };

  if (showPlayer && movie?.driveId) {
    return (
      <VideoPlayer
        driveId={movie.driveId}
        movie={movie}
        onClose={handleClosePlayer}
      />
    );
  }
  return (
    <div className="movie-detail">
      {/* Header com botão voltar */}
      <button className="detail-back" onClick={() => router.back()}>
        ← Voltar
      </button>

      {/* Hero com backdrop */}
      <div 
        className="detail-hero"
        style={{
          backgroundImage: `url(${movie?.backdrop || movie?.poster})`
        }}
      >
        <div className="detail-hero-gradient" />
        <div className="detail-content">
          <h1 className="detail-title">{movie?.title || movie?.name}</h1>
          
          <div className="detail-meta">
            {movie?.release_date && (
              <span>{new Date(movie.release_date).getFullYear()}</span>
            )}
            {movie?.vote_average > 0 && (
              <span className="detail-rating">★ {movie.vote_average.toFixed(1)}</span>
            )}
            {movie?.runtime && <span>{movie.runtime} min</span>}
            {movie?.genres?.slice(0,3).map(g => (
              <span key={g.id} className="detail-genre">{g.name}</span>
            ))}
          </div>

          <p className="detail-overview">{movie?.overview}</p>

          <div className="detail-actions">
            <button className="btn-play" onClick={handleWatch}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Assistir
            </button>
            
            {movie?.trailer && (
              <button className="btn-trailer" onClick={() => {
                window.open(`https://youtube.com/watch?v=${movie.trailer}`, '_blank');
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
                Trailer              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="detail-info">
        {movie?.cast?.length > 0 && (
          <section>
            <h3>Elenco</h3>
            <div className="cast-list">
              {movie.cast.slice(0,10).map(person => (
                <div key={person.id} className="cast-item">
                  <img src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/no-avatar.png'} alt={person.name} />
                  <span>{person.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .movie-detail {
          min-height: 100vh;
          background: #000;
          color: #fff;
          position: relative;
        }
        .detail-back {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 100;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .detail-back:hover { background: rgba(255,255,255,0.15); }
        
        .detail-hero {          position: relative;
          height: 70vh;
          min-height: 400px;
          background-size: cover;
          background-position: center 30%;
          display: flex;
          align-items: flex-end;
        }
        .detail-hero-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top, #000 0%, 
            rgba(0,0,0,0.8) 40%, 
            rgba(0,0,0,0.4) 70%, 
            transparent 100%
          ),
          linear-gradient(to right, #000 0%, transparent 40%);
        }
        .detail-content {
          position: relative;
          z-index: 2;
          padding: 0 4% 40px;
          max-width: 650px;
        }
        .detail-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.1;
          text-shadow: 0 2px 20px rgba(0,0,0,0.8);
        }
        .detail-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.85);
          margin-bottom: 20px;
        }
        .detail-rating {
          color: #4ade80;
          font-weight: 600;
        }
        .detail-genre {
          background: rgba(255,255,255,0.1);
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 0.8rem;        }
        .detail-overview {
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.9);
          margin-bottom: 28px;
          max-width: 580px;
        }
        .detail-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-play {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          color: #000;
          border: none;
          padding: 12px 28px;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.2s;
        }
        .btn-play:hover {
          transform: scale(1.05);
          opacity: 0.95;
        }
        .btn-trailer {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 12px 28px;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-trailer:hover {
          background: rgba(255,255,255,0.25);
        }
        .detail-info {
          padding: 20px 4% 60px;          background: linear-gradient(to bottom, transparent, #000 20%);
          margin-top: -60px;
          position: relative;
          z-index: 3;
        }
        .detail-info h3 {
          font-size: 1.2rem;
          margin-bottom: 16px;
          color: rgba(255,255,255,0.9);
        }
        .cast-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .cast-list::-webkit-scrollbar { display: none; }
        .cast-item {
          flex-shrink: 0;
          text-align: center;
          width: 80px;
        }
        .cast-item img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 8px;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .cast-item span {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.7);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .detail-hero { height: 60vh; }
          .detail-title { font-size: 1.8rem; }
          .detail-overview { font-size: 0.95rem; }
          .detail-content { padding: 0 4% 30px; }
          .btn-play, .btn-trailer {
            padding: 10px 20px;
            font-size: 0.9rem;
          }          .cast-item { width: 65px; }
          .cast-item img { width: 65px; height: 65px; }
        }
      `}</style>
    </div>
  );
}

// Carrega dados do filme (server-side ou client-side)
export async function getServerSideProps({ params, query }) {
  // Implemente busca na sua API/TMDB aqui
  // Por enquanto, retorna dados vazios - ajuste conforme seu backend
  return {
    props: {
      movie: null,
      profiles: [],
      userId: query.userId || null
    }
  };
                                  }
