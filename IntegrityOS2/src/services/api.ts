import axios from 'axios';

// Укажи URL своего Go сервера
const API_URL = 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
});

// Автоматически добавляем токен в хедеры (как требует твой Go middleware)
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('integrityos_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    // В твоем Go коде токен - это просто email в хедере X-Token
    // user.token мы сохраним при логине
    if (user.token) {
        config.headers['X-Token'] = user.token;
    }
  }
  return config;
});

export const endpoints = {
  login: '/login',
  register: '/register',
  dashboard: '/admin/dashboard',
  heatmap: '/api/heatmap',
  heatmapData: '/api/heatmap', // POST с фильтрами
  defects: '/api/defects',
  objects: '/api/objects',
  pipelines: '/api/pipelines',
  import: '/api/import/csv',
  reports: '/api/reports',
  callAI: (id: string | number) => `/api/objects/${id}`, // POST
};