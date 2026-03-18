const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('mohr_token');
}

export function setToken(token: string) {
  localStorage.setItem('mohr_token', token);
}

export function clearToken() {
  localStorage.removeItem('mohr_token');
}

export function hasToken(): boolean {
  return !!localStorage.getItem('mohr_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Unauthorized');
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API request failed');
  return json.data;
}

export const api = {
  login: async (password: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Login failed');
    return json.data.token;
  },

  getWeeks: () => request<any[]>('/weeks'),
  getWeek: (label: string) => request<any>(`/weeks/${encodeURIComponent(label)}`),
  saveWeek: (label: string, data: any) =>
    request<any>(`/weeks/${encodeURIComponent(label)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteWeek: (label: string) =>
    request<any>(`/weeks/${encodeURIComponent(label)}`, { method: 'DELETE' }),

  getSummary: () => request<any>('/weeks/summary'),
  getAdvice: (label: string) => request<any>(`/advice/${encodeURIComponent(label)}`),
  getLatestAdvice: () => request<any>('/advice/latest'),
  getAllAdvice: () => request<any[]>('/advice'),
};
