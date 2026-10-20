import { ApiError } from './api-errors';
import type { ApiEnvelope } from '@/types/api';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  'http://127.0.0.1:8000/api/v1'
).replace(/\/+$/, '');

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      'Cannot connect to the API. Check that the backend is running.',
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let envelope: ApiEnvelope<T>;

  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(
      'The server returned an invalid response.',
      response.status,
    );
  }

  if (!response.ok || envelope.success !== true) {
    throw new ApiError(
      envelope.message || 'The request failed.',
      response.status,
    );
  }

  return envelope.data;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
