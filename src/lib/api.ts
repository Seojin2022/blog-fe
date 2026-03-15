const API_BASE = import.meta.env.VITE_API_BASE || '';

export function apiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE}${path}`;
}

export function apiFetch(input: string, init?: RequestInit) {
  return fetch(apiUrl(input), init);
}

