import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NotFound() {
  const router = useRouter();
  return (
    <>
      <Head><title>RHFLIX — Página não encontrada</title></Head>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', textAlign: 'center', padding: '24px',
      }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', letterSpacing: '3px', color: 'var(--red)', marginBottom: 32 }}>RHFLIX</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: '6rem', color: 'rgba(255,255,255,.08)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', margin: '16px 0 10px' }}>Página não encontrada</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>O conteúdo que você procura não existe ou foi removido.</p>
        <button className="btn btn-red" onClick={() => router.push('/')}>Voltar ao início</button>
      </div>
    </>
  );
}
