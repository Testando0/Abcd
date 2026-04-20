// TMDB IDs + Google Drive file IDs
// cats: dest = destaque, action, anim, drama, terror
export const CATALOG = [
  // ── Destaques ───────────────────────────────────────────────────────────────
  { tmdbId: 259693,  driveId: '1lomcBH_PNG6AU-OQ0GjI4If9E_VCU3Ud',    cats: ['dest','terror']         }, // Invocação do Mal 2
  { tmdbId: 324857,  driveId: '192kIa8AfSu5CXxpmkdtTotD2xG_b_3zJ',    cats: ['dest','anim']           }, // Homem-Aranha no Aranhaverso
  { tmdbId: 616037,  driveId: '1_mcgTrLIVusURa54LE6AW5RY6z8CY13o',    cats: ['dest','action']         }, // Doutor Estranho no Multiverso
  { tmdbId: 616649,  driveId: '1x_zNbuE5ElI6Rs_prfHKtqriBg9n_rw1',    cats: ['dest','action']         }, // Thor: Amor e Trovão
  { tmdbId: 299537,  driveId: '11eXUdVh8jqMdZWkknHmfSeojJdMEm1TP',    cats: ['dest','action']         }, // Capitã Marvel
  { tmdbId: 671,     driveId: '1JQJ9p6SG3NKFC5wtU1Ru2nD4OnNugNzx',    cats: ['dest','drama','action'] }, // HP: Pedra Filosofal
  // ── Ação ────────────────────────────────────────────────────────────────────
  { tmdbId: 674,     driveId: '1RUevpBGLLzGIkvjgtFIYd58cv-gFVom1',    cats: ['action','drama']        }, // HP: Cálice de Fogo
  { tmdbId: 333339,  driveId: '1PduN7niVV5s6NLaaLtu986rjhb1DWuL5',    cats: ['action']                }, // Ready Player One
  { tmdbId: 337339,  driveId: '0B0j7RRgVpKSGTEtGVFltamlOaVE',          cats: ['action']                }, // Velozes & Furiosos 8
  { tmdbId: 293660,  driveId: '0Bxagr-2-iSTaSzVObkpHOUFCSVU',          cats: ['action']                }, // Deadpool
  { tmdbId: 60800,   driveId: '1vwEEIqwbg0Gpim320B5ujMIMAhiwZcMU',    cats: ['action']                }, // Gigantes de Aço
  { tmdbId: 399404,  driveId: '1U_qBEmeFqecC6gp-zMF97dgE6eJHoaca',    cats: ['action']                }, // Dupla Implacável
  // ── Animação ─────────────────────────────────────────────────────────────────
  { tmdbId: 614934,  driveId: '1jBIS4bPEC3Ti0FJ3bRrJ5naMpiKZoGHI',    cats: ['anim']                  }, // Sing 2
  { tmdbId: 718789,  driveId: '1-KjjY00gLrvLYI3EJjSjG1xKL9AQFqyY',   cats: ['anim','drama']          }, // Pinóquio (2022)
  // ── Drama / Romance ──────────────────────────────────────────────────────────
  { tmdbId: 4348,    driveId: '185blROfFpOWduXCxe-9QEBLYtSFvn9PL',    cats: ['drama']                 }, // Orgulho e Preconceito
  { tmdbId: 21733,   driveId: '0B8YN5mS0RYMDdXFDUkE2ZkxJUmc',          cats: ['drama']                 }, // 500 Dias com Ela
  { tmdbId: 762504,  driveId: '1U_cNOrm2mqhT6ObaCBjwR5YEH8iWvJTW',    cats: ['drama']                 }, // Palmer
  { tmdbId: 398181,  driveId: '1Sm5nXb3Fjoyoe-NzlIDXxtMqutCYxWpL',    cats: ['drama','action']        }, // Uma Noite de Crime 3
  // ── Terror ───────────────────────────────────────────────────────────────────
  { tmdbId: 1072790, driveId: '12BTVXbiunxtgPAMLAvx0dV3OMqS-Rjsa',    cats: ['terror']                }, // Ballerina (2023)
];

export const HERO_ID = 259693; // Featured movie TMDB ID

export const CATEGORIES = [
  { key: 'dest',   label: '🔥 Em Destaque',      rowId: 'row-dest'   },
  { key: 'action', label: '⚡ Ação & Aventura',   rowId: 'row-action' },
  { key: 'anim',   label: '🎭 Animação',          rowId: 'row-anim'   },
  { key: 'drama',  label: '🎬 Drama & Romance',   rowId: 'row-drama'  },
  { key: 'terror', label: '👻 Terror & Suspense', rowId: 'row-terror' },
];

export function getDriveId(tmdbId) {
  return CATALOG.find(c => c.tmdbId === tmdbId)?.driveId || null;
}
