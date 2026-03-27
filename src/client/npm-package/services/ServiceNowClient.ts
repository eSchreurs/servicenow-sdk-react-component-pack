// ServiceNowClient — the sole module that calls fetch().
// All other services use these functions for HTTP communication.

import { ServiceNowError } from '../types/index';

export const TABLE_API_BASE = '/api/now/table';

function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return path;
  return `${path}?${new URLSearchParams(params).toString()}`;
}

function getCsrfToken(): string {
  return (window as Window & { g_ck?: string }).g_ck ?? '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.detail ?? '';
    } catch {
      // non-JSON body — detail stays empty
    }
    throw new ServiceNowError(`HTTP ${response.status}`, response.status, detail);
  }

  const body = await response.json();

  if (body.status === 'failure') {
    throw new ServiceNowError(
      body.error?.message ?? 'ServiceNow error',
      0,
      body.error?.detail ?? '',
    );
  }

  return body.result as T;
}

export async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': getCsrfToken(),
      },
    });
  } catch (e) {
    throw new ServiceNowError('Network error', 0, String(e));
  }
  return handleResponse<T>(response);
}

export async function post<T>(
  path: string,
  body: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': getCsrfToken(),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new ServiceNowError('Network error', 0, String(e));
  }
  return handleResponse<T>(response);
}

export async function patch<T>(
  path: string,
  body: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': getCsrfToken(),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new ServiceNowError('Network error', 0, String(e));
  }
  return handleResponse<T>(response);
}

// getList is used for paginated Table API queries that return a list of records.
// Unlike get(), it also parses the X-Total-Count response header and returns it
// alongside the unwrapped result. Only RecordService.getRecords() uses this.
export async function getList<T>(
  path: string,
  params?: Record<string, string>,
): Promise<{ result: T; totalCount: number }> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-UserToken': getCsrfToken(),
      },
    });
  } catch (e) {
    throw new ServiceNowError('Network error', 0, String(e));
  }
  const totalCount = parseInt(response.headers.get('X-Total-Count') ?? '0', 10);
  const result = await handleResponse<T>(response);
  return { result, totalCount };
}
