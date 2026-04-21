import codes from '../../data/codes.json';

// Simula banco de dados de usos (em produção, use um banco real)
const codeUsage = {};

export default function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { code, userId } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Código não informado' });
  }

  const normalizedCode = code.trim().toUpperCase();
  const entry = codes.find(c => c.code === normalizedCode);

  // Código não encontrado
  if (!entry) {
    return res.status(404).json({ ok: false, error: 'Código inválido ou expirado' });
  }

  // Verifica limite de usos
  const usageKey = `${normalizedCode}${userId ? `-${userId}` : ''}`;
  const currentUses = codeUsage[usageKey] || 0;
  
  if (currentUses >= entry.maxUses) {
    return res.status(400).json({ ok: false, error: 'Limite de usos atingido' });
  }

  // Registra uso
  codeUsage[usageKey] = currentUses + 1;

  // Retorna sucesso
  return res.json({
    ok: true,
    hours: entry.hours,
    label: entry.label,
    remainingUses: entry.maxUses - codeUsage[usageKey]
  });
}
