const rawBaseUrl = (import.meta.env.VITE_BACKEND_BASE_URL ?? '').trim();
const resolvedBaseUrl = rawBaseUrl.length ? rawBaseUrl : 'http://localhost:4000';
const trimmedBaseUrl = resolvedBaseUrl.replace(/\/+$/, '');

export const backendConfig = {
  baseUrl: trimmedBaseUrl,
};
