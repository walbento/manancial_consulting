import pg from 'pg';

const { Pool } = pg;

const ALLOWED_ORIGINS = [
  'https://manancialconsulting.netlify.app',
  'http://localhost:8888',
  'http://localhost:3000',
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    // Permite qualquer deploy preview do Netlify (ex.: 64abc123--site.netlify.app)
    return new URL(origin).hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

let pool;

function getPool() {
  if (!pool) {
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Variáveis de ambiente em falta: ${missing.join(', ')}`);
    }

    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      max: 1,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

const FIELD_LIMITS = {
  nome: 100,
  email: 200,
  telefone: 15,
  empresa: 100,
  nif: 20,
  cargo: 100,
  assunto: 200,
  mensagem: 500,
};

const TIPO_EMPRESA_ALLOWED = new Set(['LDA', 'SA', 'SU', '']);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Aceita 9XXXXXXXX ou 2XXXXXXXX, com +244 opcional */
function isValidTelefone(telefone) {
  if (!telefone) return true;
  const normalized = telefone.replace(/[\s\-]/g, '');
  return /^(\+244)?[29]\d{8}$/.test(normalized);
}

function getOrigin(event) {
  return event.headers?.origin || event.headers?.Origin || '';
}

export const handler = async (event) => {
  const origin = getOrigin(event);
  const headers = corsHeaders(origin);

  const json = (statusCode, data) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
    body: JSON.stringify(data),
  });

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(404, { error: 'Rota não encontrada.' });
  }

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Corpo do pedido inválido.' });
  }

  const nome = String(input.nome || '').trim();
  const email = String(input.email || '').trim();
  const empresa = String(input.empresa || '').trim();
  const nif = String(input.nif || '').trim();
  const telefone = String(input.telefone || '').trim().replace(/[\s\-]/g, '');
  const cargo = String(input.cargo || '').trim();
  const assunto = String(input.assunto || '').trim();
  const mensagem = String(input.mensagem || '').trim();
  const tipo = String(input.tipo_empresa || '').trim();

  const erros = [];
  if (!nome) erros.push('Nome é obrigatório.');
  if (!email) erros.push('Email é obrigatório.');
  if (!empresa) erros.push('Empresa é obrigatória.');
  if (!nif) erros.push('NIF é obrigatório.');
  if (!mensagem) erros.push('Mensagem é obrigatória.');
  if (email && !isValidEmail(email)) erros.push('Email inválido.');
  if (telefone && !isValidTelefone(telefone)) {
    erros.push('Telefone inválido. Use 9 ou 2 seguido de 8 dígitos, com +244 opcional.');
  }
  if (!TIPO_EMPRESA_ALLOWED.has(tipo)) {
    erros.push('Tipo de empresa inválido.');
  }

  const lengthChecks = [
    ['nome', nome],
    ['email', email],
    ['telefone', telefone],
    ['empresa', empresa],
    ['nif', nif],
    ['cargo', cargo],
    ['assunto', assunto],
    ['mensagem', mensagem],
  ];
  for (const [field, value] of lengthChecks) {
    if (value.length > FIELD_LIMITS[field]) {
      erros.push(`${field} excede o limite de ${FIELD_LIMITS[field]} caracteres.`);
    }
  }

  if (erros.length) {
    return json(422, { error: erros.join(' ') });
  }

  try {
    const db = getPool();
    await db.query(
      `INSERT INTO contactos
        (nome, email, empresa, nif, telefone, cargo, assunto, mensagem, tipo_empresa, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [nome, email, empresa, nif, telefone, cargo, assunto, mensagem, tipo]
    );
    return json(201, { ok: true, mensagem: 'Contacto guardado com sucesso.' });
  } catch (err) {
    console.error('[contact function]', err);
    return json(500, { error: 'Erro interno. Tente novamente mais tarde.' });
  }
};
