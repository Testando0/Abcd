// data/codes.js (na pasta data)

import codes from './data/codes.json';   // <-- caminho corrigido

export default function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { code } = req.body;

  // Verifica se o código foi enviado
  if (!code) {
    return res.status(400).json({ error: 'Código não informado.' });
  }

  // Procura o código no arquivo JSON
  const entry = codes.find(
    (c) => c.code === code.trim().toUpperCase()
  );

  // Se não encontrar, devolve 404
  if (!entry) {
    return res.status(404).json({ error: 'Código inválido.' });
  }

  // Tudo certo! Retorna os dados
  return res.json({
    ok: true,
    hours: entry.hours,
    label: entry.label,
    maxUses: entry.maxUses,
  });
}
