import type {
  AdminMetrics,
  CreateVisitPayload,
  PublicVisitSummary,
  UpdateVisitAdminPayload,
  VisitRecord,
} from '../types/visit';

const ADMIN_TOKEN_STORAGE_KEY = 'rdr_admin_token';
let inMemoryAdminToken: string | null = null;

function getStoredAdminToken(): string | null {
  if (inMemoryAdminToken) return inMemoryAdminToken;
  try {
    const stored = window.sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryAdminToken = stored;
      return stored;
    }
  } catch {
    // sessionStorage indisponível em contexto restrito
  }
  return null;
}

function setStoredAdminToken(token: string | undefined): void {
  if (!token) return;
  inMemoryAdminToken = token;
  try {
    window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } catch {
    // Fallback em memória já armazenado
  }
}

export function clearStoredAdminToken(): void {
  inMemoryAdminToken = null;
  try {
    window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Ignora erro caso storage esteja bloqueado
  }
}

function buildAdminHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  const token = getStoredAdminToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAdminToken();
    }
    const message =
      typeof data?.error === 'string'
        ? data.error
        : 'Ocorreu um erro inesperado na comunicação com o servidor.';
    throw new Error(message);
  }
  return data as T;
}

export async function createVisit(payload: CreateVisitPayload): Promise<VisitRecord> {
  const response = await fetch('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ visit: VisitRecord }>(response);
  return data.visit;
}

export async function lookupVisitByProtocol(protocol: string): Promise<PublicVisitSummary> {
  const response = await fetch(`/api/visits/${encodeURIComponent(protocol.trim().toUpperCase())}`);
  const data = await parseJsonResponse<{ visit: PublicVisitSummary }>(response);
  return data.visit;
}

export async function getAdminSession(): Promise<{ authenticated: boolean; username?: string }> {
  const response = await fetch('/api/admin/session', {
    credentials: 'include',
    headers: buildAdminHeaders(),
  });
  const data = await parseJsonResponse<{ authenticated: boolean; username?: string }>(response);
  if (!data.authenticated) {
    clearStoredAdminToken();
  }
  return data;
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ authenticated: boolean; username: string }> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJsonResponse<{ authenticated: boolean; username: string; token?: string }>(
    response
  );
  setStoredAdminToken(data.token);
  return { authenticated: data.authenticated, username: data.username };
}

export async function logoutAdmin(): Promise<void> {
  try {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: buildAdminHeaders(),
    });
    await parseJsonResponse<{ ok: boolean }>(response);
  } finally {
    clearStoredAdminToken();
  }
}

export async function listAdminVisits(): Promise<{
  visits: VisitRecord[];
  metrics: AdminMetrics;
}> {
  const response = await fetch('/api/admin/visits', {
    credentials: 'include',
    headers: buildAdminHeaders(),
  });
  return parseJsonResponse<{ visits: VisitRecord[]; metrics: AdminMetrics }>(response);
}

export async function updateAdminVisit(
  id: string,
  payload: UpdateVisitAdminPayload
): Promise<VisitRecord> {
  const response = await fetch(`/api/admin/visits/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: buildAdminHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ visit: VisitRecord }>(response);
  return data.visit;
}
