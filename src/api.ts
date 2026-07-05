import type {
  Booking,
  Flight,
  FlightSearchParams,
  FlightSearchResult,
  LoginForm,
  LoginResponse,
  NewIdResponse,
  RegisterForm,
  UserProfile,
} from './types';

// Empty by default: requests go to the same origin (the Vite dev server), which
// proxies them to the backend (see vite.config.ts). This avoids CORS issues.
// Set VITE_API_URL to hit the backend directly (only works if it enables CORS).
const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Error thrown when the backend responds with a non-2xx status.
 * `message` holds the best human-readable text we could extract from the body.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Pull a readable message out of whatever the backend returned. */
async function extractError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return `Error ${res.status}`;
  try {
    const data = JSON.parse(text);
    return (
      data.message ??
      data.error ??
      data.detail ??
      (typeof data === 'string' ? data : text)
    );
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. ¿Está corriendo el backend en http://localhost:8080?',
      0
    );
  }

  if (!res.ok) {
    throw new ApiError(await extractError(res), res.status);
  }

  // Some endpoints (create-many, cleanup) return an empty body.
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ---- Auth ----

export function loginUser(data: LoginForm): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function registerUser(data: RegisterForm): Promise<NewIdResponse> {
  return request<NewIdResponse>('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(): Promise<UserProfile> {
  return request<UserProfile>('/users/current', {
    headers: { ...authHeaders() },
  });
}

// ---- Flights ----

export function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  const query = new URLSearchParams();
  if (params.flightNumber) query.set('flightNumber', params.flightNumber);
  if (params.airlineName) query.set('airlineName', params.airlineName);
  if (params.estDepartureTimeFrom)
    query.set('estDepartureTimeFrom', params.estDepartureTimeFrom);
  if (params.estDepartureTimeTo)
    query.set('estDepartureTimeTo', params.estDepartureTimeTo);
  const qs = query.toString();
  return request<FlightSearchResult>(`/flights/search${qs ? `?${qs}` : ''}`);
}

export function getFlights(): Promise<Flight[]> {
  return request<Flight[]>('/flights');
}

// ---- Bookings ----

export function bookFlight(flightId: number): Promise<NewIdResponse> {
  return request<NewIdResponse>('/flights/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ flightId }),
  });
}

export function getBooking(id: number): Promise<Booking> {
  return request<Booking>(`/flights/book/${id}`, {
    headers: { ...authHeaders() },
  });
}
