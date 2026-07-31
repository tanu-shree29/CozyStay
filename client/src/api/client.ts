import axios from 'axios';

export const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function toAppError(err: unknown): never {
  const e = err as any;
  if (e?.response?.data && typeof e.response.data === 'object') {
    if (typeof e.response.data.error === 'string' && !e.response.data.message) {
      e.response.data.message = e.response.data.error;
    }
  }
  throw e;
}
