import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  VISIT_STATUSES,
  type AdminMetrics,
  type PublicVisitSummary,
  type VisitRecord,
  type VisitStatus,
} from './src/types/visit.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');

const ADMIN_USER = process.env.ADMIN_USER || 'admin@rdr';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rdr2026';
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.createHash('sha256').update('rdr-session-dev-key').digest('hex');
const SESSION_COOKIE_NAME = 'rdr_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

interface SessionPayload {
  username: string;
  exp: number;
}

function signSessionToken(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
    if (!parsed.username || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  }
  return result;
}

function isHttpsRequest(req: Request): boolean {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function buildCookieHeader(req: Request, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isHttpsRequest(req)) {
    parts.push('SameSite=None', 'Secure');
  } else {
    parts.push('SameSite=Lax');
  }
  return parts.join('; ');
}

function getAdminFromRequest(req: Request): SessionPayload | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    const verified = verifySessionToken(bearerToken);
    if (verified) return verified;
  }
  const cookies = parseCookies(req.headers.cookie);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const session = getAdminFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Sessão administrativa expirada ou não autenticada.' });
    return;
  }
  next();
}

function normalizeVisitRecord(raw: Partial<VisitRecord>): VisitRecord {
  const createdAt = raw.createdAt || new Date().toISOString();
  const validStatus = VISIT_STATUSES.includes(raw.status as VisitStatus)
    ? (raw.status as VisitStatus)
    : 'Agendada';

  return {
    id: raw.id || crypto.randomUUID(),
    protocol: raw.protocol || 'RDR-2026-0000',
    serviceType: raw.serviceType || 'preventiva',
    sector: raw.sector || 'Indústria / Manufatura',
    urgency: raw.urgency || 'Programada',
    motorCount: raw.motorCount || '1 a 5 motores',
    preferredDate: raw.preferredDate || '',
    preferredShift: raw.preferredShift || '',
    plantAddress: raw.plantAddress || '',
    cityState: raw.cityState || '',
    companyName: raw.companyName || '',
    cnpj: raw.cnpj,
    contactName: raw.contactName || '',
    contactRole: raw.contactRole,
    contactEmail: raw.contactEmail || '',
    contactPhone: raw.contactPhone || '',
    motorDetails: raw.motorDetails || '',
    status: validStatus,
    assignedTechnician: raw.assignedTechnician || '',
    internalNotes: raw.internalNotes || '',
    createdAt,
    updatedAt: raw.updatedAt || createdAt,
  };
}

async function readVisits(): Promise<VisitRecord[]> {
  try {
    const raw = await fs.readFile(VISITS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeVisitRecord(item));
  } catch {
    return [];
  }
}

async function saveVisits(visits: VisitRecord[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(VISITS_FILE, JSON.stringify(visits, null, 2), 'utf-8');
}

function generateProtocol(existingCount: number): string {
  const year = new Date().getFullYear();
  const suffix = String(1040 + existingCount + Math.floor(Math.random() * 90)).padStart(4, '0');
  return `RDR-${year}-${suffix}`;
}

function computeMetrics(visits: VisitRecord[]): AdminMetrics {
  return {
    total: visits.length,
    pending: visits.filter(
      (v) => v.status === 'Agendada' || v.status === 'Em Triagem Técnica'
    ).length,
    emergency: visits.filter(
      (v) =>
        v.urgency.toLowerCase().includes('emergenc') &&
        v.status !== 'Concluída' &&
        v.status !== 'Cancelada'
    ).length,
    confirmedOrDone: visits.filter(
      (v) => v.status === 'Confirmada' || v.status === 'Concluída'
    ).length,
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'rdr-plataforma-web' });
  });

  // --- Rotas Públicas ---
  app.post('/api/visits', async (req, res) => {
    try {
      const body = req.body ?? {};
      const requiredFields = [
        'serviceType',
        'sector',
        'urgency',
        'preferredDate',
        'preferredShift',
        'plantAddress',
        'cityState',
        'companyName',
        'contactName',
        'contactEmail',
        'contactPhone',
      ];

      for (const field of requiredFields) {
        if (!body[field] || String(body[field]).trim().length === 0) {
          res.status(400).json({
            error: `Campo obrigatório não preenchido: ${field}.`,
          });
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(body.contactEmail).trim())) {
        res.status(400).json({ error: 'Informe um e-mail corporativo válido.' });
        return;
      }

      const phoneDigits = String(body.contactPhone).replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        res.status(400).json({ error: 'Informe um telefone ou WhatsApp com DDD válido.' });
        return;
      }

      const existing = await readVisits();
      const protocol = generateProtocol(existing.length);
      const now = new Date().toISOString();

      const newVisit: VisitRecord = {
        id: crypto.randomUUID(),
        protocol,
        serviceType: String(body.serviceType).trim(),
        sector: String(body.sector).trim(),
        urgency: String(body.urgency).trim(),
        motorCount: String(body.motorCount || '1 a 5 motores').trim(),
        preferredDate: String(body.preferredDate).trim(),
        preferredShift: String(body.preferredShift).trim(),
        plantAddress: String(body.plantAddress).trim(),
        cityState: String(body.cityState).trim(),
        companyName: String(body.companyName).trim(),
        cnpj: body.cnpj ? String(body.cnpj).trim() : undefined,
        contactName: String(body.contactName).trim(),
        contactRole: body.contactRole ? String(body.contactRole).trim() : undefined,
        contactEmail: String(body.contactEmail).trim(),
        contactPhone: String(body.contactPhone).trim(),
        motorDetails: String(body.motorDetails || '').trim(),
        status: 'Agendada',
        assignedTechnician: '',
        internalNotes: '',
        createdAt: now,
        updatedAt: now,
      };

      existing.unshift(newVisit);
      await saveVisits(existing);

      res.status(201).json({
        message: 'Visita técnica agendada com sucesso.',
        visit: newVisit,
      });
    } catch (error) {
      console.error('Erro ao registrar visita técnica:', error);
      res.status(500).json({
        error: 'Não foi possível registrar o agendamento no servidor. Tente novamente.',
      });
    }
  });

  app.get('/api/visits/:protocol', async (req, res) => {
    try {
      const protocol = String(req.params.protocol || '').trim().toUpperCase();
      if (!protocol) {
        res.status(400).json({ error: 'Informe um código de protocolo válido.' });
        return;
      }

      const existing = await readVisits();
      const found = existing.find((item) => item.protocol.toUpperCase() === protocol);

      if (!found) {
        res.status(404).json({
          error: 'Protocolo não encontrado. Verifique o código informado ou entre em contato.',
        });
        return;
      }

      const summary: PublicVisitSummary = {
        protocol: found.protocol,
        companyName: found.companyName,
        serviceType: found.serviceType,
        preferredDate: found.preferredDate,
        preferredShift: found.preferredShift,
        status: found.status,
        assignedTechnician: found.assignedTechnician,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
      };

      res.json({ visit: summary });
    } catch (error) {
      console.error('Erro ao consultar protocolo:', error);
      res.status(500).json({ error: 'Falha ao consultar protocolo.' });
    }
  });

  // --- Rotas Administrativas ---
  app.get('/api/admin/session', (req, res) => {
    const session = getAdminFromRequest(req);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, username: session.username });
  });

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body ?? {};
    const providedUser = String(username || '').trim();
    const providedPass = String(password || '');

    if (providedUser !== ADMIN_USER || providedPass !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Usuário ou senha inválidos.' });
      return;
    }

    const token = signSessionToken({
      username: providedUser,
      exp: Date.now() + SESSION_TTL_MS,
    });

    res.setHeader('Set-Cookie', buildCookieHeader(req, token, SESSION_TTL_MS / 1000));
    res.json({ authenticated: true, username: providedUser, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', buildCookieHeader(req, '', 0));
    res.json({ ok: true });
  });

  app.get('/api/admin/visits', requireAdmin, async (_req, res) => {
    try {
      const visits = await readVisits();
      visits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({
        visits,
        metrics: computeMetrics(visits),
      });
    } catch (error) {
      console.error('Erro ao listar visitas no painel:', error);
      res.status(500).json({ error: 'Falha ao carregar agendamentos.' });
    }
  });

  app.patch('/api/admin/visits/:id', requireAdmin, async (req, res) => {
    try {
      const targetId = String(req.params.id || '').trim();
      const body = req.body ?? {};
      const visits = await readVisits();
      const index = visits.findIndex((item) => item.id === targetId);

      if (index === -1) {
        res.status(404).json({ error: 'Agendamento não encontrado.' });
        return;
      }

      const current = visits[index];

      let nextStatus = current.status;
      if (body.status !== undefined) {
        if (!VISIT_STATUSES.includes(body.status as VisitStatus)) {
          res.status(400).json({ error: 'Status inválido informado.' });
          return;
        }
        nextStatus = body.status as VisitStatus;
      }

      const updated: VisitRecord = {
        ...current,
        status: nextStatus,
        assignedTechnician:
          body.assignedTechnician !== undefined
            ? String(body.assignedTechnician).trim()
            : current.assignedTechnician,
        internalNotes:
          body.internalNotes !== undefined
            ? String(body.internalNotes).trim()
            : current.internalNotes,
        preferredDate:
          body.preferredDate !== undefined
            ? String(body.preferredDate).trim()
            : current.preferredDate,
        preferredShift:
          body.preferredShift !== undefined
            ? String(body.preferredShift).trim()
            : current.preferredShift,
        updatedAt: new Date().toISOString(),
      };

      visits[index] = updated;
      await saveVisits(visits);

      res.json({
        message: 'Agendamento atualizado.',
        visit: updated,
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({ error: 'Não foi possível salvar a atualização.' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor RDR rodando na porta ${port}`);
  });
}

startServer();
