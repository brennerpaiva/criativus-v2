// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 5000, // tempo limite de 5 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em cada requisição
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error)
   
  }
);

// Interceptador de resposta para tratar erros globalmente
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (error.response?.role === 'admin') {
        return alert('não tem permissão para isso')
      }
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
