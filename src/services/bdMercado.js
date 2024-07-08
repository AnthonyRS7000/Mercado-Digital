import axios from 'axios';
import { getToken, refreshToken } from './authService'; // Asume que tienes un servicio para manejar los tokens

const bdMercado = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

bdMercado.interceptors.request.use(
  async config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

bdMercado.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken(); // Lógica para obtener un nuevo token
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      return bdMercado(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default bdMercado;
