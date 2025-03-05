// src/services/apiClient.js
import axios from 'axios';
import nookies from 'nookies';

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
    // Lê os cookies do navegador
    const cookies = nookies.get(null);
    const token = cookies.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para tratar erros globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Exemplo de tratamento para 401
      if (error.response?.role === 'admin') {
        alert('Você não tem permissão para isso.');
      }
      // Outras ações, como redirecionar para o login, podem ser implementadas aqui
    }
    return Promise.reject(error);
  }
);

export default apiClient;
