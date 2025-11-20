import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('🔴 Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de resposta
api.interceptors.response.use(
  (response) => {
    console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error(`🔴 Erro na resposta (${error.response.status}):`, {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        message: error.message,
      });

      // Se for 401, redireciona para login
      if (error.response.status === 401) {
        console.warn('⚠️ Token inválido ou expirado. Redirecionando para login...');
        localStorage.clear();
        window.location.href = '/';
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('🔴 Sem resposta do servidor:', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('🔴 Erro ao configurar requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;