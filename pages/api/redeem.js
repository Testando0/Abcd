import codes from '../../data/codes.json';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código não informado.' });

  const entry = codes.find(c => c.code === code.trim().toUpperCase());
  if (!entry) return res.status(404).json({ error: 'Código inválido.' });

  // Return code info — usage tracking is client-side per account
  res.json({
    ok: true,
    hours: entry.hours,
    label: entry.label,
    maxUses: entry.maxUses,
  });
}
